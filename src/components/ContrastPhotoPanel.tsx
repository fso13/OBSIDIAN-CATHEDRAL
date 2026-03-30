import { useCallback, useEffect, useId, useRef } from 'react'
import {
  CONTRAST_ASSET_FILENAME,
  CONTRAST_ASSET_PATH,
} from '../game/content'
import { downloadOriginalAsset } from '../game/download'
import type { GameAction } from '../game/types'

type Props = {
  contrastHintSeen: boolean
  dispatch: (action: GameAction) => void
}

export function ContrastPhotoPanel({
  contrastHintSeen,
  dispatch,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
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
  }, [])

  useEffect(() => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => paintFromBitmap(img)
    img.onerror = () => {}
    img.src = CONTRAST_ASSET_PATH
  }, [paintFromBitmap])

  useEffect(() => {
    if (contrastHintSeen) return
    dispatch({ type: 'CONTRAST_HINT_SEEN' })
  }, [contrastHintSeen, dispatch])

  function onDownload() {
    void downloadOriginalAsset(CONTRAST_ASSET_PATH, CONTRAST_ASSET_FILENAME)
  }

  return (
    <div className="evidence-photo" role="region" aria-labelledby={labelId}>
      <span id={labelId} className="sr-only">
        {CONTRAST_ASSET_FILENAME}
      </span>
      <div className="photo-toolbar">
        <button type="button" className="btn ghost" onClick={onDownload}>
          Скачать исходный файл
        </button>
      </div>
      <div className="evidence-photo-frame">
        <canvas ref={canvasRef} className="evidence-photo-canvas" />
      </div>
    </div>
  )
}
