import { useCallback, useMemo, useState } from 'react'
import type { GameAction, GameState } from '../game/types'

type Cell = { w: boolean; t: string } | null

const ROWS = 8
const COLS = 8

function startBoard(): Cell[][] {
  const ranks = [
    'rnbqkbnr',
    'pppppppp',
    '        ',
    '        ',
    '        ',
    '        ',
    'PPPPPPPP',
    'RNBQKBNR',
  ]
  return ranks.map((row) =>
    row.split('').map((ch) => {
      if (ch === ' ') return null
      const w = ch === ch.toUpperCase()
      return { w, t: ch.toLowerCase() }
    }),
  )
}

const DISP: Record<string, string> = {
  k: '♚',
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟',
}

function inb(r: number, c: number): boolean {
  return r >= 0 && r < ROWS && c >= 0 && c < COLS
}

function line(
  br: Cell[][],
  fr: number,
  fc: number,
  dr: number,
  dc: number,
  w: boolean,
): [number, number][] {
  const out: [number, number][] = []
  let r = fr + dr
  let c = fc + dc
  while (inb(r, c)) {
    const t = br[r][c]
    if (!t) {
      out.push([r, c])
    } else {
      if (t.w !== w) out.push([r, c])
      break
    }
    r += dr
    c += dc
  }
  return out
}

function movesFor(
  board: Cell[][],
  r: number,
  c: number,
): [number, number][] {
  const cell = board[r][c]
  if (!cell) return []
  const { w, t } = cell
  const out: [number, number][] = []
  const add = (tr: number, tc: number) => {
    if (!inb(tr, tc)) return
    const dst = board[tr][tc]
    if (!dst || dst.w !== w) out.push([tr, tc])
  }

  if (t === 'p') {
    const dir = w ? -1 : 1
    const start = w ? 6 : 1
    if (inb(r + dir, c) && !board[r + dir][c]) {
      out.push([r + dir, c])
      if (
        r === start &&
        inb(r + 2 * dir, c) &&
        !board[r + 2 * dir][c]
      ) {
        out.push([r + 2 * dir, c])
      }
    }
    for (const dc of [-1, 1]) {
      const tr = r + dir
      const tc = c + dc
      if (inb(tr, tc)) {
        const dst = board[tr][tc]
        if (dst && dst.w !== w) out.push([tr, tc])
      }
    }
    return out
  }

  if (t === 'n') {
    for (const [dr, dc] of [
      [2, 1],
      [2, -1],
      [-2, 1],
      [-2, -1],
      [1, 2],
      [1, -2],
      [-1, 2],
      [-1, -2],
    ]) {
      add(r + dr, c + dc)
    }
    return out
  }

  if (t === 'b' || t === 'q') {
    for (const [dr, dc] of [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]) {
      out.push(...line(board, r, c, dr, dc, w))
    }
  }
  if (t === 'r' || t === 'q') {
    for (const [dr, dc] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      out.push(...line(board, r, c, dr, dc, w))
    }
  }
  if (t === 'k') {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue
        add(r + dr, c + dc)
      }
    }
  }
  return out
}

type Props = {
  state: GameState
  dispatch: (action: GameAction) => void
}

function mateInOneBoard(): Cell[][] {
  const b = Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null))
  // Position from provided screenshot.
  b[0][1] = { w: false, t: 'b' } // b8
  b[0][2] = { w: false, t: 'n' } // c8
  b[0][3] = { w: false, t: 'r' } // d8
  b[0][4] = { w: true, t: 'r' } // e8
  b[0][7] = { w: false, t: 'n' } // h8

  b[1][2] = { w: true, t: 'r' } // c7
  b[1][3] = { w: true, t: 'b' } // d7
  b[1][4] = { w: false, t: 'q' } // e7
  b[1][5] = { w: true, t: 'n' } // f7
  b[1][7] = { w: true, t: 'b' } // h7

  b[2][1] = { w: true, t: 'p' } // b6
  b[2][5] = { w: true, t: 'p' } // f6
  b[2][6] = { w: false, t: 'q' } // g6
  b[2][7] = { w: false, t: 'p' } // h6

  b[3][0] = { w: true, t: 'q' } // a5

  b[4][0] = { w: true, t: 'n' } // a4
  b[4][4] = { w: false, t: 'k' } // e4

  b[5][7] = { w: true, t: 'r' } // h3

  b[6][1] = { w: true, t: 'q' } // b2
  b[6][7] = { w: true, t: 'k' } // h2

  b[7][1] = { w: false, t: 'r' } // b1
  b[7][2] = { w: true, t: 'n' } // c1
  b[7][3] = { w: false, t: 'n' } // d1
  b[7][5] = { w: true, t: 'r' } // f1
  b[7][7] = { w: true, t: 'n' } // h1
  return b
}

export function ChessApp({ state, dispatch }: Props) {
  const puzzleMode = !state.chessPuzzleSolved
  const [board, setBoard] = useState(() =>
    puzzleMode ? mateInOneBoard() : startBoard(),
  )
  const [turn, setTurn] = useState(true)
  const [sel, setSel] = useState<[number, number] | null>(null)
  const [hint, setHint] = useState<string | null>(null)

  const target = useMemo(
    () => ({ from: [3, 0] as [number, number], to: [0, 0] as [number, number] }), // Qa5-a8#
    [],
  )

  const whiteToMove = turn

  const onCell = useCallback(
    (r: number, c: number) => {
      const cell = board[r][c]
      if (sel) {
        const [sr, sc] = sel
        const opts = movesFor(board, sr, sc)
        const hit = opts.some(([tr, tc]) => tr === r && tc === c)
        if (hit) {
          if (puzzleMode) {
            const rightMove =
              sr === target.from[0] &&
              sc === target.from[1] &&
              r === target.to[0] &&
              c === target.to[1]
            if (!rightMove) {
              setHint('Не сходится. Мат должен быть в один ход.')
              setSel(null)
              return
            }
          }
          setBoard((b) => {
            const nb = b.map((row) => [...row])
            nb[r][c] = nb[sr][sc]
            nb[sr][sc] = null
            if (nb[r][c]?.t === 'p' && (r === 0 || r === 7)) {
              nb[r][c] = { ...nb[r][c]!, t: 'q' }
            }
            return nb
          })
          if (puzzleMode) {
            dispatch({ type: 'CHESS_PUZZLE_SOLVED' })
            setHint('Мат. Письмо с кодом уже в почте.')
            setBoard(startBoard())
            setTurn(true)
            setSel(null)
            return
          }
          setTurn((t) => !t)
          setSel(null)
          setHint(null)
          return
        }
        if (cell && cell.w === whiteToMove) {
          setSel([r, c])
          return
        }
        setSel(null)
        return
      }
      if (cell && cell.w === whiteToMove) {
        setSel([r, c])
      }
    },
    [board, dispatch, puzzleMode, sel, target.from, target.to, whiteToMove],
  )

  const reset = () => {
    setBoard(puzzleMode ? mateInOneBoard() : startBoard())
    setTurn(true)
    setSel(null)
    setHint(null)
  }

  const legal = sel ? movesFor(board, sel[0], sel[1]) : []

  return (
    <div className="chess-window chess-window--embedded">
      <div className="chess-body">
        <div className="chess-bar">
          <span>
            {puzzleMode
              ? 'Задача: белые ставят мат в 1 ход'
              : whiteToMove
                ? 'Ход белых'
                : 'Ход чёрных'}
          </span>
          <button type="button" className="btn ghost" onClick={reset}>
            Сброс
          </button>
        </div>
        <div className="chess-board" role="grid" aria-label="доска">
          {board.map((row, r) =>
            row.map((cell, c) => {
              const dark = (r + c) % 2 === 1
              const isSel = sel?.[0] === r && sel?.[1] === c
              const isMove = legal.some(([tr, tc]) => tr === r && tc === c)
              let sym = ''
              if (cell) {
                const base = DISP[cell.t] ?? '?'
                sym = cell.w ? base : base
              }
              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  className={`chess-cell ${dark ? 'chess-dark' : 'chess-light'} ${isSel ? 'chess-sel' : ''} ${isMove ? 'chess-move' : ''} ${cell?.w ? 'chess-w' : 'chess-b'}`}
                  onClick={() => onCell(r, c)}
                  aria-label={`клетка ${r} ${c}`}
                >
                  {sym}
                </button>
              )
            }),
          )}
        </div>
        <p className="muted small">
          {hint ??
            'Упрощённые правила: без рокировки, взятия на проходе и шахов. Пешка на краю превращается в ферзя.'}
        </p>
      </div>
    </div>
  )
}
