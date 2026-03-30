/** Сборка байта из битового потока (порядок бит внутри байта). */
function streamToUtf8(bits: number[], bitOrder: 'le' | 'be', maxBytes: number): string {
  const bytes: number[] = []
  for (let i = 0; i + 8 <= bits.length && bytes.length < maxBytes; i += 8) {
    let b = 0
    for (let j = 0; j < 8; j++) {
      b |= bits[i + j] << (bitOrder === 'le' ? j : 7 - j)
    }
    if (b === 0) break
    bytes.push(b)
  }
  return new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(bytes))
}

function rgbBits(
  data: Uint8ClampedArray,
  channelOrder: 'rgb' | 'bgr',
  useAlpha: boolean,
): number[] {
  const bits: number[] = []
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    if (channelOrder === 'rgb') {
      bits.push(r & 1, g & 1, b & 1)
    } else {
      bits.push(b & 1, g & 1, r & 1)
    }
    if (useAlpha) bits.push(a & 1)
  }
  return bits
}

function printableRatio(s: string, sample = 400): number {
  const slice = s.slice(0, sample)
  if (slice.length < 4) return 0
  let ok = 0
  for (let i = 0; i < slice.length; i++) {
    const c = slice.charCodeAt(i)
    if ((c >= 32 && c <= 126) || c === 9 || c === 10 || c === 13 || c >= 0x410) ok++
  }
  return ok / slice.length
}

function trimAtNoise(s: string): string {
  const i = s.search(/\0/)
  const base = i >= 0 ? s.slice(0, i) : s
  return base.replace(/[\uFFFD\u0000-\u0008]/g, '').trim()
}

function bitsToBytesAll(bits: number[], bitOrder: 'le' | 'be', maxBytes: number): Uint8Array {
  const bytes: number[] = []
  for (let i = 0; i + 8 <= bits.length && bytes.length < maxBytes; i += 8) {
    let b = 0
    for (let j = 0; j < 8; j++) {
      b |= bits[i + j] << (bitOrder === 'le' ? j : 7 - j)
    }
    bytes.push(b)
  }
  return new Uint8Array(bytes)
}

/** 4 байта LE = длина UTF-8, далее полезная нагрузка. */
function utf8AfterLengthPrefix(bytes: Uint8Array): string {
  if (bytes.length < 8) return ''
  const len =
    (bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24)) >>> 0
  if (len < 4 || len > bytes.length - 4 || len > 65536) return ''
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes.slice(4, 4 + len))
}

/** Несколько типичных раскладок LSB (в т.ч. как у простых веб-инструментов). */
export function extractLsbBest(data: Uint8ClampedArray): string {
  const configs: {
    order: 'rgb' | 'bgr'
    useAlpha: boolean
    bitOrder: 'le' | 'be'
  }[] = [
    { order: 'rgb', useAlpha: false, bitOrder: 'le' },
    { order: 'rgb', useAlpha: false, bitOrder: 'be' },
    { order: 'bgr', useAlpha: false, bitOrder: 'le' },
    { order: 'bgr', useAlpha: false, bitOrder: 'be' },
    { order: 'rgb', useAlpha: true, bitOrder: 'le' },
    { order: 'rgb', useAlpha: true, bitOrder: 'be' },
  ]

  let best = ''
  let bestScore = 0

  const consider = (s: string) => {
    const t = trimAtNoise(s)
    if (t.length < 2) return
    const sc = printableRatio(t) * Math.log10(t.length + 10)
    if (sc > bestScore) {
      bestScore = sc
      best = t
    }
  }

  for (const cfg of configs) {
    const bits = rgbBits(data, cfg.order, cfg.useAlpha)
    consider(streamToUtf8(bits, cfg.bitOrder, 8192))
    const bytes = bitsToBytesAll(bits, cfg.bitOrder, 65536)
    consider(utf8AfterLengthPrefix(bytes))
  }

  return best
}
