import { Button } from '@/components/ui/button';

interface AudioControlsProps {
  isConnected: boolean;
  isMicOn: boolean;
  audioLevel: number;
  micStreamAvailable: boolean;
  onToggleMic: () => void;
}

export const AudioControls = ({
  isConnected,
  isMicOn,
  audioLevel,
  micStreamAvailable,
  onToggleMic
}: AudioControlsProps) => {
  if (!isConnected) return null;

  return (
    <>
      <Button
        variant={isMicOn ? "default" : "secondary"}
        onClick={onToggleMic}
        disabled={!micStreamAvailable}
        className={`min-w-[120px] ${isMicOn ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}`}
      >
        {isMicOn ? '🎤 Mic ON' : '🎤 Mic OFF'}
      </Button>
    </>
  );
};
