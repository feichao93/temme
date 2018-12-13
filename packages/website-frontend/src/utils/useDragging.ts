import React from 'react'

function useEventCallback(
  target: EventTarget,
  eventType: string,
  callback: (event: MouseEvent) => void,
  inputs: any[],
) {
  React.useEffect(() => {
    target.addEventListener(eventType, callback)
    return () => target.removeEventListener(eventType, callback)
  }, inputs)
}

export type Pos = { x: number; y: number }

interface UseDraggingOptions<S> {
  onDrag?(delta: { dx: number; dy: number }, subject: S, startPos: Pos, cntPos: Pos): void
  onDragEnd?(delta: { dx: number; dy: number }, subject: S, start: Pos, endPos: Pos): void
}

interface DraggingState<S> {
  hold: boolean
  startPos: { x: number; y: number }
  subject: S
}

export default function useDragging<S>({ onDrag, onDragEnd }: UseDraggingOptions<S>) {
  const [state, setState] = React.useState<DraggingState<S>>({
    hold: false,
    startPos: null,
    subject: null,
  })

  useEventCallback(
    window,
    'mousemove',
    e => {
      if (state.hold) {
        const dragPos = { x: e.clientX, y: e.clientY }
        onDrag &&
          onDrag(
            {
              dx: dragPos.x - state.startPos.x,
              dy: dragPos.y - state.startPos.y,
            },
            state.subject,
            state.startPos,
            dragPos,
          )
      }
    },
    [state], // TODO 有一定的优化空间
  )

  useEventCallback(
    window,
    'mouseup',
    e => {
      if (state.hold) {
        const endPos = { x: e.clientX, y: e.clientY }
        onDragEnd &&
          onDragEnd(
            {
              dx: endPos.x - state.startPos.x,
              dy: endPos.y - state.startPos.y,
            },
            state.subject,
            state.startPos,
            endPos,
          )
        setState({ hold: false, startPos: null, subject: null })
      }
    },
    [state],
  )

  const start = React.useCallback((e: { clientX: number; clientY: number }, subject: S = null) => {
    const startPos = { x: e.clientX, y: e.clientY }
    setState({ hold: true, startPos, subject })
  }, [])

  return { start }
}
