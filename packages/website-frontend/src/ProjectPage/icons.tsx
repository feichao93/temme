import { MouseEventHandler } from 'react'
import classNames from 'classnames'
import React from 'react'

type PropagationStoppable = { stopPropagation(): any }
function stopPropagation<E extends PropagationStoppable, RET>(handler: (e: E) => RET) {
  return function(e: E) {
    e.stopPropagation()
    return handler(e)
  }
}

export interface IconProps {
  disabled?: boolean
  onClick: MouseEventHandler
  size: number
}

export function AddFileIcon({ disabled, onClick, size }: IconProps) {
  return (
    <svg
      className={classNames('icon interactive', { disabled })}
      onClick={disabled ? null : stopPropagation(onClick)}
      width={size}
      height={size}
    >
      <polygon
        fill="#C5C5C5"
        points="12,3 8,3 8,4 11,4 11,7 14,7 14,14 6,14 6,8 5,8 5,15 15,15 15,6"
      />
      <path
        fill="#89D185"
        d="M7 3.018h-2v-2.018h-1.981v2.018h-2.019v1.982h2.019v2h1.981v-2h2v-1.982z"
      />
    </svg>
  )
}
AddFileIcon.defaultProps = { size: 16 }

export function DeleteIcon({ disabled, onClick, size }: IconProps) {
  return (
    <svg
      className={classNames('icon interactive', { disabled })}
      onClick={disabled ? null : stopPropagation(onClick)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#c5c5c5"
    >
      <path d="M 10 3 L 9 4 L 5 4 L 5 6 L 19 6 L 19 4 L 15 4 L 14 3 L 10 3 z M 6 7 L 6 20 C 6 21.1 6.9 22 8 22 L 16 22 C 17.1 22 18 21.1 18 20 L 18 7 L 6 7 z M 9 10 L 11 10 L 11 19 L 9 19 L 9 10 z M 13 10 L 15 10 L 15 19 L 13 19 L 13 10 z" />
    </svg>
  )
}
DeleteIcon.defaultProps = { size: 16 }

export function RenameIcon({ disabled, onClick, size }: IconProps) {
  return (
    <svg
      className={classNames('icon interactive', { disabled })}
      onClick={disabled ? null : stopPropagation(onClick)}
      width={size}
      height={size}
      viewBox="0 0 100 100"
    >
      <rect fill="#c5c5c5" x="5" y="25.953" width="55" height="48" />
      <polygon
        points="95,14.047 95,8.047 83,8.047 83,7.953 77,7.953 77,8.047 65,8.047   65,14.047 77,14.047 77,86.047 65,86.047 65,92.047 95,92.047 95,86.047 83,86.047 83,14.047 "
        fill="#86A8FF"
      />
    </svg>
  )
}
RenameIcon.defaultProps = { size: 16 }

export function AddFolderIcon({ disabled, onClick, size }: IconProps) {
  return (
    <svg
      className={classNames('icon interactive', { disabled })}
      onClick={disabled ? null : stopPropagation(onClick)}
      width={size}
      height={size}
    >
      <path fill="#C5C5C5" d="M14 4H9.618l-1 2H6v2H3v6h12V4h-1zm0 2h-3.882l.5-1H14v1z" />
      <path fill="#89D185" d="M7 3.018H5V1H3.019v2.018H1V5h2.019v2H5V5h2z" />
    </svg>
  )
}
AddFolderIcon.defaultProps = { size: 16 }

export function CloseIcon({ dirty, disabled, onClick, size }: IconProps & { dirty?: boolean }) {
  if (dirty) {
    return <CloseDirtyIcon disabled={disabled} onClick={onClick} size={size} />
  } else {
    return <CloseCleanIcon disabled={disabled} onClick={onClick} size={size} />
  }
}
CloseIcon.defaultProps = { size: 16 }

export function CloseCleanIcon({ disabled, onClick, size }: IconProps) {
  return (
    <svg
      className={classNames('icon interactive', { disabled })}
      onClick={disabled ? null : stopPropagation(onClick)}
      width={size}
      height={size}
      viewBox="0 0 16 16"
    >
      <path
        d="M9.428 8L12 10.573 10.572 12 8 9.428 5.428 12 4 10.573 6.572 8 4 5.428 5.427 4 8 6.572 10.573 4 12 5.428 9.428 8z"
        fill="#E8E8E8"
      />
    </svg>
  )
}
CloseCleanIcon.defaultProps = { size: 16 }

export function CloseDirtyIcon({ disabled, onClick, size }: IconProps) {
  return (
    <svg
      className={classNames('icon', { disabled })}
      onClick={disabled ? null : stopPropagation(onClick)}
      width={size}
      height={size}
      viewBox="0 0 16 16"
    >
      <circle fill="#C5C5C5" cx="8" cy="8" r="4" />
    </svg>
  )
}
CloseDirtyIcon.defaultProps = { size: 16 }

export function SaveIcon({ disabled, onClick, size }: IconProps) {
  return (
    <svg
      className={classNames('icon interactive', { disabled })}
      onClick={disabled ? null : stopPropagation(onClick)}
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
    >
      <path
        d="M896 0l-896 0 0 1024 1024 0 0-896-128-128zM512 128l128 0 0 256-128 0 0-256zM896 896l-768 0 0-768 64 0 0 320 576 0 0-320 74.976 0 53.024 53.024 0 714.976z"
        fill="#c5c5c5"
      />
    </svg>
  )
}
SaveIcon.defaultProps = { size: 16 }

export const DownloadIcon = React.memo(({ disabled, onClick, size = 16 }: Partial<IconProps>) => (
  <svg
    className={classNames('icon interactive', { disabled })}
    onClick={disabled ? null : stopPropagation(onClick)}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="#C5C5C5"
  >
    <path d="M 10 2 L 10 10 L 6 10 L 12 18 L 18 10 L 14 10 L 14 2 L 10 2 z M 2 20 L 2 22 L 22 22 L 22 20 L 2 20 z" />
  </svg>
))

export const FileTypeHtmlIcon = React.memo(() => (
  <svg className="icon" width={16} height={16} viewBox="0 0 32 32">
    <polygon fill="#dcdbdd" points="9 11 10.5 12.5 7 16 10.5 19.5 9 21 4 16 9 11" />
    <polygon fill="#dcdbdd" points="23 21 21.5 19.5 25 16 21.5 12.5 23 11 28 16 23 21" />
    <circle fill="#0095d7" cx="16" cy="16" r="5" />
  </svg>
))

export const FileTypeJsonIcon = React.memo(() => (
  <svg className="icon" width={16} height={16} viewBox="0 0 32 32">
    <path
      fill="#dcdbdd"
      d="M5 16.76v-1.52a2.36 2.36 0 0 0 .68-.11 1.44 1.44 0 0 0 .44-.23.93.93 0 0 0 .25-.32 1.33 1.33 0 0 0 .12-.35 2.62 2.62 0 0 0 0-.37v-.46V12.29q-.12-1.13-.12-1.59a2.51 2.51 0 0 1 .8-2A3.4 3.4 0 0 1 9.34 8H10v1.7h-.32a1.16 1.16 0 0 0-.94.37 1.66 1.66 0 0 0-.29 1.05 8.92 8.92 0 0 0 .1 1.15q.1 1 .1 1.38a3.64 3.64 0 0 1-.1 1 1.74 1.74 0 0 1-.33.68 1.76 1.76 0 0 1-.54.43 2.94 2.94 0 0 1-.74.25 2.94 2.94 0 0 1 .74.24 1.7 1.7 0 0 1 .54.43 1.74 1.74 0 0 1 .33.68 3.71 3.71 0 0 1 .1 1q0 .35-.1 1.4a8.23 8.23 0 0 0-.1 1.13 1.72 1.72 0 0 0 .28 1.07 1.15 1.15 0 0 0 .94.38H10V24h-.68q-3 0-3-2.73 0-.46.12-1.59v-.49-.6-.46a2.36 2.36 0 0 0 0-.36 1.29 1.29 0 0 0-.11-.35.92.92 0 0 0-.25-.32 1.39 1.39 0 0 0-.45-.23 2.43 2.43 0 0 0-.63-.11z"
    />
    <path
      fill="#dcdbdd"
      d="M26.35 16.87a1.39 1.39 0 0 0-.45.23.92.92 0 0 0-.25.32 1.29 1.29 0 0 0-.11.35 2.36 2.36 0 0 0 0 .36v1.55q.12 1.13.12 1.59 0 2.73-3 2.73H22v-1.68h.36a1.15 1.15 0 0 0 .94-.38 1.72 1.72 0 0 0 .28-1.07 8.23 8.23 0 0 0-.1-1.13q-.1-1.05-.1-1.4a3.71 3.71 0 0 1 .1-1 1.74 1.74 0 0 1 .33-.68 1.7 1.7 0 0 1 .54-.43 2.94 2.94 0 0 1 .75-.23 2.94 2.94 0 0 1-.74-.25 1.76 1.76 0 0 1-.54-.43 1.74 1.74 0 0 1-.33-.68 3.64 3.64 0 0 1-.1-1q0-.38.1-1.38a8.92 8.92 0 0 0 .1-1.15 1.66 1.66 0 0 0-.29-1.05 1.16 1.16 0 0 0-.94-.37H22V8h.7a3.4 3.4 0 0 1 2.24.67 2.51 2.51 0 0 1 .8 2q0 .46-.12 1.59V13.83a2.62 2.62 0 0 0 0 .37 1.33 1.33 0 0 0 .12.35.93.93 0 0 0 .25.32 1.44 1.44 0 0 0 .44.23 2.36 2.36 0 0 0 .68.11v1.52a2.43 2.43 0 0 0-.76.14z"
    />
    <path transform="rotate(-45 15.999 16.003)" fill="#f77737" d="M12 12h8v8h-8z" />
  </svg>
))

export const FileTypeTSIcon = React.memo(() => (
  <svg width={16} height={16} viewBox="0 0 32 32">
    <path
      fill="#497ecf"
      d="M8.4,23V11.66H5V9H15v2.66H11.6V23Zm8.6-.85.67-2.52a8.88,8.88,0,0,0,1.71.6,7.92,7.92,0,0,0,2,.25,3.11,3.11,0,0,0,1.72-.4,1.23,1.23,0,0,0,.6-1.08,1.26,1.26,0,0,0-.55-1,6.76,6.76,0,0,0-1.89-.85q-4-1.34-4-4a3.48,3.48,0,0,1,.39-1.62,3.89,3.89,0,0,1,1.09-1.3,5.21,5.21,0,0,1,1.74-.86A8.05,8.05,0,0,1,22.69,9a9.14,9.14,0,0,1,3.73.69l-.74,2.46a7.08,7.08,0,0,0-3-.65,2.76,2.76,0,0,0-1.57.38,1.11,1.11,0,0,0-.55.93,1,1,0,0,0,.11.47,1.35,1.35,0,0,0,.29.38,2.39,2.39,0,0,0,.54.35c.24.12.49.23.75.34l1,.37a7,7,0,0,1,2.85,1.65A3.39,3.39,0,0,1,27,18.78a3.87,3.87,0,0,1-.22,1.31,3.54,3.54,0,0,1-.69,1.15,4.43,4.43,0,0,1-1.15.92,6.06,6.06,0,0,1-1.65.6,9.73,9.73,0,0,1-2.15.22,10.77,10.77,0,0,1-2.32-.25A7.67,7.67,0,0,1,17,22.15Z"
    />
  </svg>
))

export const FolderIcon = React.memo(() => (
  <svg className="icon folder-icon" width={16} height={16} viewBox="0 0 32 32">
    <path
      d="M30,5V25a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V9A1,1,0,0,1,5,8h7l2-4H29A1,1,0,0,1,30,5ZM28,8V6H16L15,8Z"
      fill="#dcb67a"
    />
  </svg>
))

export const FolderOpenIcon = React.memo(() => (
  <svg className="icon folder-open-icon" width={16} height={16} viewBox="0 0 32 32">
    <path
      d="M28,4a2,2,0,0,1,2,2V24a1.92,1.92,0,0,1-2,2V6H16l-2,4H6v6H22l6,10H6L0,16H4V10C4,8,6.47,8,6,8h7l2-4Z"
      fill="#dcb67a"
    />
  </svg>
))
