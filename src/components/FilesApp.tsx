import { useMemo } from 'react'
import {
  FILE_TREE,
  findNodeById,
  resolveFilesDirId,
  type FileNode,
} from '../game/content'
import type { GameAction } from '../game/types'

const LAUNCH_LABEL: Record<string, string> = {
  mail: 'Почта',
  calendar: 'Календарь',
  terminal: 'Терминал',
  notepad: 'Блокнот',
  browser: 'Браузер',
  'image-editor': 'Редактор изображений',
  'audio-player': 'Аудио плеер',
  'video-player': 'Видео плеер',
  solitaire: 'Пасьянс',
  tetris: 'Тетрис',
  chess: 'Шахматы',
}

type Props = {
  windowId: string
  filesDirId: string
  filesSelectedFileId: string | null
  dispatch: (action: GameAction) => void
}

function fileIcon(node: FileNode): string {
  if (node.type === 'dir') return '📁'
  if (node.fileKind === 'app-shortcut') return '⚙'
  return '📄'
}

export function FilesApp({
  windowId,
  filesDirId: filesDirIdProp,
  filesSelectedFileId,
  dispatch,
}: Props) {
  const dirId = resolveFilesDirId(filesDirIdProp)

  const dirNode = useMemo(() => findNodeById(FILE_TREE, dirId), [dirId])

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

  const selectedNode = filesSelectedFileId
    ? findNodeById(FILE_TREE, filesSelectedFileId)
    : null

  const children = dirNode?.type === 'dir' ? dirNode.children ?? [] : []

  return (
    <div className="files-window files-window--embedded">
      <nav className="breadcrumbs" aria-label="Путь">
        {crumbs.map((c, i) => (
          <span key={c.id}>
            {i > 0 && <span className="bc-sep"> / </span>}
            <button
              type="button"
              className="bc-btn"
              onClick={() =>
                dispatch({
                  type: 'FILE_WINDOW_SET_DIR',
                  windowId,
                  dirId: c.id,
                })
              }
            >
              {c.name}
            </button>
          </span>
        ))}
      </nav>
      <div className="files-split">
        <ul className="files-list">
          {children.map((child) => (
            <li key={child.id}>
              <button
                type="button"
                className={`file-row ${filesSelectedFileId === child.id ? 'active' : ''}`}
                onClick={() => {
                  if (child.type === 'dir') {
                    dispatch({
                      type: 'FILE_WINDOW_SET_DIR',
                      windowId,
                      dirId: child.id,
                    })
                    return
                  }
                  if (child.fileKind === 'app-shortcut' && child.opensApp) {
                    dispatch({
                      type: 'OPEN_WINDOW',
                      windowType: child.opensApp,
                    })
                    return
                  }
                  if (child.fileKind === 'text') {
                    dispatch({
                      type: 'FILE_WINDOW_SELECT_FILE',
                      windowId,
                      fileId: child.id,
                    })
                    dispatch({ type: 'MARK_FILE_VIEWED', id: child.id })
                    dispatch({
                      type: 'OPEN_WINDOW',
                      windowType: 'notepad',
                      notepadContent: child.content ?? '',
                      notepadLabel: child.name,
                    })
                    return
                  }
                  dispatch({
                    type: 'FILE_WINDOW_SELECT_FILE',
                    windowId,
                    fileId: child.id,
                  })
                  dispatch({ type: 'MARK_FILE_VIEWED', id: child.id })
                }}
              >
                <span className="ico">{fileIcon(child)}</span>
                <span>{child.name}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="file-preview">
          {selectedNode?.type === 'file' &&
          selectedNode.fileKind === 'app-shortcut' &&
          selectedNode.opensApp ? (
            <div className="shortcut-preview">
              <p className="muted small">Ярлык приложения.</p>
              <button
                type="button"
                className="btn primary"
                onClick={() =>
                  dispatch({
                    type: 'OPEN_WINDOW',
                    windowType: selectedNode.opensApp!,
                  })
                }
              >
                Запустить:{' '}
                {LAUNCH_LABEL[selectedNode.opensApp] ?? selectedNode.opensApp}
              </button>
            </div>
          ) : selectedNode?.type === 'file' &&
            selectedNode.fileKind === 'text' ? (
            <div className="text-preview">
              {selectedNode.content ? (
                <pre className="preview-pre">{selectedNode.content}</pre>
              ) : (
                <p className="muted small">Пустой файл.</p>
              )}
              <button
                type="button"
                className="btn primary"
                onClick={() =>
                  dispatch({
                    type: 'OPEN_WINDOW',
                    windowType: 'notepad',
                    notepadContent: selectedNode.content ?? '',
                    notepadLabel: selectedNode.name,
                  })
                }
              >
                Открыть в блокноте
              </button>
            </div>
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
