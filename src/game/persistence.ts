import {
  resolveFilesDirId,
  resolveFilesSelectedFileId,
} from './content'
import type { GameState } from './types'
import { INITIAL_STATE } from './types'

const STORAGE_KEY = 'obol-shell-game-save'

function parseSave(raw: string): GameState | null {
  try {
    const data = JSON.parse(raw) as Partial<GameState>
    if (data.version !== 2 || typeof data.phase !== 'string') return null
    return mergeWithDefaults(data as GameState)
  } catch {
    return null
  }
}

function normalizeActiveApp(
  v: GameState['activeApp'] | undefined,
): GameState['activeApp'] {
  return v === 'mail' || v === 'files' || v === 'terminal' ? v : null
}

export function mergeWithDefaults(partial: GameState): GameState {
  return {
    ...INITIAL_STATE,
    ...partial,
    version: 2,
    activeApp: normalizeActiveApp(partial.activeApp),
    readMailIds: Array.isArray(partial.readMailIds) ? partial.readMailIds : [],
    viewedFileIds: Array.isArray(partial.viewedFileIds)
      ? partial.viewedFileIds
      : [],
    filesDirId: resolveFilesDirId(partial.filesDirId),
    filesSelectedFileId: resolveFilesSelectedFileId(
      partial.filesSelectedFileId,
    ),
    secretFolderUnlocked:
      typeof partial.secretFolderUnlocked === 'boolean'
        ? partial.secretFolderUnlocked
        : false,
    fieldChannelUnlocked:
      typeof partial.fieldChannelUnlocked === 'boolean'
        ? partial.fieldChannelUnlocked
        : false,
    stegoExtractSeen:
      typeof partial.stegoExtractSeen === 'boolean'
        ? partial.stegoExtractSeen
        : false,
    contrastHintSeen:
      typeof partial.contrastHintSeen === 'boolean'
        ? partial.contrastHintSeen
        : false,
    audioSpectrogramSeen:
      typeof partial.audioSpectrogramSeen === 'boolean'
        ? partial.audioSpectrogramSeen
        : false,
    terminalAttempts:
      typeof partial.terminalAttempts === 'number' ? partial.terminalAttempts : 0,
  }
}

export function loadGameState(): GameState | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  return parseSave(raw)
}

export function saveGameState(state: GameState): void {
  if (typeof localStorage === 'undefined') return
  const payload: GameState = { ...state, version: 2 }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function clearGameState(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
