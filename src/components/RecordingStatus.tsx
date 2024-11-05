import React from 'react';
import { Mic, MicOff } from 'lucide-react';

interface RecordingStatusProps {
  isRecording: boolean;
}

export const RecordingStatus: React.FC<RecordingStatusProps> = ({ isRecording }) => {
  return (
    <div className="flex items-center gap-2">
      {isRecording ? (
        <div className="flex items-center gap-2 text-red-600">
          <Mic className="animate-pulse" />
          <span className="font-semibold">Recording</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-gray-600">
          <MicOff />
          <span className="font-semibold">Stopped</span>
        </div>
      )}
    </div>
  );
};