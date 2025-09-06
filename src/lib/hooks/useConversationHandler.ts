import { useState, useCallback } from 'react';
import { Message } from '@/types/chat.type';

export const useConversationHandler = (setMessages: React.Dispatch<React.SetStateAction<Message[]>>) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleConversationEvent = useCallback((ev: any) => {
    try {
      console.log('🗣️ Handling conversation event:', ev.type);
      
      // Handle different types of conversation events
      if (ev.type === 'response.audio_transcript.done') {
        const transcript = ev.transcript;
        console.log('🤖 AI audio transcript received:', transcript);
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
        console.log('🎤 User audio transcript received:', transcript);
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
      
      // Log voice activity detection events
      if (ev.type === 'input_audio_buffer.speech_started') {
        console.log('🗣️ Speech started detected - User is speaking');
      }
      
      if (ev.type === 'input_audio_buffer.speech_stopped') {
        console.log('🤐 Speech stopped detected - User finished speaking');
      }
      
      if (ev.type === 'input_audio_buffer.committed') {
        console.log('💾 User audio committed to conversation');
      }
      
      // Log AI audio events
      if (ev.type === 'response.audio.delta') {
        console.log('🔊 Received audio delta from AI');
        setIsSpeaking(true);
      }
      
      if (ev.type === 'response.audio.done') {
        console.log('🔊 AI audio response completed');
        setIsSpeaking(false);
      }
      
      // Log response generation events
      if (ev.type === 'response.created') {
        console.log('🤖 AI response generation started');
      }
      
      if (ev.type === 'response.done') {
        console.log('✅ AI response generation completed');
      }
      
    } catch (error) {
      console.error('Error handling conversation event:', error);
    }
  }, [setMessages]);

  return {
    isPlaying,
    isSpeaking,
    handleConversationEvent
  };
};
