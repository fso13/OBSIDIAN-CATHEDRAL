import { useMemo } from 'react'
import {
  FILE_TREE,
  QUEST_LOCKS,
  findNodeById,
  resolveFilesDirId,
  type FileNode,
} from '../game/content'
import type { GameAction, GameState } from '../game/types'

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
  state: GameState
  dispatch: (action: GameAction) => void
}

function fileIcon(node: FileNode): string {
  if (node.type === 'dir') return node.locked ? '🔒📁' : '📁'
  if (node.fileKind === 'app-shortcut') return '⚙'
  if (node.fileKind === 'image') return '🖼'
  if (node.fileKind === 'audio') return '🎵'
  return '📄'
}

export function FilesApp({
  windowId,
  filesDirId: filesDirIdProp,
  filesSelectedFileId,
  state,
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
                className={`file-row ${child.type === 'dir' ? 'file-row--dir' : ''} ${filesSelectedFileId === child.id ? 'active' : ''}`}
                onClick={() => {
                  if (child.type === 'dir') {
                    if (child.locked && !state.questUnlockedDirIds.includes(child.id)) {
                      const pass = window.prompt(
                        `Папка «${child.name}» защищена паролем. Введите пароль:`,
                      )
                      if (pass == null) return
                      const expected = QUEST_LOCKS[child.id]
                      if (!expected) return
                      if (pass.trim().toLowerCase() !== expected.toLowerCase()) {
                        window.alert('Неверный пароль.')
                        return
                      }
                      dispatch({
                        type: 'QUEST_UNLOCK_DIR',
                        dirId: child.id,
                        password: pass,
                      })
                    }
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
                  if (child.fileKind === 'image') {
                    dispatch({
                      type: 'FILE_WINDOW_SELECT_FILE',
                      windowId,
                      fileId: child.id,
                    })
                    dispatch({ type: 'MARK_FILE_VIEWED', id: child.id })
                    dispatch({
                      type: 'OPEN_WINDOW',
                      windowType: 'image-editor',
                      mediaFileId: child.id,
                      title: `Просмотр — ${child.name}`,
                    })
                    return
                  }
                  if (child.fileKind === 'audio') {
                    dispatch({
                      type: 'FILE_WINDOW_SELECT_FILE',
                      windowId,
                      fileId: child.id,
                    })
                    dispatch({ type: 'MARK_FILE_VIEWED', id: child.id })
                    dispatch({
                      type: 'OPEN_WINDOW',
                      windowType: 'audio-player',
                      mediaFileId: child.id,
                      title: `Плеер — ${child.name}`,
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
                    if (child.id === 'intro-letter') {
                      const endsAt = Date.now() + 15 * 60 * 1000
                      dispatch({ type: 'QUEST_START_TIMER', endsAt })
                    }
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
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
              <button
                type="button"
                className="btn"
                onClick={() =>
                  dispatch({
                    type: 'OPEN_WINDOW',
                    windowType: 'notepad',
                    title: `Свойства — ${selectedNode.name}`,
                    notepadContent:
                      `Имя: ${selectedNode.name}\n` +
                      `ID: ${selectedNode.id}\n` +
                      `Тип: файл\n` +
                      (selectedNode.mtime ? `Изменён: ${selectedNode.mtime}\n` : ''),
                  })
                }
              >
                Свойства
              </button>
              </div>
            </div>
          ) : selectedNode?.type === 'file' && selectedNode.content ? (
            <pre className="preview-pre">{selectedNode.content}</pre>
          ) : selectedNode?.type === 'file' ? (
            <div className="text-preview">
              <p className="muted small">Файл выбран.</p>
              <button
                type="button"
                className="btn"
                onClick={() =>
                  dispatch({
                    type: 'OPEN_WINDOW',
                    windowType: 'notepad',
                    title: `Свойства — ${selectedNode.name}`,
                    notepadContent:
                      `Имя: ${selectedNode.name}\n` +
                      `ID: ${selectedNode.id}\n` +
                      `Тип: файл\n` +
                      (selectedNode.mtime ? `Изменён: ${selectedNode.mtime}\n` : ''),
                  })
                }
              >
                Свойства
              </button>
            </div>
          ) : (
            <p className="muted">Выберите файл или папку.</p>
          )}
        </div>
      </div>
    </div>
  )
}
