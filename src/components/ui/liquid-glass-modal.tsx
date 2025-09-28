'use client'

import { useEffect, useRef, ReactNode, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LiquidGlassModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  headerButtons?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
  className?: string
  animateFrom?: 'button' | 'center'
}

export function LiquidGlassModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  headerButtons,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = '',
  animateFrom = 'center'
}: LiquidGlassModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement
      
      // Focus the modal when it opens
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      
      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement
        firstElement.focus()
      }
    } else if (previousActiveElement.current) {
      // Restore focus to the previously focused element
      previousActiveElement.current.focus()
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      const originalStyle = window.getComputedStyle(document.body).overflow
      const originalPosition = window.getComputedStyle(document.body).position
      const originalTop = window.getComputedStyle(document.body).top
      const scrollY = window.scrollY
      
      // Store original values for restoration
      document.body.dataset.originalOverflow = originalStyle
      document.body.dataset.originalPosition = originalPosition
      document.body.dataset.originalTop = originalTop
      document.body.dataset.scrollY = scrollY.toString()
      
      // Apply scroll lock styles
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      // Restore original body styles
      const originalOverflow = document.body.dataset.originalOverflow
      const originalPosition = document.body.dataset.originalPosition
      const originalTop = document.body.dataset.originalTop
      const scrollY = parseInt(document.body.dataset.scrollY || '0')
      
      document.body.style.overflow = originalOverflow || 'unset'
      document.body.style.position = originalPosition || 'unset'
      document.body.style.top = originalTop || 'unset'
      document.body.style.width = 'unset'
      
      // Restore scroll position
      window.scrollTo(0, scrollY)
      
      // Clean up data attributes
      delete document.body.dataset.originalOverflow
      delete document.body.dataset.originalPosition
      delete document.body.dataset.originalTop
      delete document.body.dataset.scrollY
    }
  }, [isOpen, closeOnEscape, onClose])

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose()
    }
  }

  // Handle modal click to prevent closing
  const handleModalClick = (event: React.MouseEvent) => {
    event.stopPropagation()
  }

  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  }

  if (!isOpen) return null

  return (
    <div
      className={`liquid-glass-modal-backdrop active ${className}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        ref={modalRef}
        className={`liquid-glass-modal ${sizeClasses[size]} ${animateFrom === 'button' ? 'liquid-glass-modal-scale-from-button' : 'liquid-glass-modal-scale-from-center'}`}
        onClick={handleModalClick}
        role="document"
      >
        {/* Modal Header */}
        {(title || closeOnEscape || headerButtons) && (
          <div className="liquid-glass-modal-header">
            {title && (
              <h2 id="modal-title" className="liquid-glass-modal-title">
                {title}
              </h2>
            )}
            <div className="flex items-center space-x-2">
              {headerButtons}
              <button
                className="liquid-glass-modal-close"
                onClick={onClose}
                aria-label="關閉對話框"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Content */}
        <div className="liquid-glass-modal-content">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="liquid-glass-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// Hook for managing modal state
export function useLiquidGlassModal() {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)
  const toggleModal = () => setIsOpen(!isOpen)

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  }
}

// Preset modal components for common use cases
export function LiquidGlassConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "確認操作",
  message,
  confirmText = "確認",
  cancelText = "取消",
  variant = "default"
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "danger"
}) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const confirmButtonClass = variant === "danger" 
    ? "bg-red-600 hover:bg-red-700" 
    : "liquid-glass-modal-button"

  return (
    <LiquidGlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <p className="mb-6 text-white">{message}</p>
      <div className="liquid-glass-modal-footer">
        <Button
          variant="outline"
          onClick={onClose}
          className="mr-2"
        >
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          className={confirmButtonClass}
        >
          {confirmText}
        </Button>
      </div>
    </LiquidGlassModal>
  )
}

export function LiquidGlassInfoModal({
  isOpen,
  onClose,
  title = "資訊",
  message,
  buttonText = "了解"
}: {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
  buttonText?: string
}) {
  return (
    <LiquidGlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <p className="mb-6 text-white">{message}</p>
      <div className="liquid-glass-modal-footer">
        <Button
          onClick={onClose}
          className="liquid-glass-modal-button"
        >
          {buttonText}
        </Button>
      </div>
    </LiquidGlassModal>
  )
}
