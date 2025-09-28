import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

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
  onToggleMic,
}: AudioControlsProps) => {
  if (!isConnected) return null;

  return (
    <>
      <div className="h-24">
        <button
          className="bg-white/10 text-white rounded-full p-6 border border-white/30 flex justify-center items-center"
          onClick={onToggleMic}
          disabled={!micStreamAvailable}
        >
          {isMicOn ? <Mic size={32} /> : <MicOff size={32} />}
        </button>
      </div>
    </>
  );
};
