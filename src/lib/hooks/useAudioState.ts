import { useState } from 'react';
import { AudioState } from '@/types/chat.type';
export const useAudioState = () => {
  const [audioState, setAudioState] = useState<AudioState>({
    isRecording: false,
    isMicOn: false,
    isPlaying: false,
    isSpeaking: false,
    audioLevel: 0
  });

  const updateAudioState = (updates: Partial<AudioState>) => {
    setAudioState(prev => ({ ...prev, ...updates }));
  };

  return { audioState, updateAudioState };
};