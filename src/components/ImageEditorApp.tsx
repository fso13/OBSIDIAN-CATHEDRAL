import { useCallback, useEffect, useId, useRef, useState } from 'react'

export function ImageEditorApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [hasImage, setHasImage] = useState(false)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const fid = useId()

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
