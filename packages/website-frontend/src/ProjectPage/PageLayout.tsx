import React, { useLayoutEffect, useRef, useState } from 'react'
import useDragging, { Pos } from '../utils/useDragging'
import './PageLayout.styl'

function clamp(min: number, value: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function percentify(ratio: number) {
  return (ratio * 100).toFixed(1) + '%'
}

// TODO 当用户进行拖拽时，需要放置一个遮罩层，防止鼠标进入其他交互元素而导致 cursor 抖动

export interface PageLayoutProps {
  sidebar: React.ReactNode
  left: React.ReactNode
  rightTop: React.ReactNode
  rightBottom: React.ReactNode
  layout(): void
}

export default function PageLayout({
  sidebar,
  left,
  rightTop,
  rightBottom,
  layout,
}: PageLayoutProps) {
  const containerRef = useRef<HTMLMainElement>(null)

  const [sidebarRatio, setSidebarRatio] = useState(0.2)
  const [leftRatio, setLeftRatio] = useState(0.4)
  const [topRatio, setTopRatio] = useState(0.5)

  const rightRatio = 1 - sidebarRatio - leftRatio

  const isMount = useRef(true)
  useLayoutEffect(
    () => {
      if (isMount.current) {
        isMount.current = false
        return
      }
      return layout()
    },
    [sidebarRatio, leftRatio, topRatio],
  )
  useLayoutEffect(() => {
    window.addEventListener('resize', layout)
    return () => window.removeEventListener('resize', layout)
  }, [])

  const dragSidebar = useDragging({
    onDrag(delta, subject, startPos, cntPos) {
      const totalWidth = containerRef.current.clientWidth
      const ratio = cntPos.x / totalWidth

      let nextSidebarRatio: number
      if (ratio < 0.05) {
        // 当用户尝试拖动 sidebar 到一个过短的宽度时，隐藏 sidebar
        nextSidebarRatio = 0
      } else {
        // sidebar 的宽度必须在 10% 到 50% 之间
        nextSidebarRatio = clamp(0.1, ratio, 0.5)
      }

      setSidebarRatio(nextSidebarRatio)
      // 在拖动 sidebar 的过程中，保持右侧不同编辑器的宽度占比
      const x = leftRatio / (leftRatio + rightRatio)
      setLeftRatio(clamp(0.1, x * (1 - nextSidebarRatio), 0.9 - nextSidebarRatio))
    },
  })

  function handleDragLeft(cntPos: Pos) {
    const totalWidth = containerRef.current.clientWidth
    const ratio = cntPos.x / totalWidth - sidebarRatio
    // 编辑器的宽度必须在 10% 到 90% 之间
    setLeftRatio(clamp(0.1, ratio, 0.9 - sidebarRatio))
  }

  function handleDragTop(cntPos: Pos) {
    const container = containerRef.current
    const { top: containerTop } = container.getBoundingClientRect()
    const totalHeight = container.clientHeight
    const ratio = (cntPos.y - containerTop) / totalHeight
    setTopRatio(clamp(0.2, ratio, 0.8))
  }

  const dragLeft = useDragging({
    onDrag(delta, subject, startPos, cntPos) {
      handleDragLeft(cntPos)
    },
  })

  const dragTop = useDragging({
    onDrag(delta, subject, startPos, cntPos) {
      handleDragTop(cntPos)
    },
  })

  const dragOrthogonal = useDragging({
    onDrag(delta, subject, startPos, cntPos) {
      handleDragLeft(cntPos)
      handleDragTop(cntPos)
    },
  })

  return (
    <main ref={containerRef}>
      <div
        style={{
          width: percentify(sidebarRatio),
          display: sidebarRatio === 0 ? 'none' : undefined,
        }}
      >
        {sidebar}
      </div>
      <div
        className="resizer vertical"
        style={{ left: percentify(sidebarRatio) }}
        onMouseDown={dragSidebar.start}
      >
        <div className="line" />
      </div>
      <div
        className="left"
        style={{
          width: percentify(leftRatio),
          display: leftRatio === 0 ? 'none' : undefined,
        }}
      >
        {left}
      </div>
      <div
        className="resizer vertical"
        style={{ left: percentify(sidebarRatio + leftRatio) }}
        onMouseDown={dragLeft.start}
      >
        <div className="line" />
      </div>
      <div className="right" style={{ width: percentify(rightRatio) }}>
        <div style={{ height: percentify(topRatio) }}>{rightTop}</div>
        <div
          className="resizer horizontal"
          style={{ top: percentify(topRatio) }}
          onMouseDown={dragTop.start}
        >
          <div className="line" />
        </div>
        <div style={{ height: percentify(1 - topRatio) }}>{rightBottom}</div>
      </div>
      <div
        className="resizer orthogonal"
        style={{
          top: percentify(topRatio),
          left: percentify(sidebarRatio + leftRatio),
        }}
        onMouseDown={e => {
          e.stopPropagation()
          dragOrthogonal.start(e)
        }}
      />
    </main>
  )
}
