import { useEffect, useMemo, useState } from 'react'
import type { CalendarEntry, GameAction } from '../game/types'

type Props = {
  entries: CalendarEntry[]
  dispatch: (action: GameAction) => void
}

const RU_MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]

const RU_DOW = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function daysInGrid(year: number, month: number) {
  const first = new Date(year, month, 1)
  const startDow = (first.getDay() + 6) % 7
  const dim = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= dim; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function dateKey(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export function CalendarApp({ entries, dispatch }: Props) {
  const now = useMemo(() => new Date(), [])
  const [cursor, setCursor] = useState(() => ({
    y: now.getFullYear(),
    m: now.getMonth(),
  }))
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate())
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const grid = useMemo(
    () => daysInGrid(cursor.y, cursor.m),
    [cursor.y, cursor.m],
  )

  useEffect(() => {
    if (selectedDay === null) return
    const dim = new Date(cursor.y, cursor.m + 1, 0).getDate()
    if (selectedDay > dim) setSelectedDay(dim)
  }, [cursor.y, cursor.m, selectedDay])

  const todayY = now.getFullYear()
  const todayM = now.getMonth()
  const todayD = now.getDate()

  const activeKey =
    selectedDay !== null
      ? dateKey(cursor.y, cursor.m, selectedDay)
      : null

  const dayEntries = activeKey
    ? entries.filter((e) => e.dateKey === activeKey)
    : []

  return (
    <div className="calendar-window calendar-window--embedded">
      <div className="calendar-body calendar-body--full">
        <div className="calendar-toolbar">
          <button
            type="button"
            className="btn ghost calendar-nav"
            onClick={() =>
              setCursor((c) => {
                const nm = c.m - 1
                return nm < 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: nm }
              })
            }
          >
            ‹
          </button>
          <span className="calendar-title">
            {RU_MONTHS[cursor.m]} {cursor.y}
          </span>
          <button
            type="button"
            className="btn ghost calendar-nav"
            onClick={() =>
              setCursor((c) => {
                const nm = c.m + 1
                return nm > 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: nm }
              })
            }
          >
            ›
          </button>
        </div>
        <div className="calendar-grid-head">
          {RU_DOW.map((d) => (
            <span key={d} className="calendar-dow">
              {d}
            </span>
          ))}
        </div>
        <div className="calendar-grid">
          {grid.map((d, i) => {
            const isToday =
              d !== null &&
              cursor.y === todayY &&
              cursor.m === todayM &&
              d === todayD
            const isSel = d !== null && selectedDay === d
            const dk =
              d !== null ? dateKey(cursor.y, cursor.m, d) : ''
            const has = dk && entries.some((e) => e.dateKey === dk)
            return (
              <button
                key={i}
                type="button"
                className={`calendar-cell calendar-cell--btn ${d === null ? 'calendar-cell--empty' : ''} ${isToday ? 'calendar-cell--today' : ''} ${isSel ? 'calendar-cell--selected' : ''}`}
                disabled={d === null}
                onClick={() => d !== null && setSelectedDay(d)}
              >
                {d !== null ? (
                  <>
                    <span>{d}</span>
                    {has && <span className="calendar-dot" aria-hidden />}
                  </>
                ) : null}
              </button>
            )
          })}
        </div>

        {activeKey && (
          <div className="calendar-events-panel">
            <h3 className="calendar-events-title">{activeKey}</h3>
            {dayEntries.length === 0 ? (
              <p className="muted small">Нет записей на этот день.</p>
            ) : (
              <ul className="calendar-event-list">
                {dayEntries.map((e) => (
                  <li key={e.id} className="calendar-event-item">
                    <div className="calendar-event-head">
                      <strong>{e.title}</strong>
                      <button
                        type="button"
                        className="btn ghost calendar-event-del"
                        onClick={() =>
                          dispatch({
                            type: 'CALENDAR_DELETE_ENTRY',
                            id: e.id,
                          })
                        }
                      >
                        Удалить
                      </button>
                    </div>
                    {e.body ? (
                      <p className="calendar-event-body">{e.body}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
            <div className="calendar-new-event">
              <label className="calendar-label">
                Заголовок
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Встреча, напоминание…"
                />
              </label>
              <label className="calendar-label">
                Заметка
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={2}
                  placeholder="Текст (необязательно)"
                />
              </label>
              <button
                type="button"
                className="btn primary"
                onClick={() => {
                  if (!activeKey) return
                  dispatch({
                    type: 'CALENDAR_ADD_ENTRY',
                    dateKey: activeKey,
                    title: title || 'Без названия',
                    body,
                  })
                  setTitle('')
                  setBody('')
                }}
              >
                Сохранить запись
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
