type Props = {
  open: boolean
  onClose: () => void
  onNewGame: () => void
}

export function GameMenuModal({ open, onClose, onNewGame }: Props) {
  if (!open) return null
  return (
    <div className="modal-root" role="dialog" aria-modal="true" aria-label="Меню">
      <button
        type="button"
        className="modal-backdrop"
        aria-label="Закрыть"
        onClick={onClose}
      />
      <div className="modal-card">
        <h2>Меню</h2>
        <p className="muted small">
          «Новая игра» сбросит прогресс и начнёт дело заново (изолятор).
        </p>
        <div className="modal-actions">
          <button
            type="button"
            className="btn danger"
            onClick={() => {
              onNewGame()
              onClose()
            }}
          >
            Новая игра
          </button>
          <button type="button" className="btn ghost" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}
