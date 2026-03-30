export type GamePhase = 'title' | 'workbench' | 'boot' | 'desktop'

export interface GameState {
  version: 2
  phase: GamePhase
  bootFinished: boolean
  mailOpenId: string | null
  filesDirId: string
  filesSelectedFileId: string | null
  activeApp: 'mail' | 'files' | 'terminal' | null
  readMailIds: string[]
  secretFolderUnlocked: boolean
  fieldChannelUnlocked: boolean
  stegoExtractSeen: boolean
  contrastHintSeen: boolean
  audioSpectrogramSeen: boolean
  viewedFileIds: string[]
  terminalAttempts: number
}

export const INITIAL_STATE: GameState = {
  version: 2,
  phase: 'title',
  bootFinished: false,
  mailOpenId: null,
  filesDirId: 'root',
  filesSelectedFileId: null,
  activeApp: null,
  readMailIds: [],
  secretFolderUnlocked: false,
  fieldChannelUnlocked: false,
  stegoExtractSeen: false,
  contrastHintSeen: false,
  audioSpectrogramSeen: false,
  viewedFileIds: [],
  terminalAttempts: 0,
}

export type GameAction =
  | { type: 'HYDRATE'; state: GameState }
  | { type: 'NEW_GAME' }
  | { type: 'SET_PHASE'; phase: GamePhase }
  | { type: 'BOOT_DONE' }
  | { type: 'OPEN_APP'; app: GameState['activeApp'] }
  | { type: 'CLOSE_APP' }
  | { type: 'MARK_MAIL_READ'; id: string }
  | { type: 'SET_MAIL_OPEN'; id: string | null }
  | { type: 'SET_FILES_DIR'; dirId: string }
  | { type: 'SELECT_FILE'; fileId: string | null }
  | { type: 'MARK_FILE_VIEWED'; id: string }
  | { type: 'UNLOCK_SECRET_FOLDER' }
  | { type: 'UNLOCK_FIELD_CHANNEL' }
  | { type: 'TERMINAL_FAIL' }
  | { type: 'STEGO_EXTRACT_SEEN' }
  | { type: 'CONTRAST_HINT_SEEN' }
  | { type: 'AUDIO_SPECTROGRAM_SEEN' }
