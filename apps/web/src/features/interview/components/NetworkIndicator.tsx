import React from "react";
import { Wifi, WifiOff } from "lucide-react";
import type { NetworkQuality, ConnectionState } from "../types/interview.types";

interface NetworkIndicatorProps {
  quality: NetworkQuality;
  connectionState: ConnectionState;
}

export const NetworkIndicator: React.FC<NetworkIndicatorProps> = ({
  quality,
  connectionState,
}) => {
  if (connectionState === "RECONNECTING") {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-[11px] font-semibold text-amber-400 animate-pulse">
        <Wifi className="w-3.5 h-3.5" />
        <span>Reconnecting...</span>
      </div>
    );
  }

  if (connectionState === "ERROR" || quality === "OFFLINE") {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-[11px] font-semibold text-red-400">
        <WifiOff className="w-3.5 h-3.5" />
        <span>Disconnected</span>
      </div>
    );
  }

  if (quality === "UNSTABLE") {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-[11px] font-semibold text-amber-400">
        <Wifi className="w-3.5 h-3.5" />
        <span>Unstable</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900/80 border border-neutral-800 rounded-full text-[11px] font-medium text-neutral-400">
      <span className="w-2 h-2 rounded-full bg-emerald-500" />
      <span className="hidden sm:inline">Connected</span>
    </div>
  );
};
