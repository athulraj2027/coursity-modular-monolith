import React from "react"
import { Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export interface LoadingScreenProps {
  message?: string
  subMessage?: string
  fullScreen?: boolean
  className?: string
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading...",
  subMessage = "Please wait a moment while we set things up",
  fullScreen = true,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors duration-300 relative overflow-hidden select-none",
        fullScreen ? "fixed inset-0 z-50 min-h-screen w-screen" : "min-h-[400px] w-full py-16",
        className
      )}
    >
      {/* Background ambient radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F42A18]/5 dark:bg-[#F42A18]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main container */}
      <div className="relative z-10 flex flex-col items-center gap-6 max-w-sm px-6 text-center animate-in fade-in zoom-in-95 duration-300">
        {/* Brand Logo & Spinner visual */}
        <div className="relative flex items-center justify-center">
          {/* Outer glowing pulsing ring */}
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl flex items-center justify-center" />
          
          {/* Spinning brand loader */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#F42A18] animate-spin stroke-[2.5]" />
          </div>

          {/* Micro decorative sparkle */}
          <div className="absolute -top-1.5 -right-1.5 bg-[#F42A18] text-white p-1 rounded-full shadow-md animate-pulse">
            <Sparkles className="w-2.5 h-2.5" />
          </div>
        </div>

        {/* Text Details */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              coursity<span className="text-[#F42A18]">.</span>
            </span>
          </div>

          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 tracking-tight">
            {message}
          </p>

          {subMessage && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-[280px] leading-relaxed">
              {subMessage}
            </p>
          )}
        </div>

        {/* Micro indeterminate progress bar */}
        <div className="w-36 h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden relative">
          <div className="h-full bg-gradient-to-r from-transparent via-[#F42A18] to-transparent w-full rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
