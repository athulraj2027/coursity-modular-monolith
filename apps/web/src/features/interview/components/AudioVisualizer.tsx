import React from "react";

interface AudioVisualizerProps {
  level: number; // 0.0 to 1.0
  isMuted?: boolean;
  barCount?: number;
  className?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  level,
  isMuted = false,
  barCount = 12,
  className = "",
}) => {
  const bars = Array.from({ length: barCount }, (_, i) => {
    if (isMuted) return 3;
    // Compute dynamic heights using wave offsets
    const offset = Math.sin((i / barCount) * Math.PI);
    const dynamicHeight = Math.max(4, Math.round(level * 28 * offset + Math.random() * 3));
    return dynamicHeight;
  });

  return (
    <div className={`flex items-center gap-[3px] h-8 px-2 py-1 ${className}`}>
      {bars.map((height, idx) => (
        <span
          key={idx}
          style={{ height: `${height}px` }}
          className={`w-[3.5px] rounded-full transition-all duration-75 ${
            isMuted
              ? "bg-neutral-600"
              : level > 0.05
              ? "bg-[#F42A18]"
              : "bg-neutral-500/50"
          }`}
        />
      ))}
    </div>
  );
};
