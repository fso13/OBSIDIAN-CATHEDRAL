/**
 * Генерирует public/zapis_diktofon_minus13.wav: тишина + азбука Морзе (WINTER).
 * Запуск: node scripts/gen-zapis-wav.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'public', 'zapis_diktofon_minus13.wav')

const MORSE = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
  '0': '-----',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',
}

const MESSAGE = 'WINTER'
const sampleRate = 44100
const freq = 650
const dit = 0.072

function pushSilence(frames, sec) {
  const n = Math.floor(sec * sampleRate)
  for (let i = 0; i < n; i++) frames.push(0)
}

function pushTone(frames, sec) {
  const n = Math.floor(sec * sampleRate)
  const start = frames.length
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate
    const env = Math.min(1, i / 120, (n - i) / 200)
    frames.push(Math.sin(2 * Math.PI * freq * t) * 0.42 * env)
  }
}

function synthMorse() {
  const frames = []
  pushSilence(frames, 0.45)
  for (let c = 0; c < MESSAGE.length; c++) {
    const ch = MESSAGE[c]
    const pat = MORSE[ch]
    if (!pat) continue
    for (let j = 0; j < pat.length; j++) {
      const sym = pat[j]
      if (sym === '.') pushTone(frames, dit)
      else if (sym === '-') pushTone(frames, dit * 3)
      if (j < pat.length - 1) pushSilence(frames, dit)
    }
    pushSilence(frames, dit * 3)
  }
  pushSilence(frames, 0.6)
  return frames
}

function floatToWav(samples) {
  const numChannels = 1
  const bitsPerSample = 16
  const blockAlign = (numChannels * bitsPerSample) / 8
  const byteRate = sampleRate * blockAlign
  const dataSize = samples.length * blockAlign
  const buf = Buffer.alloc(44 + dataSize)
  buf.write('RIFF', 0)
  buf.writeUInt32LE(36 + dataSize, 4)
  buf.write('WAVE', 8)
  buf.write('fmt ', 12)
  buf.writeUInt32LE(16, 16)
  buf.writeUInt16LE(1, 20)
  buf.writeUInt16LE(numChannels, 22)
  buf.writeUInt32LE(sampleRate, 24)
  buf.writeUInt32LE(byteRate, 28)
  buf.writeUInt16LE(blockAlign, 32)
  buf.writeUInt16LE(bitsPerSample, 34)
  buf.write('data', 36)
  buf.writeUInt32LE(dataSize, 40)
  let off = 44
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    buf.writeInt16LE(Math.round(s * 32767), off)
    off += 2
  }
  return buf
}

const morse = synthMorse()
const samples = new Float32Array(morse)
fs.writeFileSync(OUT, floatToWav(samples))
console.log('written', OUT, samples.length, 'samples')
