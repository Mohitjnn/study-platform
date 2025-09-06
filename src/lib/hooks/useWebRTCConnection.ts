import { useState, useRef, useCallback } from 'react';
import { exchangeSdp, endWebRtcSession, exchangeSdpFallback, testWebRtcConnection } from '@/lib/api/webrtc';

interface UseWebRTCConnectionProps {
  user: any;
  onDataChannelMessage: (event: any) => void;
  remoteAudioRef: React.RefObject<HTMLAudioElement | null>;
}

export const useWebRTCConnection = ({ user, onDataChannelMessage, remoteAudioRef }: UseWebRTCConnectionProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);

  const cleanup = useCallback(async (fromPcEvent = false) => {
    if (isEnding) return;
    setIsEnding(true);
    setConnectionStatus('Ending...');

    try {
      // Only call end session if we have a conversation ID and we're actually connected
      if (!fromPcEvent && conversationId && isConnected) {
        console.log('🛑 Calling endWebRtcSession with ID:', conversationId);
        
        // Test connectivity first
        console.log('🩺 Testing server connectivity before ending session...');
        const healthCheck = await testWebRtcConnection();
        console.log('🩺 Health check result:', healthCheck);
        
        await endWebRtcSession({ conversation_id: conversationId });
        console.log('✅ End session API call completed');
      } else {
        console.log('ℹ️ Skipping end session API call:', { fromPcEvent, conversationId, isConnected });
      }
    } catch (error) {
      console.error('❌ Error ending session:', error);
      // Continue with cleanup even if API call fails
    }

    try {
      // Cleanup WebRTC
      if (pcRef.current) {
        pcRef.current.ontrack = null;
        pcRef.current.onconnectionstatechange = null;
        pcRef.current.close();
        pcRef.current = null;
      }
      
      if (dcRef.current) {
        dcRef.current.close();
        dcRef.current = null;
      }
      
    } finally {
      setIsConnected(false);
      setConnectionStatus('Disconnected');
      setIsEnding(false);
      setConversationId(null);
    }
  }, [isEnding, isConnected, conversationId]);

  const startSession = useCallback(async (micStream: MediaStream | null) => {
    if (isConnecting || isConnected) return;
    
    console.log('🚀 Starting WebRTC session...');
    console.log('👤 User:', user);
    
    setIsConnecting(true);
    setConnectionStatus('Connecting...');

    try {
      console.log('🔗 Creating RTCPeerConnection...');
      // Create peer connection
      pcRef.current = new RTCPeerConnection();
      
      pcRef.current.onconnectionstatechange = () => {
        console.log('🔄 Connection state changed:', pcRef.current?.connectionState);
        console.log('🔄 ICE connection state:', pcRef.current?.iceConnectionState);
        console.log('🔄 ICE gathering state:', pcRef.current?.iceGatheringState);
        
        if (pcRef.current?.connectionState === 'connected') {
          console.log('✅ WebRTC peer connection fully established!');
        }
        
        if (pcRef.current?.connectionState === 'disconnected' || 
            pcRef.current?.connectionState === 'failed' || 
            pcRef.current?.connectionState === 'closed') {
          cleanup(true);
        }
      };

      // Add ICE candidate handling
      pcRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('🧊 ICE candidate:', event.candidate.type);
        } else {
          console.log('🧊 ICE gathering completed');
        }
      };

      // Remote audio handling
      if (remoteAudioRef.current) {
        pcRef.current.ontrack = (e) => {
          console.log('🎵 Received remote track:', e);
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = e.streams[0];
          }
        };
      }

      // Add microphone track if available
      if (micStream) {
        const audioTrack = micStream.getTracks()[0];
        audioTrack.enabled = false; // Initially disabled
        pcRef.current.addTrack(audioTrack);
      }

      // Data channel for events
      console.log('📡 Creating data channel...');
      dcRef.current = pcRef.current.createDataChannel('oai-events');
      
      dcRef.current.onopen = () => {
        console.log('✅ Data channel opened successfully');
      };
      
      dcRef.current.onerror = (error) => {
        console.error('❌ Data channel error:', error);
      };
      
      dcRef.current.onclose = () => {
        console.log('📡 Data channel closed');
      };
      
      dcRef.current.onmessage = (e) => {
        try {
          const ev = JSON.parse(e.data);
          console.log('📩 Received event:', ev);
          
          if (ev.type === 'session.updated') {
            console.log('🔄 Session updated, setting connected state');
            setIsConnected(true);
            setConnectionStatus('Connected');
          }
          
          onDataChannelMessage(ev);
        } catch (error) {
          console.error('Error parsing data channel message:', error);
        }
      };

      console.log('🤝 Creating WebRTC offer...');
      // Create offer and exchange via WebRTC API utility
      const offer = await pcRef.current.createOffer({ 
        offerToReceiveAudio: true, 
        offerToReceiveVideo: false 
      });
      await pcRef.current.setLocalDescription(offer);
      
      console.log('📤 Local description set, exchanging SDP...');
      
      let sdpAnswer: string;
      const sessionId = 'a1691a0b-55fd-4822-8b4c-577ef791cbca'; // You might want to generate this dynamically
      setConversationId(sessionId); // Store the conversation ID
      
      try {
        sdpAnswer = await exchangeSdp(offer.sdp!, sessionId);
      } catch (error) {
        console.warn('⚠️ Primary SDP exchange failed, trying fallback method...');
        sdpAnswer = await exchangeSdpFallback(offer.sdp!, sessionId);
      }
      
      console.log('📥 Received SDP answer, setting remote description...');
      const answer = { type: 'answer' as RTCSdpType, sdp: sdpAnswer };
      await pcRef.current.setRemoteDescription(answer);

      console.log('✅ WebRTC session started successfully!');
      setIsConnected(true);
      setConnectionStatus('Connected');
      setIsConnecting(false);
      
      // Start monitoring WebRTC stats for debugging
      if (pcRef.current) {
        const monitorStats = async () => {
          if (pcRef.current && isConnected) {
            try {
              const stats = await pcRef.current.getStats();
              stats.forEach((report) => {
                if (report.type === 'outbound-rtp' && report.mediaType === 'audio') {
                  console.log('📊 Audio outbound stats:', {
                    packetsSent: report.packetsSent,
                    bytesSent: report.bytesSent,
                    timestamp: report.timestamp
                  });
                }
                if (report.type === 'inbound-rtp' && report.mediaType === 'audio') {
                  console.log('📊 Audio inbound stats:', {
                    packetsReceived: report.packetsReceived,
                    bytesReceived: report.bytesReceived,
                    timestamp: report.timestamp
                  });
                }
              });
            } catch (error) {
              console.error('Error getting WebRTC stats:', error);
            }
            
            // Monitor again in 5 seconds
            setTimeout(monitorStats, 5000);
          }
        };
        
        // Start monitoring after a 2 second delay
        setTimeout(monitorStats, 2000);
      }
      
    } catch (error: any) {
      console.error('❌ Start session failed:', error);
      console.error('Error details:', {
        name: error?.name || 'Unknown',
        message: error?.message || 'Unknown error',
        stack: error?.stack || 'No stack trace'
      });
      setIsConnecting(false);
      await cleanup();
      setConnectionStatus('Connection Failed');
    }
  }, [isConnecting, isConnected, user, onDataChannelMessage, remoteAudioRef, cleanup]);

  return {
    isConnected,
    isConnecting,
    isEnding,
    connectionStatus,
    conversationId,
    pcRef,
    dcRef,
    startSession,
    cleanup
  };
};
