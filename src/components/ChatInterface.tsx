"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import VoiceSphere from "@/components/VoiceSphere";
import { MessageList } from "@/components/chat/MessageList";
import { ConnectionControls } from "@/components/chat/ConnectionControls";
import { AudioControls } from "@/components/chat/AudioControls";
import { useWebRTCConnection } from "@/lib/hooks/useWebRTCConnection";
import { useAudioManagement } from "@/lib/hooks/useAudioManagement";
import { useImagePolling } from "@/lib/hooks/useImagePolling";
import { useConversationHandler } from "@/lib/hooks/useConversationHandler";
import ConversationLoading from "./ConversationLoading";
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
}

// Configuration
export default function ChatInterface({ user, conversationId, linkId }: ChatInterfaceProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      role: "assistant",
      timestamp: new Date(),
      type: "text",
    },
  ]);

  // Audio State
  const [isRecording, setIsRecording] = useState(false);

  // Refs
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const sessionStartedRef = useRef(false);

  // Custom hooks
  const audioManagement = useAudioManagement();
  const conversationHandler = useConversationHandler(setMessages);
  const imagePolling = useImagePolling(setMessages);

  // WebRTC data channel message handler
  const handleDataChannelMessage = (ev: DataChannelEvent) => {
    // Handle image generation events
    imagePolling.maybeStartImagePollingFromEvent(ev);

    // Handle conversation events
    conversationHandler.handleConversationEvent(ev);
  };

  const webrtcConnection = useWebRTCConnection({
    user,
    onDataChannelMessage: handleDataChannelMessage,
    remoteAudioRef: audioManagement.remoteAudioRef,
    externalConversationId: conversationId,
  });

  // Auto-start session when conversationId is provided
  useEffect(() => {
    const autoStartSession = async () => {
      if (conversationId && 
          conversationId !== "test" && 
          !webrtcConnection.isConnected && 
          !webrtcConnection.isConnecting && 
          !sessionStartedRef.current) {
        
        sessionStartedRef.current = true;
        setIsLoading(false);
        
        try {
          // Setup microphone first
          const micStream = await audioManagement.setupMicrophone();
          // Start WebRTC session with mic stream
          await webrtcConnection.startSession(micStream);
          // Setup audio analysis after connection
          audioManagement.setupAudioAnalysis(webrtcConnection.isConnected);
        } catch (error) {
          sessionStartedRef.current = false; // Reset on error
        }
      } else if (!conversationId || conversationId === "test" || sessionStartedRef.current) {
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };

    // Only run if we haven't started a session yet
    if (!sessionStartedRef.current) {
      const timer = setTimeout(autoStartSession, 500);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [conversationId]);

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sessionStartedRef.current = false;
      cleanup();
    };
  }, []);

  // Mic Control
  const toggleMic = () => {
    audioManagement.toggleMic(webrtcConnection.isConnected);
  };

  // Cleanup function with dashboard navigation
  const cleanup = async () => {
    sessionStartedRef.current = false;
    await webrtcConnection.cleanup();
    audioManagement.cleanupAudio();
    imagePolling.stopImagePolling();
  };

  // End session and navigate to dashboard
  const endSessionAndNavigate = async () => {
    await cleanup();
    router.push('/dashboard');
  };

  // Show loading screen while initializing
  if (isLoading) {
    return <ConversationLoading />;
  }

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto p-4 gap-6">
      {/* Voice Sphere Section */}
      <div className="flex justify-center items-center py-8">
        <VoiceSphere
          isActive={webrtcConnection.isConnected}
          audioLevel={audioManagement.isMicOn ? audioManagement.audioLevel : 0}
          isListening={audioManagement.isMicOn && webrtcConnection.isConnected}
          isSpeaking={conversationHandler.isSpeaking}
        />
      </div>
      {/* Chat Messages */}
      <MessageList messages={messages} />
      {/* Controls */}
      <div className="space-y-4">
        {/* WebRTC Session Controls */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ConnectionControls
                isConnected={webrtcConnection.isConnected}
                isConnecting={webrtcConnection.isConnecting}
                isEnding={webrtcConnection.isEnding}
                onEndSession={endSessionAndNavigate}
                autoStarted={!!conversationId}
              />

              <AudioControls
                isConnected={webrtcConnection.isConnected}
                isMicOn={audioManagement.isMicOn}
                audioLevel={audioManagement.audioLevel}
                micStreamAvailable={!!audioManagement.micStreamRef.current}
                onToggleMic={toggleMic}
              />
            </div>

            {/* <StatusDisplay
              connectionStatus={webrtcConnection.connectionStatus}
              isConnected={webrtcConnection.isConnected}
              pcConnectionState={webrtcConnection.pcRef.current?.connectionState}
              isMicOn={audioManagement.isMicOn}
            /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
