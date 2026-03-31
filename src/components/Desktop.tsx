import { useMemo, useState } from 'react'
import { getVisibleMails } from '../game/content'
import { stressTier } from '../game/stress'
import type { GameAction, GameState, ShellWindow } from '../game/types'
import { AudioPlayerApp } from './AudioPlayerApp'
import { BrowserApp } from './BrowserApp'
import { CalendarApp } from './CalendarApp'
import { ChessApp } from './ChessApp'
import { FilesApp } from './FilesApp'
import { GameMenuModal } from './GameMenuModal'
import { ImageEditorApp } from './ImageEditorApp'
import { MailApp } from './MailApp'
import { NotepadApp } from './NotepadApp'
import { ShellWindowFrame } from './ShellWindowFrame'
import { SolitaireApp } from './SolitaireApp'
import { StartMenu } from './StartMenu'
import { TerminalApp } from './TerminalApp'
import { TetrisApp } from './TetrisApp'
import { VideoPlayerApp } from './VideoPlayerApp'

type Props = {
  state: GameState
  dispatch: (action: GameAction) => void
  onNewGame: () => void
}

function tbLabel(title: string, max = 14): string {
  const t = title.trim()
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`
}

function renderWindowContent(
  win: ShellWindow,
  state: GameState,
  dispatch: (action: GameAction) => void,
) {
  switch (win.type) {
    case 'files':
      return (
        <FilesApp
          windowId={win.id}
          filesDirId={win.filesDirId ?? 'root'}
          filesSelectedFileId={win.filesSelectedFileId ?? null}
          dispatch={dispatch}
        />
      )
    case 'mail':
      return (
        <MailApp
          windowId={win.id}
          mailOpenId={win.mailOpenId ?? null}
          state={state}
          dispatch={dispatch}
        />
      )
    case 'calendar':
      return (
        <CalendarApp
          entries={state.calendarEntries}
          dispatch={dispatch}
        />
      )
    case 'terminal':
      return <TerminalApp state={state} dispatch={dispatch} />
    case 'notepad':
      return (
        <NotepadApp
          key={win.id}
          initialContent={win.notepadContent ?? null}
        />
      )
    case 'browser':
      return <BrowserApp state={state} dispatch={dispatch} />
    case 'image-editor':
      return <ImageEditorApp />
    case 'audio-player':
      return <AudioPlayerApp />
    case 'video-player':
      return <VideoPlayerApp />
    case 'solitaire':
      return <SolitaireApp />
    case 'tetris':
      return <TetrisApp />
    case 'chess':
      return <ChessApp />
    default:
      return null
  }
}

export function Desktop({ state, dispatch, onNewGame }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [startOpen, setStartOpen] = useState(false)
  const tier = stressTier(state)
  const visibleMails = useMemo(() => getVisibleMails(state), [state])
  const unreadCount = useMemo(
    () => visibleMails.filter((m) => !state.readMailIds.includes(m.id)).length,
    [visibleMails, state.readMailIds],
  )

  const sortedVisible = useMemo(
    () =>
      state.windows
        .filter((w) => !w.minimized)
        .slice()
        .sort((a, b) => a.zIndex - b.zIndex),
    [state.windows],
  )

  const taskbarClick = (w: ShellWindow) => {
    if (w.minimized) {
      dispatch({ type: 'RESTORE_WINDOW', id: w.id })
    } else {
      dispatch({ type: 'FOCUS_WINDOW', id: w.id })
    }
  }

  return (
    <div className={`desktop desktop--shell desktop--stress-${tier}`}>
      <div className="wallpaper wallpaper--shell" aria-hidden="true" />
      <div
        className={`stress-vignette stress-vignette--${tier}`}
        aria-hidden="true"
      />

      <GameMenuModal
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNewGame={onNewGame}
      />

      <div className="desktop-icons">
        <button
          type="button"
          className="desk-icon"
          onClick={() =>
            dispatch({
              type: 'OPEN_WINDOW',
              windowType: 'files',
              filesDirId: 'dir-docs',
            })
          }
        >
          <span className="ico-lg">📄</span>
          <span className="lbl">Мои документы</span>
        </button>
        <button
          type="button"
          className="desk-icon"
          onClick={() =>
            dispatch({ type: 'OPEN_WINDOW', windowType: 'calendar' })
          }
        >
          <span className="ico-lg">📅</span>
          <span className="lbl">Календарь</span>
        </button>
        <button
          type="button"
          className="desk-icon"
          onClick={() => dispatch({ type: 'OPEN_WINDOW', windowType: 'mail' })}
        >
          <span className="ico-lg">✉</span>
          <span className="lbl">
            Почта
            {unreadCount > 0 && (
              <span className="badge">
                {unreadCount > 9 ? '!' : unreadCount}
              </span>
            )}
          </span>
        </button>
        <button
          type="button"
          className="desk-icon"
          onClick={() =>
            dispatch({
              type: 'OPEN_WINDOW',
              windowType: 'files',
              filesDirId: 'dir-trash',
            })
          }
        >
          <span className="ico-lg">🗑</span>
          <span className="lbl">Корзина</span>
        </button>
      </div>

      <footer className="taskbar taskbar--xp">
        <div className="taskbar-start-wrap">
          <button
            type="button"
            className="start-btn-xp"
            onClick={() => setStartOpen((v) => !v)}
            aria-expanded={startOpen}
            aria-haspopup="true"
          >
            <span className="start-btn-xp-flag" aria-hidden />
            Пуск
          </button>
          <StartMenu
            open={startOpen}
            onClose={() => setStartOpen(false)}
            dispatch={dispatch}
          />
        </div>
        <div className="taskbar-windows" role="tablist" aria-label="Открытые окна">
          {state.windows.map((w) => (
            <button
              key={w.id}
              type="button"
              className={`taskbar-win-btn ${
                !w.minimized && state.focusedWindowId === w.id
                  ? 'taskbar-win-btn--active'
                  : ''
              } ${w.minimized ? 'taskbar-win-btn--min' : ''}`}
              title={w.title}
              onClick={() => taskbarClick(w)}
            >
              {tbLabel(w.title)}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="tb-btn ghost tb-menu-side"
          onClick={() => setMenuOpen(true)}
        >
          Меню
        </button>
        <span className="tb-meta">shell</span>
      </footer>

      <div className="windows-layer windows-layer--multi">
        {sortedVisible.map((win) => (
          <ShellWindowFrame key={win.id} win={win} dispatch={dispatch}>
            {renderWindowContent(win, state, dispatch)}
          </ShellWindowFrame>
        ))}
      </div>
    </div>
  )
}
