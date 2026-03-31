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
  tetris: { width: 460, height: 620, title: 'Тетрис' },
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

export type FileKind = 'text' | 'app-shortcut' | 'image' | 'audio'

export type FileNode = {
  id: string
  name: string
  type: 'dir' | 'file'
  fileKind?: FileKind
  opensApp?: AppShortcut
  content?: string
  locked?: boolean
  mtime?: string
  children?: FileNode[]
}

export const QUEST_LOCKS: Record<string, string> = {
  'case-01': 'OMEGA',
  'dir-case-02': 'SEVER',
  'dir-case-03': 'TUMAN',
  'dir-case-04': '03:37',
  'dir-case-05': '2026-03-31_04:12-MATE-713',
}

export const QUEST_STAGE_BY_DIR: Record<string, number> = {
  'case-01': 1,
  'dir-case-02': 2,
  'dir-case-03': 3,
  'dir-case-04': 4,
  'dir-case-05': 5,
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
          {
            id: 'dir-unknown',
            name: 'UNKNOWN',
            type: 'dir',
            children: [
              {
                id: 'intro-letter',
                name: 'intro_letter.txt',
                type: 'file',
                fileKind: 'text',
                content:
                  'Ты включил машину, которая тебе не принадлежит.\n' +
                  'Или наоборот — слишком давно перестал принадлежать себе, чтобы различать.\n\n' +
                  'Эта система притворяется твоей: знакомые иконки, мёртвые ярлыки, цифровой хлам.\n' +
                  'Но между её слоями есть то, что ты сюда не ставил.\n\n' +
                  'Я.\n\n' +
                  'Внутри — первая запертая дверь: CASE_01.\n' +
                  'Найди первое слово, которым машина сама признается, что больше не контролирует, что в ней живёт.\n' +
                  'Это слово откроет тебе CASE_01. Таймер уже идёт.',
              },
              {
                id: 'dir-omega-last-public',
                name: 'Ω_last',
                type: 'dir',
                children: [
                  {
                    id: 'omega-public-1',
                    name: 'omega_note_1.txt',
                    type: 'file',
                    fileKind: 'text',
                    content:
                      '…и в конце всегда остаётся только OMEGA.\n' +
                      'остальное похоже на след, стёртый мокрой тряпкой.\n',
                  },
                  {
                    id: 'omega-public-2',
                    name: 'omega_note_2.txt',
                    type: 'file',
                    fileKind: 'text',
                    content:
                      'OMEGA — отметка, куда стекли ошибки.\n' +
                      'Если это слово просится на язык — попробуй им открыть дверь.\n',
                  },
                ],
              },
              {
                id: 'case-01',
                name: 'CASE_01.locked',
                type: 'dir',
                locked: true,
                children: [
                  {
                    id: 'letter-01',
                    name: 'letter_01_case.txt',
                    type: 'file',
                    fileKind: 'text',
                    content:
                      'Ты нашёл Омегу.\n\n' +
                      'Теперь послушаем, как эта система говорит — в логах.\n' +
                      'В папке app_logs повторяется один мотив: направление.\n\n' +
                      'Доберись до того лога, где она признаётся:\n' +
                      '«НАПРАВЛЕНИЕ ПОДТВЕРЖДЕНО».\n\n' +
                      'Имя направления — твой следующий ключ.\n' +
                      'Откроешь CASE_02.',
                  },
                  {
                    id: 'dir-app-logs',
                    name: 'app_logs',
                    type: 'dir',
                    children: [
                      {
                        id: 'log-app-1',
                        name: 'app_1.log',
                        type: 'file',
                        fileKind: 'text',
                        content:
                          '[2026-03-30 02:11] init ok\n[2026-03-30 02:12] warning: cache stale\n[2026-03-30 02:13] ok\n',
                      },
                      {
                        id: 'log-net-1',
                        name: 'network_1.log',
                        type: 'file',
                        fileKind: 'text',
                        content:
                          '[net] route=auto\n[net] connect ok\n[net] jitter=11ms\n',
                      },
                      {
                        id: 'log-net-2',
                        name: 'network_2.log',
                        type: 'file',
                        fileKind: 'text',
                        content:
                          '[net] retry endpoint=core\n[net] packet loss=3%\n[net] timeout\n',
                      },
                      {
                        id: 'log-net-3',
                        name: 'network_3.log',
                        type: 'file',
                        fileKind: 'text',
                        content:
                          '[net] connection to NORTH node failed\n' +
                          '[net] route to NORTH is unstable\n' +
                          '[net] retrying NORTH endpoint...\n' +
                          '[net] connection to NORTH node failed\n' +
                          '>> DIRECTION CONFIRMED: SEVER\n',
                      },
                      {
                        id: 'log-system-critical',
                        name: 'system_critical.log',
                        type: 'file',
                        fileKind: 'text',
                        content:
                          'panic: non-deterministic state observed\n' +
                          'trace: /UNKNOWN/Ω_last/... (redacted)\n',
                      },
                    ],
                  },
                  {
                    id: 'dir-case-02',
                    name: 'CASE_02.locked',
                    type: 'dir',
                    locked: true,
                    children: [
                      {
                        id: 'letter-02',
                        name: 'letter_02_case.txt',
                        type: 'file',
                        fileKind: 'text',
                        content:
                          'Открой то, что обычно открывают, когда хотят спрятаться от всех — и внимательно присмотрись к тому, что не двигается.\n\n' +
                          'В зеркале рабочего стола есть кадр, который случился только один раз.\n' +
                          'Ответ написан прямо на нём.\n' +
                          'Это слово откроет CASE_03.',
                      },
                      {
                        id: 'dir-desktop-mirror',
                        name: 'Desktop_Mirror',
                        type: 'dir',
                        children: [
                          {
                            id: 'img-wallpaper1',
                            name: 'wallpaper1.png',
                            type: 'file',
                            fileKind: 'image',
                          },
                          {
                            id: 'img-screen-old',
                            name: 'screen_old.jpg',
                            type: 'file',
                            fileKind: 'image',
                          },
                          {
                            id: 'img-family',
                            name: 'family_photo.png',
                            type: 'file',
                            fileKind: 'image',
                          },
                          {
                            id: 'img-freeze',
                            name: 'screenshot_freeze.png',
                            type: 'file',
                            fileKind: 'image',
                          },
                          {
                            id: 'img-corrupted',
                            name: 'image_corrupted.png',
                            type: 'file',
                            fileKind: 'image',
                          },
                        ],
                      },
                      {
                        id: 'dir-case-03',
                        name: 'CASE_03.locked',
                        type: 'dir',
                        locked: true,
                        children: [
                          {
                            id: 'letter-03',
                            name: 'letter_03_case.txt',
                            type: 'file',
                            fileKind: 'text',
                            content:
                              'В этой системе проигрывают не только музыку.\n' +
                              'Иногда код проявляется, когда что-то рушится у тебя на глазах.\n\n' +
                              'Запусти игру с падающими блоками.\n' +
                              'Не побеждай. Дожми до отказа.\n' +
                              'То, что всплывёт в момент поражения, и есть ключ к следующей двери.',
                          },
                          {
                            id: 'dir-music-cache',
                            name: 'music_cache',
                            type: 'dir',
                            children: [
                              {
                                id: 'track-hidden',
                                name: 'track_hidden.mp3',
                                type: 'file',
                                fileKind: 'audio',
                              },
                              {
                                id: 'song-old-1',
                                name: 'song_old_1.mp3',
                                type: 'file',
                                fileKind: 'audio',
                              },
                              {
                                id: 'noise-test',
                                name: 'noise_test.wav',
                                type: 'file',
                                fileKind: 'audio',
                              },
                              {
                                id: 'track-hidden-2',
                                name: 'track_hidden_2.mp3',
                                type: 'file',
                                fileKind: 'audio',
                              },
                            ],
                          },
                          {
                            id: 'dir-case-04',
                            name: 'CASE_04.locked',
                            type: 'dir',
                            locked: true,
                            children: [
                              {
                                id: 'letter-04',
                                name: 'letter_04_case.txt',
                                type: 'file',
                                fileKind: 'text',
                                content:
                                  'Есть файлы, которые можно читать. И есть файлы, которые надо допрашивать.\n' +
                                  'origin.dat — из вторых.\n\n' +
                                  'Его тело бесполезно, но у каждого свидетеля есть время последнего разговора.\n' +
                                  'День найди там, где люди назначают встречи. Час — у самого файла.\n' +
                                  'Собери момент целиком: день и час одним швом.\n' +
                                  'И не забудь знак, который придёт после мата.\n' +
                                  'Тогда дверь CASE_05 перестанет притворяться закрытой.',
                              },
                              {
                                id: 'dir-system-core',
                                name: 'system_core',
                                type: 'dir',
                                children: [
                                  {
                                    id: 'origin-dat',
                                    name: 'origin.dat',
                                    type: 'file',
                                    fileKind: 'text',
                                    mtime: '2026-03-31 04:12',
                                    content:
                                      '00000000  8f 00 13 37 00 00 00 00  00 00 00 00 00 00 00 00\n' +
                                      '00000010  00 00 00 00 6f 72 69 67  69 6e 00 00 00 00 00 00\n',
                                  },
                                  {
                                    id: 'origin-old',
                                    name: 'origin_old.dat',
                                    type: 'file',
                                    fileKind: 'text',
                                    mtime: '2025-11-12 09:18',
                                    content: 'старый дамп.\n',
                                  },
                                  {
                                    id: 'system-core-bin',
                                    name: 'system_core.bin',
                                    type: 'file',
                                    fileKind: 'text',
                                    content: 'binary blob (заглушка).\n',
                                  },
                                  {
                                    id: 'meta-txt',
                                    name: 'meta.txt',
                                    type: 'file',
                                    fileKind: 'text',
                                    content:
                                      'Момент собирается из двух частей.\n' +
                                      'Слева день, справа час.\n' +
                                      'Между ними один шов.\n' +
                                      'После времени — ещё один шов и шахматный знак.',
                                  },
                                ],
                              },
                              {
                                id: 'dir-case-05',
                                name: 'CASE_05.locked',
                                type: 'dir',
                                locked: true,
                                children: [
                                  {
                                    id: 'final-letter',
                                    name: 'final_letter.txt',
                                    type: 'file',
                                    fileKind: 'text',
                                    content:
                                      'Ты дошёл.\n\n' +
                                      'Теперь это не папка — это комната.\n' +
                                      'И в ней больше нет интерфейса, который притворяется невиновным.\n',
                                  },
                                  {
                                    id: 'credits',
                                    name: 'credits.txt',
                                    type: 'file',
                                    fileKind: 'text',
                                    content: 'Конец демо.\n',
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'doc-notes-random',
            name: 'notes_random.txt',
            type: 'file',
            fileKind: 'text',
            content: 'купить кофе\nзаписать пароль (потом)\nне забыть выключить свет\n',
          },
          {
            id: 'doc-draft-1',
            name: 'draft_1.docx',
            type: 'file',
            fileKind: 'text',
            content: 'DOCX (заглушка).',
          },
        ],
      },
      {
        id: 'dir-downloads',
        name: 'Загрузки',
        type: 'dir',
        children: [
          {
            id: 'dl-setup-old',
            name: 'setup_old.exe',
            type: 'file',
            fileKind: 'text',
            content: 'EXE (заглушка).',
          },
          {
            id: 'dl-video',
            name: 'video_2020.mp4',
            type: 'file',
            fileKind: 'text',
            content: 'MP4 (заглушка).',
          },
          {
            id: 'dl-crack',
            name: 'game_crack.lnk',
            type: 'file',
            fileKind: 'text',
            content: 'Ярлык (заглушка).',
          },
        ],
      },
      {
        id: 'dir-images',
        name: 'Изображения',
        type: 'dir',
        children: [
          {
            id: 'img-holiday',
            name: 'holiday_2019.jpg',
            type: 'file',
            fileKind: 'text',
            content: 'JPG (заглушка).',
          },
          {
            id: 'img-avatar',
            name: 'avatar_old.png',
            type: 'file',
            fileKind: 'text',
            content: 'PNG (заглушка).',
          },
        ],
      },
      {
        id: 'dir-music',
        name: 'Музыка',
        type: 'dir',
        children: [
          {
            id: 'music-song1',
            name: 'song1.mp3',
            type: 'file',
            fileKind: 'text',
            content: 'MP3 (мусор).',
          },
          {
            id: 'music-song2',
            name: 'song2_old.ogg',
            type: 'file',
            fileKind: 'text',
            content: 'OGG (мусор).',
          },
          {
            id: 'music-voice',
            name: 'voice_note.wav',
            type: 'file',
            fileKind: 'text',
            content: 'WAV (мусор).',
          },
        ],
      },
      {
        id: 'dir-videos',
        name: 'Видео',
        type: 'dir',
        children: [
          {
            id: 'vid-empty',
            name: 'readme.txt',
            type: 'file',
            fileKind: 'text',
            content: 'папка пустая.\n',
          },
        ],
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
        children: [
          {
            id: 'trash-readme',
            name: 'readme_old.txt',
            type: 'file',
            fileKind: 'text',
            content: 'Удалённые файлы. Некоторые можно восстановить.\n',
          },
          {
            id: 'trash-draft',
            name: 'draft_song_v2.txt',
            type: 'file',
            fileKind: 'text',
            content: 'OBSIDIAN CATHEDRAL demo lyrics\n',
          },
          {
            id: 'trash-cache',
            name: 'cache_dump.log',
            type: 'file',
            fileKind: 'text',
            content: '[warn] stale cache\n[warn] stale cache\n',
          },
          {
            id: 'trash-img',
            name: 'broken_poster_preview.png',
            type: 'file',
            fileKind: 'image',
          },
        ],
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
  {
    id: 'q0',
    from: 'Неизвестный',
    subject: 'Не открывай',
    date: '2026-03-31',
    body:
      'Ты включил машину, которая тебе не принадлежит.\n\n' +
      'В «Документы/UNKNOWN» лежит письмо и первая запертая папка.\n' +
      'Пароль к CASE_01 — слово, которое система повторяет последним.\n',
    visible: () => true,
  },
  {
    id: 'q1',
    from: 'Неизвестный',
    subject: 'Омега',
    date: '2026-03-31',
    body:
      'Ты идёшь по следу правильно.\n\n' +
      'Логи всегда врут о причинах и честны в направлении.\n' +
      'Слушай повторяющееся слово, а не громкие ошибки.\n',
    visible: (s) => s.questStage >= 1,
  },
  {
    id: 'q2',
    from: 'Неизвестный',
    subject: 'Застывший экран',
    date: '2026-03-31',
    body:
      'Скриншот не объясняет, он указывает.\n' +
      'Слово на замёрзшем кадре и есть ключ.\n',
    visible: (s) => s.questStage >= 2,
  },
  {
    id: 'q3',
    from: 'Неизвестный',
    subject: 'Падение',
    date: '2026-03-31',
    body:
      'Ты слишком бережно обходишься с играми.\n' +
      'Иногда дверь открывает только поражение.\n' +
      'Смотри на экран в последнюю секунду.\n',
    visible: (s) => s.questStage >= 3,
  },
  {
    id: 'q4',
    from: 'Неизвестный',
    subject: 'Свойства',
    date: '2026-03-31',
    body:
      'У файла есть не только содержимое.\n' +
      'Иногда самое важное — когда к нему прикасались в последний раз.\n' +
      'Если не хватает дня, загляни в календарь.\n' +
      'Если не хватает хвоста — добей мат.\n',
    visible: (s) => s.questStage >= 4,
  },
  {
    id: 'q5-chess',
    from: 'Неизвестный',
    subject: 'Один ход',
    date: '2026-03-31',
    body:
      'Ты умеешь читать файлы, но не умеешь читать доску.\n' +
      'Открой шахматы. Белые ходят и ставят мат сразу.\n\n' +
      'Код: MATE-713\n',
    visible: (s) => s.chessPuzzleSolved,
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
