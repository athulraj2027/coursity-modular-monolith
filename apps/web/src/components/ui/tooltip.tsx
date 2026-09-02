import * as React from "react"
import { cn } from "@/lib/utils"

export interface TooltipProviderProps {
  children: React.ReactNode
  delayDuration?: number
}

export const TooltipProvider: React.FC<TooltipProviderProps> = ({ children }) => {
  return <>{children}</>
}

export interface TooltipProps {
  children: React.ReactNode
}

export const Tooltip: React.FC<TooltipProps> = ({ children }) => {
  return <div className="relative group/tooltip inline-flex">{children}</div>
}

export interface TooltipTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export const TooltipTrigger = React.forwardRef<HTMLButtonElement, TooltipTriggerProps>(
  ({ children, asChild, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ ref?: React.Ref<HTMLButtonElement> }>, { ref })
    }
    return (
      <button ref={ref} type="button" {...props}>
        {children}
      </button>
    )
  }
)
TooltipTrigger.displayName = "TooltipTrigger"

export interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  hidden?: boolean
}

export const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, side = "top", children, hidden, ...props }, ref) => {
    if (hidden) return null

    const sideClasses = {
      top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
      right: "left-full top-1/2 -translate-y-1/2 ml-2",
      bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
      left: "right-full top-1/2 -translate-y-1/2 mr-2",
    }[side]

    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-150 overflow-hidden rounded-md bg-neutral-900 dark:bg-neutral-100 px-3 py-1.5 text-xs text-neutral-50 dark:text-neutral-900 shadow-md",
          sideClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TooltipContent.displayName = "TooltipContent"
