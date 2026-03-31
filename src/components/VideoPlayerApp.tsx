import { useId, useState } from 'react'

export function VideoPlayerApp() {
  const fid = useId()
  const [src, setSrc] = useState<string | null>(null)

  return (
    <div className="media-window media-window--embedded">
      <div className="media-body">
        <label className="btn ghost">
          Открыть видео
          <input
            id={fid}
            type="file"
            accept="video/*"
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
          <video controls className="media-el media-video" src={src}>
            Браузер не воспроизводит этот формат.
          </video>
        )}
        <p className="muted small">Часто поддерживаются MP4 и WebM.</p>
      </div>
    </div>
  )
}
