"use client";
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SandboxSettings } from './SandboxSettings';
import { SandboxChat } from './SandboxChat';
import { useAudioManagement } from '@/lib/hooks/useAudioManagement';
import { useConversationHandler } from '@/lib/hooks/useConversationHandler';
import { useImagePolling } from '@/lib/hooks/useImageState';
import { useSandboxWebRTC } from '@/lib/hooks/useSandboxWebRTC';

export interface SandboxConfig {
  model: string;
  prompt: string;
  temperature: number;
  max_output_tokens: number;
  threshold: number;
  prefix_padding_ms: number;
  silence_duration_ms: number;
  create_response: boolean;
  interrupt_response: boolean;
  auto_start: boolean;
}

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  type: "text" | "audio" | "image";
  imageUrl?: string;
  explanation?: string;
}

interface ConversationEvent {
  type: string;
  [key: string]: unknown;
}

const defaultConfig: SandboxConfig = {
  model: 'gpt-realtime',
  prompt: 'You are a helpful bot!',
  temperature: 0.82,
  max_output_tokens: 1024,
  threshold: 0.6,
  prefix_padding_ms: 500,
  silence_duration_ms: 1000,
  create_response: true,
  interrupt_response: false,
  auto_start: true,
};

interface User {
  id: string;
  name: string;
  email: string;
}

// Mock user for sandbox
const mockUser: User = {
  id: 'sandbox-user',
  name: 'Sandbox User',
  email: 'sandbox@test.com'
};

export const SandboxInterface: React.FC = () => {
  const [config, setConfig] = useState<SandboxConfig>(defaultConfig);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConfiguring, setIsConfiguring] = useState(true);
  const sessionStartedRef = useRef(false);

  // Audio management
  const audioManagement = useAudioManagement();
  
  // Conversation handling
  const conversationHandler = useConversationHandler(setMessages);
  
  // Image polling
  const imagePolling = useImagePolling(setMessages);

  // WebRTC data channel message handler
  const handleDataChannelMessage = (ev: ConversationEvent) => {
    imagePolling.maybeStartImagePollingFromEvent(ev);
    conversationHandler.handleConversationEvent(ev);
  };

  // Sandbox WebRTC connection
  const webrtcConnection = useSandboxWebRTC({
    user: mockUser,
    onDataChannelMessage: handleDataChannelMessage,
    remoteAudioRef: audioManagement.remoteAudioRef,
    config,
  });

  const handleConfigChange = (newConfig: Partial<SandboxConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  // Build query parameters for preview
  const buildQueryParams = () => {
    const params = new URLSearchParams({
      model: config.model,
      prompt: config.prompt,
      temperature: config.temperature.toString(),
      max_output_tokens: config.max_output_tokens.toString(),
      threshold: config.threshold.toString(),
      prefix_padding_ms: config.prefix_padding_ms.toString(),
      silence_duration_ms: config.silence_duration_ms.toString(),
      create_response: config.create_response.toString(),
      interrupt_response: config.interrupt_response.toString(),
      auto_start: config.auto_start.toString(),
    });
    return params.toString();
  };

  const handleBeginConversation = async () => {
    // If already connected, end the current session first
    if (webrtcConnection.isConnected) {
      console.log('🔄 Restarting session with new configuration...');
      await webrtcConnection.cleanup();
    }

    // Clear previous messages
    setMessages([]);
    setIsConfiguring(false);
    sessionStartedRef.current = true;

    try {
      // Setup microphone
      const micStream = await audioManagement.setupMicrophone();
      
      // Start WebRTC session with sandbox config
      await webrtcConnection.startSession(micStream);
      
      // Setup audio analysis
      audioManagement.setupAudioAnalysis(webrtcConnection.isConnected);
      
      // Add initial message with configuration summary
      const configSummary = `Sandbox session started with:
• Model: ${config.model}
• Temperature: ${config.temperature}
• Voice Threshold: ${config.threshold}
• Max Tokens: ${config.max_output_tokens}

You can now speak to test your configuration!`;

      setMessages([{
        id: Date.now().toString(),
        content: configSummary,
        role: "assistant",
        timestamp: new Date(),
        type: "text",
      }]);
    } catch (error) {
      console.error('Failed to start sandbox session:', error);
      sessionStartedRef.current = false;
      setIsConfiguring(true);
      
      // Show error message
      setMessages([{
        id: Date.now().toString(),
        content: `Failed to start sandbox session: ${error instanceof Error ? error.message : 'Unknown error'}`,
        role: "assistant",
        timestamp: new Date(),
        type: "text",
      }]);
    }
  };

  const handleEndConversation = async () => {
    await webrtcConnection.cleanup();
    audioManagement.cleanupAudio();
    imagePolling.stopImagePolling();
    setIsConfiguring(true);
    sessionStartedRef.current = false;
    setMessages([]);
  };

  const toggleMic = () => {
    audioManagement.toggleMic(webrtcConnection.isConnected);
  };

  return (
    <div className="grid grid-cols-1 h-full">

              {/* Chat Panel */}
      <Card className="h-full">
        <CardHeader>
          <CardTitle>
            Conversation Test
            {webrtcConnection.isConnected && (
              <span className="ml-2 text-sm font-normal text-green-600">
                • Connected
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-80px)]">
          <SandboxChat
            messages={messages}
            isConnected={webrtcConnection.isConnected}
            isConnecting={webrtcConnection.isConnecting}
            audioLevel={audioManagement.isMicOn ? audioManagement.audioLevel : 0}
            isSpeaking={conversationHandler.isSpeaking}
            isMicOn={audioManagement.isMicOn}
          />
        </CardContent>
      </Card>
      {/* Settings Panel */}
      <Card className="h-full mt-12">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Configuration
            {!isConfiguring && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsConfiguring(true)}
              >
                Edit Settings
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-80px)] overflow-y-auto">
          <SandboxSettings
            config={config}
            onChange={handleConfigChange}
            disabled={webrtcConnection.isConnected && !isConfiguring}
          />
          
          <div className="mt-6 pt-6 border-t border-border">
            {isConfiguring ? (
              <Button 
                onClick={handleBeginConversation}
                disabled={webrtcConnection.isConnecting}
                className="w-full"
                size="lg"
              >
                {webrtcConnection.isConnecting ? 'Starting...' : 
                 webrtcConnection.isConnected ? 'Restart with New Config' : 
                 'Begin New Conversation'}
              </Button>
            ) : (
              <div className="space-y-3">
                <Button 
                  onClick={handleBeginConversation}
                  disabled={webrtcConnection.isConnecting}
                  className="w-full"
                  variant="outline"
                >
                  {webrtcConnection.isConnecting ? 'Restarting...' : 'Restart with Current Config'}
                </Button>

                <Button 
                  onClick={handleEndConversation}
                  variant="destructive"
                  disabled={webrtcConnection.isEnding}
                  className="w-full"
                >
                  {webrtcConnection.isEnding ? 'Ending...' : 'End Conversation'}
                </Button>
                
                {webrtcConnection.isConnected && (
                  <Button
                    variant={audioManagement.isMicOn ? "default" : "secondary"}
                    onClick={toggleMic}
                    disabled={!audioManagement.micStreamRef.current}
                    className={`w-full ${audioManagement.isMicOn ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}`}
                  >
                    {audioManagement.isMicOn ? '🎤 Mic ON' : '🎤 Mic OFF'}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Configuration Preview */}
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-sm font-medium mb-3">Current Configuration</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Model: <span className="text-foreground">{config.model}</span></div>
              <div>Temperature: <span className="text-foreground">{config.temperature}</span></div>
              <div>Threshold: <span className="text-foreground">{config.threshold}</span></div>
              <div>Max Tokens: <span className="text-foreground">{config.max_output_tokens}</span></div>
              <div>Prefix Padding: <span className="text-foreground">{config.prefix_padding_ms}ms</span></div>
              <div>Silence Duration: <span className="text-foreground">{config.silence_duration_ms}ms</span></div>
            </div>
            
            {/* <div className="mt-3">
              <h5 className="text-xs font-medium mb-1">API Endpoints:</h5>
              <div className="space-y-2">
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">SDP Exchange:</div>
                  <div className="text-xs text-muted-foreground break-all p-2 bg-muted rounded font-mono">
                    POST https://burgerkingswaadkapatakha.com/api/v1/realtime2/sandbox/sdp?{buildQueryParams()}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">End Session:</div>
                  <div className="text-xs text-muted-foreground break-all p-2 bg-muted rounded font-mono">
                    POST https://burgerkingswaadkapatakha.com/api/v1/realtime2/sandbox/end
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </CardContent>
      </Card>


    </div>
  );
};
