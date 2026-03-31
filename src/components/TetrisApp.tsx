import { useCallback, useEffect, useRef, useState } from 'react'

const COLS = 10
const ROWS = 20

const SHAPES: number[][][] = [
  [[1, 1, 1, 1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [1, 0, 0],
    [1, 1, 1],
  ],
  [
    [0, 0, 1],
    [1, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
]

function rotate(m: number[][]): number[][] {
  const h = m.length
  const w = m[0].length
  const out: number[][] = []
  for (let x = 0; x < w; x++) {
    out[x] = []
    for (let y = 0; y < h; y++) {
      out[x][h - 1 - y] = m[y][x]
    }
  }
  return out
}

function emptyBoard(): number[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0))
}

type PieceState = {
  shape: number[][]
  x: number
  y: number
  id: number
}

function collides(b: number[][], p: PieceState): boolean {
  for (let py = 0; py < p.shape.length; py++) {
    for (let px = 0; px < p.shape[py].length; px++) {
      if (!p.shape[py][px]) continue
      const gx = p.x + px
      const gy = p.y + py
      if (gx < 0 || gx >= COLS || gy >= ROWS) return true
      if (gy >= 0 && b[gy][gx]) return true
    }
  }
  return false
}

function merge(
  b: number[][],
  p: PieceState,
): { board: number[][]; cleared: number } {
  const next = b.map((row) => [...row])
  for (let py = 0; py < p.shape.length; py++) {
    for (let px = 0; px < p.shape[py].length; px++) {
      if (!p.shape[py][px]) continue
      const gy = p.y + py
      const gx = p.x + px
      if (gy >= 0) next[gy][gx] = p.id
    }
  }
  const kept = next.filter((row) => row.some((c) => c === 0))
  const cleared = ROWS - kept.length
  while (kept.length < ROWS) {
    kept.unshift(Array(COLS).fill(0))
  }
  return { board: kept, cleared }
}

function randomPiece(): PieceState {
  const id = 1 + Math.floor(Math.random() * 7)
  let shape = SHAPES[Math.floor(Math.random() * SHAPES.length)].map((r) => [
    ...r,
  ])
  const r = Math.floor(Math.random() * 4)
  for (let i = 0; i < r; i++) shape = rotate(shape)
  const x = Math.floor((COLS - shape[0].length) / 2)
  return { shape, x, y: 0, id }
}

function spawn(b: number[][]): PieceState | null {
  const p = randomPiece()
  if (collides(b, p)) return null
  return p
}

export function TetrisApp() {
  const [board, setBoard] = useState(() => emptyBoard())
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const pieceRef = useRef<PieceState | null>(null)
  const boardRef = useRef(board)
  const scoreRef = useRef(0)
  const gameOverRef = useRef(false)
  const [, force] = useState(0)

  useEffect(() => {
    boardRef.current = board
  }, [board])

  useEffect(() => {
    gameOverRef.current = gameOver
  }, [gameOver])

  const tick = useCallback(() => {
    if (gameOverRef.current) return
    const b = boardRef.current
    let p = pieceRef.current
    if (!p) {
      const next = spawn(b)
      if (!next) {
        gameOverRef.current = true
        setGameOver(true)
        return
      }
      pieceRef.current = next
      force((n) => n + 1)
      return
    }
    const down = { ...p, y: p.y + 1 }
    if (!collides(b, down)) {
      pieceRef.current = down
      force((n) => n + 1)
      return
    }
    const { board: nb, cleared } = merge(b, p)
    const add = [0, 100, 300, 700, 1500][cleared] ?? 0
    scoreRef.current += add
    setScore(scoreRef.current)
    boardRef.current = nb
    setBoard(nb)
    pieceRef.current = null
    force((n) => n + 1)
  }, [])

  useEffect(() => {
    pieceRef.current = spawn(emptyBoard())
    boardRef.current = emptyBoard()
    force((n) => n + 1)
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => tick(), 650)
    return () => window.clearInterval(id)
  }, [tick])

  const tryMove = (dx: number, dy: number, rot?: boolean) => {
    if (gameOverRef.current) return
    let p = pieceRef.current
    if (!p) return
    if (rot) {
      const ns = rotate(p.shape)
      const trial = { ...p, shape: ns }
      if (!collides(boardRef.current, trial)) pieceRef.current = trial
    } else {
      const trial = { ...p, x: p.x + dx, y: p.y + dy }
      if (!collides(boardRef.current, trial)) pieceRef.current = trial
    }
    force((n) => n + 1)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (gameOverRef.current) return
      if (e.key === 'ArrowLeft') tryMove(-1, 0)
      else if (e.key === 'ArrowRight') tryMove(1, 0)
      else if (e.key === 'ArrowDown') tryMove(0, 1)
      else if (e.key === 'ArrowUp' || e.key === ' ') {
        e.preventDefault()
        tryMove(0, 0, true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const display = board.map((row) => [...row])
  const p = pieceRef.current
  if (p) {
    for (let py = 0; py < p.shape.length; py++) {
      for (let px = 0; px < p.shape[py].length; px++) {
        if (!p.shape[py][px]) continue
        const gy = p.y + py
        const gx = p.x + px
        if (gy >= 0 && gy < ROWS && gx >= 0 && gx < COLS) {
          display[gy][gx] = p.id
        }
      }
    }
  }

  const reset = () => {
    const empty = emptyBoard()
    boardRef.current = empty
    setBoard(empty)
    scoreRef.current = 0
    setScore(0)
    setGameOver(false)
    gameOverRef.current = false
    pieceRef.current = spawn(empty)
    force((n) => n + 1)
  }

  return (
    <div className="tetris-window tetris-window--embedded">
      <div className="tetris-body">
        <div className="tetris-meta">
          <span>Счёт: {score}</span>
          {gameOver && <span className="tetris-over">Игра окончена</span>}
          <button type="button" className="btn ghost" onClick={reset}>
            Заново
          </button>
        </div>
        <div className="tetris-grid" role="grid" aria-label="поле">
          {display.map((row, y) =>
            row.map((c, x) => (
              <div
                key={`${y}-${x}`}
                className={`tetris-cell tetris-c-${c}`}
                role="gridcell"
              />
            )),
          )}
        </div>
        <p className="muted small tetris-hint">
          ← → вниз, ↑ или пробел — поворот.
        </p>
      </div>
    </div>
  )
}
