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
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        
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
      console.log('🎤 Setting up microphone...');
      micStreamRef.current = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true, 
          autoGainControl: true 
        } 
      });
      
      console.log('✅ Microphone stream obtained');
      const audioTrack = micStreamRef.current.getTracks()[0];
      
      // Initially disable the audio track until mic is turned on manually
      audioTrack.enabled = false;
      setIsMicOn(false);
      
      return micStreamRef.current;
    } else {
      console.warn('⚠️ MediaDevices not available or not in secure context');
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
          
          // Log audio activity only when mic is on and audio is detected
          if (normalizedLevel > 0.1) {
            const audioTrack = micStreamRef.current?.getTracks()[0];
            console.log('🎤 Audio detected, level:', normalizedLevel.toFixed(3), 'Mic enabled:', audioTrack?.enabled);
          }
          
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
      console.warn('⚠️ No microphone stream available or not connected');
      return;
    }
    
    const newMicState = !isMicOn;
    console.log(`🎤 Toggling microphone: ${isMicOn} -> ${newMicState}`);
    setIsMicOn(newMicState);
    
    micStreamRef.current.getTracks().forEach(track => {
      track.enabled = newMicState;
      console.log(`🎤 Track ${track.id} enabled: ${track.enabled}, readyState: ${track.readyState}`);
    });
    
    if (newMicState) {
      console.log('🔊 Microphone is now ACTIVE - audio will be sent to AI');
    } else {
      console.log('🔇 Microphone is now MUTED - no audio will be sent');
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
