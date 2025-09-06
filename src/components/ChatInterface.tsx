// components/ChatInterface.tsx
"use client";

import { useState } from 'react';
import { Message, ChatInterfaceProps } from '@/types/chat.type';
import { useWebRTCRefs } from '@/lib/hooks/useWebRtcRefs';
// If these hooks are exported from a different module, update the import path accordingly.
// For example, if they are in '@/lib/hooks/useWebRtcState':
import { useConnectionState } from '@/lib/hooks/useConnectioState';
import { useAudioState } from '@/lib/hooks/useAudioState';
import { useImageState } from '@/lib/hooks/useImageState';
// Otherwise, ensure they are exported from '@/lib/hooks/useWebRtcRefs'.
import { useWebRTCManager } from '@/lib/hooks/useWebRtcManager';
import { MessageList } from '@/components/chat/MessageList';
import { ConnectionControls } from '@/components/chat/ConnectionControl';
import VoiceSphere from '@/components/VoiceSphere';

export default function ChatInterface({ user }: ChatInterfaceProps) {
  // State management
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      role: 'assistant',
      timestamp: new Date(),
      type: 'text'
    }
  ]);

  // Custom hooks for state management
  const refs = useWebRTCRefs();
  const { connectionState, updateConnectionState } = useConnectionState();
  const { audioState, updateAudioState } = useAudioState();
  const { imageState, updateImageState } = useImageState();

  // Callback handlers
  const handleMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleConnectionUpdate = (isConnected: boolean, status: string) => {
    updateConnectionState({ isConnected, status });
  };

  const handleAudioLevelUpdate = (level: number) => {
    updateAudioState({ audioLevel: level });
  };

  const handleSpeakingUpdate = (isSpeaking: boolean) => {
    updateAudioState({ isSpeaking });
  };

  // WebRTC Manager
  const { startSession, endSession, toggleMicrophone } = useWebRTCManager({
    refs,
    user,
    onMessage: handleMessage,
    onConnectionUpdate: handleConnectionUpdate,
    onAudioLevelUpdate: handleAudioLevelUpdate,
    onSpeakingUpdate: handleSpeakingUpdate
  });

  // UI Event handlers
  const handleStartSession = async () => {
    updateConnectionState({ isConnecting: true });
    try {
      await startSession();
    } finally {
      updateConnectionState({ isConnecting: false });
    }
  };

  const handleEndSession = async () => {
    updateConnectionState({ isEnding: true });
    try {
      await endSession();
    } finally {
      updateConnectionState({ isEnding: false });
    }
  };

  const handleToggleMic = () => {
    const newMicState = toggleMicrophone(audioState.isMicOn);
    updateAudioState({ isMicOn: newMicState });
    
    if (!newMicState) {
      updateAudioState({ audioLevel: 0 });
    }
  };

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto p-4 gap-6">
      {/* Voice Sphere Section */}
      <div className="flex justify-center items-center py-8">
        <VoiceSphere 
          isActive={connectionState.isConnected} 
          audioLevel={audioState.isMicOn ? audioState.audioLevel : 0}
          isListening={audioState.isMicOn && connectionState.isConnected}
          isSpeaking={audioState.isSpeaking}
        />
      </div>

      {/* Chat Messages */}
      <MessageList messages={messages} />

      {/* Connection Controls */}
      <ConnectionControls
        connectionState={connectionState}
        audioState={audioState}
        onStartSession={handleStartSession}
        onEndSession={handleEndSession}
        onToggleMic={handleToggleMic}
        hasMicStream={!!refs.micStreamRef.current}
      />
    </div>
  );
}