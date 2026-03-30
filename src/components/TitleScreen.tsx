type Props = {
  onBegin: () => void
}

export function TitleScreen({ onBegin }: Props) {
  return (
    <div className="screen title-screen">
      <p className="eyebrow">детектив · цифровая криминалистика</p>
      <h1 className="game-title">Цепь улик</h1>
      <p className="tagline">
        Ноутбук с места преступления. Внутри — шифры серийного убийцы и следы
        пропавших.
      </p>
      <div className="title-actions">
        <button type="button" className="btn primary" onClick={onBegin}>
          Начать
        </button>
      </div>
      <p className="save-hint">Прогресс хранится в этом браузере.</p>
    </div>
  )
}
