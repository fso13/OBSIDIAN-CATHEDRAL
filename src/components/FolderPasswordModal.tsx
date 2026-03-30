import { type FormEvent, useState } from 'react'
import {
  AUDIO_MORSE_PASSWORD,
  FIELD_CHANNEL_FOLDER_NAME,
  LOCKED_FOLDER_NAME,
  SECRET_FOLDER_PASSWORD,
} from '../game/content'
import type { GameAction } from '../game/types'

export type FolderUnlockTarget = 'secret' | 'field'

type Props = {
  open: boolean
  target: FolderUnlockTarget | null
  onClose: () => void
  dispatch: (action: GameAction) => void
  secretFolderUnlocked: boolean
  fieldChannelUnlocked: boolean
}

export function FolderPasswordModal({
  open,
  target,
  onClose,
  dispatch,
  secretFolderUnlocked,
  fieldChannelUnlocked,
}: Props) {
  const [value, setValue] = useState('')
  const [err, setErr] = useState<string | null>(null)

  if (!open || !target) return null

  const title =
    target === 'secret' ? LOCKED_FOLDER_NAME : FIELD_CHANNEL_FOLDER_NAME
  const alreadyOk =
    target === 'secret' ? secretFolderUnlocked : fieldChannelUnlocked

  function submit(e: FormEvent) {
    e.preventDefault()
    setErr(null)
    if (alreadyOk) {
      onClose()
      return
    }
    const v = value.trim().toLowerCase()
    if (target === 'secret' && v === SECRET_FOLDER_PASSWORD) {
      dispatch({ type: 'UNLOCK_SECRET_FOLDER' })
      setValue('')
      onClose()
      return
    }
    if (target === 'field' && v === AUDIO_MORSE_PASSWORD) {
      dispatch({ type: 'UNLOCK_FIELD_CHANNEL' })
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
        <h2>«{title}»</h2>
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
