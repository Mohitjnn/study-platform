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
}

export const useFreeExploreWebRTC = ({
  user,
  onDataChannelMessage,
  remoteAudioRef,
}: UseFreeExploreWebRTCProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [sessionId, setSessionId] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
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
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

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

      isStartingRef.current = true; // Set starting flag
      setIsConnecting(true);
      setConnectionStatus("Connecting...");

      // Store mic stream in ref
      if (micStream) {
        localStreamRef.current = micStream;
      }

      try {
        // Create RTCPeerConnection with local variable (critical!)
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
          ],
        });

        // Store in ref for cleanup
        pcRef.current = pc;

        // Create data channel BEFORE adding tracks
        let dc: RTCDataChannel | null = null;
        try {
          dc = pc.createDataChannel("oai-events");
          dcRef.current = dc;
          
          dc.onopen = () => { 
            // Data channel opened
          };
          
          dc.onclose = () => { 
            // Data channel closed
          };
          
          dc.onerror = (e) => { 
            // Data channel error
          };
          
          dc.onmessage = (e) => {
            try {
              const data = JSON.parse(e.data);
              onDataChannelMessage(data);
            } catch (error) {
              // Error parsing data channel message
            }
          };
        } catch (e) {
          // Failed to create data channel
        }

        // Add microphone track if available
        if (micStream) {
          micStream.getTracks().forEach(track => {
            pc.addTrack(track, micStream);
          });
        }

        // Handle remote audio - EXACTLY like home.js
        pc.ontrack = (event) => {
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = event.streams[0];
            const playPromise = remoteAudioRef.current.play();
            if (playPromise && typeof playPromise.then === 'function') {
              playPromise.catch((e) => {
                // Autoplay blocked, waiting for user gesture
              });
            }
          }
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
          // ICE candidate generated
        };

        // Connection state handler - NO CLEANUP on failure (like home.js)
        pc.onconnectionstatechange = () => {
          setConnectionStatus(`Connection: ${pc.connectionState}`);
          
          if (pc.connectionState === 'connected') {
            setIsConnected(true);
            setIsConnecting(false);
            isStartingRef.current = false; // Clear starting flag on success
          } else if (pc.connectionState === 'connecting') {
            // WebRTC connection in progress
          }
          // NOTE: NOT calling cleanup on failed/disconnected like home.js
        };

        // Create offer
        const offer = await pc.createOffer();
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
        const answer = new RTCSessionDescription({ type: "answer", sdp: sdpAnswer });
        await pc.setRemoteDescription(answer);

        // Ensure playback after remote description is set (like home.js)
        if (remoteAudioRef.current) {
          try {
            await remoteAudioRef.current.play();
          } catch (e) {
            // Autoplay after setRemoteDescription failed
          }
        }

        // Set session ID AFTER successful connection
        setSessionId(responseSessionId);
        isStartingRef.current = false; // Clear starting flag on success
        
      } catch (error) {
        isStartingRef.current = false; // Clear starting flag on error
        setIsConnecting(false);
        setConnectionStatus("Connection Failed");
        // Don't call cleanup here - let user manually end session
      }
    },
    [isConnecting, isConnected, onDataChannelMessage, remoteAudioRef]
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