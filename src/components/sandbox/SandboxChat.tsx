"use client";
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import VoiceSphere from '@/components/VoiceSphere';
import { Message } from './SandboxInterface';

interface SandboxChatProps {
  messages: Message[];
  isConnected: boolean;
  isConnecting: boolean;
  audioLevel: number;
  isSpeaking: boolean;
  isMicOn: boolean;
}

export const SandboxChat: React.FC<SandboxChatProps> = ({
  messages,
  isConnected,
  isConnecting,
  audioLevel,
  isSpeaking,
  isMicOn
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isConnected && !isConnecting && messages.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
        <div className="text-4xl">🎯</div>
        <div>
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            Sandbox Ready
          </h3>
          <p className="text-muted-foreground text-sm max-w-md">
            Configure your settings and click &quot;Begin New Conversation&quot; to start testing
          </p>
        </div>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
        <div className="animate-spin text-4xl">⚙️</div>
        <div>
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            Connecting...
          </h3>
          <p className="text-muted-foreground text-sm">
            Establishing WebRTC connection with your settings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Voice Sphere */}
      <div className="flex justify-center my-4">
        <VoiceSphere
          isActive={isConnected}
          audioLevel={isMicOn ? audioLevel : 0}
          isListening={isMicOn && isConnected}
          isSpeaking={isSpeaking}
        />
      </div>
      {/* Messages */}
      <div className="flex-1 py-4 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="space-y-4 p-4">
            {messages.length === 0 && isConnected && (
              <div className="text-center text-muted-foreground text-sm">
                Start speaking to begin the conversation...
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={ `w-full px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-4'
                      : 'bg-muted text-muted-foreground mr-4'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                    {message.type === 'audio' && ' • Audio'}
                  </div>
                  {message.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={message.imageUrl}
                        alt="Generated content"
                        className="max-w-full rounded border"
                      />
                      {message.explanation && (
                        <p className="text-xs opacity-70 mt-1">{message.explanation}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
