import { useCallback } from 'react'
import { BootSequence } from './components/BootSequence'
import { Desktop } from './components/Desktop'
import { TitleScreen } from './components/TitleScreen'
import { WorkbenchScreen } from './components/WorkbenchScreen'
import { usePersistedGame } from './game/usePersistedGame'
import './App.css'

export default function App() {
  const { state, dispatch, resetProgress } = usePersistedGame()

  const bootDone = useCallback(() => {
    dispatch({ type: 'BOOT_DONE' })
  }, [dispatch])

  if (state.phase === 'title') {
    return (
      <TitleScreen
        onBegin={() => dispatch({ type: 'SET_PHASE', phase: 'workbench' })}
      />
    )
  }

  if (state.phase === 'workbench') {
    return (
      <WorkbenchScreen
        onPowerOn={() => dispatch({ type: 'SET_PHASE', phase: 'boot' })}
      />
    )
  }

  if (state.phase === 'boot') {
    return <BootSequence onComplete={bootDone} />
  }

  return (
    <Desktop
      state={state}
      dispatch={dispatch}
      onNewGame={resetProgress}
    />
  )
}
