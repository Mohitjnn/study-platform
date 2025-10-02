import { useState, useCallback, useRef } from 'react';

interface ImagePollingEvent {
  type: string;
  output_item?: {
    type?: string;
    name?: string;
  };
}

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  type: "text" | "audio" | "image";
  imageUrl?: string;
  explanation?: string;
}

export const useImagePolling = (setMessages: React.Dispatch<React.SetStateAction<Message[]>>) => {
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const maybeStartImagePollingFromEvent = useCallback((ev: ImagePollingEvent) => {
    // Check if this is an image generation event
    if (ev.type === 'response.output_item.added' && 
        ev.output_item?.type === 'function_call' && 
        ev.output_item?.name === 'generate_image') {
      // For sandbox, we'll simulate image polling
      // In a real implementation, you'd poll your API for the generated image
    }
  }, []);

  const stopImagePolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  return {
    isPolling,
    maybeStartImagePollingFromEvent,
    stopImagePolling,
  };
};
