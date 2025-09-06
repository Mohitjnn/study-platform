// lib/services/webrtc.service.ts (SIMPLIFIED WORKING VERSION)
import { exchangeSdp, bindWebRtcContext, endWebRtcSession, exchangeSdpFallback } from '@/lib/api/webrtc';
import { WebRTCEvent, User, WebRTCRefs } from '@/types/chat.type';
import { AudioAnalysisService } from './audio.service';

export class WebRTCService {
  private refs: WebRTCRefs;
  private audioService: AudioAnalysisService;

  constructor(refs: WebRTCRefs, audioService: AudioAnalysisService) {
    this.refs = refs;
    this.audioService = audioService;
  }

  async createPeerConnection(): Promise<RTCPeerConnection> {
    console.log('🔗 Creating RTCPeerConnection...');
    
    // Simple peer connection setup (like original)
    const pc = new RTCPeerConnection();
    
    pc.onconnectionstatechange = () => {
      console.log('🔄 Connection state changed:', pc.connectionState);
      if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        // Handle cleanup elsewhere
      }
    };

    return pc;
  }

  async setupMicrophone(): Promise<MediaStream | null> {
    if (!navigator.mediaDevices || !window.isSecureContext) {
      console.warn('⚠️ MediaDevices not available or not in secure context');
      return null;
    }

    try {
      console.log('🎤 Setting up microphone...');
      
      // EXACTLY like the working code
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true, 
          autoGainControl: true 
        } 
      });

      console.log('✅ Microphone stream obtained');
      
      // NOTE: In original code, mic starts ON by default
      // We'll keep our toggle functionality but ensure track is properly handled
      const audioTrack = stream.getTracks()[0];
      audioTrack.enabled = false; // Start with mic off like our UI expects
      
      return stream;
    } catch (error) {
      console.error('❌ Error setting up microphone:', error);
      return null;
    }
  }

  setupRemoteAudioPlayback(pc: RTCPeerConnection): void {
    // Delegate to audio service with simple setup
    this.audioService.setupRemoteAudioPlayback(pc);
  }

  createDataChannel(pc: RTCPeerConnection): RTCDataChannel {
    console.log('📡 Creating data channel...');
    
    // Simple data channel setup (like original)
    const dc = pc.createDataChannel('oai-events');
    
    dc.onopen = () => console.log('✅ Data channel opened');
    dc.onerror = (error) => console.error('❌ Data channel error:', error);
    dc.onclose = () => console.log('📡 Data channel closed');
    
    return dc;
  }

  async exchangeSDP(offer: RTCSessionDescriptionInit, model: string): Promise<string> {
    console.log('📤 Exchanging SDP...');
    
    try {
      return await exchangeSdp(offer.sdp!, model);
    } catch (error) {
      console.warn('⚠️ Primary SDP exchange failed, trying fallback...');
      return await exchangeSdpFallback(offer.sdp!, model);
    }
  }

  async bindContext(user: User): Promise<void> {
    console.log('🔗 Binding context...');
    try {
      await bindWebRtcContext({ 
        title: 'AI Chat Session', 
        information: `User: ${user.full_name || 'Anonymous'}` 
      });
    } catch (e) {
      console.warn('bind-context failed', e);
    }
  }

  async endSession(): Promise<void> {
    try {
      await endWebRtcSession();
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  cleanup(): void {
    console.log('🧹 Cleaning up WebRTC...');
    
    // Simple cleanup (like original)
    if (this.refs.pcRef.current) {
      this.refs.pcRef.current.ontrack = null;
      this.refs.pcRef.current.onconnectionstatechange = null;
      this.refs.pcRef.current.close();
      this.refs.pcRef.current = null;
    }
    
    if (this.refs.dcRef.current) {
      this.refs.dcRef.current.close();
      this.refs.dcRef.current = null;
    }
    
    if (this.refs.micStreamRef.current) {
      this.refs.micStreamRef.current.getTracks().forEach(track => track.stop());
      this.refs.micStreamRef.current = null;
    }
  }

  toggleMicrophone(isMicOn: boolean): boolean {
    if (!this.refs.micStreamRef.current) {
      console.warn('⚠️ No microphone stream available');
      return isMicOn;
    }
    
    const newMicState = !isMicOn;
    console.log(`🎤 Toggling microphone: ${isMicOn} -> ${newMicState}`);
    
    // Simple toggle (like original)
    this.refs.micStreamRef.current.getTracks().forEach(track => {
      track.enabled = newMicState;
    });
    
    return newMicState;
  }
}