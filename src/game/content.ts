import type { AppWindowType, GameState } from './types'

export type AppShortcut = Exclude<AppWindowType, 'files'>

export const WINDOW_DEFAULTS: Record<
  AppWindowType,
  { width: number; height: number; title: string }
> = {
  files: { width: 600, height: 480, title: 'Проводник' },
  mail: { width: 640, height: 440, title: 'Почта' },
  calendar: { width: 420, height: 520, title: 'Календарь' },
  terminal: { width: 520, height: 420, title: 'Терминал' },
  notepad: { width: 500, height: 440, title: 'Блокнот' },
  'image-editor': { width: 640, height: 520, title: 'Редактор изображений' },
  'audio-player': { width: 420, height: 200, title: 'Аудио плеер' },
  'video-player': { width: 480, height: 320, title: 'Видео плеер' },
  solitaire: { width: 760, height: 580, title: 'Пасьянс' },
  tetris: { width: 380, height: 480, title: 'Тетрис' },
  chess: { width: 440, height: 520, title: 'Шахматы' },
  browser: { width: 720, height: 520, title: 'Браузер' },
}

export const START_MENU_PROGRAMS: { type: AppWindowType; label: string }[] = [
  { type: 'calendar', label: 'Календарь' },
  { type: 'mail', label: 'Почта' },
  { type: 'image-editor', label: 'Редактор изображений' },
  { type: 'audio-player', label: 'Аудио плеер' },
  { type: 'video-player', label: 'Видео плеер' },
  { type: 'notepad', label: 'Блокнот' },
  { type: 'browser', label: 'Браузер' },
  { type: 'terminal', label: 'Терминал' },
]

export const START_MENU_GAMES: { type: AppWindowType; label: string }[] = [
  { type: 'solitaire', label: 'Пасьянс' },
  { type: 'tetris', label: 'Тетрис' },
  { type: 'chess', label: 'Шахматы' },
]

export type FileKind = 'text' | 'app-shortcut'

export type FileNode = {
  id: string
  name: string
  type: 'dir' | 'file'
  fileKind?: FileKind
  opensApp?: AppShortcut
  content?: string
  children?: FileNode[]
}

export const FILE_TREE: FileNode[] = [
  {
    id: 'root',
    name: 'Ноутбук',
    type: 'dir',
    children: [
      {
        id: 'dir-docs',
        name: 'Документы',
        type: 'dir',
        children: [
          {
            id: 'doc-welcome',
            name: 'Добро пожаловать.txt',
            type: 'file',
            fileKind: 'text',
            content:
              'Документы — ваши файлы.\n\nСистемные папки находятся в проводнике: Загрузки, Изображения, Музыка, Видео, Программы, Игры, Корзина.',
          },
        ],
      },
      {
        id: 'dir-downloads',
        name: 'Загрузки',
        type: 'dir',
        children: [],
      },
      {
        id: 'dir-images',
        name: 'Изображения',
        type: 'dir',
        children: [],
      },
      {
        id: 'dir-music',
        name: 'Музыка',
        type: 'dir',
        children: [],
      },
      {
        id: 'dir-videos',
        name: 'Видео',
        type: 'dir',
        children: [],
      },
      {
        id: 'dir-programs',
        name: 'Программы',
        type: 'dir',
        children: [
          {
            id: 'app-calendar',
            name: 'Календарь.app',
            type: 'file',
            fileKind: 'app-shortcut',
            opensApp: 'calendar',
          },
          {
            id: 'app-mail',
            name: 'Почта.app',
            type: 'file',
            fileKind: 'app-shortcut',
            opensApp: 'mail',
          },
          {
            id: 'app-image-editor',
            name: 'Редактор изображений.app',
            type: 'file',
            fileKind: 'app-shortcut',
            opensApp: 'image-editor',
          },
          {
            id: 'app-audio',
            name: 'Аудио плеер.app',
            type: 'file',
            fileKind: 'app-shortcut',
            opensApp: 'audio-player',
          },
          {
            id: 'app-video',
            name: 'Видео плеер.app',
            type: 'file',
            fileKind: 'app-shortcut',
            opensApp: 'video-player',
          },
          {
            id: 'app-notepad',
            name: 'Блокнот.app',
            type: 'file',
            fileKind: 'app-shortcut',
            opensApp: 'notepad',
          },
          {
            id: 'app-browser',
            name: 'Браузер.app',
            type: 'file',
            fileKind: 'app-shortcut',
            opensApp: 'browser',
          },
          {
            id: 'app-terminal',
            name: 'Терминал.app',
            type: 'file',
            fileKind: 'app-shortcut',
            opensApp: 'terminal',
          },
        ],
      },
      {
        id: 'dir-games',
        name: 'Игры',
        type: 'dir',
        children: [
          {
            id: 'game-solitaire',
            name: 'Пасьянс.app',
            type: 'file',
            fileKind: 'app-shortcut',
            opensApp: 'solitaire',
          },
          {
            id: 'game-tetris',
            name: 'Тетрис.app',
            type: 'file',
            fileKind: 'app-shortcut',
            opensApp: 'tetris',
          },
          {
            id: 'game-chess-app',
            name: 'Шахматы.app',
            type: 'file',
            fileKind: 'app-shortcut',
            opensApp: 'chess',
          },
        ],
      },
      {
        id: 'dir-trash',
        name: 'Корзина',
        type: 'dir',
        children: [],
      },
    ],
  },
]

export type MailDef = {
  id: string
  from: string
  subject: string
  date: string
  body: string
  to?: string
  visible: (s: GameState) => boolean
}

export const MAILS: MailDef[] = [
  {
    id: 'm1',
    from: 'Система',
    subject: 'Добро пожаловать',
    date: '2026-03-29',
    body:
      'Почта готова к работе.\n\nПрограммы и игры запускайте из папок «Программы» и «Игры» в проводнике или с ярлыков на рабочем столе.',
    visible: () => true,
  },
]

export function getVisibleMails(state: GameState): MailDef[] {
  return MAILS.filter((m) => m.visible(state))
}

export function findNodeById(
  nodes: FileNode[],
  id: string,
): FileNode | null {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children) {
      const found = findNodeById(n.children, id)
      if (found) return found
    }
  }
  return null
}

export function resolveFilesDirId(id: string | undefined | null): string {
  if (typeof id !== 'string' || id === '') return 'root'
  const n = findNodeById(FILE_TREE, id)
  return n?.type === 'dir' ? id : 'root'
}

export function resolveFilesSelectedFileId(
  id: string | null | undefined,
): string | null {
  if (id == null || typeof id !== 'string') return null
  const n = findNodeById(FILE_TREE, id)
  return n?.type === 'file' ? id : null
}
