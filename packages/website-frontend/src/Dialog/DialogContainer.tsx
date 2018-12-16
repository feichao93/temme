import React from 'react'
import { createPortal } from 'react-dom'
import '../Dialog.styl'
import classNames from 'classnames'
import { useDialog } from './dialog'

export function DialogContainer({ children }: { children: JSX.Element }) {
  const { show, closeDialog } = useDialog()
  function onClose(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLDivElement
    if (target.id === 'dialog') {
      closeDialog()
    }
  }
  return createPortal(
    <div id="dialog" className={classNames('dialog', { show })} onClick={onClose}>
      <div className="dialog-container">{children}</div>
    </div>,
    document.getElementById('app'),
  )
}


