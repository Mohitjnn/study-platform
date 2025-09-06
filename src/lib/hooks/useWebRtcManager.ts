// lib/hooks/useWebRTCManager.ts
import { useEffect, useCallback } from 'react';
import { User, Message, WebRTCEvent, WebRTCRefs } from '@/types/chat.type';
import { WebRTCService } from '@/lib/services/webrtc.service';
import { AudioAnalysisService } from '@/lib/services/audio.service';
import { ImagePollingService } from '@/lib/services/image.service';
import { EventHandlerService } from '@/lib/services/eventHandler.service';

interface UseWebRTCManagerProps {
  refs: WebRTCRefs;
  user: User;
  onMessage: (message: Message) => void;
  onConnectionUpdate: (isConnected: boolean, status: string) => void;
  onAudioLevelUpdate: (level: number) => void;
  onSpeakingUpdate: (isSpeaking: boolean) => void;
}

export const useWebRTCManager = ({
  refs,
  user,
  onMessage,
  onConnectionUpdate,
  onAudioLevelUpdate,
  onSpeakingUpdate
}: UseWebRTCManagerProps) => {
  // Initialize services
  const audioService = new AudioAnalysisService(refs);
  const webrtcService = new WebRTCService(refs, audioService);
  const imageService = new ImagePollingService(refs, onMessage);
  const eventHandler = new EventHandlerService(
    onMessage,
    (connected) => onConnectionUpdate(connected, connected ? 'Connected' : 'Disconnected'),
    onSpeakingUpdate
  );

  // Initialize audio context on mount
  useEffect(() => {
    audioService.initializeAudioContext();
    
    return () => {
      cleanup();
    };
  }, []);

  const startSession = useCallback(async () => {
    console.log('🚀 Starting WebRTC session...');
    onConnectionUpdate(false, 'Connecting...');

    try {
      // Create peer connection
      const pc = await webrtcService.createPeerConnection();
      refs.pcRef.current = pc;

      // Setup connection state handlers
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          console.log('✅ WebRTC peer connection fully established!');
        }
        
        if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
          cleanup(true);
        }
      };

      // Setup remote audio
      // webrtcService.setupRemoteAudio(pc);

      // Setup microphone
      const micStream = await webrtcService.setupMicrophone();
      if (micStream) {
        refs.micStreamRef.current = micStream;
        const audioTrack = micStream.getTracks()[0];
        pc.addTrack(audioTrack);

        // Setup audio analysis
        audioService.setupAudioAnalysis(micStream, onAudioLevelUpdate);
      }

      // Create data channel
      const dc = webrtcService.createDataChannel(pc);
      refs.dcRef.current = dc;

      // Setup data channel message handler
      dc.onmessage = (e) => {
        try {
          const event: WebRTCEvent = JSON.parse(e.data);
          console.log('📩 Received event:', event);
          
          // Handle the event
          eventHandler.handleEvent(event);
          
          // Check if we need to start image polling
          if (imageService.shouldStartPollingFromEvent(event)) {
            imageService.startPolling(30000);
          }
        } catch (error) {
          console.error('Error parsing data channel message:', error);
        }
      };

      // Create and exchange SDP
      const offer = await pc.createOffer({ 
        offerToReceiveAudio: true, 
        offerToReceiveVideo: false 
      });
      await pc.setLocalDescription(offer);

      const sdpAnswer = await webrtcService.exchangeSDP(offer, 'gpt-4o-mini-realtime-preview-2024-12-17');
      const answer = { type: 'answer' as RTCSdpType, sdp: sdpAnswer };
      await pc.setRemoteDescription(answer);

      // Bind context
      await webrtcService.bindContext(user);

      console.log('✅ WebRTC session started successfully!');
      onConnectionUpdate(true, 'Connected');
      
    } catch (error: any) {
      console.error('❌ Start session failed:', error);
      await cleanup();
      onConnectionUpdate(false, 'Connection Failed');
    }
  }, [user, onMessage, onConnectionUpdate, onAudioLevelUpdate, onSpeakingUpdate]);

  const endSession = useCallback(async () => {
    await cleanup();
  }, []);

  const cleanup = useCallback(async (fromPcEvent = false) => {
    console.log('🧹 Cleaning up WebRTC session...');
    onConnectionUpdate(false, 'Ending...');

    try {
      if (!fromPcEvent) {
        await webrtcService.endSession();
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }

    // Cleanup all services
    webrtcService.cleanup();
    audioService.cleanup();
    imageService.cleanup();
    
    onConnectionUpdate(false, 'Disconnected');
    onAudioLevelUpdate(0);
  }, [onConnectionUpdate, onAudioLevelUpdate]);

  const toggleMicrophone = useCallback((currentMicState: boolean) => {
    return webrtcService.toggleMicrophone(currentMicState);
  }, []);

  return {
    startSession,
    endSession,
    toggleMicrophone,
    cleanup
  };
};