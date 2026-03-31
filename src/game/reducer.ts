import {
  FILE_TREE,
  QUEST_LOCKS,
  QUEST_STAGE_BY_DIR,
  WINDOW_DEFAULTS,
  findNodeById,
} from './content'
import { mergeWithDefaults } from './persistence'
import type { GameAction, GameState, ShellWindow } from './types'
import { INITIAL_STATE } from './types'

function bumpZ(state: GameState, id: string): ShellWindow[] {
  const top = Math.max(10, ...state.windows.map((w) => w.zIndex)) + 1
  return state.windows.map((w) =>
    w.id === id ? { ...w, zIndex: top } : w,
  )
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'HYDRATE':
      return mergeWithDefaults(action.state)
    case 'NEW_GAME':
      return { ...INITIAL_STATE, phase: 'workbench' }
    case 'SET_PHASE':
      return { ...state, phase: action.phase }
    case 'BOOT_DONE':
      return {
        ...state,
        bootFinished: true,
        phase: 'desktop',
        windows: [],
        focusedWindowId: null,
      }
    case 'OPEN_WINDOW': {
      const def = WINDOW_DEFAULTS[action.windowType]
      const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `w-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      const n = state.windows.length
      const base: ShellWindow = {
        id,
        type: action.windowType,
        title: action.title ?? def.title,
        x: 40 + (n % 8) * 24,
        y: 28 + (n % 8) * 24,
        width: def.width,
        height: def.height,
        zIndex: Math.max(10, ...state.windows.map((w) => w.zIndex)) + 1,
        minimized: false,
      }
      if (action.windowType === 'files') {
        base.filesDirId = action.filesDirId ?? 'root'
        base.filesSelectedFileId = null
        const node = findNodeById(FILE_TREE, base.filesDirId)
        base.title = node
          ? `Проводник — ${node.name}`
          : def.title
      }
      if (action.windowType === 'mail') {
        base.mailOpenId = null
      }
      if (action.windowType === 'notepad') {
        if (action.notepadContent !== undefined) {
          base.notepadContent = action.notepadContent
        }
        if (action.title) {
          base.title = action.title
        } else if (action.notepadLabel) {
          base.title = `Блокнот — ${action.notepadLabel}`
        }
      }
      if (
        (action.windowType === 'image-editor' || action.windowType === 'audio-player') &&
        typeof action.mediaFileId === 'string'
      ) {
        base.mediaFileId = action.mediaFileId
      }
      return {
        ...state,
        windows: [...state.windows, base],
        focusedWindowId: id,
      }
    }
    case 'CLOSE_WINDOW':
      return {
        ...state,
        windows: state.windows.filter((w) => w.id !== action.id),
        focusedWindowId:
          state.focusedWindowId === action.id
            ? state.windows.filter((w) => w.id !== action.id).at(-1)?.id ?? null
            : state.focusedWindowId,
      }
    case 'FOCUS_WINDOW': {
      if (!state.windows.some((w) => w.id === action.id)) return state
      return {
        ...state,
        focusedWindowId: action.id,
        windows: bumpZ(state, action.id),
      }
    }
    case 'MINIMIZE_WINDOW':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, minimized: true } : w,
        ),
        focusedWindowId:
          state.focusedWindowId === action.id
            ? null
            : state.focusedWindowId,
      }
    case 'RESTORE_WINDOW': {
      if (!state.windows.some((w) => w.id === action.id)) return state
      const raised = bumpZ(state, action.id)
      return {
        ...state,
        windows: raised.map((w) =>
          w.id === action.id ? { ...w, minimized: false } : w,
        ),
        focusedWindowId: action.id,
      }
    }
    case 'MOVE_WINDOW':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, x: action.x, y: action.y } : w,
        ),
      }
    case 'RESIZE_WINDOW':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id
            ? { ...w, width: action.width, height: action.height }
            : w,
        ),
      }
    case 'SET_WINDOW_TITLE':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, title: action.title } : w,
        ),
      }
    case 'FILE_WINDOW_SET_DIR': {
      const node = findNodeById(FILE_TREE, action.dirId)
      const title = node
        ? `Проводник — ${node.name}`
        : WINDOW_DEFAULTS.files.title
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.windowId
            ? {
                ...w,
                filesDirId: action.dirId,
                filesSelectedFileId: null,
                title,
              }
            : w,
        ),
      }
    }
    case 'FILE_WINDOW_SELECT_FILE':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.windowId
            ? { ...w, filesSelectedFileId: action.fileId }
            : w,
        ),
      }
    case 'MAIL_WINDOW_SET_OPEN':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.windowId
            ? { ...w, mailOpenId: action.mailId }
            : w,
        ),
      }
    case 'MARK_MAIL_READ': {
      if (state.readMailIds.includes(action.id)) return state
      return { ...state, readMailIds: [...state.readMailIds, action.id] }
    }
    case 'MARK_FILE_VIEWED': {
      if (state.viewedFileIds.includes(action.id)) return state
      return {
        ...state,
        viewedFileIds: [...state.viewedFileIds, action.id],
      }
    }
    case 'TERMINAL_FAIL':
      return { ...state, terminalAttempts: state.terminalAttempts + 1 }
    case 'TETRIS_GAME_OVER':
      if (state.tetrisGameOverSeen) return state
      return { ...state, tetrisGameOverSeen: true }
    case 'CHESS_PUZZLE_SOLVED':
      if (state.chessPuzzleSolved) return state
      return { ...state, chessPuzzleSolved: true }
    case 'QUEST_START_TIMER': {
      if (state.questTimerEndsAt != null) return state
      return { ...state, questTimerEndsAt: action.endsAt }
    }
    case 'QUEST_UNLOCK_DIR': {
      const expected = QUEST_LOCKS[action.dirId]
      if (!expected) return state
      const normalized = action.password.trim()
      if (normalized.toLowerCase() !== expected.toLowerCase()) return state
      if (state.questUnlockedDirIds.includes(action.dirId)) return state
      const nextStage = Math.max(
        state.questStage,
        QUEST_STAGE_BY_DIR[action.dirId] ?? state.questStage,
      )
      return {
        ...state,
        questStage: nextStage,
        questUnlockedDirIds: [...state.questUnlockedDirIds, action.dirId],
      }
    }
    case 'CALENDAR_ADD_ENTRY': {
      const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `cal-${Date.now()}`
      return {
        ...state,
        calendarEntries: [
          ...state.calendarEntries,
          {
            id,
            dateKey: action.dateKey,
            title: action.title.trim() || 'Без названия',
            body: action.body,
          },
        ],
      }
    }
    case 'CALENDAR_DELETE_ENTRY':
      return {
        ...state,
        calendarEntries: state.calendarEntries.filter(
          (e) => e.id !== action.id,
        ),
      }
    case 'BROWSER_ADD_BOOKMARK': {
      const bid =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `bm-${Date.now()}`
      const next = {
        id: bid,
        title: action.title.trim() || action.url,
        url: action.url,
      }
      if (state.browserBookmarks.some((b) => b.url === next.url)) {
        return state
      }
      return {
        ...state,
        browserBookmarks: [...state.browserBookmarks, next],
      }
    }
    case 'BROWSER_REMOVE_BOOKMARK':
      return {
        ...state,
        browserBookmarks: state.browserBookmarks.filter(
          (b) => b.id !== action.id,
        ),
      }
    case 'BROWSER_RECORD_VISIT': {
      const hid =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `h-${Date.now()}`
      const item = {
        id: hid,
        title: action.title,
        url: action.url,
        at: Date.now(),
      }
      const rest = state.browserHistory.filter((h) => h.url !== action.url)
      return {
        ...state,
        browserHistory: [item, ...rest].slice(0, 120),
      }
    }
    default:
      return state
  }
}
