import React, { useState, useCallback, useRef } from "react"
import {
  ConfirmationModal,
  type ConfirmationModalProps,
  type ConfirmationActionType,
  type ConfirmationModalVariant,
} from "@/components/common/ConfirmationModal"

export interface ConfirmOptions {
  actionType?: ConfirmationActionType
  title?: string
  description?: React.ReactNode
  confirmText?: string
  cancelText?: string
  variant?: ConfirmationModalVariant
  icon?: React.ReactNode
  children?: React.ReactNode
  maxWidth?: ConfirmationModalProps["maxWidth"]
  closeOnOverlayClick?: boolean
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({})
  const [isLoading, setIsLoading] = useState(false)
  
  const resolverRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback((dialogOptions: ConfirmOptions = {}): Promise<boolean> => {
    setOptions(dialogOptions)
    setIsOpen(true)
    setIsLoading(false)

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
    })
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    if (resolverRef.current) {
      resolverRef.current(false)
      resolverRef.current = null
    }
  }, [])

  const handleConfirm = useCallback(async () => {
    setIsOpen(false)
    if (resolverRef.current) {
      resolverRef.current(true)
      resolverRef.current = null
    }
  }, [])

  const ConfirmDialog: React.FC = useCallback(() => {
    if (!isOpen) return null

    return (
      <ConfirmationModal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        actionType={options.actionType}
        title={options.title}
        description={options.description}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        variant={options.variant}
        icon={options.icon}
        maxWidth={options.maxWidth}
        closeOnOverlayClick={options.closeOnOverlayClick}
        isLoading={isLoading}
      >
        {options.children}
      </ConfirmationModal>
    )
  }, [isOpen, handleClose, handleConfirm, options, isLoading])

  return {
    confirm,
    ConfirmDialog,
    isOpen,
    close: handleClose,
    setIsLoading,
  }
}

export default useConfirmDialog
