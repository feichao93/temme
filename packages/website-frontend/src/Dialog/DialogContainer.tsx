import React from 'react'
import { createPortal } from 'react-dom'
import '../Dialog.styl'

interface DialogContainerProps {
  show: boolean
  onClose?(): void
  children: React.ReactNode
  canOutsideClickClose: boolean
}

export function DialogContainer({
  show,
  onClose,
  children,
  canOutsideClickClose,
}: DialogContainerProps) {
  if (!show) {
    return null
  }

  function onClickOverlay(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLDivElement
    if (target.dataset.dialogoverlay) {
      if (canOutsideClickClose) {
        onClose()
      }
    }
  }

  return createPortal(
    <div data-dialogoverlay className="dialog-container" onClick={onClickOverlay}>
      <div className="dialog">{children}</div>
    </div>,
    document.getElementById('app'),
  )
}
DialogContainer.defaultProps = {
  canOutsideClickClose: true,
}
