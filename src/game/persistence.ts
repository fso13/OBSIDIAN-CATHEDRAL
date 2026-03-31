import { resolveFilesDirId } from './content'
import type {
  GameState,
  GamePhase,
  ShellWindow,
  CalendarEntry,
  BrowserBookmark,
  BrowserHistoryItem,
} from './types'
import { INITIAL_STATE } from './types'

const STORAGE_KEY = 'obol-shell-game-save'

function isPhase(v: unknown): v is GamePhase {
  return (
    v === 'title' ||
    v === 'workbench' ||
    v === 'boot' ||
    v === 'desktop'
  )
}

function isAppWindowType(v: string): v is GameState['windows'][0]['type'] {
  return (
    v === 'files' ||
    v === 'mail' ||
    v === 'calendar' ||
    v === 'terminal' ||
    v === 'notepad' ||
    v === 'image-editor' ||
    v === 'audio-player' ||
    v === 'video-player' ||
    v === 'solitaire' ||
    v === 'tetris' ||
    v === 'chess' ||
    v === 'browser'
  )
}

function normalizeWindow(raw: unknown): ShellWindow | null {
  if (!raw || typeof raw !== 'object') return null
  const w = raw as Partial<ShellWindow>
  if (typeof w.id !== 'string' || typeof w.type !== 'string') return null
  if (!isAppWindowType(w.type)) return null
  const title = typeof w.title === 'string' ? w.title : 'Окно'
  const x = typeof w.x === 'number' ? w.x : 40
  const y = typeof w.y === 'number' ? w.y : 40
  const width = typeof w.width === 'number' ? Math.max(280, w.width) : 400
  const height = typeof w.height === 'number' ? Math.max(160, w.height) : 320
  const zIndex = typeof w.zIndex === 'number' ? w.zIndex : 10
  const minimized = Boolean(w.minimized)
  const base: ShellWindow = {
    id: w.id,
    type: w.type,
    title,
    x,
    y,
    width,
    height,
    zIndex,
    minimized,
  }
  if (w.type === 'files') {
    base.filesDirId = resolveFilesDirId(w.filesDirId)
    base.filesSelectedFileId =
      typeof w.filesSelectedFileId === 'string' ||
      w.filesSelectedFileId === null
        ? w.filesSelectedFileId
        : null
  }
  if (w.type === 'mail') {
    base.mailOpenId =
      typeof w.mailOpenId === 'string' || w.mailOpenId === null
        ? w.mailOpenId
        : null
  }
  if (w.type === 'notepad' && typeof w.notepadContent === 'string') {
    base.notepadContent = w.notepadContent
  }
  return base
}

function normalizeBookmark(raw: unknown): BrowserBookmark | null {
  if (!raw || typeof raw !== 'object') return null
  const b = raw as Partial<BrowserBookmark>
  if (
    typeof b.id !== 'string' ||
    typeof b.title !== 'string' ||
    typeof b.url !== 'string'
  )
    return null
  return { id: b.id, title: b.title, url: b.url }
}

function normalizeHistoryItem(raw: unknown): BrowserHistoryItem | null {
  if (!raw || typeof raw !== 'object') return null
  const h = raw as Partial<BrowserHistoryItem>
  if (
    typeof h.id !== 'string' ||
    typeof h.title !== 'string' ||
    typeof h.url !== 'string'
  )
    return null
  return {
    id: h.id,
    title: h.title,
    url: h.url,
    at: typeof h.at === 'number' ? h.at : Date.now(),
  }
}

function normalizeCalendarEntry(raw: unknown): CalendarEntry | null {
  if (!raw || typeof raw !== 'object') return null
  const e = raw as Partial<CalendarEntry>
  if (
    typeof e.id !== 'string' ||
    typeof e.dateKey !== 'string' ||
    typeof e.title !== 'string'
  )
    return null
  return {
    id: e.id,
    dateKey: e.dateKey,
    title: e.title,
    body: typeof e.body === 'string' ? e.body : '',
  }
}

export function mergeWithDefaults(partial: Partial<GameState>): GameState {
  const winRaw = partial.windows
  let windows: ShellWindow[] = []
  if (Array.isArray(winRaw)) {
    windows = winRaw
      .map(normalizeWindow)
      .filter((w): w is ShellWindow => w !== null)
  }

  const calRaw = partial.calendarEntries
  let calendarEntries: CalendarEntry[] = []
  if (Array.isArray(calRaw)) {
    calendarEntries = calRaw
      .map(normalizeCalendarEntry)
      .filter((e): e is CalendarEntry => e !== null)
  }

  const focusedWindowId =
    typeof partial.focusedWindowId === 'string' ||
    partial.focusedWindowId === null
      ? partial.focusedWindowId
      : null

  const base: GameState = {
    ...INITIAL_STATE,
    version: 5,
    phase: isPhase(partial.phase) ? partial.phase : INITIAL_STATE.phase,
    bootFinished:
      typeof partial.bootFinished === 'boolean'
        ? partial.bootFinished
        : INITIAL_STATE.bootFinished,
    windows,
    focusedWindowId:
      focusedWindowId && windows.some((w) => w.id === focusedWindowId)
        ? focusedWindowId
        : windows.length
          ? windows[windows.length - 1]!.id
          : null,
    calendarEntries,
    readMailIds: Array.isArray(partial.readMailIds) ? partial.readMailIds : [],
    viewedFileIds: Array.isArray(partial.viewedFileIds)
      ? partial.viewedFileIds
      : [],
    terminalAttempts:
      typeof partial.terminalAttempts === 'number'
        ? partial.terminalAttempts
        : 0,
    browserBookmarks: Array.isArray(partial.browserBookmarks)
      ? partial.browserBookmarks
          .map(normalizeBookmark)
          .filter((b): b is BrowserBookmark => b !== null)
      : INITIAL_STATE.browserBookmarks,
    browserHistory: Array.isArray(partial.browserHistory)
      ? partial.browserHistory
          .map(normalizeHistoryItem)
          .filter((h): h is BrowserHistoryItem => h !== null)
          .slice(0, 120)
      : INITIAL_STATE.browserHistory,
  }
  return base
}

function parseSave(raw: string): GameState | null {
  try {
    const data = JSON.parse(raw) as Partial<GameState> & { version?: number }
    if (typeof data.phase !== 'string') return null
    return mergeWithDefaults(data)
  } catch {
    return null
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
  const payload: GameState = { ...state, version: 5 }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function clearGameState(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
