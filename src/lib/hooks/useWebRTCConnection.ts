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
  // Add more known properties here as needed
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
        // Only call end session if we have a conversation ID and we're actually connected
        if (!fromPcEvent && conversationId && isConnected) {
          // console.log('🛑 Calling endWebRtcSession with ID:', conversationId);

          // // Test connectivity first
          // console.log('🩺 Testing server connectivity before ending session...');
          // const healthCheck = await testWebRtcConnection();
          // console.log('🩺 Health check result:', healthCheck);

          await endWebRtcSession({ conversation_id: conversationId });
          console.log("✅ End session API call completed");
        } else {
          console.log("ℹ️ Skipping end session API call:", {
            fromPcEvent,
            conversationId,
            isConnected,
          });
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("❌ Error ending session:", error.message);
        } else {
          console.error("❌ Error ending session:", error);
        }
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
        setConnectionStatus("Disconnected");
        setIsEnding(false);
        setConversationId(null);
      }
    },
    [isEnding, isConnected, conversationId]
  );
  // Add this to your useWebRTCConnection.ts file
  // Replace your existing startSession function with this enhanced version

  const startSession = useCallback(
    async (micStream: MediaStream | null) => {
      if (isConnecting || isConnected) return;

      console.log("🚀 Starting WebRTC session...");
      console.log("👤 User:", user);

      setIsConnecting(true);
      setConnectionStatus("Connecting...");

      try {
        console.log("🔗 Creating RTCPeerConnection...");

        // Enhanced RTCPeerConnection with better ICE servers
        pcRef.current = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun.cloudflare.com:3478" },
          ],
          iceCandidatePoolSize: 10,
        });

        // === COMPREHENSIVE CONNECTION STATE LOGGING ===
        pcRef.current.onconnectionstatechange = () => {
          const state = pcRef.current?.connectionState;
          const iceState = pcRef.current?.iceConnectionState;
          const iceGatheringState = pcRef.current?.iceGatheringState;

          console.log("🔄 CONNECTION STATE CHANGE:", {
            connectionState: state,
            iceConnectionState: iceState,
            iceGatheringState: iceGatheringState,
            timestamp: new Date().toISOString(),
          });

          // BACKEND ISSUE INDICATORS
          if (iceState === "failed") {
            console.error("❌ BACKEND ISSUE: ICE connection failed");
            console.error("💡 This indicates:");
            console.error(
              "   - Backend server cannot establish direct connection"
            );
            console.error("   - Firewall blocking RTP packets");
            console.error("   - NAT traversal issues");
            console.error("   - Backend needs STUN/TURN configuration");
          }

          if (iceState === "disconnected") {
            console.warn("⚠️ POTENTIAL BACKEND ISSUE: ICE disconnected");
            console.warn("💡 Backend may have dropped the connection");
          }

          if (state === "connected") {
            console.log("✅ WebRTC peer connection established!");
            // Start audio monitoring after connection
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

        // === ICE CANDIDATE LOGGING ===
        pcRef.current.onicecandidate = (event) => {
          if (event.candidate) {
            console.log("🧊 ICE CANDIDATE:", {
              type: event.candidate.type,
              protocol: event.candidate.protocol,
              address: event.candidate.address,
              port: event.candidate.port,
              foundation: event.candidate.foundation,
              priority: event.candidate.priority,
              component: event.candidate.component,
            });

            // Check for relay candidates (indicates TURN is working)
            if (event.candidate.type === "relay") {
              console.log(
                "✅ TURN/Relay candidate found - good for NAT traversal"
              );
            }

            // Check for host candidates (direct connection possible)
            if (event.candidate.type === "host") {
              console.log(
                "✅ Host candidate found - direct connection possible"
              );
            }

            // Check for server reflexive candidates (STUN working)
            if (event.candidate.type === "srflx") {
              console.log("✅ Server reflexive candidate found - STUN working");
            }
          } else {
            console.log(
              "🧊 ICE gathering completed at:",
              new Date().toISOString()
            );
          }
        };

        // === ICE STATE CHANGE LOGGING ===
        pcRef.current.oniceconnectionstatechange = () => {
          const state = pcRef.current?.iceConnectionState;
          console.log(
            "🧊 ICE CONNECTION STATE:",
            state,
            "at",
            new Date().toISOString()
          );

          switch (state) {
            case "checking":
              console.log("🔍 ICE is checking connectivity...");
              break;
            case "connected":
              console.log("✅ ICE connected - RTP packets should flow now");
              break;
            case "completed":
              console.log("✅ ICE completed - optimal path found");
              break;
            case "failed":
              console.error("❌ CRITICAL BACKEND ISSUE: ICE connection failed");
              console.error(
                "💡 DIAGNOSIS: Backend cannot establish media connection"
              );
              console.error(
                "💡 SOLUTION NEEDED: Backend server network configuration"
              );
              break;
            case "disconnected":
              console.warn("⚠️ ICE disconnected - connection quality issues");
              break;
            case "closed":
              console.log("🔒 ICE connection closed");
              break;
          }
        };

        // === TRACK RECEPTION LOGGING (CRITICAL FOR AUDIO) ===
        pcRef.current.ontrack = (event) => {
          console.log("🎵 TRACK RECEIVED:", {
            kind: event.track.kind,
            id: event.track.id,
            label: event.track.label,
            enabled: event.track.enabled,
            muted: event.track.muted,
            readyState: event.track.readyState,
            streamCount: event.streams.length,
            timestamp: new Date().toISOString(),
          });

          if (event.track.kind === "audio") {
            console.log("🔊 AUDIO TRACK RECEIVED - This is what we want!");

            event.track.onended = () => {
              console.warn("⚠️ Audio track ended");
            };

            event.track.onmute = () => {
              console.warn("🔇 Audio track muted by backend");
            };

            event.track.onunmute = () => {
              console.log("🔊 Audio track unmuted");
            };

            // Set up audio element
            if (remoteAudioRef.current && event.streams.length > 0) {
              console.log("🎵 Setting up audio element with stream");
              const audioElement = remoteAudioRef.current;
              audioElement.srcObject = event.streams[0];

              // Audio element event logging
              audioElement.onloadstart = () => {
                console.log("🎵 Audio element: loadstart");
              };

              audioElement.oncanplay = () => {
                console.log(
                  "✅ Audio element: canplay - Audio should be audible now!"
                );
              };

              audioElement.onplay = () => {
                console.log("▶️ Audio element: playing");
              };

              audioElement.onplaying = () => {
                console.log("🔊 Audio element: actively playing");
              };

              audioElement.onerror = (e) => {
                console.error("❌ FRONTEND ISSUE: Audio element error:", e);
              };

              audioElement.onstalled = () => {
                console.warn(
                  "⚠️ POTENTIAL BACKEND ISSUE: Audio stalled (no data)"
                );
              };

              audioElement.onwaiting = () => {
                console.warn("⏳ Audio waiting for data from backend");
              };

              audioElement.onsuspend = () => {
                console.warn("⏸️ Audio loading suspended");
              };

              // Force audio settings
              audioElement.autoplay = true;
              audioElement.muted = false;
              audioElement.volume = 1.0;

              // Try to play
              audioElement.play().catch((error) => {
                console.warn(
                  "🎵 Autoplay prevented (browser policy):",
                  error.message
                );
                console.log(
                  "💡 User interaction may be required to start audio"
                );
              });
            }
          }
        };

        // Add microphone track if available
        if (micStream) {
          const audioTrack = micStream.getTracks()[0];
          audioTrack.enabled = true; // Initially disabled
          console.log("🎤 Adding microphone track to peer connection");
          pcRef.current.addTrack(audioTrack, micStream);
        }

        // === DATA CHANNEL SETUP WITH LOGGING ===
        console.log("📡 Creating data channel...");
        dcRef.current = pcRef.current.createDataChannel("oai-events");

        dcRef.current.onopen = () => {
          console.log("✅ Data channel opened - signaling working properly");
        };

        dcRef.current.onerror = (error) => {
          console.error("❌ BACKEND ISSUE: Data channel error:", error);
        };

        dcRef.current.onclose = () => {
          console.log("📡 Data channel closed");
        };

        dcRef.current.onmessage = (e) => {
          try {
            const ev = JSON.parse(e.data);
            console.log("📩 Data channel message:", ev.type);

            // Log important session events
            if (ev.type === "session.updated") {
              console.log("🔄 Session updated - backend is responding");
              setIsConnected(true);
              setConnectionStatus("Connected");
            }

            if (ev.type === "response.audio.delta") {
              console.log(
                "🔊 BACKEND SENDING AUDIO DATA - Backend is working!"
              );
            }

            if (ev.type === "response.audio.done") {
              console.log("✅ Backend finished sending audio response");
            }

            onDataChannelMessage(ev);
          } catch (error) {
            console.error("Error parsing data channel message:", error);
          }
        };

        // === SDP EXCHANGE WITH LOGGING ===
        console.log("🤝 Creating WebRTC offer...");
        const offer = await pcRef.current.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: false,
        });
        await pcRef.current.setLocalDescription(offer);

        console.log("📤 SDP Offer created:", {
          type: offer.type,
          sdpLength: offer.sdp?.length,
          hasAudio: offer.sdp?.includes("m=audio"),
          hasVideo: offer.sdp?.includes("m=video"),
        });

        let sdpAnswer: string;
        const sessionId = externalConversationId || "6f89a3e5-07f1-4556-8f62-6ce0451e4437";
        setConversationId(sessionId);

        try {
          console.log("🌐 Attempting SDP exchange with backend...");
          sdpAnswer = await exchangeSdp(offer.sdp!, sessionId);
          console.log("✅ SDP exchange successful with primary method");
        } catch (error) {
          console.warn("⚠️ Primary SDP exchange failed, trying fallback...");
          sdpAnswer = await exchangeSdpFallback(offer.sdp!, sessionId);
          console.log("✅ SDP exchange successful with fallback method");
        }

        console.log("📥 SDP Answer received:", {
          length: sdpAnswer.length,
          hasAudio: sdpAnswer.includes("m=audio"),
          hasVideo: sdpAnswer.includes("m=video"),
        });

        const answer = { type: "answer" as RTCSdpType, sdp: sdpAnswer };
        await pcRef.current.setRemoteDescription(answer);
        console.log("✅ Remote description set successfully");

        console.log("✅ WebRTC session setup completed!");
        setIsConnecting(false);

        // === AUDIO MONITORING FUNCTION ===
        const startAudioMonitoring = async () => {
          console.log("🔍 Starting audio monitoring...");

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

              // CRITICAL DIAGNOSTIC LOGS
              if (audioStats.inboundFound) {
                if (audioStats.packetsReceived > 0) {
                  console.log(
                    "✅ RECEIVING AUDIO PACKETS FROM BACKEND:",
                    audioStats
                  );
                } else {
                  console.warn(
                    "⚠️ INBOUND AUDIO STREAM EXISTS BUT NO PACKETS YET"
                  );
                }
              } else {
                console.error("❌ CRITICAL: NO INBOUND AUDIO STREAM FOUND");
                console.error(
                  "💡 DIAGNOSIS: Backend is not sending audio data"
                );
                console.error("💡 This is definitely a BACKEND ISSUE");
              }

              // Check audio element status
              if (remoteAudioRef.current) {
                const audio = remoteAudioRef.current;
                console.log("🎵 Audio Element Status:", {
                  paused: audio.paused,
                  muted: audio.muted,
                  volume: audio.volume,
                  readyState: audio.readyState,
                  networkState: audio.networkState,
                  currentTime: audio.currentTime,
                  duration: audio.duration || "unknown",
                  hasSourceObject: !!audio.srcObject,
                });

                if (audio.readyState === 0) {
                  console.warn(
                    "⚠️ Audio element has no data - backend not sending audio"
                  );
                }
              }
            } catch (error) {
              console.error("Error in audio monitoring:", error);
            }
          };

          // Monitor every 3 seconds for 30 seconds
          const interval = setInterval(monitorAudio, 3000);
          setTimeout(() => {
            clearInterval(interval);
            console.log("🔍 Audio monitoring completed");
          }, 30000);
        };
      } catch (error: unknown) {
        console.error("❌ WEBRTC SESSION SETUP FAILED:");
        if (error instanceof Error) {
          console.error("Error name:", error.name);
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        } else {
          console.error("Unknown error:", error);
        }
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
