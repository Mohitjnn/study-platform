import { useState, useRef, useEffect, useCallback } from 'react';
import { loadDtlnModule } from '../dtnLoader';
import { DtlnHandle, AudioProcessorResult, AudioCleaningConfig } from '../../types/audio';

export const useAudioManagement = () => {
  const [isMicOn, setIsMicOn] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const micStreamRef = useRef<MediaStream | null>(null);
  const processedStreamRef = useRef<MediaStream | null>(null); // ✅ Processed audio stream
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dtlnHandleRef = useRef<DtlnHandle | null>(null);
  const dtlnModuleRef = useRef<ReturnType<typeof loadDtlnModule> extends Promise<infer T> ? T : never | null>(null);
  const isInitializingRef = useRef<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null); // ✅ For processing
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null); // ✅ Output stream
  const audioCleaningConfig = useRef<AudioCleaningConfig>({
    enabled: true,
    sampleRate: 16000,
    frameSize: 512
  });

  // Initialize audio context for visualization
  useEffect(() => {
    const initAudio = async () => {
      if (isInitializingRef.current || audioContextRef.current) {
        return;
      }
      
      isInitializingRef.current = true;
      
      try {
        let AudioCtx: typeof AudioContext | undefined = undefined;
        if (typeof window.AudioContext !== 'undefined') {
          AudioCtx = window.AudioContext;
        } else if ('webkitAudioContext' in window && typeof (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext !== 'undefined') {
          AudioCtx = (window as Window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        }
        if (AudioCtx) {
          audioContextRef.current = new AudioCtx({ sampleRate: audioCleaningConfig.current.sampleRate });
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;
        } else {
          throw new Error('No AudioContext available');
        }
        
        // Initialize DTLN for noise reduction
        if (audioCleaningConfig.current.enabled && !dtlnHandleRef.current) {
          try {
            const dtlnModule = await loadDtlnModule();
            dtlnModuleRef.current = dtlnModule;
          
            if (dtlnModule.dtln_create && dtlnModule.dtln_denoise) {
              const handle = dtlnModule.dtln_create();
              dtlnHandleRef.current = { handle };
            } else {
              audioCleaningConfig.current.enabled = false;
            }
          } catch (dtlnError) {
            audioCleaningConfig.current.enabled = false;
          }
        }
        
        // Create remote audio element
        if (!remoteAudioRef.current) {
          remoteAudioRef.current = new Audio();
          remoteAudioRef.current.autoplay = true;
        }
      } catch (error) {
        // Error initializing audio
      } finally {
        isInitializingRef.current = false;
      }
    };
    initAudio();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  const setupMicrophone = useCallback(async () => {
    if (navigator.mediaDevices && window.isSecureContext) {
      try {
        // Get raw microphone stream
        const rawStream = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
            echoCancellation: true, 
            noiseSuppression: false, // ✅ Disable browser noise suppression - we'll use DTLN
            autoGainControl: true,
            sampleRate: audioCleaningConfig.current.sampleRate
          } 
        });
        
        micStreamRef.current = rawStream;
        
        // ✅ Process audio with DTLN if enabled
        if (audioCleaningConfig.current.enabled && audioContextRef.current && dtlnHandleRef.current && dtlnModuleRef.current) {
          
          const source = audioContextRef.current.createMediaStreamSource(rawStream);
          
          // Create ScriptProcessor for real-time processing
          const bufferSize = audioCleaningConfig.current.frameSize;
          processorNodeRef.current = audioContextRef.current.createScriptProcessor(bufferSize, 1, 1);
          
          // Create destination for processed stream
          destinationRef.current = audioContextRef.current.createMediaStreamDestination();
          
          const inputBuffer = new Float32Array(bufferSize);
          let bufferIndex = 0;
          
          // ✅ Process audio in real-time
          processorNodeRef.current.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const outputData = audioProcessingEvent.outputBuffer.getChannelData(0);
            
            try {
              // Accumulate input until we have a full buffer
              for (let i = 0; i < inputData.length; i++) {
                inputBuffer[bufferIndex++] = inputData[i];
                
                if (bufferIndex >= bufferSize) {
                  // Process with DTLN
                  const processedBuffer = new Float32Array(bufferSize);
                  if (dtlnModuleRef.current?.dtln_denoise && dtlnHandleRef.current?.handle) {
                    dtlnModuleRef.current.dtln_denoise(
                      dtlnHandleRef.current.handle,
                      inputBuffer,
                      processedBuffer
                    );
                    // Copy processed data to output
                    outputData.set(processedBuffer.subarray(0, inputData.length));
                  } else {
                    // Fallback to passthrough
                    outputData.set(inputData);
                  }
                  bufferIndex = 0;
                }
              }
            } catch (error) {
              // On error, pass through original audio
              outputData.set(inputData);
            }
          };
          
          // Connect the pipeline
          source.connect(processorNodeRef.current);
          processorNodeRef.current.connect(destinationRef.current);
          
          // Use the processed stream
          processedStreamRef.current = destinationRef.current.stream;
        } else {
          // No DTLN processing - use raw stream
          processedStreamRef.current = rawStream;
        }
        
        const audioTrack = processedStreamRef.current.getTracks()[0];
        audioTrack.enabled = true;
        setIsMicOn(true);
        return processedStreamRef.current; // ✅ Return processed stream for WebRTC
      } catch (error) {
        return null;
      }
    } else {
      return null;
    }
  }, []);

  // ✅ Setup visualization (separate from processing)
  const setupAudioAnalysis = useCallback((isConnected: boolean) => {
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (!processedStreamRef.current || !audioContextRef.current || !analyserRef.current) {
      return;
    }
    
    // Analyze the processed stream for visualization
    const source = audioContextRef.current.createMediaStreamSource(processedStreamRef.current);
    source.connect(analyserRef.current);
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    let frameCount = 0;
    
    const updateAudioLevel = () => {
      if (!analyserRef.current || !isMicOn || !isConnected) {
        setAudioLevel(0);
        animationFrameRef.current = null;
        return;
      }
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const normalizedLevel = average / 255;
      setAudioLevel(normalizedLevel);
      
      frameCount++;
      
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    };
    
    updateAudioLevel();
  }, []);

  const toggleMic = useCallback((isConnected: boolean) => {
    if (!processedStreamRef.current || !isConnected) {
      return;
    }
    
    const newMicState = !isMicOn;
    setIsMicOn(newMicState);
    
    processedStreamRef.current.getTracks().forEach(track => {
      track.enabled = newMicState;
    });
    
    if (!newMicState) {
      setAudioLevel(0);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, [isMicOn]);

  const cleanupAudio = useCallback(() => {
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Disconnect processor
    if (processorNodeRef.current) {
      processorNodeRef.current.disconnect();
      processorNodeRef.current = null;
    }
    
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    
    if (processedStreamRef.current) {
      processedStreamRef.current.getTracks().forEach(track => track.stop());
      processedStreamRef.current = null;
    }
    
    if (dtlnHandleRef.current && dtlnModuleRef.current?.dtln_destroy) {
      try {
        dtlnModuleRef.current.dtln_destroy(dtlnHandleRef.current.handle);
      } catch (error) {
        // Error destroying DTLN handle
      }
    }
    
    setIsMicOn(false);
    setAudioLevel(0);
    dtlnHandleRef.current = null;
    dtlnModuleRef.current = null;
    isInitializingRef.current = false;
  }, []);

  return {
    isMicOn,
    audioLevel,
    micStreamRef: processedStreamRef, // ✅ Return processed stream
    remoteAudioRef,
    setupMicrophone,
    setupAudioAnalysis,
    toggleMic,
    cleanupAudio
  };
};