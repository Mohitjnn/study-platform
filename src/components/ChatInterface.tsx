"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import VoiceSphere from "@/components/VoiceSphere";
import { MessageList } from "@/components/chat/MessageList";
import { ConnectionControls } from "@/components/chat/ConnectionControls";
import { AudioControls } from "@/components/chat/AudioControls";
import { useWebRTCConnection } from "@/lib/hooks/useWebRTCConnection";
import { useFreeExploreWebRTC } from "@/lib/hooks/useFreeExploreWebRTC";
import { useAudioManagement } from "@/lib/hooks/useAudioManagement";
import { useImagePolling } from "@/lib/hooks/useImagePolling";
import { useConversationHandler } from "@/lib/hooks/useConversationHandler";
import ConversationLoading from "./ConversationLoading";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion } from "framer-motion";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  type: "text" | "audio" | "image";
  imageUrl?: string;
  explanation?: string;
}

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

interface ChatInterfaceProps {
  user: User;
  conversationId?: string;
  linkId?: string;
  mode?: string;
}

export default function ChatInterface({
  user,
  conversationId,
  linkId,
  mode,
}: ChatInterfaceProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        mode === "free-explore"
          ? "Welcome to Free Explore! Ask me anything and let's have an open conversation."
          : "Hello! I'm your AI assistant. How can I help you today?",
      role: "assistant",
      timestamp: new Date(),
      type: "text",
    },
  ]);

  const [isRecording, setIsRecording] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const sessionStartedRef = useRef(false);
  const audioAnalysisSetupRef = useRef(false); // ✅ Track if audio analysis is setup

  // Custom hooks
  const audioManagement = useAudioManagement();
  const conversationHandler = useConversationHandler(setMessages);
  const imagePolling = useImagePolling(setMessages);

  // WebRTC data channel message handler
  const handleDataChannelMessage = (ev: DataChannelEvent) => {
    imagePolling.maybeStartImagePollingFromEvent(ev);
    conversationHandler.handleConversationEvent(ev);
  };

  const webrtcConnection = useWebRTCConnection({
    user,
    onDataChannelMessage: handleDataChannelMessage,
    remoteAudioRef: audioManagement.remoteAudioRef,
    externalConversationId: conversationId,
  });

  const freeExploreConnection = useFreeExploreWebRTC({
    user,
    onDataChannelMessage: handleDataChannelMessage,
    remoteAudioRef: audioManagement.remoteAudioRef,
  });

  const activeConnection =
    mode === "free-explore" ? freeExploreConnection : webrtcConnection;

  // Auto-start session
  useEffect(() => {
    const autoStartSession = async () => {
      if (mode === "free-explore") {
        if (
          !activeConnection.isConnected &&
          !activeConnection.isConnecting &&
          !sessionStartedRef.current
        ) {
          sessionStartedRef.current = true;
          setIsLoading(false);

          try {
            const micStream = await audioManagement.setupMicrophone();
            await activeConnection.startSession(micStream);
          } catch (error) {
            console.error('[ChatInterface] Error starting session:', error);
            sessionStartedRef.current = false;
          }
        } else {
          setIsLoading(false);
        }
      } else if (
        conversationId &&
        conversationId !== "test" &&
        !activeConnection.isConnected &&
        !activeConnection.isConnecting &&
        !sessionStartedRef.current
      ) {
        sessionStartedRef.current = true;
        setIsLoading(false);

        try {
          const micStream = await audioManagement.setupMicrophone();
          await activeConnection.startSession(micStream);
        } catch (error) {
          console.error('[ChatInterface] Error starting session:', error);
          sessionStartedRef.current = false;
        }
      } else {
        setIsLoading(false);
      }
    };

    if (!sessionStartedRef.current) {
      const timer = setTimeout(autoStartSession, 500);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [conversationId, mode]);

  // ✅ FIXED: Setup audio analysis only once when connected
  useEffect(() => {
    if (
      activeConnection.isConnected && 
      audioManagement.micStreamRef.current &&
      !audioAnalysisSetupRef.current
    ) {
      console.log('[ChatInterface] Setting up audio analysis (one-time)');
      audioManagement.setupAudioAnalysis(true);
      audioAnalysisSetupRef.current = true;
    }
    
    // Reset flag when disconnected
    if (!activeConnection.isConnected && audioAnalysisSetupRef.current) {
      audioAnalysisSetupRef.current = false;
    }
  }, [activeConnection.isConnected, audioManagement.setupAudioAnalysis]); // ✅ Include stable setupAudioAnalysis

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sessionStartedRef.current = false;
      audioAnalysisSetupRef.current = false;
      if (mode === "free-explore" && "endSession" in activeConnection) {
        activeConnection.endSession();
      } else {
        activeConnection.cleanup();
      }
      audioManagement.cleanupAudio();
    };
  }, []);

  const toggleMic = () => {
    audioManagement.toggleMic(activeConnection.isConnected);
  };

  const endSessionAndNavigate = async () => {
    sessionStartedRef.current = false;
    audioAnalysisSetupRef.current = false;

    if (mode === "free-explore" && "endSession" in activeConnection) {
      await activeConnection.endSession();
    } else {
      await activeConnection.cleanup();
    }

    audioManagement.cleanupAudio();
    imagePolling.stopImagePolling();
    router.push("/dashboard");
  };

  if (isLoading) {
    return <ConversationLoading />;
  }

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto gap-6 relative">
      <div>
        <h1 className="font-medium text-xl text-center mt-10 text-white">
          Go ahead, I am listening
        </h1>
      </div>

      <div className="w-full flex justify-center md:h-[50vh]">
        <motion.div
          className="relative"
          animate={{
            y: ["-6px", "6px"],
            opacity: audioManagement.isMicOn ? 1 : 0.6,
            scale:
              audioManagement.isMicOn && audioManagement.audioLevel > 5
                ? 1 + audioManagement.audioLevel / 250
                : 1,
          }}
          transition={{
            y: {
              repeat: Infinity,
              repeatType: "mirror",
              duration: 3,
              ease: "easeInOut",
            },
            opacity: { duration: 0.2 },
            scale: { duration: 0.1 },
          }}
        >
          <DotLottieReact
            src="https://lottie.host/a066e66f-168d-4331-9ec7-873ee59f5a45/2ueyRGjkNZ.lottie"
            loop
            autoplay={audioManagement.isMicOn}
            speed={
              audioManagement.isMicOn && audioManagement.audioLevel > 5
                ? 1 + audioManagement.audioLevel / 100
                : 1
            }
          />
        </motion.div>
      </div>

      <div className="text-center text-white/90 px-4 min-h-[100px] md:min-h-[50px]">
        {messages.length > 0 &&
          messages[messages.length - 1].role === "assistant" &&
          messages[messages.length - 1].content}
      </div>

      <div className="flex justify-between items-center mt-20 md:mt-0">
        <div className="w-1/3"></div>
        <div className="w-1/3 flex justify-center">
          <AudioControls
            isConnected={activeConnection.isConnected}
            isMicOn={audioManagement.isMicOn}
            audioLevel={audioManagement.audioLevel}
            micStreamAvailable={!!audioManagement.micStreamRef.current}
            onToggleMic={toggleMic}
          />
        </div>
        <div className="w-1/3 flex justify-end">
          <ConnectionControls
            isConnected={activeConnection.isConnected}
            isConnecting={activeConnection.isConnecting}
            isEnding={activeConnection.isEnding}
            onEndSession={endSessionAndNavigate}
            autoStarted={!!conversationId || mode === "free-explore"}
          />
        </div>
      </div>
    </div>
  );
}