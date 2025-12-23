import { useState, useRef, useCallback } from 'react';
import { exchangeFreeExploreSdp, endFreeExploreSession } from '@/lib/api/webrtc';

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

interface UseFreeExploreWebRTCProps {
  user: User;
  onDataChannelMessage: (event: DataChannelEvent) => void;
  remoteAudioRef: React.RefObject<HTMLAudioElement | null>;
  micStreamRef: React.RefObject<MediaStream | null>; // Add processed stream ref
  onAudioReconnection?: () => Promise<void>; // ✅ Add callback for audio reconnection
}

export const useFreeExploreWebRTC = ({
  user,
  onDataChannelMessage,
  remoteAudioRef,
  micStreamRef, // Add processed stream ref
  onAudioReconnection, // ✅ Add callback for audio reconnection
}: UseFreeExploreWebRTCProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [sessionId, setSessionId] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const isStartingRef = useRef(false); // Add this to prevent multiple starts

  const cleanup = useCallback(() => {
    // Don't cleanup if we're currently starting a session
    if (isStartingRef.current) {
      return;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    setConnectionStatus("Disconnected");
    setSessionId(null);

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    if (dcRef.current) {
      try { dcRef.current.close(); } catch (_) { }
      dcRef.current = null;
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    setIsEnding(false);
  }, [remoteAudioRef]);

  const endSession = useCallback(async () => {
    if (isEnding || isStartingRef.current) {
      return;
    }
    
    try {
      setIsEnding(true);
      setConnectionStatus("Ending...");

      if (sessionId) {
        try {
          await endFreeExploreSession(sessionId);
        } catch (error) {
          // Silent error handling for production
        }
      }

      cleanup();

    } catch (error) {
      cleanup();
    }
  }, [sessionId, cleanup, isEnding]);

  const startSession = useCallback(
    async (micStream: MediaStream | null) => {
      if (isConnecting || isConnected || isStartingRef.current) {
        return;
      }

      isStartingRef.current = true;
      setIsConnecting(true);
      setConnectionStatus("Connecting...");

      try {
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun.cloudflare.com:3478" },
          ],
          iceCandidatePoolSize: 10,
        });

        // Store in ref for cleanup
        pcRef.current = pc;

        // Connection state handler - match useWebRTCConnection behavior
        pc.onconnectionstatechange = () => {
          const state = pc.connectionState;
          setConnectionStatus(`Connection: ${state}`);
          
          if (state === "connected") {
            setIsConnected(true);
            setIsConnecting(false);
            isStartingRef.current = false;
          } else if (
            state === "disconnected" ||
            state === "failed" ||
            state === "closed"
          ) {
            // ✅ Handle audio reconnection before cleanup
            if (onAudioReconnection && (state === "disconnected" || state === "failed")) {
              onAudioReconnection().catch(console.warn);
            }
            cleanup();
          }
        };

        pc.onicecandidate = () => {
          // ICE candidate handling (no logging)
        };

        pc.oniceconnectionstatechange = () => {
          // ICE state change handling (no logging)
        };

        // Handle remote audio - exactly like useWebRTCConnection
        pc.ontrack = (event) => {
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

        // Use processed microphone stream (with DTLN) like useWebRTCConnection
        const processedStream = micStreamRef.current;
        if (processedStream) {
          const audioTrack = processedStream.getTracks()[0];
          audioTrack.enabled = true;
          pc.addTrack(audioTrack, processedStream);
        }

        // Create data channel EXACTLY like useWebRTCConnection
        const dc = pc.createDataChannel("oai-events");
        dcRef.current = dc;

        dc.onopen = () => {};

        dc.onerror = () => {};

        dc.onclose = () => {};

        dc.onmessage = (e) => {
          try {
            const ev = JSON.parse(e.data);

            if (ev.type === "session.updated") {
              setIsConnected(true);
              setConnectionStatus("Connected");
            }

            onDataChannelMessage(ev);
          } catch (error) {
            // Silent error handling
          }
        };

        // Create offer with same options as useWebRTCConnection
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: false,
        });
        await pc.setLocalDescription(offer);

        // Exchange SDP using free explore endpoint
        const response = await exchangeFreeExploreSdp(offer.sdp || '');
        const sdpAnswer = response.sdp;
        const responseSessionId = response.sessionId;

        // CRITICAL: Check if peer connection is still valid
        if (!pcRef.current || pcRef.current.signalingState === 'closed') {
          throw new Error('Peer connection closed during setup');
        }

        // Set remote description using LOCAL pc variable (NOT pcRef.current)
        const answer = { type: "answer" as RTCSdpType, sdp: sdpAnswer };
        await pc.setRemoteDescription(answer);

        setIsConnecting(false);
        setSessionId(responseSessionId);
        isStartingRef.current = false;
        
      } catch (error) {
        isStartingRef.current = false;
        setIsConnecting(false);
        setConnectionStatus("Connection Failed");
        await cleanup();
      }
    },
    [isConnecting, isConnected, onDataChannelMessage, remoteAudioRef, cleanup]
  );

  return {
    isConnected,
    isConnecting,
    isEnding,
    connectionStatus,
    sessionId,
    pcRef,
    dcRef,
    startSession,
    endSession,
    cleanup,
  };
};