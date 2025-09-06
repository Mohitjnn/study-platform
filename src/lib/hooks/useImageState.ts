import { useState } from 'react';
import { ConnectionState, AudioState, ImageState } from '@/types/chat.type';

export const useImageState = () => {
  const [imageState, setImageState] = useState<ImageState>({
    lastImageUrl: null
  });

  const updateImageState = (updates: Partial<ImageState>) => {
    setImageState(prev => ({ ...prev, ...updates }));
  };

  return { imageState, updateImageState };
};