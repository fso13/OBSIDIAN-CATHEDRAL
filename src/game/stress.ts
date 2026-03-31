import type { GameState } from './types'

/** Лёгкая «усталость» интерфейса от промахов в терминале. */
export function stressTier(state: GameState): 0 | 1 | 2 | 3 {
  const t = state.terminalAttempts
  if (t >= 12) return 3
  if (t >= 6) return 2
  if (t >= 2) return 1
  return 0
}
