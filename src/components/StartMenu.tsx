import { useEffect, useRef } from 'react'
import {
  START_MENU_GAMES,
  START_MENU_PROGRAMS,
} from '../game/content'
import type { GameAction } from '../game/types'

type Props = {
  open: boolean
  onClose: () => void
  dispatch: (action: GameAction) => void
}

export function StartMenu({ open, onClose, dispatch }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      const el = e.target as Node | null
      if (panelRef.current && el && !panelRef.current.contains(el)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="start-menu-panel" ref={panelRef} role="menu">
      <div className="start-menu-banner">
        <span className="start-menu-banner-text">Добро пожаловать</span>
      </div>
      <div className="start-menu-cols">
        <div className="start-menu-col">
          <p className="start-menu-heading">Система</p>
          <button
            type="button"
            className="start-menu-item"
            onClick={() => {
              dispatch({
                type: 'OPEN_WINDOW',
                windowType: 'files',
                filesDirId: 'root',
              })
              onClose()
            }}
          >
            <span className="start-menu-ico">📂</span> Проводник
          </button>
          <button
            type="button"
            className="start-menu-item"
            onClick={() => {
              dispatch({
                type: 'OPEN_WINDOW',
                windowType: 'files',
                filesDirId: 'dir-docs',
              })
              onClose()
            }}
          >
            <span className="start-menu-ico">📄</span> Мои документы
          </button>
        </div>
        <div className="start-menu-col">
          <p className="start-menu-heading">Программы</p>
          {START_MENU_PROGRAMS.map((item) => (
            <button
              key={item.type}
              type="button"
              className="start-menu-item"
              onClick={() => {
                dispatch({ type: 'OPEN_WINDOW', windowType: item.type })
                onClose()
              }}
            >
              <span className="start-menu-ico">▸</span> {item.label}
            </button>
          ))}
        </div>
        <div className="start-menu-col">
          <p className="start-menu-heading">Игры</p>
          {START_MENU_GAMES.map((item) => (
            <button
              key={item.type}
              type="button"
              className="start-menu-item"
              onClick={() => {
                dispatch({ type: 'OPEN_WINDOW', windowType: item.type })
                onClose()
              }}
            >
              <span className="start-menu-ico">🎮</span> {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
