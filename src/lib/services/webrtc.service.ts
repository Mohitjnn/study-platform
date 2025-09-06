// lib/services/webrtc.service.ts
import { exchangeSdp, bindWebRtcContext, endWebRtcSession, exchangeSdpFallback } from '@/lib/api/webrtc';
import { WebRTCEvent, User, WebRTCRefs } from "@/types/chat.type";

export class WebRTCService {
  private refs: WebRTCRefs;

  constructor(refs: WebRTCRefs) {
    this.refs = refs;
  }

  async createPeerConnection(): Promise<RTCPeerConnection> {
    const pc = new RTCPeerConnection();
    
    pc.onconnectionstatechange = () => {
      console.log('🔄 Connection state changed:', pc.connectionState);
      console.log('🔄 ICE connection state:', pc.iceConnectionState);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 ICE candidate:', event.candidate.type);
      } else {
        console.log('🧊 ICE gathering completed');
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
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true, 
          autoGainControl: true 
        } 
      });

      console.log('✅ Microphone stream obtained');
      const audioTrack = stream.getTracks()[0];
      audioTrack.enabled = false; // Initially disabled
      
      return stream;
    } catch (error) {
      console.error('❌ Error setting up microphone:', error);
      return null;
    }
  }

  setupRemoteAudio(pc: RTCPeerConnection): void {
    if (this.refs.remoteAudioRef.current) {
      pc.ontrack = (e) => {
        console.log('🎵 Received remote track:', e);
        if (this.refs.remoteAudioRef.current) {
          this.refs.remoteAudioRef.current.srcObject = e.streams[0];
        }
      };
    }
  }

  createDataChannel(pc: RTCPeerConnection): RTCDataChannel {
    console.log('📡 Creating data channel...');
    const dc = pc.createDataChannel('oai-events');
    
    dc.onopen = () => console.log('✅ Data channel opened successfully');
    dc.onerror = (error) => console.error('❌ Data channel error:', error);
    dc.onclose = () => console.log('📡 Data channel closed');
    
    return dc;
  }

  async exchangeSDP(offer: RTCSessionDescriptionInit, model: string): Promise<string> {
    console.log('📤 Local description set, exchanging SDP...');
    
    try {
      return await exchangeSdp(offer.sdp!, model);
    } catch (error) {
      console.warn('⚠️ Primary SDP exchange failed, trying fallback method...');
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
    // Cleanup WebRTC connections
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
    
    this.refs.micStreamRef.current.getTracks().forEach(track => {
      track.enabled = newMicState;
      console.log(`🎤 Track ${track.id} enabled: ${track.enabled}`);
    });
    
    if (newMicState) {
      console.log('🔊 Microphone is now ACTIVE');
    } else {
      console.log('🔇 Microphone is now MUTED');
    }
    
    return newMicState;
  }
}