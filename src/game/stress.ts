import type { GameState } from './types'

export function stressTier(state: GameState): 0 | 1 | 2 | 3 {
  if (state.secretFolderUnlocked) return 2
  if (
    state.stegoExtractSeen ||
    state.contrastHintSeen ||
    state.audioSpectrogramSeen ||
    state.metadataExifSeen
  )
    return 1
  return 0
}
