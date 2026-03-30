import exifr from 'exifr'
import { useEffect, useId, useState } from 'react'
import {
  METADATA_PHOTO_FILENAME,
  METADATA_PHOTO_PATH,
} from '../game/content'
import { downloadOriginalAsset } from '../game/download'
import type { GameAction } from '../game/types'

type Props = {
  metadataExifSeen: boolean
  dispatch: (action: GameAction) => void
}

function formatValue(v: unknown): string {
  if (v == null) return ''
  if (v instanceof Uint8Array) {
    const s = new TextDecoder('utf-8', { fatal: false })
      .decode(v)
      .replace(/\0/g, '')
    return s || `[binary ${v.length} B]`
  }
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>
    if ('numerator' in o && 'denominator' in o) {
      const n = Number(o.numerator)
      const d = Number(o.denominator)
      if (d) return `${n}/${d}`
    }
    try {
      return JSON.stringify(v)
    } catch {
      return String(v)
    }
  }
  return String(v)
}

/** UserComment в EXIF: у exifr по умолчанию отключён; в значении префикс ITU «ASCII» + нули. */
function formatExifPair(key: string, v: unknown): string {
  if (key === 'userComment' && typeof v === 'string') {
    const cleaned = v.replace(/^ASCII(\u0000)+/i, '').trim()
    return cleaned || formatValue(v)
  }
  return formatValue(v)
}

async function readExifLines(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = await res.arrayBuffer()
  const tags = await exifr.parse(buf, {
    mergeOutput: true,
    userComment: true,
    reviveValues: true,
    translateKeys: true,
    translateValues: true,
  })
  if (!tags || typeof tags !== 'object')
    throw new Error('Пустой ответ EXIF')
  const rows: [string, string][] = []
  for (const [k, v] of Object.entries(tags)) {
    if (v === undefined) continue
    const line = formatExifPair(k, v)
    if (line === '') continue
    rows.push([k, line])
  }
  rows.sort((a, b) => a[0].localeCompare(b[0]))
  if (rows.length === 0) throw new Error('В JPEG нет читаемых EXIF')
  return rows.map(([k, v]) => `${k.padEnd(22)}: ${v}`).join('\n')
}

export function ExifPhotoPanel({ metadataExifSeen, dispatch }: Props) {
  const [active, setActive] = useState(metadataExifSeen)
  const [dump, setDump] = useState<string | null>(null)
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const labelId = useId()

  useEffect(() => {
    if (!metadataExifSeen) return
    setActive(true)
    let cancelled = false
    setBusy(true)
    setLoadErr(null)
    readExifLines(METADATA_PHOTO_PATH)
      .then((t) => {
        if (!cancelled) setDump(t)
      })
      .catch((e) => {
        if (!cancelled) {
          setDump(null)
          setLoadErr(
            e instanceof Error ? e.message : 'Не удалось прочитать EXIF.',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setBusy(false)
      })
    return () => {
      cancelled = true
    }
  }, [metadataExifSeen])

  function revealExif() {
    setActive(true)
    setBusy(true)
    setLoadErr(null)
    void readExifLines(METADATA_PHOTO_PATH)
      .then((t) => {
        setDump(t)
        dispatch({ type: 'EXIF_METADATA_SEEN' })
      })
      .catch((e) => {
        setDump(null)
        setLoadErr(
          e instanceof Error ? e.message : 'Не удалось прочитать EXIF.',
        )
      })
      .finally(() => setBusy(false))
  }

  function onDownload() {
    void downloadOriginalAsset(METADATA_PHOTO_PATH, METADATA_PHOTO_FILENAME)
  }

  return (
    <div className="evidence-photo exif-photo" role="region" aria-labelledby={labelId}>
      <span id={labelId} className="sr-only">
        {METADATA_PHOTO_FILENAME}
      </span>
      <div className="photo-toolbar">
        <button type="button" className="btn ghost" onClick={onDownload}>
          Скачать исходный файл
        </button>
        <button
          type="button"
          className="btn primary"
          onClick={revealExif}
          disabled={busy}
        >
          {busy ? 'Чтение EXIF…' : 'Прочитать метаданные (EXIF)'}
        </button>
      </div>
      <p className="muted small exif-photo-lead">
        Метаданные записаны в сам JPEG (<code className="mono">npm run embed:exif</code>
        ). Тот же файл можно открыть в «Свойства» (Windows), инспекторе Preview (⌘I, macOS), в GNOME / KDE
        и через <code className="mono">exiftool</code>. Подсказка <code className="mono">ACCESS=…</code>{' '}
        продублирована: в <strong>User Comment</strong> (редко виден в Preview) и в{' '}
        <strong>Image Description</strong> / «Описание» — на Mac смотрите строку описания (TIFF). Ниже —
        чтение из игры.
      </p>
      <div className="evidence-photo-frame">
        <img
          src={METADATA_PHOTO_PATH}
          alt=""
          className="evidence-photo-img"
        />
      </div>
      {active ? (
        <div className="exif-readout" role="region" aria-label="EXIF из файла">
          {busy && <p className="muted small">Загрузка и разбор…</p>}
          {loadErr && (
            <p className="hint-warn folder-pass-err">{loadErr}</p>
          )}
          {dump && !busy && (
            <pre className="preview-pre exif-dump">{dump}</pre>
          )}
        </div>
      ) : null}
    </div>
  )
}
