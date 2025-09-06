import { Button } from '@/components/ui/button';

interface ConnectionControlsProps {
  isConnected: boolean;
  isConnecting: boolean;
  isEnding: boolean;
  onStartSession: () => void;
  onEndSession: () => void;
}

export const ConnectionControls = ({ 
  isConnected, 
  isConnecting, 
  isEnding, 
  onStartSession, 
  onEndSession 
}: ConnectionControlsProps) => {
  return (
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
  );
};
