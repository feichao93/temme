import { useLayoutEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import React from 'react'

export type CursorOverlayType = 'ew-resize' | 'ns-resize' | 'all-scroll' | null

// 当用户进行拖拽时，放置一个遮罩层，防止鼠标进入其他交互元素而导致 cursor 抖动
export default function CursorOverlay({ type }: { type: CursorOverlayType }) {
  const ref = useRef(document.createElement('div'))

  useLayoutEffect(() => {
    const overlay = ref.current
    overlay.classList.add('cursor-overlay')
    document.body.appendChild(overlay)
    return () => document.body.removeChild(overlay)
  }, [])

  useLayoutEffect(
    () => {
      document.body.style.userSelect = type == null ? '' : 'none'
    },
    [type],
  )

  if (type == null) {
    return null
  } else {
    return ReactDOM.createPortal(
      <div
        style={{
          position: 'absolute',
          userSelect: 'none',
          zIndex: 10,
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          cursor: type,
        }}
      />,
      ref.current,
    )
  }
}
