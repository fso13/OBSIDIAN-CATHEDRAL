import { useEffect, useMemo, useState } from 'react'
import {
  FILE_TREE,
  findNodeById,
  isNodeLocked,
  resolveFilesDirId,
  type FileNode,
} from '../game/content'
import type { GameAction, GameState } from '../game/types'
import { AudioEvidencePanel } from './AudioEvidencePanel'
import { ContrastPhotoPanel } from './ContrastPhotoPanel'
import {
  FolderPasswordModal,
  type FolderUnlockTarget,
} from './FolderPasswordModal'
import { StegoPhotoPanel } from './StegoPhotoPanel'

type Props = {
  state: GameState
  onClose: () => void
  onDir: (dirId: string) => void
  onSelectFile: (fileId: string | null) => void
  onViewFile: (id: string) => void
  dispatch: (action: GameAction) => void
}

export function FilesApp({
  state,
  onClose,
  onDir,
  onSelectFile,
  onViewFile,
  dispatch,
}: Props) {
  const [passwordTarget, setPasswordTarget] =
    useState<FolderUnlockTarget | null>(null)

  const dirId = resolveFilesDirId(state.filesDirId)

  useEffect(() => {
    if (dirId !== state.filesDirId) {
      dispatch({ type: 'SET_FILES_DIR', dirId })
    }
  }, [dirId, state.filesDirId, dispatch])

  const dirNode = useMemo(
    () => findNodeById(FILE_TREE, dirId),
    [dirId],
  )

  const crumbs = useMemo(() => {
    const crumbs: { id: string; name: string }[] = []
    const walk = (
      nodes: FileNode[],
      target: string,
      acc: { id: string; name: string }[],
    ): boolean => {
      for (const n of nodes) {
        const next = [...acc, { id: n.id, name: n.name }]
        if (n.id === target) {
          crumbs.push(...next)
          return true
        }
        if (n.children && walk(n.children, target, next)) return true
      }
      return false
    }
    walk(FILE_TREE, dirId, [])
    return crumbs
  }, [dirId])

  const selectedNode = state.filesSelectedFileId
    ? findNodeById(FILE_TREE, state.filesSelectedFileId)
    : null

  return (
    <div className="window files-window">
      <FolderPasswordModal
        open={passwordTarget !== null}
        target={passwordTarget}
        onClose={() => setPasswordTarget(null)}
        dispatch={dispatch}
        secretFolderUnlocked={state.secretFolderUnlocked}
        fieldChannelUnlocked={state.fieldChannelUnlocked}
      />
      <header className="window-head">
        <span>Проводник · копия ПК</span>
        <button type="button" className="win-close" onClick={onClose}>
          ×
        </button>
      </header>
      <nav className="breadcrumbs" aria-label="Путь">
        {crumbs.map((c, i) => (
          <span key={c.id}>
            {i > 0 && <span className="bc-sep"> / </span>}
            <button
              type="button"
              className="bc-btn"
              onClick={() => {
                onDir(c.id)
              }}
            >
              {c.name}
            </button>
          </span>
        ))}
      </nav>
      <div className="files-split">
        <ul className="files-list">
          {dirNode?.type === 'dir' && dirNode.children
            ? dirNode.children.map((child) => {
                const locked = isNodeLocked(child, state)
                return (
                  <li key={child.id}>
                    <button
                      type="button"
                      className={`file-row ${state.filesSelectedFileId === child.id ? 'active' : ''}`}
                      onClick={() => {
                        if (child.type === 'dir' && locked) {
                          if (child.id === 'dir-sealed') {
                            setPasswordTarget('secret')
                          } else if (child.id === 'dir-field-channel') {
                            setPasswordTarget('field')
                          }
                          return
                        }
                        if (child.type === 'dir') {
                          onDir(child.id)
                          return
                        }
                        onSelectFile(child.id)
                        onViewFile(child.id)
                      }}
                    >
                      <span className="ico">
                        {child.type === 'dir'
                          ? '📁'
                          : child.fileKind === 'photo-lsb' ||
                              child.fileKind === 'photo-contrast'
                            ? '📷'
                            : child.fileKind === 'audio-spectrogram'
                              ? '🎵'
                              : '📄'}
                      </span>
                      <span>
                        {child.name}
                        {locked && <span className="lock"> 🔒</span>}
                      </span>
                    </button>
                  </li>
                )
              })
            : null}
        </ul>
        <div className="file-preview">
          {selectedNode?.type === 'file' &&
            selectedNode.fileKind === 'photo-lsb' ? (
            <StegoPhotoPanel
              stegoExtractSeen={state.stegoExtractSeen}
              dispatch={dispatch}
            />
          ) : selectedNode?.type === 'file' &&
            selectedNode.fileKind === 'photo-contrast' ? (
            <ContrastPhotoPanel
              contrastHintSeen={state.contrastHintSeen}
              dispatch={dispatch}
            />
          ) : selectedNode?.type === 'file' &&
            selectedNode.fileKind === 'audio-spectrogram' ? (
            <AudioEvidencePanel
              audioSpectrogramSeen={state.audioSpectrogramSeen}
              dispatch={dispatch}
            />
          ) : selectedNode?.type === 'file' && selectedNode.content ? (
            <pre className="preview-pre">{selectedNode.content}</pre>
          ) : (
            <p className="muted">Выберите файл или папку.</p>
          )}
        </div>
      </div>
    </div>
  )
}
