import { useId, useState } from 'react'

const DEFAULT_BODY =
  'Блокнот\n\nЗдесь можно вести заметки. Текст не сохраняется на диск автоматически.'

type Props = {
  initialContent?: string | null
}

export function NotepadApp({ initialContent = null }: Props) {
  const id = useId()
  const [text, setText] = useState(
    () => (initialContent != null ? initialContent : DEFAULT_BODY),
  )

  return (
    <div className="notepad-window notepad-window--embedded">
      <div className="notepad-body">
        <label htmlFor={id} className="sr-only">
          Текст
        </label>
        <textarea
          id={id}
          className="notepad-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          placeholder="Введите текст…"
        />
      </div>
    </div>
  )
}
