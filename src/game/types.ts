export type GamePhase = 'title' | 'workbench' | 'boot' | 'desktop'

export type AppWindowType =
  | 'files'
  | 'mail'
  | 'calendar'
  | 'terminal'
  | 'notepad'
  | 'browser'
  | 'image-editor'
  | 'audio-player'
  | 'video-player'
  | 'solitaire'
  | 'tetris'
  | 'chess'

export interface ShellWindow {
  id: string
  type: AppWindowType
  title: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  minimized: boolean
  filesDirId?: string
  filesSelectedFileId?: string | null
  mailOpenId?: string | null
  /** Содержимое при открытии из файла */
  notepadContent?: string
}

export interface BrowserBookmark {
  id: string
  title: string
  url: string
}

export interface BrowserHistoryItem {
  id: string
  title: string
  url: string
  at: number
}

export interface CalendarEntry {
  id: string
  dateKey: string
  title: string
  body: string
}

export interface GameState {
  version: 5
  phase: GamePhase
  bootFinished: boolean
  windows: ShellWindow[]
  focusedWindowId: string | null
  calendarEntries: CalendarEntry[]
  browserBookmarks: BrowserBookmark[]
  browserHistory: BrowserHistoryItem[]
  readMailIds: string[]
  viewedFileIds: string[]
  terminalAttempts: number
}

export const INITIAL_STATE: GameState = {
  version: 5,
  phase: 'title',
  bootFinished: false,
  windows: [],
  focusedWindowId: null,
  calendarEntries: [],
  browserBookmarks: [
    {
      id: 'bm-obsidian-home',
      title: 'OBSIDIAN CATHEDRAL — домашняя',
      url: 'shell:home',
    },
  ],
  browserHistory: [],
  readMailIds: [],
  viewedFileIds: [],
  terminalAttempts: 0,
}

export type GameAction =
  | { type: 'HYDRATE'; state: GameState }
  | { type: 'NEW_GAME' }
  | { type: 'SET_PHASE'; phase: GamePhase }
  | { type: 'BOOT_DONE' }
  | {
      type: 'OPEN_WINDOW'
      windowType: AppWindowType
      title?: string
      filesDirId?: string
      notepadContent?: string
      notepadLabel?: string
    }
  | { type: 'CLOSE_WINDOW'; id: string }
  | { type: 'FOCUS_WINDOW'; id: string }
  | { type: 'MINIMIZE_WINDOW'; id: string }
  | { type: 'RESTORE_WINDOW'; id: string }
  | { type: 'MOVE_WINDOW'; id: string; x: number; y: number }
  | { type: 'RESIZE_WINDOW'; id: string; width: number; height: number }
  | { type: 'SET_WINDOW_TITLE'; id: string; title: string }
  | { type: 'FILE_WINDOW_SET_DIR'; windowId: string; dirId: string }
  | { type: 'FILE_WINDOW_SELECT_FILE'; windowId: string; fileId: string | null }
  | { type: 'MAIL_WINDOW_SET_OPEN'; windowId: string; mailId: string | null }
  | { type: 'MARK_MAIL_READ'; id: string }
  | { type: 'MARK_FILE_VIEWED'; id: string }
  | { type: 'TERMINAL_FAIL' }
  | { type: 'CALENDAR_ADD_ENTRY'; dateKey: string; title: string; body: string }
  | { type: 'CALENDAR_DELETE_ENTRY'; id: string }
  | { type: 'BROWSER_ADD_BOOKMARK'; title: string; url: string }
  | { type: 'BROWSER_REMOVE_BOOKMARK'; id: string }
  | { type: 'BROWSER_RECORD_VISIT'; title: string; url: string }
