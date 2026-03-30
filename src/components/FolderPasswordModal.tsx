import { type FormEvent, useState } from 'react'
import { LOCKED_FOLDER_NAME, SECRET_FOLDER_PASSWORD } from '../game/content'
import type { GameAction } from '../game/types'

type Props = {
  open: boolean
  onClose: () => void
  dispatch: (action: GameAction) => void
  alreadyUnlocked: boolean
}

export function FolderPasswordModal({
  open,
  onClose,
  dispatch,
  alreadyUnlocked,
}: Props) {
  const [value, setValue] = useState('')
  const [err, setErr] = useState<string | null>(null)

  if (!open) return null

  function submit(e: FormEvent) {
    e.preventDefault()
    setErr(null)
    if (alreadyUnlocked) {
      onClose()
      return
    }
    const v = value.trim().toLowerCase()
    if (v === SECRET_FOLDER_PASSWORD) {
      dispatch({ type: 'UNLOCK_SECRET_FOLDER' })
      setValue('')
      onClose()
      return
    }
    setErr('Неверный пароль.')
    dispatch({ type: 'TERMINAL_FAIL' })
  }

  return (
    <div className="modal-root" role="dialog" aria-modal="true" aria-label="Пароль папки">
      <button type="button" className="modal-backdrop" aria-label="Закрыть" onClick={onClose} />
      <div className="modal-card">
        <h2>«{LOCKED_FOLDER_NAME}»</h2>
        <form onSubmit={submit}>
          <input
            className="folder-pass-input"
            type="password"
            autoComplete="off"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Пароль"
            aria-label="Пароль"
          />
          {err && <p className="hint-warn folder-pass-err">{err}</p>}
          <div className="modal-actions">
            <button type="submit" className="btn primary">
              OK
            </button>
            <button type="button" className="btn ghost" onClick={onClose}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
