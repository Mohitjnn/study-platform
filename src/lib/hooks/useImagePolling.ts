import { useState, useRef, useCallback } from 'react';
import { getLatestImage } from '@/lib/api/webrtc';
import { Message } from '@/types/chat.type';

export const useImagePolling = (setMessages: React.Dispatch<React.SetStateAction<Message[]>>) => {
  const [lastImageUrl, setLastImageUrl] = useState<string | null>(null);
  
  const imagePollerRef = useRef<NodeJS.Timeout | null>(null);
  const hideImageTimerRef = useRef<NodeJS.Timeout | null>(null);
  const imagePollingUntilRef = useRef<number>(0);

  const stopImagePolling = useCallback(() => {
    if (imagePollerRef.current) {
      clearInterval(imagePollerRef.current);
      imagePollerRef.current = null;
    }
    if (hideImageTimerRef.current) {
      clearTimeout(hideImageTimerRef.current);
      hideImageTimerRef.current = null;
    }
  }, []);

  const startImagePolling = useCallback((maxMs: number = 25000) => {
    stopImagePolling();
    imagePollingUntilRef.current = Date.now() + Math.max(3000, maxMs);
    
    imagePollerRef.current = setInterval(async () => {
      try {
        if (Date.now() > imagePollingUntilRef.current) {
          stopImagePolling();
          return;
        }
        
        const data = await getLatestImage();
        
        if (data && data.status === 'ok' && data.image_url && data.image_url !== lastImageUrl) {
          setLastImageUrl(data.image_url);
          
          // Add image message to chat
          const imageMessage: Message = {
            id: Date.now().toString(),
            content: data.explanation || 'Generated image',
            role: 'assistant',
            timestamp: new Date(),
            type: 'image',
            imageUrl: data.image_url,
            explanation: data.explanation
          };
          
          setMessages(prev => [...prev, imageMessage]);
          stopImagePolling();
          
          // Auto-hide image after 16 seconds
          hideImageTimerRef.current = setTimeout(() => {
            // Image will stay in chat history
          }, 16000);
        }
      } catch (error) {
        console.warn('latest-image error', error);
      }
    }, 3000);
  }, [lastImageUrl, setMessages, stopImagePolling]);

  const maybeStartImagePollingFromEvent = useCallback((ev: any) => {
    try {
      if (!ev || typeof ev !== 'object') return;
      
      if (ev.type === 'response.done' || ev.type === 'response.output_item.created') {
        const out = ev.response && ev.response.output;
        if (Array.isArray(out)) {
          for (const item of out) {
            if (item && item.type === 'function_call' && item.name === 'generate_educational_image') {
              startImagePolling(30000);
              return;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking image polling event:', error);
    }
  }, [startImagePolling]);

  return {
    lastImageUrl,
    startImagePolling,
    stopImagePolling,
    maybeStartImagePollingFromEvent
  };
};
