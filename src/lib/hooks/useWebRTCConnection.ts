import { useState, useRef, useCallback } from "react";
import {
  exchangeSdp,
  endWebRtcSession,
  exchangeSdpFallback,
} from "@/lib/api/webrtc";

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

interface UseWebRTCConnectionProps {
  user: User;
  onDataChannelMessage: (event: DataChannelEvent) => void;
  remoteAudioRef: React.RefObject<HTMLAudioElement | null>;
  externalConversationId?: string;
}

export const useWebRTCConnection = ({
  user,
  onDataChannelMessage,
  remoteAudioRef,
  externalConversationId,
}: UseWebRTCConnectionProps) => {
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
          await endWebRtcSession({ conversation_id: conversationId });
        }
      } catch (error: unknown) {
        // Continue with cleanup even if API call fails
      }

      try {
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

          if (state === "connected") {
            setTimeout(startAudioMonitoring, 2000);
          }

          if (
            state === "disconnected" ||
            state === "failed" ||
            state === "closed"
          ) {
            cleanup(true);
          }
        };

        pcRef.current.onicecandidate = () => {
          // ICE candidate handling (no logging)
        };

        pcRef.current.oniceconnectionstatechange = () => {
          // ICE state change handling (no logging)
        };

        pcRef.current.ontrack = (event) => {
          if (event.track.kind === "audio") {
            event.track.onended = () => {};
            event.track.onmute = () => {};
            event.track.onunmute = () => {};

            if (remoteAudioRef.current && event.streams.length > 0) {
              const audioElement = remoteAudioRef.current;
              audioElement.srcObject = event.streams[0];

              audioElement.onloadstart = () => {};
              audioElement.oncanplay = () => {};
              audioElement.onplay = () => {};
              audioElement.onplaying = () => {};
              audioElement.onerror = () => {};
              audioElement.onstalled = () => {};
              audioElement.onwaiting = () => {};
              audioElement.onsuspend = () => {};

              audioElement.autoplay = true;
              audioElement.muted = false;
              audioElement.volume = 1.0;

              audioElement.play().catch(() => {});
            }
          }
        };

        if (micStream) {
          const audioTrack = micStream.getTracks()[0];
          audioTrack.enabled = true;
          pcRef.current.addTrack(audioTrack, micStream);
        }

        dcRef.current = pcRef.current.createDataChannel("oai-events");

        dcRef.current.onopen = () => {};

        dcRef.current.onerror = () => {};

        dcRef.current.onclose = () => {};

        dcRef.current.onmessage = (e) => {
          try {
            const ev = JSON.parse(e.data);

            if (ev.type === "session.updated") {
              setIsConnected(true);
              setConnectionStatus("Connected");
            }

            onDataChannelMessage(ev);
          } catch (error) {
            // Error parsing data channel message
          }
        };

        const offer = await pcRef.current.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: false,
        });
        await pcRef.current.setLocalDescription(offer);

        let sdpAnswer: string;
        const sessionId = externalConversationId || "6f89a3e5-07f1-4556-8f62-6ce0451e4437";
        setConversationId(sessionId);

        try {
          sdpAnswer = await exchangeSdp(offer.sdp!, sessionId);
        } catch (error) {
          sdpAnswer = await exchangeSdpFallback(offer.sdp!, sessionId);
        }

        const answer = { type: "answer" as RTCSdpType, sdp: sdpAnswer };
        await pcRef.current.setRemoteDescription(answer);

        setIsConnecting(false);

        const startAudioMonitoring = async () => {
          const monitorAudio = async () => {
            if (!pcRef.current || !isConnected) return;

            try {
              const stats = await pcRef.current.getStats();
              const audioStats = {
                inboundFound: false,
                outboundFound: false,
                packetsReceived: 0,
                bytesReceived: 0,
                packetsLost: 0,
                packetsSent: 0,
                bytesSent: 0,
              };

              stats.forEach((report) => {
                if (
                  report.type === "inbound-rtp" &&
                  report.mediaType === "audio"
                ) {
                  audioStats.inboundFound = true;
                  audioStats.packetsReceived = report.packetsReceived || 0;
                  audioStats.bytesReceived = report.bytesReceived || 0;
                  audioStats.packetsLost = report.packetsLost || 0;
                }

                if (
                  report.type === "outbound-rtp" &&
                  report.mediaType === "audio"
                ) {
                  audioStats.outboundFound = true;
                  audioStats.packetsSent = report.packetsSent || 0;
                  audioStats.bytesSent = report.bytesSent || 0;
                }
              });
            } catch (error) {
              // Error in audio monitoring
            }
          };

          const interval = setInterval(monitorAudio, 3000);
          setTimeout(() => {
            clearInterval(interval);
          }, 30000);
        };
      } catch (error: unknown) {
        setIsConnecting(false);
        await cleanup();
        setConnectionStatus("Connection Failed");
      }
    },
    [
      isConnecting,
      isConnected,
      user,
      onDataChannelMessage,
      remoteAudioRef,
      cleanup,
      externalConversationId,
    ]
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