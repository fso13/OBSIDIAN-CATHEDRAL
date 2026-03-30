import { useMemo } from 'react'
import { getVisibleMails } from '../game/content'
import type { GameState } from '../game/types'

type Props = {
  state: GameState
  onClose: () => void
  onOpenMessage: (id: string | null) => void
  onRead: (id: string) => void
}

export function MailApp({ state, onClose, onOpenMessage, onRead }: Props) {
  const visible = useMemo(() => getVisibleMails(state), [state])
  const openId = useMemo(() => {
    const preferred = state.mailOpenId
    if (preferred && visible.some((m) => m.id === preferred)) return preferred
    return visible[0]?.id ?? null
  }, [state.mailOpenId, visible])

  const open = visible.find((m) => m.id === openId)

  return (
    <div className="window mail-window">
      <header className="window-head">
        <span>Почта</span>
        <button type="button" className="win-close" onClick={onClose}>
          ×
        </button>
      </header>
      <div className="mail-layout">
        <aside className="mail-list">
          {visible.map((m) => {
            const unread = !state.readMailIds.includes(m.id)
            return (
              <button
                key={m.id}
                type="button"
                className={`mail-item ${openId === m.id ? 'active' : ''}`}
                onClick={() => onOpenMessage(m.id)}
              >
                <span className={`mail-from ${unread ? 'unread' : ''}`}>
                  {m.from}
                </span>
                <span className="mail-subj">{m.subject}</span>
              </button>
            )
          })}
        </aside>
        <article
          className="mail-body"
          onFocus={() => open && onRead(open.id)}
          onMouseEnter={() => open && onRead(open.id)}
        >
          {open ? (
            <>
              <h2>{open.subject}</h2>
              <p className="meta">
                {open.from} · {open.date}
              </p>
              <div className="body-text">{open.body}</div>
            </>
          ) : (
            <p className="muted">Нет писем.</p>
          )}
        </article>
      </div>
    </div>
  )
}
