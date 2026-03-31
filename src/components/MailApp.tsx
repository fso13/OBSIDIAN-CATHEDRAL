import { useMemo } from 'react'
import { getVisibleMails } from '../game/content'
import type { GameAction, GameState } from '../game/types'

type Props = {
  windowId: string
  mailOpenId: string | null
  state: GameState
  dispatch: (action: GameAction) => void
}

export function MailApp({
  windowId,
  mailOpenId,
  state,
  dispatch,
}: Props) {
  const visible = useMemo(() => getVisibleMails(state), [state])
  const openId = useMemo(() => {
    if (mailOpenId && visible.some((m) => m.id === mailOpenId)) {
      return mailOpenId
    }
    return visible[0]?.id ?? null
  }, [mailOpenId, visible])

  const open = visible.find((m) => m.id === openId)

  return (
    <div className="mail-window mail-window--embedded">
      <div className="mail-layout">
        <aside className="mail-list">
          {visible.map((m) => {
            const unread = !state.readMailIds.includes(m.id)
            return (
              <button
                key={m.id}
                type="button"
                className={`mail-item ${openId === m.id ? 'active' : ''}`}
                onClick={() =>
                  dispatch({
                    type: 'MAIL_WINDOW_SET_OPEN',
                    windowId,
                    mailId: m.id,
                  })
                }
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
          onFocus={() => open && dispatch({ type: 'MARK_MAIL_READ', id: open.id })}
          onMouseEnter={() =>
            open && dispatch({ type: 'MARK_MAIL_READ', id: open.id })
          }
        >
          {open ? (
            <>
              <h2>{open.subject}</h2>
              <p className="meta">
                {open.to ? <>Кому: {open.to} · </> : null}
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
