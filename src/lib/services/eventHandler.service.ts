// lib/services/eventHandler.service.ts
import { WebRTCEvent, Message } from '@/types/chat.type';

export class EventHandlerService {
  private onMessage: (message: Message) => void;
  private onConnectionUpdate: (isConnected: boolean) => void;
  private onSpeakingUpdate: (isSpeaking: boolean) => void;

  constructor(
    onMessage: (message: Message) => void,
    onConnectionUpdate: (isConnected: boolean) => void,
    onSpeakingUpdate: (isSpeaking: boolean) => void
  ) {
    this.onMessage = onMessage;
    this.onConnectionUpdate = onConnectionUpdate;
    this.onSpeakingUpdate = onSpeakingUpdate;
  }

  handleEvent(event: WebRTCEvent): void {
    try {
      console.log('📩 Received event:', event.type);
      
      switch (event.type) {
        case 'session.updated':
          console.log('🔄 Session updated, setting connected state');
          this.onConnectionUpdate(true);
          break;

        case 'response.audio_transcript.done':
          this.handleAIAudioTranscript(event);
          break;

        case 'conversation.item.input_audio_transcription.completed':
          this.handleUserAudioTranscript(event);
          break;

        case 'input_audio_buffer.speech_started':
          console.log('🗣️ Speech started detected - User is speaking');
          break;

        case 'input_audio_buffer.speech_stopped':
          console.log('🤐 Speech stopped detected - User finished speaking');
          break;

        case 'input_audio_buffer.committed':
          console.log('💾 User audio committed to conversation');
          break;

        case 'response.audio.delta':
          console.log('🔊 Received audio delta from AI');
          this.onSpeakingUpdate(true);
          break;

        case 'response.audio.done':
          console.log('🔊 AI audio response completed');
          this.onSpeakingUpdate(false);
          break;

        case 'response.created':
          console.log('🤖 AI response generation started');
          break;

        case 'response.done':
          console.log('✅ AI response generation completed');
          break;

        default:
          console.log(`🔍 Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling event:', error);
    }
  }

  private handleAIAudioTranscript(event: WebRTCEvent): void {
    const transcript = event.transcript;
    console.log('🤖 AI audio transcript received:', transcript);
    
    if (transcript) {
      const message: Message = {
        id: Date.now().toString(),
        content: transcript,
        role: 'assistant',
        timestamp: new Date(),
        type: 'audio'
      };
      
      this.onMessage(message);
      this.onSpeakingUpdate(true);
      
      // Stop speaking indicator after a delay
      setTimeout(() => this.onSpeakingUpdate(false), 2000);
    }
  }

  private handleUserAudioTranscript(event: WebRTCEvent): void {
    const transcript = event.transcript;
    console.log('🎤 User audio transcript received:', transcript);
    
    if (transcript) {
      const message: Message = {
        id: Date.now().toString(),
        content: transcript,
        role: 'user',
        timestamp: new Date(),
        type: 'audio'
      };
      
      this.onMessage(message);
    }
  }
}