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
  const dtlnStateRef = useRef<'idle' | 'initializing' | 'running' | 'stopping' | 'stopped' | 'error'>('idle');
  const dtlnModuleRef = useRef<ReturnType<typeof loadDtlnModule> extends Promise<infer T> ? T : never | null>(null);
  const isInitializingRef = useRef<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null); // ✅ For processing
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null); // ✅ Output stream
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null); // ✅ Track source for cleanup
  const isProcessingActiveRef = useRef<boolean>(false); // ✅ Guard for audio processing
  const isCleaningUpRef = useRef<boolean>(false); // ✅ Prevent multiple cleanup calls
  const audioCleaningConfig = useRef<AudioCleaningConfig>({
    enabled: (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_DTLN === 'true') && 
             process.env.NEXT_PUBLIC_DISABLE_DTLN !== 'true', // ✅ Emergency disable flag
    sampleRate: 16000,
    frameSize: 512
  });

  // Initialize audio context for visualization
  useEffect(() => {
    const initAudio = async () => {
      // ✅ Prevent duplicate initialization in React Strict Mode
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
        if (audioCleaningConfig.current.enabled && !dtlnModuleRef.current) {
          try {
            dtlnStateRef.current = 'initializing';
            const dtlnModule = await loadDtlnModule();
            dtlnModuleRef.current = dtlnModule;
            
            // ✅ Don't create handle here - create it only when needed during setupMicrophone
            if (dtlnModule.dtln_create && dtlnModule.dtln_denoise && dtlnModule.dtln_destroy) {
              dtlnStateRef.current = 'idle';
              console.log('[DTLN] ✅ Module initialized'); // ✅ Essential init log
            } else {
              audioCleaningConfig.current.enabled = false;
              dtlnStateRef.current = 'error';
            }
          } catch (dtlnError) {
            audioCleaningConfig.current.enabled = false;
            dtlnStateRef.current = 'error';
          }
        }
        
        // Create remote audio element
        if (!remoteAudioRef.current) {
          remoteAudioRef.current = new Audio();
          remoteAudioRef.current.autoplay = true;
        }
      } catch (error) {
        console.error('[Audio] Error initializing audio:', error);
      } finally {
        isInitializingRef.current = false;
      }
    };
    
    // ✅ Add a small delay to reduce race conditions in React Strict Mode
    const timeoutId = setTimeout(initAudio, 100);
    
    return () => {
      clearTimeout(timeoutId);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  // ✅ Helper function to safely start DTLN processing
  const startDtlnProcessing = useCallback(() => {
    if (dtlnStateRef.current !== 'idle' || !dtlnHandleRef.current || !dtlnModuleRef.current) {
      return false;
    }
    
    dtlnStateRef.current = 'running';
    isProcessingActiveRef.current = true;
    console.log('[DTLN] ✅ Processing activated'); // ✅ Essential activation log
    return true;
  }, []);

  // ✅ Helper function to safely stop DTLN processing
  const stopDtlnProcessing = useCallback(() => {
    if (dtlnStateRef.current === 'running') {
      dtlnStateRef.current = 'stopping';
      isProcessingActiveRef.current = false;
      
      // Give time for any in-flight audio processing to complete
      setTimeout(() => {
        if (dtlnStateRef.current === 'stopping') {
          dtlnStateRef.current = 'stopped';
        }
      }, 100);
    }
  }, []);

  // ✅ Helper function to safely reset DTLN instance
  const resetDtlnInstance = useCallback(async () => {
    // ✅ Always destroy existing handle first
    if (dtlnHandleRef.current && dtlnModuleRef.current?.dtln_destroy) {
      try {
        dtlnModuleRef.current.dtln_destroy(dtlnHandleRef.current.handle);
      } catch (error) {
        console.warn('[Audio] Error destroying DTLN handle:', error);
      }
      dtlnHandleRef.current = null;
    }

    // ✅ Only create new handle if module is ready and enabled
    if (audioCleaningConfig.current.enabled && 
        dtlnModuleRef.current?.dtln_create && 
        dtlnStateRef.current !== 'error') {
      
      // ✅ Try multiple times with delays - DTLN might need time after TensorFlow init
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {          
          // Add delay for TensorFlow to stabilize
          if (attempt > 1) {
            await new Promise(resolve => setTimeout(resolve, 500 * attempt));
          }
          
          const handle = dtlnModuleRef.current.dtln_create();
          if (handle && handle !== 0) {
            dtlnHandleRef.current = { handle };
            dtlnStateRef.current = 'idle';
            return true;
          }
        } catch (error) {
          // Silent retry on error
        }
      }
      
      // All attempts failed
      dtlnStateRef.current = 'error';
      return false;
    }
    
    // Module not ready or disabled
    return false;
  }, []);

  // ✅ Removed detailed DTLN analysis for production - keeping only essential logs

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
        if (audioCleaningConfig.current.enabled && audioContextRef.current && dtlnModuleRef.current) {
          
          // ✅ Stop any existing processing before starting new
          stopDtlnProcessing();
          
          // ✅ Wait for any ongoing processing to complete
          await new Promise(resolve => setTimeout(resolve, 150));
          
          // ✅ Reset DTLN instance for fresh start (this creates the handle)
          const dtlnReady = await resetDtlnInstance();
          if (!dtlnReady) {
            console.warn('[Audio] DTLN reset failed, using passthrough');
            processedStreamRef.current = rawStream;
          } else {
            const source = audioContextRef.current.createMediaStreamSource(rawStream);
            sourceNodeRef.current = source;
            
            // Create ScriptProcessor for real-time processing
            const bufferSize = audioCleaningConfig.current.frameSize;
            processorNodeRef.current = audioContextRef.current.createScriptProcessor(bufferSize, 1, 1);
            
            // Create destination for processed stream
            destinationRef.current = audioContextRef.current.createMediaStreamDestination();
            
            const inputBuffer = new Float32Array(bufferSize);
            let bufferIndex = 0;
            
            // ✅ Protected audio processing with lifecycle checks and DTLN analysis
            processorNodeRef.current.onaudioprocess = (audioProcessingEvent) => {
              // ✅ Guard: Only process if DTLN is in running state
              if (!isProcessingActiveRef.current || dtlnStateRef.current !== 'running') {
                // Passthrough during invalid states
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const outputData = audioProcessingEvent.outputBuffer.getChannelData(0);
                outputData.set(inputData);
                return;
              }

              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const outputData = audioProcessingEvent.outputBuffer.getChannelData(0);
              
              try {
                // ✅ Ensure we have complete frames for DTLN processing
                for (let i = 0; i < inputData.length; i++) {
                  inputBuffer[bufferIndex++] = inputData[i];
                  
                  if (bufferIndex >= bufferSize) {
                    // ✅ Double-check state before processing
                    if (isProcessingActiveRef.current && 
                        dtlnStateRef.current === 'running' && 
                        dtlnModuleRef.current?.dtln_denoise && 
                        dtlnHandleRef.current?.handle) {
                      
                      // Process with DTLN
                      const processedBuffer = new Float32Array(bufferSize);
                      dtlnModuleRef.current.dtln_denoise(
                        dtlnHandleRef.current.handle,
                        inputBuffer,
                        processedBuffer
                      );
                      
                      // Copy processed data to output (only the current chunk size)
                      const outputChunkSize = Math.min(inputData.length, bufferSize);
                      outputData.set(processedBuffer.subarray(0, outputChunkSize));
                    } else {
                      // Fallback to passthrough if state changed
                      outputData.set(inputData);
                    }
                    bufferIndex = 0;
                    break; // Process only one buffer per audio event
                  }
                }
                
                // ✅ If buffer not full yet, use passthrough for this chunk
                if (bufferIndex < bufferSize) {
                  outputData.set(inputData);
                }
              } catch (error) {
                console.warn('[Audio] DTLN processing error:', error);
                // ✅ On error, mark as error state and passthrough
                dtlnStateRef.current = 'error';
                isProcessingActiveRef.current = false;
                outputData.set(inputData);
              }
            };
            
            // Connect the pipeline
            source.connect(processorNodeRef.current);
            processorNodeRef.current.connect(destinationRef.current);
            
            // ✅ Start DTLN processing only after pipeline is connected
            if (startDtlnProcessing()) {
              processedStreamRef.current = destinationRef.current.stream;
            } else {
              processedStreamRef.current = rawStream;
              processedStreamRef.current = rawStream;
            }
          }
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
    
    try {
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
        
        try {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          const normalizedLevel = average / 255;
          setAudioLevel(normalizedLevel);
          
          frameCount++;
          
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        } catch (error) {
          setAudioLevel(0);
          animationFrameRef.current = null;
        }
      };
      
      updateAudioLevel();
    } catch (error) {
      // Silent error handling
    }
  }, [isMicOn]);

  const toggleMic = useCallback((isConnected: boolean) => {
    if (!processedStreamRef.current || !isConnected) {
      return;
    }
    
    const newMicState = !isMicOn;
    setIsMicOn(newMicState);
    
    processedStreamRef.current.getTracks().forEach(track => {
      track.enabled = newMicState;
    });
    
    // ✅ Handle DTLN state when muting/unmuting
    if (newMicState) {
      // Unmuting - restart DTLN processing if available
      if (dtlnStateRef.current === 'stopped' || dtlnStateRef.current === 'idle') {
        startDtlnProcessing();
      }
    } else {
      // Muting - pause DTLN processing to save resources
      if (dtlnStateRef.current === 'running') {
        stopDtlnProcessing();
      }
      
      setAudioLevel(0);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, [isMicOn, startDtlnProcessing, stopDtlnProcessing]);

  const cleanupAudio = useCallback(() => {
    // ✅ Prevent multiple cleanup calls
    if (isCleaningUpRef.current) {
      return;
    }
    
    isCleaningUpRef.current = true;
    
    // ✅ Step 1: Stop DTLN processing first
    stopDtlnProcessing();
    
    // ✅ Step 2: Cancel any pending animations
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // ✅ Step 3: Disconnect audio graph (stops audio callbacks)
    if (processorNodeRef.current) {
      try {
        processorNodeRef.current.disconnect();
        processorNodeRef.current.onaudioprocess = null;
      } catch (error) {
        console.warn('Error disconnecting processor:', error);
      }
      processorNodeRef.current = null;
    }
    
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch (error) {
        console.warn('Error disconnecting source:', error);
      }
      sourceNodeRef.current = null;
    }
    
    if (destinationRef.current) {
      destinationRef.current = null;
    }
    
    // ✅ Step 4: Stop media streams
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    
    if (processedStreamRef.current) {
      processedStreamRef.current.getTracks().forEach(track => track.stop());
      processedStreamRef.current = null;
    }
    
    // ✅ Step 5: Wait briefly, then destroy DTLN handle
    setTimeout(() => {
      if (dtlnHandleRef.current && dtlnModuleRef.current?.dtln_destroy) {
        try {
          dtlnModuleRef.current.dtln_destroy(dtlnHandleRef.current.handle);
        } catch (error) {
          console.warn('Error destroying DTLN handle:', error);
        }
      }
      
      // ✅ Step 6: Reset all DTLN state
      dtlnHandleRef.current = null;
      dtlnStateRef.current = 'idle';
      isProcessingActiveRef.current = false;
      
      // ✅ Step 7: Reset UI state
      setIsMicOn(false);
      setAudioLevel(0);
      isInitializingRef.current = false;
      
      // ✅ Allow cleanup to run again
      isCleaningUpRef.current = false;
    }, 200); // Give time for any in-flight processing to complete
  }, [stopDtlnProcessing]);

  // ✅ Add function to handle reconnection scenarios
  const handleReconnection = useCallback(async () => {    
    // Stop current processing
    stopDtlnProcessing();
    
    // Brief pause to let things settle
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Reset DTLN if needed
    if (audioCleaningConfig.current.enabled && dtlnStateRef.current !== 'idle') {
      await resetDtlnInstance();
    }
    
    // Restart processing if we have a valid stream
    if (processedStreamRef.current && isMicOn) {
      startDtlnProcessing();
    }
    
  }, [stopDtlnProcessing, resetDtlnInstance, startDtlnProcessing, isMicOn]);

  return {
    isMicOn,
    audioLevel,
    micStreamRef: processedStreamRef, // ✅ Return processed stream
    remoteAudioRef,
    setupMicrophone,
    setupAudioAnalysis,
    toggleMic,
    cleanupAudio,
    handleReconnection, // ✅ New function for handling reconnections
    dtlnState: dtlnStateRef.current, // ✅ Expose DTLN state for debugging
  };
};