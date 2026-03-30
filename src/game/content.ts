import type { GameState } from './types'

/** Открывает папку «Личный архив» (терминал или проводник) */
export const SECRET_FOLDER_PASSWORD = 'blackwood'

/** Второй снимок — проявляется контрастом; пригодится позже в сюжете */
export const FUTURE_PASSWORD_HINT = 'OMEN-776'

/** Сегмент пути и имя папки в проводнике */
export const LOCKED_FOLDER_NAME = 'Личный архив'

/** Стего-снимок в `public/` (LSB уже в файле) */
export const STEGO_ASSET_FILENAME = 'image (1).png'
/** Пробел в имени — кодируем для URL */
export const STEGO_ASSET_PATH = '/image%20(1).png'

/** Размытый скрин — проявляется контрастом (`скрин_монитор_размыто.jpg` в проводнике) */
export const CONTRAST_ASSET_FILENAME = 'skrin_monitor_razmyto (2).png'
export const CONTRAST_ASSET_PATH = '/skrin_monitor_razmyto%20(2).png'

export function secretFolderPrefixes(): string[] {
  const base = '/' + LOCKED_FOLDER_NAME
  return [base, base + '/']
}

export function isInsideSecretFolder(absPath: string): boolean {
  const n =
    absPath === '' || absPath === '/'
      ? '/'
      : absPath.replace(/\/+$/, '') || '/'
  const sealed = '/' + LOCKED_FOLDER_NAME
  return n === sealed || n.startsWith(sealed + '/')
}

export type MailDef = {
  id: string
  from: string
  subject: string
  date: string
  body: string
  visible: (s: GameState) => boolean
}

export const MAILS: MailDef[] = [
  {
    id: 'spam-vitamins',
    from: 'SuperSale <noreply@megavitamins.ru>',
    subject: '−70% на омегу только сегодня',
    date: 'вчера',
    visible: () => true,
    body: `Дорогой клиент!

Акция сгорает через 3 часа. Код WINTER не действует.

Отписаться можно, но мы всё равно попробуем ещё раз :)`,
  },
  {
    id: 'friend-dima',
    from: 'Дима К. <d.kozlov@mail.ru>',
    subject: 'ты живой?',
    date: '12 мар',
    visible: () => true,
    body: `Йо. Ты пропал после той вечеринки. Напиши хоть «норм», а то мамка опять спрашивает.

Кстати долг за пиццу не забудь ))`,
  },
  {
    id: 'work-newsletter',
    from: 'HR Портал <news@staff-portal.local>',
    subject: 'Ежемесячная рассылка — абонемент в спортзал',
    date: '10 мар',
    visible: () => true,
    body: `Коллеги, напоминаем о льготном абонементе до 15 числа.

С уважением, отдел мотивации.`,
  },
  {
    id: 'stego-article',
    from: 'Дайджест безопасности <digest@sec-notes.io>',
    subject: 'Подборка: стеганография в бытовых JPEG',
    date: '8 мар',
    visible: () => true,
    body: `Добрый день.

В номере — обзор, как в «обычных» фото прячут текст, меняя младшие биты цвета. Глаз не видит, а скрипт вытаскивает строку.

Практика: если картинка «пустая», а размер подозрительно велик — попробуйте простой LSB-декодер или посмотрите метаданные.

Онлайн-сервис для кодирования и извлечения сообщений из изображений: https://stego.app/

Читать: https://example.org/stego-intro (вырезка для внутреннего курса)

— Редколлегия.`,
  },
  {
    id: 'spam-bank',
    from: '«Банк» <security-urgent@fake-bank.xyz>',
    subject: 'СРОЧНО: блокировка карты',
    date: '7 мар',
    visible: () => true,
    body: `Уважаемый клиент. Мы заблокировали ваш счёт. Перейдите по ссылке и введите CVV.

(это фишинг, даже не открывайте — но подозреваемый открыл)`,
  },
  {
    id: 'mom',
    from: 'мама',
    subject: 'рецепт борща фото пришлю',
    date: '6 мар',
    visible: () => true,
    body: `Сынок, купи сметану нормальную, не ту что в прошлый раз.

Целую.`,
  },
  {
    id: 'steam-sale',
    from: 'Steam <noreply@steampowered.com>',
    subject: 'В вашем списке желаемого скидка',
    date: '5 мар',
    visible: () => true,
    body: `Одна из игр из списка желаемого сейчас со скидкой 40%.

Спасибо что играете с нами.`,
  },
  {
    id: 'dentist',
    from: 'Клиника «Улыбка» <info@smile-dent.ru>',
    subject: 'Напоминание: чистка',
    date: '3 мар',
    visible: () => true,
    body: `Здравствуйте! Напоминаем о записи на профгигиену.

Если не актуально — проигнорируйте.`,
  },
  {
    id: 'killer-invite',
    from: 'без адреса <void>',
    subject: 'Ты открыл дверь',
    date: 'только что',
    visible: (s) => s.secretFolderUnlocked,
    body: `Ты вошёл туда, куда тебя не звали. Мило.

Раз уж ты любишь копаться в чужих вещах — давай сыграем. У меня есть правила, у тебя есть совесть (если найдёшь).

На кону не абстракция — люди, которых ты ещё можешь не видеть. Или уже видел, но не заметил.

Дальше будет интереснее. Не закрывай почту.

— Наблюдатель.`,
  },
]

export function getVisibleMails(state: GameState): MailDef[] {
  return MAILS.filter((m) => m.visible(state))
}

export type FileKind = 'text' | 'photo-lsb' | 'photo-contrast'

export type FileNode = {
  id: string
  name: string
  type: 'dir' | 'file'
  fileKind?: FileKind
  lockedIf?: (s: GameState) => boolean
  content?: string
  children?: FileNode[]
}

export const FILE_TREE: FileNode[] = [
  {
    id: 'root',
    name: 'Пользователь',
    type: 'dir',
    children: [
      {
        id: 'dir-desktop',
        name: 'Рабочий стол',
        type: 'dir',
        children: [
          {
            id: 'lnk-readme',
            name: 'Корзина — ярлык.txt',
            type: 'file',
            content: 'Ярлык битый. Ничего полезного.',
          },
        ],
      },
      {
        id: 'dir-documents',
        name: 'Документы',
        type: 'dir',
        children: [
          {
            id: 'doc-draft',
            name: 'черновик_резюме.docx.txt',
            type: 'file',
            content: 'Черновик не закончен. Навыки: Excel, «общительность».',
          },
        ],
      },
      {
        id: 'dir-downloads',
        name: 'Загрузки',
        type: 'dir',
        children: [
          {
            id: 'dl-installer',
            name: 'Setup.exe-remove-me.txt',
            type: 'file',
            content: 'Фейковый инсталлятор уже удалён. Остался только текстовый лог загрузки.',
          },
          {
            id: 'dl-torrent',
            name: 'readme_first.txt',
            type: 'file',
            content: 'Спасибо что скачали. Пароль к архиву в описании раздачи — шутка, тут пусто.',
          },
        ],
      },
      {
        id: 'dir-pictures',
        name: 'Изображения',
        type: 'dir',
        children: [
          {
            id: 'photo-lsb',
            name: STEGO_ASSET_FILENAME,
            type: 'file',
            fileKind: 'photo-lsb',
          },
          {
            id: 'photo-contrast',
            name: 'скрин_монитор_размыто.jpg',
            type: 'file',
            fileKind: 'photo-contrast',
          },
        ],
      },
      {
        id: 'dir-videos',
        name: 'Видео',
        type: 'dir',
        children: [
          {
            id: 'vid-placeholder',
            name: 'пусто.txt',
            type: 'file',
            content: 'Папка пустая. Запись с регистратора удалена или не сюда.',
          },
        ],
      },
      {
        id: 'dir-music',
        name: 'Музыка',
        type: 'dir',
        children: [
          {
            id: 'mus-playlist',
            name: 'плейлист_погода.m3u.txt',
            type: 'file',
            content: 'track1.mp3\ntrack2.mp3\n...',
          },
        ],
      },
      {
        id: 'dir-sealed',
        name: LOCKED_FOLDER_NAME,
        type: 'dir',
        lockedIf: (s) => !s.secretFolderUnlocked,
        children: [
          {
            id: 'sealed-note',
            name: 'следующий_ход.txt',
            type: 'file',
            content: `Ты не должен был так быстро дойти до сути.

Но раз дошёл — сохраняй холод в голове. Следующая заготовка уже не на этом диске.

Почта. Всегда почта.`,
          },
        ],
      },
    ],
  },
]

export function isNodeLocked(node: FileNode, state: GameState): boolean {
  return node.lockedIf ? node.lockedIf(state) : false
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

/** Сохранения могли устареть — несуществующая папка даёт пустой проводник. */
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
