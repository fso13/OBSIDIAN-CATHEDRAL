import {
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useMemo,
  useState,
} from 'react'
import {
  isInsideSecretFolder,
  isNodeLocked,
  SECRET_FOLDER_PASSWORD,
} from '../game/content'
import type { GameAction, GameState } from '../game/types'
import {
  formatLsLine,
  getNodeAtPath,
  listDir,
  listNames,
  normalizePath,
  SHELL_COMMANDS,
} from '../game/virtualFs'

type Props = {
  state: GameState
  onClose: () => void
  dispatch: (action: GameAction) => void
}

function canAccessPath(absPath: string, state: GameState): boolean {
  const n = normalizePath('/', absPath)
  if (!state.secretFolderUnlocked && isInsideSecretFolder(n)) return false
  return true
}

function normalizeKey(line: string): string | null {
  const t = line.trim().toLowerCase()
  const unlock = t.match(/^unlock\s+(.+)$/)
  if (unlock) return unlock[1]?.trim().replace(/\s+/g, '') ?? null
  if (t.length > 0 && !/\s/.test(t)) return t
  return null
}

function tokenize(line: string): string[] {
  const m = line.match(/(?:[^\s"]+|"[^"]*")+/g)
  if (!m) return []
  return m.map((s) => s.replace(/^"|"$/g, ''))
}

function helpLines(): string[] {
  return [
    'Команды: pwd · cd · ls [-la] [путь] · cat · echo · history · help · clear · whoami · status · unlock',
  ]
}

function longestCommonPrefix(strs: string[]): string {
  if (strs.length === 0) return ''
  let pref = strs[0]
  for (let i = 1; i < strs.length; i++) {
    while (!strs[i].startsWith(pref)) {
      pref = pref.slice(0, -1)
      if (pref === '') return ''
    }
  }
  return pref
}

export function TerminalApp({ state, onClose, dispatch }: Props) {
  const intro = useMemo(
    () => [
      'Локальная копия профиля (volumes/user).',
      'help — список команд.',
    ],
    [],
  )

  const [lines, setLines] = useState<string[]>(() => intro)
  const [input, setInput] = useState('')
  const [cwd, setCwd] = useState('/')
  const [history, setHistory] = useState<string[]>([])
  const [histIndex, setHistIndex] = useState(-1)

  const prompt = useMemo(() => {
    const tail = cwd === '/' ? '~' : cwd.replace(/^\//, '') || '/'
    return `user@copy:${tail}$ `
  }, [cwd])

  const append = useCallback((chunk: string[]) => {
    setLines((l) => [...l, ...chunk])
  }, [])

  const runLine = useCallback(
    (raw: string) => {
      const trimmed = raw.trim()
      append([`${prompt}${raw}`])
      if (!trimmed) return

      const tokens = tokenize(trimmed)
      const cmd0 = tokens[0]?.toLowerCase() ?? ''

      if (cmd0 === 'clear') {
        setLines([])
        return
      }
      if (cmd0 === 'help') {
        append(helpLines())
        return
      }
      if (cmd0 === 'whoami') {
        append(['user', 'локальный том'])
        return
      }
      if (cmd0 === 'pwd') {
        append([cwd])
        return
      }
      if (cmd0 === 'history') {
        if (history.length === 0) {
          append(['(история пуста)'])
          return
        }
        for (let i = 0; i < history.length; i++) {
          append([`${String(i + 1).padStart(4)}  ${history[i]}`])
        }
        return
      }
      if (cmd0 === 'echo') {
        append([tokens.slice(1).join(' ')])
        return
      }
      if (cmd0 === 'status') {
        append([
          `архив......... ${state.secretFolderUnlocked ? 'ОТКРЫТ' : 'ЗАКРЫТ'}`,
          `стего_1....... ${state.stegoExtractSeen ? 'да' : 'нет'}`,
          `контраст_2..... ${state.contrastHintSeen ? 'да' : 'нет'}`,
        ])
        return
      }

      if (cmd0 === 'cd') {
        const target = tokens[1] ?? '~'
        const dest =
          target === '~' || target === ''
            ? '/'
            : normalizePath(cwd, target)
        if (dest === cwd && target !== '..') {
          return
        }
        const node = getNodeAtPath(dest)
        if (!node) {
          append([`cd: нет такого пути: ${target}`])
          return
        }
        if (node.type !== 'dir') {
          append([`cd: не каталог: ${target}`])
          return
        }
        if (isNodeLocked(node, state)) {
          append(['cd: доступ запрещён. Нужен пароль к папке.'])
          return
        }
        setCwd(dest === '' ? '/' : dest)
        return
      }

      if (cmd0 === 'ls') {
        let long = false
        let i = 1
        while (i < tokens.length && tokens[i].startsWith('-')) {
          const f = tokens[i]
          if (f.includes('l')) long = true
          i++
        }
        const pathArg = tokens[i] ?? '.'
        const abs = normalizePath(cwd, pathArg)
        const node = getNodeAtPath(abs)
        if (!node) {
          append([`ls: нет доступа: ${pathArg}`])
          return
        }
        if (node.type !== 'dir') {
          append([long ? formatLsLine(node, true) : node.name])
          return
        }
        if (!canAccessPath(abs, state)) {
          append([`ls: отказ: ${pathArg}`])
          return
        }
        const kids = listDir(abs, state)
        if (long) {
          append(['total ' + String(kids.length)])
          kids.forEach((k) => append([formatLsLine(k, true)]))
        } else {
          append([kids.map((k) => k.name).join('  ') || '(пусто)'])
        }
        return
      }

      if (cmd0 === 'unlock' && tokens.length === 1) {
        append(['Использование: unlock <пароль>'])
        return
      }

      if (cmd0 === 'cat') {
        if (tokens.length < 2) {
          append(['cat: укажите файл'])
          return
        }
        const abs = normalizePath(cwd, tokens[1])
        const node = getNodeAtPath(abs)
        if (!node) {
          append([`cat: нет файла: ${tokens[1]}`])
          return
        }
        if (node.type === 'dir') {
          append([`cat: это каталог: ${tokens[1]}`])
          return
        }
        if (!canAccessPath(abs, state)) {
          append(['cat: доступ к пути закрыт.'])
          return
        }
        if (
          node.fileKind === 'photo-lsb' ||
          node.fileKind === 'photo-contrast'
        ) {
          append([`${node.name}: смотреть в «Файлы».`])
          return
        }
        if (node.content) {
          append(node.content.split('\n'))
          dispatch({ type: 'MARK_FILE_VIEWED', id: node.id })
        } else {
          append(['(пустой файл)'])
        }
        return
      }

      const maybePassphrase =
        (tokens.length === 1 && !SHELL_COMMANDS.includes(cmd0)) ||
        (tokens.length === 2 && cmd0 === 'unlock')
      if (maybePassphrase) {
        const bare = normalizeKey(raw)
        if (bare === SECRET_FOLDER_PASSWORD) {
          if (state.secretFolderUnlocked) {
            append(['Папка уже разблокирована.'])
            return
          }
          dispatch({ type: 'UNLOCK_SECRET_FOLDER' })
          append([
            'Пароль принят.',
            'Папка «Личный архив» разблокирована.',
          ])
          return
        }
        if (bare && bare !== SECRET_FOLDER_PASSWORD) {
          append(['Неверный пароль.'])
          dispatch({ type: 'TERMINAL_FAIL' })
          return
        }
      }

      append([`команда не найдена: ${cmd0}. Введите help.`])
    },
    [append, cwd, dispatch, history, prompt, state],
  )

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const raw = input
    setInput('')
    setHistIndex(-1)
    if (raw.trim()) {
      setHistory((h) => {
        const next = h[h.length - 1] === raw.trim() ? h : [...h, raw.trim()]
        return next.slice(-100)
      })
    }
    runLine(raw)
  }

  const tryComplete = () => {
    const line = input
    if (line.endsWith(' ') || line.trim() === '') return false
    const tokens = tokenize(line)
    if (tokens.length === 1) {
      const prefix = tokens[0].toLowerCase()
      const hits = SHELL_COMMANDS.filter((c) => c.startsWith(prefix))
      if (hits.length === 0) return false
      const lcp = longestCommonPrefix(hits)
      if (lcp.length > prefix.length) {
        setInput(lcp + (hits.length === 1 ? ' ' : ''))
        return true
      }
      if (hits.length > 1) {
        append([hits.join('  ')])
        return true
      }
      return false
    }
    const cmd = tokens[0].toLowerCase()
    if (!['cd', 'cat', 'ls'].includes(cmd)) return false
    let pathTokIdx = 1
    if (cmd === 'ls') {
      while (
        pathTokIdx < tokens.length &&
        tokens[pathTokIdx].startsWith('-')
      ) {
        pathTokIdx++
      }
    }
    if (pathTokIdx >= tokens.length) return false
    const lastTok = tokens[pathTokIdx]
    const dirPart =
      lastTok.lastIndexOf('/') >= 0
        ? lastTok.slice(0, lastTok.lastIndexOf('/') + 1)
        : ''
    const baseDir = dirPart.startsWith('/')
      ? normalizePath('/', dirPart.slice(0, -1) || '/')
      : normalizePath(cwd, dirPart.replace(/\/?$/, '/') || '.')

    if (!canAccessPath(baseDir, state)) return false

    const namePrefix =
      lastTok.lastIndexOf('/') >= 0
        ? lastTok.slice(lastTok.lastIndexOf('/') + 1)
        : lastTok
    const names = listNames(baseDir, state)
    const cands = names.filter((n) => n.startsWith(namePrefix))
    if (cands.length === 0) return false
    const lcp = longestCommonPrefix(cands)
    const newLast = dirPart + lcp
    const newTokens = [...tokens.slice(0, pathTokIdx), newLast]
    if (cands.length === 1) {
      const n = getNodeAtPath(normalizePath(baseDir, newLast))
      if (n?.type === 'dir') {
        newTokens[pathTokIdx] = newLast + '/'
      } else {
        newTokens[pathTokIdx] = newLast + ' '
      }
    }
    setInput(newTokens.join(' '))
    return true
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      tryComplete()
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const next =
        histIndex === -1
          ? history.length - 1
          : Math.max(0, histIndex - 1)
      setHistIndex(next)
      setInput(history[next])
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (histIndex === -1) return
      if (histIndex >= history.length - 1) {
        setHistIndex(-1)
        setInput('')
        return
      }
      const next = histIndex + 1
      setHistIndex(next)
      setInput(history[next])
    }
  }

  return (
    <div className="window terminal-window">
      <header className="window-head">
        <span>Терминал</span>
        <button type="button" className="win-close" onClick={onClose}>
          ×
        </button>
      </header>
      <div className="term-body">
        <div className="term-scroll" tabIndex={-1}>
          {lines.map((line, i) => (
            <div key={`${i}-${line.slice(0, 20)}`} className="term-line">
              {line}
            </div>
          ))}
        </div>
        <form className="term-form" onSubmit={submit}>
          <span className="prompt" aria-hidden="true">
            {prompt}
          </span>
          <input
            className="term-input"
            autoComplete="off"
            spellCheck={false}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Команда"
          />
        </form>
      </div>
    </div>
  )
}
