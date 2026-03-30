import { useCallback, useEffect, useReducer, useRef } from 'react'
import { gameReducer } from './reducer'
import {
  clearGameState,
  loadGameState,
  saveGameState,
} from './persistence'
import type { GameAction, GameState } from './types'
import { INITIAL_STATE } from './types'

function readInitialState(): GameState {
  if (typeof localStorage === 'undefined') return INITIAL_STATE
  return loadGameState() ?? INITIAL_STATE
}

export function usePersistedGame() {
  const skipFirstSave = useRef(true)
  const [state, dispatchBase] = useReducer(gameReducer, undefined, readInitialState)

  useEffect(() => {
    if (skipFirstSave.current) {
      skipFirstSave.current = false
      return
    }
    saveGameState(state)
  }, [state])

  const dispatch = useCallback((action: GameAction) => {
    dispatchBase(action)
  }, [])

  const resetProgress = useCallback(() => {
    clearGameState()
    dispatchBase({ type: 'NEW_GAME' })
  }, [])

  return { state, dispatch, resetProgress }
}
