import { useEffect, useState } from 'react'

const LINES = [
  'Загрузка профиля пользователя…',
  'Проверка тома OS (образ)… OK',
  'Службы: сеть отключена (офлайн)',
  'Оболочка готова.',
]

type Props = {
  onComplete: () => void
}

export function BootSequence({ onComplete }: Props) {
  const [visible, setVisible] = useState(0)

  useEffect(() => {
    if (visible < LINES.length) {
      const t = window.setTimeout(
        () => setVisible((v) => v + 1),
        280 + Math.random() * 160,
      )
      return () => window.clearTimeout(t)
    }
    const done = window.setTimeout(onComplete, 480)
    return () => window.clearTimeout(done)
  }, [visible, onComplete])

  return (
    <div className="screen boot-screen">
      <div className="boot-crt">
        <pre className="boot-text" aria-live="polite">
          {LINES.slice(0, visible).join('\n')}
          <span className="cursor-blink">▌</span>
        </pre>
      </div>
    </div>
  )
}
