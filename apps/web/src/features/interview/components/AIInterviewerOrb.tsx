import React, { useEffect, useRef } from "react";
import type { OrbState } from "../types/interview.types";

interface AIInterviewerOrbProps {
  state: OrbState;
  audioLevel?: number; // 0.0 to 1.0
  size?: number;
}

export const AIInterviewerOrb: React.FC<AIInterviewerOrbProps> = ({
  state,
  audioLevel = 0,
  size = 220,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const rotationRef = useRef<number>(0);
  const pulseRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particleAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = size * 0.28;

      rotationRef.current += 0.015;
      pulseRef.current += 0.03;

      const dynamicRadius = baseRadius + audioLevel * (size * 0.12);

      // 1. Ambient Outer Glow / Ripples
      if (state === "SPEAKING" || state === "LISTENING") {
        const rippleCount = state === "SPEAKING" ? 3 : 2;
        for (let i = 1; i <= rippleCount; i++) {
          const rippleRadius = dynamicRadius + i * 22 + (Math.sin(pulseRef.current + i) * 6);
          ctx.beginPath();
          ctx.arc(centerX, centerY, rippleRadius, 0, Math.PI * 2);
          ctx.strokeStyle =
            state === "SPEAKING"
              ? `rgba(244, 42, 24, ${Math.max(0.04, 0.25 - i * 0.08)})`
              : `rgba(59, 130, 246, ${Math.max(0.04, 0.22 - i * 0.07)})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // 2. Main Glowing Orb Gradient
      const gradient = ctx.createRadialGradient(
        centerX - baseRadius * 0.2,
        centerY - baseRadius * 0.2,
        baseRadius * 0.1,
        centerX,
        centerY,
        dynamicRadius
      );

      if (state === "SPEAKING") {
        // Red / Coral Passion glow
        gradient.addColorStop(0, "#FF6B5B");
        gradient.addColorStop(0.45, "#F42A18");
        gradient.addColorStop(0.85, "#991B1B");
        gradient.addColorStop(1, "rgba(153, 27, 27, 0.0)");
      } else if (state === "LISTENING") {
        // Vibrant Blue / Cyan listening glow
        gradient.addColorStop(0, "#93C5FD");
        gradient.addColorStop(0.45, "#3B82F6");
        gradient.addColorStop(0.85, "#1E3A8A");
        gradient.addColorStop(1, "rgba(30, 58, 138, 0.0)");
      } else if (state === "THINKING") {
        // Violet / Purple deep thinking glow
        gradient.addColorStop(0, "#E9D5FF");
        gradient.addColorStop(0.45, "#A855F7");
        gradient.addColorStop(0.85, "#581C87");
        gradient.addColorStop(1, "rgba(88, 28, 135, 0.0)");
      } else if (state === "COMPLETING") {
        // Emerald Success glow
        gradient.addColorStop(0, "#A7F3D0");
        gradient.addColorStop(0.45, "#10B981");
        gradient.addColorStop(0.85, "#064E3B");
        gradient.addColorStop(1, "rgba(6, 78, 59, 0.0)");
      } else {
        // IDLE subtle dark charcoal / warm red glow
        gradient.addColorStop(0, "#F87171");
        gradient.addColorStop(0.4, "#DC2626");
        gradient.addColorStop(0.8, "#450A0A");
        gradient.addColorStop(1, "rgba(69, 10, 10, 0.0)");
      }

      ctx.beginPath();
      ctx.arc(centerX, centerY, dynamicRadius + 4, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // 3. Orbiting Energy Particles in THINKING mode
      if (state === "THINKING") {
        particleAngle += 0.04;
        for (let p = 0; p < 4; p++) {
          const currentP = particleAngle + (p * Math.PI) / 2;
          const px = centerX + Math.cos(currentP) * (dynamicRadius + 14);
          const py = centerY + Math.sin(currentP) * (dynamicRadius + 14);
          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = "#F3E8FF";
          ctx.shadowColor = "#A855F7";
          ctx.shadowBlur = 10;
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [state, audioLevel, size]);

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <canvas
        ref={canvasRef}
        width={size * 1.5}
        height={size * 1.5}
        className="w-full h-full pointer-events-none"
      />
      {/* State Badge Overlay */}
      <div className="absolute -bottom-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase backdrop-blur-md border shadow-lg transition-all duration-300">
        {state === "SPEAKING" && (
          <span className="text-[#F42A18] bg-[#F42A18]/15 border-[#F42A18]/30 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F42A18] animate-ping" /> AI Speaking
          </span>
        )}
        {state === "LISTENING" && (
          <span className="text-blue-400 bg-blue-500/15 border-blue-500/30 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> Listening to you...
          </span>
        )}
        {state === "THINKING" && (
          <span className="text-purple-300 bg-purple-500/15 border-purple-500/30 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-spin" /> Analyzing Response...
          </span>
        )}
        {state === "COMPLETING" && (
          <span className="text-emerald-300 bg-emerald-500/15 border-emerald-500/30 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Finalizing Assessment
          </span>
        )}
        {state === "IDLE" && (
          <span className="text-neutral-400 bg-neutral-800/80 border-neutral-700/60 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full">
            Ready
          </span>
        )}
      </div>
    </div>
  );
};
