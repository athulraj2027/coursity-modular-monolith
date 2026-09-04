import React, { useEffect, type ReactNode } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ModalTemplateProps {
  isOpen: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  maxWidth?: "sm" | "md" | "lg" | "xl"
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEsc?: boolean
  className?: string
  contentClassName?: string
}

export const ModalTemplate: React.FC<ModalTemplateProps> = ({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
  maxWidth = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  className,
  contentClassName,
}) => {
  // Handle ESC key press
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, closeOnEsc, onClose])

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  const maxWidthClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }[maxWidth]

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={closeOnOverlayClick ? onClose : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 ease-out",
          maxWidthClasses,
          className
        )}
      >
        {/* Modal Header */}
        {(title || showCloseButton || icon) && (
          <div className="p-5 sm:p-6 border-b border-neutral-200/80 dark:border-neutral-800 flex items-start justify-between gap-4 bg-neutral-50/50 dark:bg-neutral-950/40 shrink-0">
            <div className="flex items-start gap-3.5 min-w-0">
              {icon && <div className="shrink-0 mt-0.5">{icon}</div>}
              <div className="min-w-0">
                {title && (
                  <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white truncate">
                    {title}
                  </h3>
                )}
                {description && (
                  <div className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                    {description}
                  </div>
                )}
              </div>
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                title="Close modal"
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0 -mr-1"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Modal Body */}
        {children && (
          <div className={cn("p-5 sm:p-6 overflow-y-auto max-h-[75vh]", contentClassName)}>
            {children}
          </div>
        )}

        {/* Modal Footer */}
        {footer && (
          <div className="p-4 sm:p-5 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 flex items-center justify-end gap-2.5 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default ModalTemplate
