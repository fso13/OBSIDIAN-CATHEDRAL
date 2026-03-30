import { useEffect, useId, useRef, useState } from 'react'
import {
  AUDIO_ASSET_FILENAME,
  AUDIO_ASSET_PATH,
} from '../game/content'
import { downloadOriginalAsset } from '../game/download'
import type { GameAction } from '../game/types'

const W = 520
const H = 200

type Props = {
  audioSpectrogramSeen: boolean
  dispatch: (action: GameAction) => void
}

/** Без текста пароля — только визуал полосы и подсказка по морзе. */
function drawSpectrogramView(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#06080c'
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = 'rgba(45, 62, 82, 0.35)'
  ctx.lineWidth = 1
  for (let x = 0; x < W; x += 32) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
    ctx.stroke()
  }
  for (let y = 0; y < H; y += 16) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
    ctx.stroke()
  }
  const cols = 100
  const colW = W / cols
  for (let c = 0; c < cols; c++) {
    const phase = Math.sin(c * 0.08) * 0.08
    const n = 0.12 + phase + ((c * 17) % 41) / 400
    const barH = H * Math.min(0.72, n + ((c * 13) % 23) / 100)
    const g = ctx.createLinearGradient(c * colW, H, c * colW, H - barH)
    g.addColorStop(0, 'rgba(25, 90, 72, 0.2)')
    g.addColorStop(0.6, 'rgba(55, 180, 140, 0.35)')
    g.addColorStop(1, 'rgba(120, 230, 195, 0.5)')
    ctx.fillStyle = g
    ctx.fillRect(c * colW, H - barH, colW + 0.6, barH)
  }
  ctx.font = '600 15px IBM Plex Mono, ui-monospace, monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(180, 210, 200, 0.9)'
  ctx.fillText('полоса ~650 Гц · модуляция CW / морзе', W / 2, H / 2 - 14)
  ctx.font = '400 12px IBM Plex Mono, ui-monospace, monospace'
  ctx.fillStyle = 'rgba(140, 160, 175, 0.88)'
  ctx.fillText(
    'расшифровка по слуху или таблице ITU — пароль не подставляется автоматически',
    W / 2,
    H / 2 + 12,
  )
}

export function AudioEvidencePanel({
  audioSpectrogramSeen,
  dispatch,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [spectrumRequested, setSpectrumRequested] = useState(false)
  const labelId = useId()

  const showCanvas = spectrumRequested || audioSpectrogramSeen

  useEffect(() => {
    if (!showCanvas) return
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    c.width = W
    c.height = H
    drawSpectrogramView(ctx)
  }, [showCanvas])

  function runAnalysis() {
    setSpectrumRequested(true)
    dispatch({ type: 'AUDIO_SPECTROGRAM_SEEN' })
  }

  function onDownload() {
    void downloadOriginalAsset(AUDIO_ASSET_PATH, AUDIO_ASSET_FILENAME)
  }

  return (
    <div className="evidence-photo audio-evidence" role="region" aria-labelledby={labelId}>
      <span id={labelId} className="sr-only">
        {AUDIO_ASSET_FILENAME}
      </span>
      <div className="photo-toolbar">
        <button type="button" className="btn ghost" onClick={onDownload}>
          Скачать исходный файл
        </button>
        <button type="button" className="btn primary" onClick={runAnalysis}>
          Снять спектрограмму
        </button>
      </div>
      <p className="muted small audio-evidence-lead">
        На дорожке — сигнал азбукой Морзе (~650 Гц) на фоне тишины. Слушайте ритм точек и тире и пауз
        между буквами.
      </p>
      <audio
        className="audio-evidence-player"
        controls
        src={AUDIO_ASSET_PATH}
        preload="metadata"
      />
      {showCanvas ? (
        <div className="evidence-photo-frame spectrogram-frame">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="evidence-photo-canvas spectrogram-canvas"
            aria-label="Результат спектрального анализа"
          />
        </div>
      ) : null}
    </div>
  )
}
