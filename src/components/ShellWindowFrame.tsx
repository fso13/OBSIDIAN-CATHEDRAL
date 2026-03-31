import {
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useState,
} from 'react'
import type { GameAction, ShellWindow } from '../game/types'

const MIN_W = 280
const MIN_H = 160

function clampMove(
  x: number,
  y: number,
  w: number,
  h: number,
  bar: number,
): { x: number; y: number } {
  const vw = window.innerWidth
  const vh = window.innerHeight
  let nx = Math.min(x, vw - 48)
  nx = Math.max(nx, -w + 120)
  let ny = Math.min(y, vh - bar - h)
  ny = Math.max(ny, 0)
  return { x: nx, y: ny }
}

function clampSize(w: number, h: number, bar: number): { w: number; h: number } {
  const vw = window.innerWidth
  const vh = window.innerHeight
  return {
    w: Math.max(MIN_W, Math.min(w, vw - 8)),
    h: Math.max(MIN_H, Math.min(h, vh - bar - 8)),
  }
}

type Props = {
  win: ShellWindow
  dispatch: (action: GameAction) => void
  children: ReactNode
}

export function ShellWindowFrame({ win, dispatch, children }: Props) {
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)
  const [resizeDim, setResizeDim] = useState<{ w: number; h: number } | null>(
    null,
  )
  const bar = 52

  const focus = useCallback(() => {
    dispatch({ type: 'FOCUS_WINDOW', id: win.id })
  }, [dispatch, win.id])

  const x = dragPos?.x ?? win.x
  const y = dragPos?.y ?? win.y
  const w = resizeDim?.w ?? win.width
  const h = resizeDim?.h ?? win.height

  const onTitlePointerDown = (e: ReactPointerEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    focus()
    const sx = e.clientX
    const sy = e.clientY
    const ox = dragPos?.x ?? win.x
    const oy = dragPos?.y ?? win.y

    const move = (ev: PointerEvent) => {
      const rawX = ox + ev.clientX - sx
      const rawY = oy + ev.clientY - sy
      const c = clampMove(rawX, rawY, w, h, bar)
      setDragPos(c)
    }

    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      const rawX = ox + ev.clientX - sx
      const rawY = oy + ev.clientY - sy
      const c = clampMove(rawX, rawY, w, h, bar)
      dispatch({ type: 'MOVE_WINDOW', id: win.id, x: c.x, y: c.y })
      setDragPos(null)
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const onResizePointerDown = (e: ReactPointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    focus()
    const sx = e.clientX
    const sy = e.clientY
    const ow = resizeDim?.w ?? win.width
    const oh = resizeDim?.h ?? win.height

    const move = (ev: PointerEvent) => {
      const rawW = ow + ev.clientX - sx
      const rawH = oh + ev.clientY - sy
      const c = clampSize(rawW, rawH, bar)
      setResizeDim(c)
    }

    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      const rawW = ow + ev.clientX - sx
      const rawH = oh + ev.clientY - sy
      const c = clampSize(rawW, rawH, bar)
      dispatch({
        type: 'RESIZE_WINDOW',
        id: win.id,
        width: c.w,
        height: c.h,
      })
      setResizeDim(null)
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  if (win.minimized) return null

  return (
    <div
      className="shell-window"
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
        zIndex: win.zIndex,
      }}
    >
      <div
        className="shell-window-titlebar"
        onPointerDown={onTitlePointerDown}
      >
        <span className="shell-window-title">{win.title}</span>
        <div className="shell-window-controls">
          <button
            type="button"
            className="shell-win-btn shell-win-min"
            aria-label="Свернуть"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => dispatch({ type: 'MINIMIZE_WINDOW', id: win.id })}
          >
            _
          </button>
          <button
            type="button"
            className="shell-win-btn shell-win-close"
            aria-label="Закрыть"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => dispatch({ type: 'CLOSE_WINDOW', id: win.id })}
          >
            ×
          </button>
        </div>
      </div>
      <div className="shell-window-body" onPointerDown={focus}>
        {children}
      </div>
      <div
        className="shell-window-resize"
        onPointerDown={onResizePointerDown}
        aria-hidden
      />
    </div>
  )
}
