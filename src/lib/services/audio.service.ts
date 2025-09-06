// lib/services/audio.service.ts (SIMPLIFIED WORKING VERSION)
import { WebRTCRefs } from '@/types/chat.type';

export class AudioAnalysisService {
  private refs: WebRTCRefs;
  private animationFrameId: number | null = null;

  constructor(refs: WebRTCRefs) {
    this.refs = refs;
  }

  async initializeAudioContext(): Promise<void> {
    try {
      console.log('🎧 Initializing audio context...');
      
      // Create AudioContext for analysis only
      this.refs.audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.refs.analyserRef.current = this.refs.audioContextRef.current.createAnalyser();
      this.refs.analyserRef.current.fftSize = 256;
      
      // CRITICAL FIX: Simple audio element setup (like original code)
      this.refs.remoteAudioRef.current = document.createElement('audio');
      const audio = this.refs.remoteAudioRef.current;
      
      // Keep it simple - exactly like the working code
      audio.autoplay = true;
      
      console.log('✅ Audio context initialized successfully');
      
    } catch (error) {
      console.error('❌ Error initializing audio context:', error);
    }
  }

  setupRemoteAudioPlayback(peerConnection: RTCPeerConnection): void {
    console.log('🔊 Setting up remote audio playback...');
    
    if (!this.refs.remoteAudioRef.current) {
      console.error('❌ No remote audio element available');
      return;
    }

    const audioEl = this.refs.remoteAudioRef.current;
    
    // CRITICAL FIX: Simple ontrack handler (exactly like working code)
    peerConnection.ontrack = (e) => {
      console.log('🎵 Received remote track:', e.track.kind);
      
      if (e.track.kind === 'audio') {
        // Simple, direct assignment - no complex logic
        audioEl.srcObject = e.streams[0];
        console.log('✅ Audio stream assigned to element');
      }
    };
  }

  setupAudioAnalysis(micStream: MediaStream, onAudioLevelUpdate: (level: number) => void): void {
    if (!this.refs.audioContextRef.current || !this.refs.analyserRef.current) {
      console.warn('Audio context not initialized');
      return;
    }

    console.log('🎤 Setting up audio analysis...');
    
    // Resume audio context if suspended
    if (this.refs.audioContextRef.current.state === 'suspended') {
      this.refs.audioContextRef.current.resume();
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
    console.log('🧹 Cleaning up audio service...');
    
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