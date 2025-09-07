import { useState, useRef, useEffect, useCallback } from 'react';

export const useAudioManagement = () => {
  const [isMicOn, setIsMicOn] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const micStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Initialize audio context for visualization
  useEffect(() => {
    const initAudio = async () => {
      try {
        let AudioCtx: typeof AudioContext | undefined = undefined;
        if (typeof window.AudioContext !== 'undefined') {
          AudioCtx = window.AudioContext;
        } else if ('webkitAudioContext' in window && typeof (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext !== 'undefined') {
          AudioCtx = (window as Window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        }
        if (AudioCtx) {
          audioContextRef.current = new AudioCtx();
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;
        } else {
          throw new Error('No AudioContext available');
        }
        
        // Create remote audio element
        remoteAudioRef.current = new Audio();
        remoteAudioRef.current.autoplay = true;
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };
    initAudio();
  }, []);

  const setupMicrophone = useCallback(async () => {
    if (navigator.mediaDevices && window.isSecureContext) {
      micStreamRef.current = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true, 
          autoGainControl: true 
        } 
      });
      
      const audioTrack = micStreamRef.current.getTracks()[0];
      
      // Initially disable the audio track until mic is turned on manually
      audioTrack.enabled = false;
      setIsMicOn(false);
      
      return micStreamRef.current;
    } else {
      return null;
    }
  }, []);

  const setupAudioAnalysis = useCallback((isConnected: boolean) => {
    if (micStreamRef.current && audioContextRef.current && analyserRef.current) {
      const source = audioContextRef.current.createMediaStreamSource(micStreamRef.current);
      source.connect(analyserRef.current);
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      const updateAudioLevel = () => {
        if (analyserRef.current && isMicOn && isConnected) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          const normalizedLevel = average / 255;
          setAudioLevel(normalizedLevel);
          
          requestAnimationFrame(updateAudioLevel);
        } else if (!isMicOn || !isConnected) {
          setAudioLevel(0);
          if (updateAudioLevel) {
            requestAnimationFrame(updateAudioLevel);
          }
        }
      };
      updateAudioLevel();
    }
  }, [isMicOn]);

  const toggleMic = useCallback((isConnected: boolean) => {
    if (!micStreamRef.current || !isConnected) {
      return;
    }
    
    const newMicState = !isMicOn;
    setIsMicOn(newMicState);
    
    micStreamRef.current.getTracks().forEach(track => {
      track.enabled = newMicState;
    });
    
    if (!newMicState) {
      setAudioLevel(0);
    }
  }, [isMicOn]);

  const cleanupAudio = useCallback(() => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    setIsMicOn(false);
    setAudioLevel(0);
  }, []);

  return {
    isMicOn,
    audioLevel,
    micStreamRef,
    remoteAudioRef,
    setupMicrophone,
    setupAudioAnalysis,
    toggleMic,
    cleanupAudio
  };
};
