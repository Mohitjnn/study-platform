import { Button } from '@/components/ui/button';

interface ConnectionControlsProps {
  isConnected: boolean;
  isConnecting: boolean;
  isEnding: boolean;
  onEndSession: () => void;
  autoStarted?: boolean;
}

export const ConnectionControls = ({ 
  isConnected, 
  isConnecting, 
  isEnding, 
  onEndSession,
  autoStarted = false
}: ConnectionControlsProps) => {
  // Only show controls if session is connected or if it was auto-started
  if (!isConnected && !isConnecting && !isEnding && autoStarted) {
    return null;
  }

  return (
    <Button
      variant="destructive"
      onClick={onEndSession}
      disabled={isEnding || (!isConnected && !isConnecting)}
      className="min-w-[120px]"
    >
      {isConnecting ? 'Connecting...' : 
       isEnding ? 'Ending...' :
       'End Session'}
    </Button>
  );
};
