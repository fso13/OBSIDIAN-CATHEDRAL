import { useMemo, useState } from 'react'
import { getVisibleMails } from '../game/content'
import { stressTier } from '../game/stress'
import type { GameAction, GameState } from '../game/types'
import { FilesApp } from './FilesApp'
import { GameMenuModal } from './GameMenuModal'
import { MailApp } from './MailApp'
import { TerminalApp } from './TerminalApp'

type Props = {
  state: GameState
  dispatch: (action: GameAction) => void
  onNewGame: () => void
}

export function Desktop({ state, dispatch, onNewGame }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const tier = stressTier(state)
  const visibleMails = useMemo(() => getVisibleMails(state), [state])
  const unreadCount = useMemo(
    () => visibleMails.filter((m) => !state.readMailIds.includes(m.id)).length,
    [visibleMails, state.readMailIds],
  )

  return (
    <div className={`desktop desktop--stress-${tier}`}>
      <div className="wallpaper" aria-hidden="true" />
      <div className={`stress-vignette stress-vignette--${tier}`} aria-hidden="true" />

      <GameMenuModal
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNewGame={onNewGame}
      />

      <div className="desktop-icons">
        <button
          type="button"
          className="desk-icon"
          onClick={() => dispatch({ type: 'OPEN_APP', app: 'mail' })}
        >
          <span className="ico-lg">✉</span>
          <span className="lbl">
            Почта
            {unreadCount > 0 && (
              <span className="badge">{unreadCount > 9 ? '!' : unreadCount}</span>
            )}
          </span>
        </button>
        <button
          type="button"
          className="desk-icon"
          onClick={() => dispatch({ type: 'OPEN_APP', app: 'files' })}
        >
          <span className="ico-lg">📂</span>
          <span className="lbl">Файлы</span>
        </button>
        <button
          type="button"
          className="desk-icon"
          onClick={() => dispatch({ type: 'OPEN_APP', app: 'terminal' })}
        >
          <span className="ico-lg">⌨</span>
          <span className="lbl">Терминал</span>
        </button>
      </div>

      <footer className="taskbar">
        <button
          type="button"
          className="tb-btn"
          onClick={() =>
            dispatch({
              type: 'OPEN_APP',
              app: state.activeApp ?? 'mail',
            })
          }
        >
          Окна
        </button>
        <button
          type="button"
          className="tb-btn ghost"
          onClick={() => setMenuOpen(true)}
        >
          Меню
        </button>
        <span className="tb-meta">shell</span>
      </footer>

      <div className="windows-layer">
        {state.activeApp === 'mail' && (
          <MailApp
            state={state}
            onClose={() => dispatch({ type: 'CLOSE_APP' })}
            onOpenMessage={(id) => dispatch({ type: 'SET_MAIL_OPEN', id })}
            onRead={(id) => dispatch({ type: 'MARK_MAIL_READ', id })}
          />
        )}
        {state.activeApp === 'files' && (
          <FilesApp
            state={state}
            dispatch={dispatch}
            onClose={() => dispatch({ type: 'CLOSE_APP' })}
            onDir={(dirId) => dispatch({ type: 'SET_FILES_DIR', dirId })}
            onSelectFile={(fileId) =>
              dispatch({ type: 'SELECT_FILE', fileId })
            }
            onViewFile={(id) => {
              dispatch({ type: 'MARK_FILE_VIEWED', id })
            }}
          />
        )}
        {state.activeApp === 'terminal' && (
          <TerminalApp
            state={state}
            onClose={() => dispatch({ type: 'CLOSE_APP' })}
            dispatch={dispatch}
          />
        )}
      </div>
    </div>
  )
}
