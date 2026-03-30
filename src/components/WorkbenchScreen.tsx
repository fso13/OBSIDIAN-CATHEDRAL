type Props = {
  onPowerOn: () => void
}

export function WorkbenchScreen({ onPowerOn }: Props) {
  return (
    <div className="screen workbench-screen">
      <p className="eyebrow">изолятор · дело «Собиратель»</p>
      <h1>Носитель изъят</h1>
      <div className="panel narrative">
        <p>
          Ноутбук с заброшенного объекта; цепочка пропавших без вести. Сеть
          отключена — только локальный образ диска.
        </p>
        <p>Нужно собрать следы, пока система ещё что-то помнит.</p>
      </div>
      <button type="button" className="btn primary" onClick={onPowerOn}>
        Загрузка с носителя
      </button>
    </div>
  )
}
