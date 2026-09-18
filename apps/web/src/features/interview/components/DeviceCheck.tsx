import React from "react";
import { Mic, Volume2, Video, CheckCircle2, AlertCircle, Play, RefreshCw } from "lucide-react";
import { AudioVisualizer } from "./AudioVisualizer";
import type { AudioDevice } from "../types/interview.types";

interface DeviceCheckProps {
  microphones: AudioDevice[];
  speakers: AudioDevice[];
  cameras: AudioDevice[];
  selectedMicId: string;
  selectedSpeakerId: string;
  selectedCameraId: string;
  onSelectMic: (id: string) => void;
  onSelectSpeaker: (id: string) => void;
  onSelectCamera: (id: string) => void;
  micLevel: number;
  isPlayingTestTone: boolean;
  onTestSpeaker: () => void;
  onRequestPermissions: () => void;
  hasPermissions: { microphone: boolean; camera: boolean };
}

export const DeviceCheck: React.FC<DeviceCheckProps> = ({
  microphones,
  speakers,
  cameras,
  selectedMicId,
  selectedSpeakerId,
  selectedCameraId,
  onSelectMic,
  onSelectSpeaker,
  onSelectCamera,
  micLevel,
  isPlayingTestTone,
  onTestSpeaker,
  onRequestPermissions,
  hasPermissions,
}) => {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-5 text-neutral-200 shadow-xl">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <span>Audio & Video Hardware Check</span>
        </h3>
        <button
          onClick={onRequestPermissions}
          className="flex items-center gap-1 text-[11px] font-medium text-neutral-400 hover:text-white transition"
        >
          <RefreshCw className="w-3 h-3" /> Re-detect Devices
        </button>
      </div>

      <div className="space-y-4 text-xs">
        {/* 1. Microphone Check */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-neutral-300 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-[#F42A18]" /> Microphone
            </label>
            {hasPermissions.microphone ? (
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3" /> Active & Working
              </span>
            ) : (
              <span className="text-[10px] text-red-400 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" /> Permission Needed
              </span>
            )}
          </div>

          <select
            value={selectedMicId}
            onChange={(e) => onSelectMic(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-neutral-700 bg-neutral-800 text-white font-medium focus:outline-none focus:border-[#F42A18]"
          >
            {microphones.length === 0 && <option value="">Default Microphone</option>}
            {microphones.map((m) => (
              <option key={m.deviceId} value={m.deviceId}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Live Mic Input Meter */}
          <div className="flex items-center justify-between px-3 py-2 bg-neutral-950/80 rounded-xl border border-neutral-800/80">
            <span className="text-[11px] text-neutral-400">Input Amplitude</span>
            <div className="flex items-center gap-2">
              <AudioVisualizer level={micLevel} barCount={8} className="h-4" />
              <span className="text-[10px] font-mono text-neutral-500 w-8 text-right">
                {Math.round(micLevel * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* 2. Speaker Check */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-neutral-300 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-[#F42A18]" /> Speaker / Output
            </label>
            <button
              onClick={onTestSpeaker}
              disabled={isPlayingTestTone}
              className="text-[11px] text-[#F42A18] hover:underline flex items-center gap-1 font-semibold"
            >
              <Play className={`w-3 h-3 ${isPlayingTestTone ? "animate-spin" : ""}`} />
              {isPlayingTestTone ? "Playing Tone..." : "Test Audio"}
            </button>
          </div>

          <select
            value={selectedSpeakerId}
            onChange={(e) => onSelectSpeaker(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-neutral-700 bg-neutral-800 text-white font-medium focus:outline-none focus:border-[#F42A18]"
          >
            {speakers.length === 0 && <option value="">Default System Speaker</option>}
            {speakers.map((s) => (
              <option key={s.deviceId} value={s.deviceId}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Camera Check */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-neutral-300 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-[#F42A18]" /> Camera
            </label>
            {hasPermissions.camera ? (
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3" /> Ready
              </span>
            ) : (
              <span className="text-[10px] text-neutral-500">Optional</span>
            )}
          </div>

          <select
            value={selectedCameraId}
            onChange={(e) => onSelectCamera(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-neutral-700 bg-neutral-800 text-white font-medium focus:outline-none focus:border-[#F42A18]"
          >
            {cameras.length === 0 && <option value="">Default Camera</option>}
            {cameras.map((c) => (
              <option key={c.deviceId} value={c.deviceId}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
