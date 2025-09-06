import { useState } from 'react';
import { ConnectionState, AudioState, ImageState } from '@/types/chat.type';

export const useConnectionState = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    isConnecting: false,
    isEnding: false,
    status: 'Disconnected'
  });

  const updateConnectionState = (updates: Partial<ConnectionState>) => {
    setConnectionState(prev => ({ ...prev, ...updates }));
  };

  return { connectionState, updateConnectionState };
};