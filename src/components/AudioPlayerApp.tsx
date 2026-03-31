import { useId, useState } from 'react'

export function AudioPlayerApp() {
  const fid = useId()
  const [src, setSrc] = useState<string | null>(null)

  return (
    <div className="media-window media-window--embedded">
      <div className="media-body">
        <label className="btn ghost">
          Открыть аудио
          <input
            id={fid}
            type="file"
            accept="audio/*"
            className="visually-hidden-input"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (!f) return
              if (src) URL.revokeObjectURL(src)
              setSrc(URL.createObjectURL(f))
            }}
          />
        </label>
        {src && (
          <audio controls className="media-el" src={src}>
            Браузер не воспроизводит этот формат.
          </audio>
        )}
        <p className="muted small">
          Поддерживаются форматы, которые умеет ваш браузер (часто MP3, OGG, WAV).
        </p>
      </div>
    </div>
  )
}
