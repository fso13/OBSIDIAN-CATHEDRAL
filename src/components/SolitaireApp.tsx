import { useCallback, useState } from 'react'

type Suit = '♠' | '♥' | '♦' | '♣'

type Card = {
  suit: Suit
  r: number
  faceUp: boolean
}

const SUITS: Suit[] = ['♠', '♥', '♦', '♣']
const RED = new Set<Suit>(['♥', '♦'])

function color(c: Card): 'R' | 'B' {
  return RED.has(c.suit) ? 'R' : 'B'
}

function shuffle<T>(a: T[]): T[] {
  const x = [...a]
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[x[i], x[j]] = [x[j], x[i]]
  }
  return x
}

function buildDeck(): Card[] {
  const d: Card[] = []
  for (const s of SUITS) {
    for (let r = 1; r <= 13; r++) {
      d.push({ suit: s, r, faceUp: false })
    }
  }
  return shuffle(d)
}

function rankLabel(r: number): string {
  const m: Record<number, string> = {
    1: 'A',
    11: 'J',
    12: 'Q',
    13: 'K',
  }
  return m[r] ?? String(r)
}

function canTableau(bottom: Card | null, top: Card): boolean {
  if (!bottom) return top.r === 13
  if (!bottom.faceUp) return false
  return color(bottom) !== color(top) && bottom.r === top.r + 1
}

function canFoundation(top: Card | null, c: Card): boolean {
  if (!top) return c.r === 1
  return top.suit === c.suit && c.r === top.r + 1
}

type Sel =
  | { kind: 'waste' }
  | { kind: 'tab'; col: number; start: number }

function deal(): {
  tab: Card[][]
  stock: Card[]
  waste: Card[]
  foundations: Card[][]
} {
  const deck = buildDeck()
  const tab: Card[][] = [[], [], [], [], [], [], []]
  let di = 0
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j <= i; j++) {
      const c = deck[di++]!
      c.faceUp = j === i
      tab[i].push(c)
    }
  }
  const stock = deck.slice(di).map((c) => {
    c.faceUp = false
    return c
  })
  return { tab, stock, waste: [], foundations: [[], [], [], []] }
}

export function SolitaireApp() {
  const [game, setGame] = useState(deal)
  const [sel, setSel] = useState<Sel | null>(null)

  const drawStock = useCallback(() => {
    setGame((g) => {
      const stock = [...g.stock]
      const waste = [...g.waste]
      if (stock.length > 0) {
        const c = stock.pop()!
        c.faceUp = true
        waste.push(c)
        return { ...g, stock, waste }
      }
      while (waste.length) {
        const c = waste.pop()!
        c.faceUp = false
        stock.push(c)
      }
      return { ...g, stock, waste: [] }
    })
    setSel(null)
  }, [])

  const clickWaste = () => {
    if (game.waste.length === 0) return
    setSel({ kind: 'waste' })
  }

  const tryFoundation = (fi: number) => {
    if (!sel) return
    setGame((g) => {
      const foundations = g.foundations.map((f) => [...f])
      const top = foundations[fi].length
        ? foundations[fi][foundations[fi].length - 1]!
        : null

      const takeFromWaste = () => {
        if (sel!.kind !== 'waste' || g.waste.length === 0) return null
        const w = [...g.waste]
        const c = w[w.length - 1]!
        if (!canFoundation(top, c)) return null
        w.pop()
        foundations[fi].push({ ...c, faceUp: true })
        return { ...g, waste: w, foundations }
      }

      const takeFromTab = () => {
        if (sel!.kind !== 'tab') return null
        const { col, start } = sel
        const tab = g.tab.map((t) => [...t])
        const pile = tab[col]
        if (!pile.length || start >= pile.length) return null
        const moving = pile.slice(start)
        if (!moving[0]?.faceUp) return null
        const c = moving[0]!
        if (moving.length > 1) return null
        if (!canFoundation(top, c)) return null
        pile.splice(start, 1)
        if (pile.length) {
          const last = pile[pile.length - 1]!
          if (!last.faceUp) last.faceUp = true
        }
        foundations[fi].push({ ...c, faceUp: true })
        return { ...g, tab, foundations }
      }

      return takeFromWaste() ?? takeFromTab() ?? g
    })
    setSel(null)
  }

  const clickTab = (col: number) => {
    const pile = game.tab[col]
    if (!sel) {
      if (pile.length === 0) return
      let start = pile.length - 1
      while (start > 0 && pile[start - 1]!.faceUp) {
        if (!canTableau(pile[start - 1]!, pile[start]!)) break
        start--
      }
      if (!pile[start]!.faceUp) return
      setSel({ kind: 'tab', col, start })
      return
    }

    if (sel.kind === 'waste') {
      const c = game.waste[game.waste.length - 1]
      if (!c) return
      setGame((g) => {
        const tab = g.tab.map((t) => [...t])
        const target = tab[col]
        const bottom =
          target.length > 0 ? target[target.length - 1]! : null
        if (!canTableau(bottom, c)) return g
        const w = [...g.waste]
        w.pop()
        target.push({ ...c, faceUp: true })
        return { ...g, waste: w, tab }
      })
      setSel(null)
      return
    }

    if (sel.kind === 'tab') {
      if (sel.col === col) {
        setSel(null)
        return
      }
      setGame((g) => {
        const tab = g.tab.map((t) => [...t])
        const fromP = tab[sel.col]
        const toP = tab[col]
        const chunk = fromP.slice(sel.start)
        if (!chunk.length || !chunk[0]!.faceUp) return g
        const bottom =
          toP.length > 0 ? toP[toP.length - 1]! : null
        if (!canTableau(bottom, chunk[0]!)) return g
        for (let i = 0; i < chunk.length - 1; i++) {
          if (!canTableau(chunk[i]!, chunk[i + 1]!)) return g
        }
        fromP.splice(sel.start, chunk.length)
        toP.push(...chunk.map((c) => ({ ...c, faceUp: true })))
        if (fromP.length) {
          const last = fromP[fromP.length - 1]!
          if (!last.faceUp) last.faceUp = true
        }
        return { ...g, tab }
      })
      setSel(null)
    }
  }

  const newGame = () => {
    setGame(deal())
    setSel(null)
  }

  const wasteTop = game.waste[game.waste.length - 1]

  return (
    <div className="solitaire-window solitaire-window--embedded">
      <div className="sol-body">
        <div className="sol-toolbar">
          <button type="button" className="btn ghost" onClick={newGame}>
            Новая игра
          </button>
        </div>
        <div className="sol-row sol-row--top">
          <button type="button" className="sol-pile" onClick={drawStock}>
            <span className="sol-pile-inner">
              {game.stock.length ? '🂠' : '↻'}
            </span>
          </button>
          <button
            type="button"
            className={`sol-card sol-waste ${sel?.kind === 'waste' ? 'sol-sel' : ''}`}
            onClick={clickWaste}
          >
            {wasteTop ? (
              <span>
                {rankLabel(wasteTop.r)}
                <span className={RED.has(wasteTop.suit) ? 'red' : ''}>
                  {wasteTop.suit}
                </span>
              </span>
            ) : (
              '·'
            )}
          </button>
          <div className="sol-foundations">
            {game.foundations.map((f, fi) => {
              const t = f[f.length - 1]
              return (
                <button
                  key={fi}
                  type="button"
                  className="sol-card sol-foundation"
                  onClick={() => tryFoundation(fi)}
                >
                  {t ? (
                    <span>
                      {rankLabel(t.r)}
                      <span className={RED.has(t.suit) ? 'red' : ''}>
                        {t.suit}
                      </span>
                    </span>
                  ) : (
                    '◇'
                  )}
                </button>
              )
            })}
          </div>
        </div>
        <div className="sol-tableau">
          {game.tab.map((pile, col) => (
            <div
              key={col}
              role="button"
              tabIndex={0}
              className="sol-column"
              onClick={() => clickTab(col)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  clickTab(col)
                }
              }}
            >
              {pile.map((c, i) => (
                <div
                  key={`${col}-${i}-${c.suit}-${c.r}`}
                  className={`sol-card sol-stack ${!c.faceUp ? 'sol-back' : ''} ${
                    sel?.kind === 'tab' && sel.col === col && sel.start === i
                      ? 'sol-sel'
                      : ''
                  }`}
                >
                  {c.faceUp ? (
                    <span>
                      {rankLabel(c.r)}
                      <span className={RED.has(c.suit) ? 'red' : ''}>
                        {c.suit}
                      </span>
                    </span>
                  ) : (
                    '🂠'
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        <p className="muted small">
          Колода — сдача. Снимок с отбоя — выбор. Клик по столбцу — ход. Клик по
          основанию (◇) — собрать туз и стопку по масти.
        </p>
      </div>
    </div>
  )
}
