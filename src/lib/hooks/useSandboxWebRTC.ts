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
        if (!fromPcEvent && conversationId && isConnected) {
          try {
            await endSandboxSession(conversationId, true);
          } catch (error) {
            // Continue with cleanup even if API call fails
          }
        }

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

      setIsConnecting(true);
      setConnectionStatus("Connecting...");

      try {
        pcRef.current = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun.cloudflare.com:3478" },
          ],
          iceCandidatePoolSize: 10,
        });

        pcRef.current.onconnectionstatechange = () => {
          const state = pcRef.current?.connectionState;
          setConnectionStatus(`Connection: ${state}`);
          
          if (state === 'connected') {
            setIsConnected(true);
            setIsConnecting(false);
          } else if (state === 'failed' || state === 'disconnected') {
            cleanup(true);
          }
        };

        pcRef.current.ontrack = (event) => {
          if (event.track.kind === 'audio' && remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = event.streams[0];
          }
        };

        if (micStream) {
          const audioTrack = micStream.getAudioTracks()[0];
          if (audioTrack) {
            pcRef.current.addTrack(audioTrack, micStream);
          }
        }

        dcRef.current = pcRef.current.createDataChannel("oai-events");

        dcRef.current.onopen = () => {};

        dcRef.current.onerror = () => {};

        dcRef.current.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            onDataChannelMessage(data);
          } catch (error) {
            // Error parsing data channel message
          }
        };

        const offer = await pcRef.current.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: false,
        });
        await pcRef.current.setLocalDescription(offer);

        const sdpAnswer = await exchangeSandboxSdp(offer.sdp || '', config);

        const answer = { type: "answer" as RTCSdpType, sdp: sdpAnswer };
        await pcRef.current.setRemoteDescription(answer);

        setConversationId(`sandbox-${Date.now()}`);
        
      } catch (error) {
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