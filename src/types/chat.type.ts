// types/chat.types.ts
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type: 'text' | 'audio' | 'image';
  imageUrl?: string;
  explanation?: string;
}

export interface User {
  id?: string;
  full_name?: string;
  email?: string;
  [key: string]: any;
}

export interface ChatInterfaceProps {
  user: User;
}

export interface WebRTCEvent {
  type: string;
  transcript?: string;
  response?: {
    output?: Array<{
      type: string;
      name?: string;
    }>;
  };
  [key: string]: any;
}

export interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  isEnding: boolean;
  status: string;
}

export interface AudioState {
  isRecording: boolean;
  isMicOn: boolean;
  isPlaying: boolean;
  isSpeaking: boolean;
  audioLevel: number;
}

export interface ImageState {
  lastImageUrl: string | null;
}

export interface WebRTCRefs {
  pcRef: React.MutableRefObject<RTCPeerConnection | null>;
  dcRef: React.MutableRefObject<RTCDataChannel | null>;
  micStreamRef: React.MutableRefObject<MediaStream | null>;
  remoteAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
  audioContextRef: React.MutableRefObject<AudioContext | null>;
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  imagePollerRef: React.MutableRefObject<NodeJS.Timeout | null>;
  hideImageTimerRef: React.MutableRefObject<NodeJS.Timeout | null>;
  imagePollingUntilRef: React.MutableRefObject<number>;
}