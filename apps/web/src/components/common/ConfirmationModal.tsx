import React, { type ReactNode } from "react"
import { AlertTriangle, AlertCircle, Info, CheckCircle2, HelpCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModalTemplate, type ModalTemplateProps } from "./ModalTemplate"
import { cn } from "@/lib/utils"

export type ConfirmationModalVariant = "danger" | "warning" | "info" | "success" | "neutral"

export interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description?: ReactNode
  confirmText?: string
  cancelText?: string
  variant?: ConfirmationModalVariant
  isLoading?: boolean
  icon?: ReactNode
  children?: ReactNode
  maxWidth?: ModalTemplateProps["maxWidth"]
  closeOnOverlayClick?: boolean
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
  icon,
  children,
  maxWidth = "sm",
  closeOnOverlayClick = true,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
          iconBg: "bg-red-500/10 border-red-500/20",
          confirmButtonClass:
            "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 border-transparent",
        }
      case "warning":
        return {
          icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
          iconBg: "bg-amber-500/10 border-amber-500/20",
          confirmButtonClass:
            "bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-500/20 border-transparent",
        }
      case "success":
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
          iconBg: "bg-emerald-500/10 border-emerald-500/20",
          confirmButtonClass:
            "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 border-transparent",
        }
      case "info":
        return {
          icon: <Info className="w-5 h-5 text-blue-500" />,
          iconBg: "bg-blue-500/10 border-blue-500/20",
          confirmButtonClass:
            "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 border-transparent",
        }
      case "neutral":
      default:
        return {
          icon: <HelpCircle className="w-5 h-5 text-neutral-500" />,
          iconBg: "bg-neutral-500/10 border-neutral-500/20",
          confirmButtonClass: "bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900",
        }
    }
  }

  const variantStyle = getVariantStyles()

  const renderedIcon = icon ? (
    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", variantStyle.iconBg)}>
      {icon}
    </div>
  ) : (
    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", variantStyle.iconBg)}>
      {variantStyle.icon}
    </div>
  )

  const handleConfirm = async () => {
    if (isLoading) return
    await onConfirm()
  }

  const footer = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isLoading}
        className="text-xs rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer"
      >
        {cancelText}
      </Button>

      <Button
        type="button"
        onClick={handleConfirm}
        disabled={isLoading}
        className={cn("text-xs rounded-xl font-medium cursor-pointer transition-all flex items-center gap-1.5", variantStyle.confirmButtonClass)}
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        <span>{confirmText}</span>
      </Button>
    </>
  )

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      icon={renderedIcon}
      maxWidth={maxWidth}
      closeOnOverlayClick={!isLoading && closeOnOverlayClick}
      closeOnEsc={!isLoading}
      showCloseButton={!isLoading}
      footer={footer}
    >
      {children}
    </ModalTemplate>
  )
}

export default ConfirmationModal
