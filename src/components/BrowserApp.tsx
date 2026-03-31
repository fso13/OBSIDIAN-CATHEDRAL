import { useCallback, useEffect, useMemo, useState } from 'react'
import type { GameAction, GameState } from '../game/types'

const SEARCH_PREFIX = 'https://duckduckgo.com/html/?q='

function resolveNavigation(raw: string): { url: string; title: string } {
  const t = raw.trim()
  if (!t || t.toLowerCase() === 'about:blank') {
    return { url: 'about:blank', title: 'Пустая страница' }
  }
  const low = t.toLowerCase()
  if (
    low === 'shell:home' ||
    low === 'about:metal' ||
    low === 'obsidian:' ||
    low === 'obsidian://'
  ) {
    return { url: 'shell:home', title: 'OBSIDIAN CATHEDRAL' }
  }
  if (/^https?:\/\//i.test(t)) {
    return {
      url: t,
      title: t.replace(/^https?:\/\//i, '').split('/')[0] ?? t,
    }
  }
  if (/\s/.test(t) || !t.includes('.')) {
    return {
      url: SEARCH_PREFIX + encodeURIComponent(t),
      title: `Поиск: ${t}`,
    }
  }
  return { url: `https://${t}`, title: t }
}

function ObsidianHomePage() {
  return (
    <div className="browser-internal-metal">
      <div className="browser-metal-logo">OBSIDIAN CATHEDRAL</div>
      <p className="browser-metal-era">Melodic Thrash · Milwaukee · 1993–2001</p>
      <p className="browser-metal-blurb">
        Культовая «подпольная» четвёрка 90-х: хромированные гитары, хор на припевах и
        обложки в духе airbrush на фургонах. Последний студийник «Rust & Revelation»
        вышел в 1998 и мгновенно раскупился в районе Великих озёр.
      </p>
      <ul className="browser-metal-tracks">
        <li>1994 — <em>Skull Highway</em> (demo K7)</li>
        <li>1996 — <em>Crimson Fuel</em></li>
        <li>1998 — <em>Rust &amp; Revelation</em></li>
      </ul>
      <p className="browser-metal-foot muted small">
        Выдуманная группа для этого рабочего стола. Введите URL или запрос в адресной
        строке — откроется поиск или сайт (если разрешит iframe).
      </p>
    </div>
  )
}

type Panel = 'bookmarks' | 'history' | null

type Nav = { stack: string[]; ptr: number }

type Props = {
  state: GameState
  dispatch: (action: GameAction) => void
}

export function BrowserApp({ state, dispatch }: Props) {
  const [nav, setNav] = useState<Nav>(() => ({
    stack: ['shell:home'],
    ptr: 0,
  }))
  const [address, setAddress] = useState('shell:home')
  const [panel, setPanel] = useState<Panel>(null)
  const [frameKey, setFrameKey] = useState(0)
  const [frameError, setFrameError] = useState(false)

  const currentUrl = nav.stack[nav.ptr] ?? 'about:blank'

  useEffect(() => {
    const u = nav.stack[nav.ptr]
    if (typeof u === 'string') setAddress(u)
  }, [nav.stack, nav.ptr])

  const historySorted = useMemo(
    () => [...state.browserHistory].sort((a, b) => b.at - a.at),
    [state.browserHistory],
  )

  const navigateTo = useCallback(
    (url: string, title: string, record: boolean) => {
      setNav(({ stack, ptr }) => ({
        stack: [...stack.slice(0, ptr + 1), url],
        ptr: ptr + 1,
      }))
      setFrameError(false)
      if (record && url !== 'about:blank') {
        dispatch({ type: 'BROWSER_RECORD_VISIT', title, url })
      }
    },
    [dispatch],
  )

  const go = (e: React.FormEvent) => {
    e.preventDefault()
    const { url, title } = resolveNavigation(address)
    navigateTo(url, title, true)
  }

  const openUrl = (url: string, title: string) => {
    navigateTo(url, title, true)
  }

  const back = () => {
    setNav(({ stack, ptr }) => {
      if (ptr <= 0) return { stack, ptr }
      const nextPtr = ptr - 1
      const next = { stack, ptr: nextPtr }
      return next
    })
    setFrameError(false)
  }

  const fwd = () => {
    setNav(({ stack, ptr }) => {
      if (ptr >= stack.length - 1) return { stack, ptr }
      const nextPtr = ptr + 1
      const next = { stack, ptr: nextPtr }
      return next
    })
    setFrameError(false)
  }

  const refresh = () => {
    setFrameError(false)
    setFrameKey((k) => k + 1)
  }

  const addBookmark = () => {
    const { title, url } = resolveNavigation(address)
    if (url === 'about:blank') return
    dispatch({ type: 'BROWSER_ADD_BOOKMARK', title, url })
  }

  const showInternal = currentUrl === 'shell:home'
  const showBlank = currentUrl === 'about:blank'

  return (
    <div className="browser-app browser-window--embedded">
      <div className="browser-toolbar">
        <div className="browser-nav-row">
          <button
            type="button"
            className="btn ghost browser-tb"
            disabled={nav.ptr <= 0}
            onClick={back}
            title="Назад"
          >
            ←
          </button>
          <button
            type="button"
            className="btn ghost browser-tb"
            disabled={nav.ptr >= nav.stack.length - 1}
            onClick={fwd}
            title="Вперёд"
          >
            →
          </button>
          <button
            type="button"
            className="btn ghost browser-tb"
            onClick={refresh}
            title="Обновить"
          >
            ↻
          </button>
          <form className="browser-address-form" onSubmit={go}>
            <input
              className="browser-address-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="URL или поиск…"
              aria-label="Адрес и поиск"
            />
            <button type="submit" className="btn primary browser-go">
              Перейти
            </button>
          </form>
        </div>
        <div className="browser-second-row">
          <button
            type="button"
            className={`btn ghost ${panel === 'bookmarks' ? 'active' : ''}`}
            onClick={() =>
              setPanel((p) => (p === 'bookmarks' ? null : 'bookmarks'))
            }
          >
            Закладки
          </button>
          <button
            type="button"
            className={`btn ghost ${panel === 'history' ? 'active' : ''}`}
            onClick={() => setPanel((p) => (p === 'history' ? null : 'history'))}
          >
            История
          </button>
          <button type="button" className="btn ghost" onClick={addBookmark}>
            В закладки
          </button>
        </div>
      </div>
      <div className="browser-main">
        {panel && (
          <aside className="browser-side" aria-label={panel}>
            {panel === 'bookmarks' && (
              <>
                <p className="browser-side-title">Закладки</p>
                <ul className="browser-side-list">
                  {state.browserBookmarks.map((b) => (
                    <li key={b.id}>
                      <button
                        type="button"
                        className="browser-side-link"
                        onClick={() => {
                          openUrl(b.url, b.title)
                          setPanel(null)
                        }}
                      >
                        {b.title}
                      </button>
                      <button
                        type="button"
                        className="browser-side-del"
                        aria-label="Удалить закладку"
                        onClick={() =>
                          dispatch({
                            type: 'BROWSER_REMOVE_BOOKMARK',
                            id: b.id,
                          })
                        }
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {panel === 'history' && (
              <>
                <p className="browser-side-title">История</p>
                <ul className="browser-side-list">
                  {historySorted.map((h) => (
                    <li key={h.id}>
                      <button
                        type="button"
                        className="browser-side-link browser-side-link--hist"
                        onClick={() => {
                          openUrl(h.url, h.title)
                          setPanel(null)
                        }}
                      >
                        <span className="browser-hist-title">{h.title}</span>
                        <span className="browser-hist-url muted small">{h.url}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </aside>
        )}
        <div className="browser-viewport">
          {showBlank && (
            <p className="browser-placeholder muted">Введите адрес или запрос.</p>
          )}
          {showInternal && <ObsidianHomePage />}
          {!showInternal && !showBlank && (
            <>
              {frameError && (
                <p className="browser-frame-error hint-warn">
                  Этот сайт не позволяет открывать себя внутри окна (iframe).
                  Скопируйте адрес из строки и откройте его во внешнем браузере.
                </p>
              )}
              <iframe
                key={`${currentUrl}-${frameKey}`}
                className="browser-frame"
                title="Просмотр"
                src={currentUrl}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                onError={() => setFrameError(true)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
