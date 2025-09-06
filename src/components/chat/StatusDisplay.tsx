interface StatusDisplayProps {
  connectionStatus: string;
  isConnected: boolean;
  pcConnectionState?: string;
  isMicOn: boolean;
}

export const StatusDisplay = ({
  connectionStatus,
  isConnected,
  pcConnectionState,
  isMicOn
}: StatusDisplayProps) => {
  return (
    <div className="flex flex-col items-end">
      <p className="text-sm text-muted-foreground">
        Status: {connectionStatus}
      </p>
      {isConnected && (
        <>
          <p className="text-xs text-muted-foreground">
            WebRTC: {pcConnectionState || 'Unknown'}
          </p>
          <p className={`text-xs font-medium ${isMicOn ? 'text-green-500' : 'text-red-500'}`}>
            🎤 {isMicOn ? 'SENDING AUDIO' : 'AUDIO MUTED'}
          </p>
        </>
      )}
    </div>
  );
};
