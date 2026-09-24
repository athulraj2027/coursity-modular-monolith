import React, { type ReactNode } from "react"
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Sparkles,
  Loader2,
  LogOut,
  RotateCcw,
  Save,
  Trash2,
  Heart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModalTemplate, type ModalTemplateProps } from "./ModalTemplate"
import { cn } from "@/lib/utils"

export type ConfirmationModalVariant = "danger" | "warning" | "info" | "success" | "neutral"
export type ConfirmationActionType = "logout" | "discard" | "save" | "delete" | "wishlist" | "generic"

export interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  actionType?: ConfirmationActionType
  title?: string
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
  actionType = "generic",
  title,
  description,
  confirmText,
  cancelText = "Cancel",
  variant,
  isLoading = false,
  icon,
  children,
  maxWidth = "sm",
  closeOnOverlayClick = true,
}) => {
  // Derive defaults based on actionType
  const getActionDefaults = () => {
    switch (actionType) {
      case "logout":
        return {
          title: "Sign Out of Coursity",
          description:
            "Are you sure you want to sign out? You will need to sign back in to access your dashboard and account.",
          confirmText: "Sign Out",
          variant: "danger" as ConfirmationModalVariant,
          icon: <LogOut className="w-5 h-5 text-[#F42A18]" />,
        }
      case "discard":
        return {
          title: "Discard Unsaved Changes?",
          description:
            "Are you sure you want to discard your changes? All unsaved modifications in this form will be permanently reverted.",
          confirmText: "Discard Changes",
          variant: "warning" as ConfirmationModalVariant,
          icon: <RotateCcw className="w-5 h-5 text-amber-500" />,
        }
      case "save":
        return {
          title: "Save Changes?",
          description: "Are you sure you want to apply these updates to your profile/account?",
          confirmText: "Save Changes",
          variant: "success" as ConfirmationModalVariant,
          icon: <Save className="w-5 h-5 text-emerald-500" />,
        }
      case "delete":
        return {
          title: "Confirm Deletion",
          description: "Are you sure you want to permanently delete this? This action cannot be undone.",
          confirmText: "Delete",
          variant: "danger" as ConfirmationModalVariant,
          icon: <Trash2 className="w-5 h-5 text-[#F42A18]" />,
        }
      case "wishlist":
        return {
          title: "Add to Wishlist?",
          description: "Save this course to your wishlist so you can easily access and enroll in it later.",
          confirmText: "Add to Wishlist",
          variant: "neutral" as ConfirmationModalVariant,
          icon: <Heart className="w-5 h-5 text-[#F42A18] fill-[#F42A18]" />,
        }
      case "generic":
      default:
        return {
          title: "Confirm Action",
          description: "Are you sure you want to proceed with this action?",
          confirmText: "Confirm",
          variant: "neutral" as ConfirmationModalVariant,
          icon: <Sparkles className="w-5 h-5 text-[#F42A18]" />,
        }
    }
  }

  const actionDefaults = getActionDefaults()
  const effectiveVariant = variant || actionDefaults.variant
  const effectiveTitle = title || actionDefaults.title
  const effectiveDescription = description !== undefined ? description : actionDefaults.description
  const effectiveConfirmText = confirmText || actionDefaults.confirmText

  const getVariantStyles = () => {
    switch (effectiveVariant) {
      case "danger":
        return {
          icon: <AlertTriangle className="w-5 h-5 text-[#F42A18]" />,
          iconBg: "bg-red-500/10 border-red-500/20 text-[#F42A18] shadow-sm shadow-red-500/10",
          confirmButtonClass:
            "bg-[#F42A18] hover:bg-[#d92211] text-white shadow-md shadow-[#F42A18]/25 border-transparent",
        }
      case "warning":
        return {
          icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
          iconBg: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 shadow-sm shadow-amber-500/10",
          confirmButtonClass:
            "bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-500/20 border-transparent",
        }
      case "success":
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
          iconBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm shadow-emerald-500/10",
          confirmButtonClass:
            "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 border-transparent",
        }
      case "info":
        return {
          icon: <Info className="w-5 h-5 text-blue-500" />,
          iconBg: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm shadow-blue-500/10",
          confirmButtonClass:
            "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 border-transparent",
        }
      case "neutral":
      default:
        return {
          icon: <Sparkles className="w-5 h-5 text-[#F42A18]" />,
          iconBg: "bg-red-500/10 border-red-500/20 text-[#F42A18] shadow-sm shadow-red-500/10",
          confirmButtonClass:
            "bg-[#F42A18] hover:bg-[#d92211] text-white shadow-md shadow-[#F42A18]/25 border-transparent",
        }
    }
  }

  const variantStyle = getVariantStyles()
  const iconContent = icon || actionDefaults.icon || variantStyle.icon

  const renderedIcon = (
    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0", variantStyle.iconBg)}>
      {iconContent}
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
        className="text-xs rounded-xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer h-9 px-4 font-medium"
      >
        {cancelText}
      </Button>

      <Button
        type="button"
        onClick={handleConfirm}
        disabled={isLoading}
        className={cn(
          "text-xs rounded-xl font-semibold cursor-pointer transition-all flex items-center gap-1.5 h-9 px-4.5",
          variantStyle.confirmButtonClass
        )}
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        <span>{effectiveConfirmText}</span>
      </Button>
    </>
  )

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title={effectiveTitle}
      description={effectiveDescription}
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
