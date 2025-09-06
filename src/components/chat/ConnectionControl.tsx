// components/chat/ConnectionControls.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { ConnectionState, AudioState } from '@/types/chat.type';

interface ConnectionControlsProps {
  connectionState: ConnectionState;
  audioState: AudioState;
  onStartSession: () => void;
  onEndSession: () => void;
  onToggleMic: () => void;
  hasMicStream: boolean;
}

export const ConnectionControls: React.FC<ConnectionControlsProps> = ({
  connectionState,
  audioState,
  onStartSession,
  onEndSession,
  onToggleMic,
  hasMicStream
}) => {
  const { isConnected, isConnecting, isEnding, status } = connectionState;
  const { isMicOn, audioLevel } = audioState;

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant={isConnected ? "destructive" : "default"}
              onClick={isConnected ? onEndSession : onStartSession}
              disabled={isConnecting || isEnding}
              className="min-w-[120px]"
            >
              {isConnecting ? 'Connecting...' : 
               isEnding ? 'Ending...' :
               isConnected ? 'End Session' : 'Start Voice Chat'}
            </Button>
            
            {isConnected && (
              <>
                <Button
                  variant={isMicOn ? "default" : "secondary"}
                  onClick={onToggleMic}
                  disabled={!hasMicStream}
                  className={`min-w-[120px] ${
                    isMicOn 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {isMicOn ? '🎤 Mic ON' : '🎤 Mic OFF'}
                </Button>
                
                {/* Audio Level Indicator */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">Audio:</span>
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-100"
                      style={{ width: `${audioLevel * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {(audioLevel * 100).toFixed(0)}%
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col items-end">
            <p className="text-sm text-muted-foreground">
              Status: {status}
            </p>
            {isConnected && (
              <>
                <p className="text-xs text-muted-foreground">
                  WebRTC: Connected
                </p>
                <p className={`text-xs font-medium ${
                  isMicOn ? 'text-green-500' : 'text-red-500'
                }`}>
                  🎤 {isMicOn ? 'SENDING AUDIO' : 'AUDIO MUTED'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};