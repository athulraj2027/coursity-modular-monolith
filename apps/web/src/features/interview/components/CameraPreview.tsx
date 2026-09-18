import React, { useEffect, useRef } from "react";
import { Mic, MicOff, User } from "lucide-react";
import { AudioVisualizer } from "./AudioVisualizer";

interface CameraPreviewProps {
  stream: MediaStream | null;
  candidateName?: string;
  isCameraOn?: boolean;
  isMicMuted?: boolean;
  micLevel?: number;
  className?: string;
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({
  stream,
  candidateName = "Candidate",
  isCameraOn = true,
  isMicMuted = false,
  micLevel = 0,
  className = "",
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-xl flex items-center justify-center ${className}`}
    >
      {/* Video Element */}
      {isCameraOn && stream && stream.getVideoTracks().length > 0 ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover -scale-x-100"
        />
      ) : (
        /* Fallback Candidate Avatar */
        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 bg-gradient-to-br from-neutral-900 to-neutral-950 p-4 space-y-2">
          <div className="w-16 h-16 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300 font-bold text-xl shadow-inner">
            <User className="w-8 h-8 text-neutral-400" />
          </div>
          <p className="text-xs font-medium text-neutral-400">{candidateName}</p>
        </div>
      )}

      {/* Candidate Name Tag & Audio Status Indicator */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-white text-[11px] font-medium border border-white/10">
          <span>{candidateName}</span>
          <span className="text-neutral-400">(You)</span>
        </div>

        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10">
          {isMicMuted ? (
            <MicOff className="w-3.5 h-3.5 text-red-400" />
          ) : (
            <div className="flex items-center gap-1">
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
              <AudioVisualizer level={micLevel} barCount={4} className="h-4 px-0" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
