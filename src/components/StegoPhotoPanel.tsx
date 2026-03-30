import { useCallback, useEffect, useId, useRef, useState } from 'react'
import {
  STEGO_ASSET_FILENAME,
  STEGO_ASSET_PATH,
} from '../game/content'
import { downloadOriginalAsset } from '../game/download'
import { extractLsbBest } from '../game/lsbExtract'
import type { GameAction } from '../game/types'

type Props = {
  stegoExtractSeen: boolean
  dispatch: (action: GameAction) => void
}

function decodeCanvas(canvas: HTMLCanvasElement | null): string {
  if (!canvas || canvas.width < 2 || canvas.height < 2) return ''
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  return extractLsbBest(data)
}

export function StegoPhotoPanel({ stegoExtractSeen, dispatch }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mode, setMode] = useState<'view' | 'stego'>('view')
  const [loaded, setLoaded] = useState(false)
  const [decoded, setDecoded] = useState('')
  const labelId = useId()

  const paintFromBitmap = useCallback((img: HTMLImageElement) => {
    const c = canvasRef.current
    if (!c) return
    const w = img.naturalWidth
    const h = img.naturalHeight
    if (!w || !h) return
    c.width = w
    c.height = h
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.drawImage(img, 0, 0)
    setLoaded(true)
  }, [])

  useEffect(() => {
    setLoaded(false)
    setDecoded('')
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => paintFromBitmap(img)
    img.onerror = () => setLoaded(false)
    img.src = STEGO_ASSET_PATH
  }, [paintFromBitmap])

  useEffect(() => {
    if (!loaded || !stegoExtractSeen) return
    const t = decodeCanvas(canvasRef.current)
    if (t) setDecoded(t)
  }, [loaded, stegoExtractSeen])

  function runExtract() {
    setMode('stego')
    const t = decodeCanvas(canvasRef.current)
    setDecoded(t)
    dispatch({ type: 'STEGO_EXTRACT_SEEN' })
  }

  function onDownload() {
    void downloadOriginalAsset(STEGO_ASSET_PATH, STEGO_ASSET_FILENAME)
  }

  const showResult = mode === 'stego' || stegoExtractSeen
  const displayText =
    decoded ||
    (showResult
      ? 'Не удалось прочитать LSB в интерфейсе — откройте этот PNG на https://stego.app/'
      : '')

  return (
    <div className="evidence-photo" role="region" aria-labelledby={labelId}>
      <span id={labelId} className="sr-only">
        {STEGO_ASSET_FILENAME}
      </span>
      <div className="photo-toolbar">
        <button type="button" className="btn ghost" onClick={onDownload}>
          Скачать исходный файл
        </button>
      </div>
      <div className="evidence-photo-frame">
        <canvas ref={canvasRef} className="evidence-photo-canvas" />
      </div>
      <div className="stego-actions">
        <button type="button" className="btn ghost" onClick={runExtract}>
          Извлечь LSB
        </button>
      </div>
      {showResult && (
        <div className="stego-result" role="status">
          <pre className="stego-result-pre">{displayText}</pre>
        </div>
      )}
    </div>
  )
}
