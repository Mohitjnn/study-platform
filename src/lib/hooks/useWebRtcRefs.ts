import { useRef } from 'react';
import { WebRTCRefs } from '@/types/chat.type';

export const useWebRTCRefs = (): WebRTCRefs => {
  return {
    pcRef: useRef<RTCPeerConnection | null>(null),
    dcRef: useRef<RTCDataChannel | null>(null),
    micStreamRef: useRef<MediaStream | null>(null),
    remoteAudioRef: useRef<HTMLAudioElement | null>(null),
    audioContextRef: useRef<AudioContext | null>(null),
    analyserRef: useRef<AnalyserNode | null>(null),
    imagePollerRef: useRef<NodeJS.Timeout | null>(null),
    hideImageTimerRef: useRef<NodeJS.Timeout | null>(null),
    imagePollingUntilRef: useRef<number>(0),
  };
};