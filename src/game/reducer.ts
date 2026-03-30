import { mergeWithDefaults } from './persistence'
import type { GameAction, GameState } from './types'
import { INITIAL_STATE } from './types'

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
        activeApp: null,
      }
    case 'OPEN_APP':
      return { ...state, activeApp: action.app }
    case 'CLOSE_APP':
      return {
        ...state,
        activeApp: null,
        mailOpenId: null,
        filesSelectedFileId: null,
      }
    case 'MARK_MAIL_READ': {
      if (state.readMailIds.includes(action.id)) return state
      return { ...state, readMailIds: [...state.readMailIds, action.id] }
    }
    case 'SET_MAIL_OPEN':
      return { ...state, mailOpenId: action.id }
    case 'SET_FILES_DIR':
      return {
        ...state,
        filesDirId: action.dirId,
        filesSelectedFileId: null,
      }
    case 'SELECT_FILE':
      return { ...state, filesSelectedFileId: action.fileId }
    case 'MARK_FILE_VIEWED': {
      if (state.viewedFileIds.includes(action.id)) return state
      return { ...state, viewedFileIds: [...state.viewedFileIds, action.id] }
    }
    case 'UNLOCK_SECRET_FOLDER':
      return { ...state, secretFolderUnlocked: true }
    case 'UNLOCK_FIELD_CHANNEL':
      return { ...state, fieldChannelUnlocked: true }
    case 'UNLOCK_LENS_LAYER':
      return { ...state, lensLayerUnlocked: true }
    case 'TERMINAL_FAIL':
      return { ...state, terminalAttempts: state.terminalAttempts + 1 }
    case 'STEGO_EXTRACT_SEEN':
      return { ...state, stegoExtractSeen: true }
    case 'CONTRAST_HINT_SEEN':
      return { ...state, contrastHintSeen: true }
    case 'AUDIO_SPECTROGRAM_SEEN':
      return { ...state, audioSpectrogramSeen: true }
    case 'EXIF_METADATA_SEEN':
      return { ...state, metadataExifSeen: true }
    default:
      return state
  }
}
