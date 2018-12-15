import { MouseEventHandler } from 'react'
import classNames from 'classnames'
import React from 'react'

export interface IconProps {
  disabled?: boolean
  onClick: MouseEventHandler
  size: number
}

export function AddFileIcon({ disabled, onClick, size }: IconProps) {
  return (
    <svg
      className={classNames('icon interactive', { disabled })}
      onClick={disabled ? null : onClick}
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
      onClick={disabled ? null : onClick}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#f44336"
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
      onClick={disabled ? null : onClick}
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
      onClick={disabled ? null : onClick}
      width={size}
      height={size}
    >
      <path fill="#C5C5C5" d="M14 4H9.618l-1 2H6v2H3v6h12V4h-1zm0 2h-3.882l.5-1H14v1z" />
      <path fill="#89D185" d="M7 3.018H5V1H3.019v2.018H1V5h2.019v2H5V5h2z" />
    </svg>
  )
}
AddFolderIcon.defaultProps = { size: 16 }

export function CloseIcon({ disabled, onClick, size }: IconProps) {
  return (
    <svg
      className={classNames('icon interactive', { disabled })}
      onClick={disabled ? null : onClick}
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
CloseIcon.defaultProps = { size: 16 }

// export function CloseDirtyIcon({ disabled, onClick, size }: IconProps) {
//   return (
//     <svg
//       className={classNames('icon', { disabled })}
//       onClick={disabled ? null : onClick}
//       width={size}
//       height={size}
//       viewBox="0 0 16 16"
//     >
//       <circle fill="#C5C5C5" cx="8" cy="8" r="4" />
//     </svg>
//   )
// }
