import { useState, useCallback } from 'react';
import { Message } from '@/types/chat.type';

interface ConversationEvent {
  type: string;
  transcript?: string;
  response?: {
    output?: Array<{ type?: string; name?: string }>;
  };
}

export const useConversationHandler = (setMessages: React.Dispatch<React.SetStateAction<Message[]>>) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleConversationEvent = useCallback((ev: ConversationEvent) => {
    try {
      // Handle different types of conversation events
      if (ev.type === 'response.audio_transcript.done') {
        const transcript = ev.transcript;
        if (transcript) {
          const message: Message = {
            id: Date.now().toString(),
            content: transcript,
            role: 'assistant',
            timestamp: new Date(),
            type: 'audio'
          };
          setMessages(prev => [...prev, message]);
          setIsSpeaking(true);
          
          // Stop speaking indicator after a delay
          setTimeout(() => setIsSpeaking(false), 2000);
        }
      }
      
      if (ev.type === 'conversation.item.input_audio_transcription.completed') {
        const transcript = ev.transcript;
        if (transcript) {
          const message: Message = {
            id: Date.now().toString(),
            content: transcript,
            role: 'user',
            timestamp: new Date(),
            type: 'audio'
          };
          setMessages(prev => [...prev, message]);
        }
      }
      
      // Handle AI audio events
      if (ev.type === 'response.audio.delta') {
        setIsSpeaking(true);
      }
      
      if (ev.type === 'response.audio.done') {
        setIsSpeaking(false);
      }
      
    } catch (error) {
      // Silent error handling for production
    }
  }, [setMessages]);

  return {
    isPlaying,
    isSpeaking,
    handleConversationEvent
  };
};
