import { useId, useMemo, useRef, useState } from 'react'

type Props = {
  mediaFileId?: string | null
}

export function AudioPlayerApp({ mediaFileId = null }: Props) {
  const fid = useId()
  const [src, setSrc] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const beepFiredRef = useRef(false)
  const lastTimeRef = useRef(0)
  const mediaSrc = useMemo(() => {
    const map: Record<string, string> = {
      'track-hidden': '/music_cache/track_hidden.mp3',
      'track-hidden-2': '/music_cache/track_hidden_2.mp3',
      'song-old-1': '/music_cache/song_old_1.mp3',
      'noise-test': '/music_cache/noise_test.mp3',
    }
    return mediaFileId ? map[mediaFileId] ?? null : null
  }, [mediaFileId])
  const effectiveSrc = mediaSrc ?? src
  const isHiddenTrack = mediaFileId === 'track-hidden'

  const playBeep = () => {
    const AudioCtx =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    void ctx.resume()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 1900
    gain.gain.value = 0.0001
    osc.connect(gain)
    gain.connect(ctx.destination)
    const now = ctx.currentTime
    gain.gain.exponentialRampToValueAtTime(0.24, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.36)
    osc.start(now)
    osc.stop(now + 0.38)
    window.setTimeout(() => void ctx.close(), 450)
  }

  return (
    <div className="media-window media-window--embedded">
      <div className="media-body">
        {!mediaSrc && (
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
        )}
        {effectiveSrc && (
          <audio
            ref={audioRef}
            controls
            className="media-el"
            src={effectiveSrc}
            onLoadedMetadata={() => {
              beepFiredRef.current = false
              lastTimeRef.current = 0
            }}
            onSeeked={(e) => {
              lastTimeRef.current = e.currentTarget.currentTime
              if (e.currentTarget.currentTime < 217) {
                beepFiredRef.current = false
              }
            }}
            onTimeUpdate={(e) => {
              if (!isHiddenTrack) return
              const current = e.currentTarget.currentTime
              const prev = lastTimeRef.current
              lastTimeRef.current = current
              if (current < 217) {
                beepFiredRef.current = false
                return
              }
              if (prev < 217 && current >= 217 && !beepFiredRef.current) {
                beepFiredRef.current = true
                playBeep()
              }
            }}
          >
            Браузер не воспроизводит этот формат.
          </audio>
        )}
        <p className="muted small">
          Поддерживаются форматы, которые умеет ваш браузер (часто MP3, OGG,
          WAV).
        </p>
      </div>
    </div>
  )
}
