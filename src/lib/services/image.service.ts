// lib/services/image.service.ts
import { getLatestImage } from '@/lib/api/webrtc';
import { WebRTCEvent, Message, WebRTCRefs } from '@/types/chat.type';

export class ImagePollingService {
  private refs: WebRTCRefs;
  private onImageReceived: (message: Message) => void;

  constructor(refs: WebRTCRefs, onImageReceived: (message: Message) => void) {
    this.refs = refs;
    this.onImageReceived = onImageReceived;
  }

  startPolling(maxMs: number = 25000): void {
    this.stopPolling();
    this.refs.imagePollingUntilRef.current = Date.now() + Math.max(3000, maxMs);
    
    this.refs.imagePollerRef.current = setInterval(async () => {
      try {
        if (Date.now() > this.refs.imagePollingUntilRef.current) {
          this.stopPolling();
          return;
        }
        
        const data = await getLatestImage();
        
        if (data && data.status === 'ok' && data.image_url) {
          const imageMessage: Message = {
            id: Date.now().toString(),
            content: data.explanation || 'Generated image',
            role: 'assistant',
            timestamp: new Date(),
            type: 'image',
            imageUrl: data.image_url,
            explanation: data.explanation
          };
          
          this.onImageReceived(imageMessage);
          this.stopPolling();
          
          // Auto-hide image after 16 seconds (optional)
          this.refs.hideImageTimerRef.current = setTimeout(() => {
            console.log('Image display timer completed');
          }, 16000);
        }
      } catch (error) {
        console.warn('Image polling error:', error);
      }
    }, 3000);
  }

  stopPolling(): void {
    if (this.refs.imagePollerRef.current) {
      clearInterval(this.refs.imagePollerRef.current);
      this.refs.imagePollerRef.current = null;
    }
    if (this.refs.hideImageTimerRef.current) {
      clearTimeout(this.refs.hideImageTimerRef.current);
      this.refs.hideImageTimerRef.current = null;
    }
  }

  shouldStartPollingFromEvent(event: WebRTCEvent): boolean {
    try {
      if (!event || typeof event !== 'object') return false;
      
      if (event.type === 'response.done' || event.type === 'response.output_item.created') {
        const output = event.response?.output;
        if (Array.isArray(output)) {
          return output.some(item => 
            item && 
            item.type === 'function_call' && 
            item.name === 'generate_educational_image'
          );
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking image polling event:', error);
      return false;
    }
  }

  cleanup(): void {
    this.stopPolling();
  }
}