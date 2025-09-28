import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

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
  autoStarted = false,
}: ConnectionControlsProps) => {
  // Only show controls if session is connected or if it was auto-started
  if (!isConnected && !isConnecting && !isEnding && autoStarted) {
    return null;
  }

  return (
    <div>
      <button
        className="bg-white/10 text-white rounded-full p-3 border border-white/30 flex justify-center items-center"
        onClick={onEndSession}
        disabled={isEnding || (!isConnected && !isConnecting)}
      >
        {isConnecting ? (
          "Connecting..."
        ) : isEnding ? (
          "Ending..."
        ) : (
          <X size={20} />
        )}
      </button>
    </div>
  );
};
