"use client";
import { useState, useRef, useEffect } from 'react';
import VoiceSphere from '@/components/VoiceSphere';
import { MessageList } from '@/components/chat/MessageList';
import { ConnectionControls } from '@/components/chat/ConnectionControls';
import { AudioControls } from '@/components/chat/AudioControls';
import { useWebRTCConnection } from '@/lib/hooks/useWebRTCConnection';
import { useAudioManagement } from '@/lib/hooks/useAudioManagement';
import { useImagePolling } from '@/lib/hooks/useImagePolling';
import { useConversationHandler } from '@/lib/hooks/useConversationHandler';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type: 'text' | 'audio' | 'image';
  imageUrl?: string;
  explanation?: string;
}

interface ChatInterfaceProps {
  user: any;
}

// Configuration
export default function ChatInterface({ user }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      role: 'assistant',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  
  // Audio State
  const [isRecording, setIsRecording] = useState(false);
  
  // Refs
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Custom hooks
  const audioManagement = useAudioManagement();
  const conversationHandler = useConversationHandler(setMessages);
  const imagePolling = useImagePolling(setMessages);
  
  // WebRTC data channel message handler
  const handleDataChannelMessage = (ev: any) => {
    // Handle audio transcript events
    if (ev.type === 'conversation.item.input_audio_transcription.completed') {
      console.log('🎤 User audio transcription completed:', ev.transcript);
    }
    
    if (ev.type === 'response.audio_transcript.done') {
      console.log('🔊 AI response audio transcript done:', ev.transcript);
    }
    
    // Handle image generation events
    imagePolling.maybeStartImagePollingFromEvent(ev);
    
    // Handle conversation events
    conversationHandler.handleConversationEvent(ev);
  };
  
  const webrtcConnection = useWebRTCConnection({
    user,
    onDataChannelMessage: handleDataChannelMessage,
    remoteAudioRef: audioManagement.remoteAudioRef
  });

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  // WebRTC Session Management
  const startSession = async () => {
    console.log('🚀 Starting WebRTC session...');
    
    try {
      // Setup microphone first
      const micStream = await audioManagement.setupMicrophone();
      
      // Start WebRTC session with mic stream
      await webrtcConnection.startSession(micStream);
      
      // Setup audio analysis after connection
      audioManagement.setupAudioAnalysis(webrtcConnection.isConnected);
      
    } catch (error: any) {
      console.error('❌ Start session failed:', error);
    }
  };

  const cleanup = async () => {
    await webrtcConnection.cleanup();
    audioManagement.cleanupAudio();
    imagePolling.stopImagePolling();
  };

  // Mic Control
  const toggleMic = () => {
    audioManagement.toggleMic(webrtcConnection.isConnected);
  };

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
                onStartSession={startSession}
                onEndSession={cleanup}
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
};