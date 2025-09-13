import { useState, useRef, useCallback } from 'react';
import { SandboxConfig } from '@/components/sandbox/SandboxInterface';
import { exchangeSandboxSdp, endSandboxSession } from '@/lib/api/webrtc';

interface User {
  id: string;
  name: string;
  email: string;
}

interface DataChannelEvent {
  type: string;
  transcript?: string;
  [key: string]: string | number | boolean | undefined;
}

interface UseSandboxWebRTCProps {
  user: User;
  onDataChannelMessage: (event: DataChannelEvent) => void;
  remoteAudioRef: React.RefObject<HTMLAudioElement | null>;
  config: SandboxConfig;
}

export const useSandboxWebRTC = ({
  user,
  onDataChannelMessage,
  remoteAudioRef,
  config,
}: UseSandboxWebRTCProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [conversationId, setConversationId] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);

  const cleanup = useCallback(
    async (fromPcEvent = false) => {
      if (isEnding) return;
      setIsEnding(true);
      setConnectionStatus("Ending...");

      try {
        // End sandbox session if we have a conversation ID and we're not cleaning up from a PC event
        if (!fromPcEvent && conversationId && isConnected) {
          try {
            console.log('� Calling endSandboxSession with ID:', conversationId);
            await endSandboxSession(conversationId, true);
            console.log("✅ Sandbox session ended successfully");
          } catch (error) {
            console.error("❌ Error ending sandbox session:", error);
            // Continue with cleanup even if API call fails
          }
        }

        // Cleanup WebRTC connection
        if (pcRef.current) {
          pcRef.current.ontrack = null;
          pcRef.current.onconnectionstatechange = null;
          pcRef.current.close();
          pcRef.current = null;
        }

        if (dcRef.current) {
          dcRef.current.onopen = null;
          dcRef.current.onmessage = null;
          dcRef.current.onclose = null;
          dcRef.current.onerror = null;
          dcRef.current.close();
          dcRef.current = null;
        }
      } finally {
        setIsConnected(false);
        setConnectionStatus("Disconnected");
        setIsEnding(false);
        setConversationId(null);
      }
    },
    [isEnding, isConnected, conversationId]
  );

  const startSession = useCallback(
    async (micStream: MediaStream | null) => {
      if (isConnecting || isConnected) return;

      console.log("🚀 Starting Sandbox WebRTC session...");
      console.log("⚙️ Config:", config);

      setIsConnecting(true);
      setConnectionStatus("Connecting...");

      try {
        // Create RTCPeerConnection
        pcRef.current = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun.cloudflare.com:3478" },
          ],
          iceCandidatePoolSize: 10,
        });

        // Connection state monitoring
        pcRef.current.onconnectionstatechange = () => {
          const state = pcRef.current?.connectionState;
          console.log('📡 Connection state:', state);
          setConnectionStatus(`Connection: ${state}`);
          
          if (state === 'connected') {
            setIsConnected(true);
            setIsConnecting(false);
          } else if (state === 'failed' || state === 'disconnected') {
            cleanup(true);
          }
        };

        // Handle incoming audio tracks
        pcRef.current.ontrack = (event) => {
          console.log('🎵 Received remote track:', event.track.kind);
          if (event.track.kind === 'audio' && remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = event.streams[0];
          }
        };

        // Add microphone track if available
        if (micStream) {
          const audioTrack = micStream.getAudioTracks()[0];
          if (audioTrack) {
            pcRef.current.addTrack(audioTrack, micStream);
            console.log('🎤 Added microphone track');
          }
        }

        // Create data channel
        dcRef.current = pcRef.current.createDataChannel("oai-events");

        dcRef.current.onopen = () => {
          console.log('📡 Data channel opened');
        };

        dcRef.current.onerror = (error) => {
          console.error('❌ Data channel error:', error);
        };

        dcRef.current.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            onDataChannelMessage(data);
          } catch (error) {
            console.error('❌ Error parsing data channel message:', error);
          }
        };

        // Create and set local offer
        const offer = await pcRef.current.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: false,
        });
        await pcRef.current.setLocalDescription(offer);

        console.log('📤 Created SDP offer');

        // Exchange SDP using sandbox endpoint with config
        const sdpAnswer = await exchangeSandboxSdp(offer.sdp || '', config);

        // Set remote description
        const answer = { type: "answer" as RTCSdpType, sdp: sdpAnswer };
        await pcRef.current.setRemoteDescription(answer);

        console.log('✅ Sandbox WebRTC session setup completed!');
        setConversationId(`sandbox-${Date.now()}`);
        
      } catch (error) {
        console.error('❌ Sandbox WebRTC setup failed:', error);
        setIsConnecting(false);
        await cleanup();
        setConnectionStatus("Connection Failed");
      }
    },
    [isConnecting, isConnected, config, onDataChannelMessage, remoteAudioRef, cleanup]
  );

  return {
    isConnected,
    isConnecting,
    isEnding,
    connectionStatus,
    conversationId,
    pcRef,
    dcRef,
    startSession,
    cleanup,
  };
};
