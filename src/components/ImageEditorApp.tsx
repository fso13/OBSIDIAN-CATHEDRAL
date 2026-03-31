import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'

type Props = {
  mediaFileId?: string | null
}

export function ImageEditorApp({ mediaFileId = null }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [hasImage, setHasImage] = useState(false)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const fid = useId()
  const mediaSrc = useMemo(() => {
    const map: Record<string, string> = {
      'img-wallpaper1': '/Desktop_Mirror/wallpaper1.png',
      'img-screen-old': '/Desktop_Mirror/screen_old.jpg',
      'img-family': '/Desktop_Mirror/family_photo.png',
      'img-freeze': '/Desktop_Mirror/screenshot_freeze.png',
      'img-corrupted': '/Desktop_Mirror/image_corrupted.png',
      'trash-img': '/Desktop_Mirror/image_corrupted.png',
    }
    return mediaFileId ? map[mediaFileId] ?? null : null
  }, [mediaFileId])

  const paint = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img?.complete) return
    const w = img.naturalWidth
    const h = img.naturalHeight
    if (!w || !h) return
    canvas.width = Math.min(w, 720)
    canvas.height = Math.min(h, 520)
    const scale = Math.min(canvas.width / w, canvas.height / h, 1)
    const dw = w * scale
    const dh = h * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`
    ctx.drawImage(img, 0, 0, w, h, 0, 0, dw, dh)
    ctx.filter = 'none'
  }, [brightness, contrast])

  useEffect(() => {
    paint()
  }, [paint])

  useEffect(() => {
    if (!mediaSrc) return
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      setHasImage(true)
      paint()
    }
    img.src = mediaSrc
  }, [mediaSrc, paint])

  const onFile = (file: File | null) => {
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      setHasImage(true)
      paint()
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  return (
    <div className="image-editor-window image-editor-window--embedded">
      <div className="image-editor-body">
        <div className="image-editor-toolbar">
          <label className="btn ghost small-file">
            Открыть файл
            <input
              id={fid}
              type="file"
              accept="image/*"
              className="visually-hidden-input"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        <div className="image-editor-sliders">
          <label>
            Яркость {brightness}%
            <input
              type="range"
              min={40}
              max={180}
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
            />
          </label>
          <label>
            Контраст {contrast}%
            <input
              type="range"
              min={40}
              max={200}
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
            />
          </label>
        </div>
        <div className="image-editor-canvas-wrap">
          {!hasImage && (
            <p className="muted small">Загрузите изображение (JPEG, PNG, WebP…).</p>
          )}
          <canvas ref={canvasRef} className="image-editor-canvas" />
        </div>
      </div>
    </div>
  )
}
