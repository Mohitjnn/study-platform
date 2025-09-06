// lib/services/audio.service.ts
import { WebRTCRefs } from '@/types/chat.type';

export class AudioAnalysisService {
  private refs: WebRTCRefs;
  private animationFrameId: number | null = null;

  constructor(refs: WebRTCRefs) {
    this.refs = refs;
  }

  async initializeAudioContext(): Promise<void> {
    try {
      this.refs.audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.refs.analyserRef.current = this.refs.audioContextRef.current.createAnalyser();
      this.refs.analyserRef.current.fftSize = 256;
      
      // Create remote audio element
      this.refs.remoteAudioRef.current = new Audio();
      this.refs.remoteAudioRef.current.autoplay = true;
    } catch (error) {
      console.error('Error initializing audio context:', error);
    }
  }

  setupAudioAnalysis(micStream: MediaStream, onAudioLevelUpdate: (level: number) => void): void {
    if (!this.refs.audioContextRef.current || !this.refs.analyserRef.current) {
      console.warn('Audio context not initialized');
      return;
    }

    const source = this.refs.audioContextRef.current.createMediaStreamSource(micStream);
    source.connect(this.refs.analyserRef.current);
    
    const dataArray = new Uint8Array(this.refs.analyserRef.current.frequencyBinCount);
    
    const updateAudioLevel = () => {
      if (this.refs.analyserRef.current) {
        this.refs.analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const normalizedLevel = average / 255;
        
        onAudioLevelUpdate(normalizedLevel);
        
        // Log audio activity when detected
        if (normalizedLevel > 0.1) {
          console.log('🎤 Audio detected, level:', normalizedLevel.toFixed(3));
        }
        
        this.animationFrameId = requestAnimationFrame(updateAudioLevel);
      }
    };
    
    updateAudioLevel();
  }

  stopAudioAnalysis(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  cleanup(): void {
    this.stopAudioAnalysis();
    
    if (this.refs.audioContextRef.current) {
      this.refs.audioContextRef.current.close();
      this.refs.audioContextRef.current = null;
    }
    
    if (this.refs.remoteAudioRef.current) {
      this.refs.remoteAudioRef.current.srcObject = null;
      this.refs.remoteAudioRef.current = null;
    }
  }
}