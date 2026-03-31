import {
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useMemo,
  useState,
} from 'react'
import type { GameAction, GameState } from '../game/types'
import {
  getNodeAtPath,
  listDir,
  listNames,
  normalizePath,
  SHELL_COMMANDS,
} from '../game/virtualFs'

type Props = {
  state: GameState
  dispatch: (action: GameAction) => void
}

function tokenize(line: string): string[] {
  const m = line.match(/(?:[^\s"]+|"[^"]*")+/g)
  if (!m) return []
  return m.map((s) => s.replace(/^"|"$/g, ''))
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

function helpLines(): string[] {
  return [
    'Команды: pwd · cd · ls · cat · echo · help · clear · history · whoami',
  ]
}

export function TerminalApp({ state, dispatch }: Props) {
  const intro = useMemo(
    () => [
      'Оболочка. Введите help.',
      'Корень диска соответствует папке «Ноутбук».',
    ],
    [],
  )

  const [lines, setLines] = useState<string[]>(() => intro)
  const [input, setInput] = useState('')
  const [cwd, setCwd] = useState('/')
  const [history, setHistory] = useState<string[]>([])
  const [histIndex, setHistIndex] = useState(-1)

  const prompt = useMemo(() => {
    const tail = cwd === '/' ? 'Ноутбук' : cwd.replace(/^\//, '')
    return `user@pc:${tail}$ `
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
        append(['user'])
        return
      }
      if (cmd0 === 'pwd') {
        append([cwd === '/' ? '/Ноутбук' : cwd])
        return
      }
      if (cmd0 === 'history') {
        if (history.length === 0) {
          append(['(пусто)'])
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

      if (cmd0 === 'cd') {
        const target = tokens[1] ?? ''
        if (!target || target === '~') {
          setCwd('/')
          return
        }
        const dest = normalizePath(cwd, target)
        const node = getNodeAtPath(dest)
        if (!node) {
          append([`cd: нет пути: ${target}`])
          dispatch({ type: 'TERMINAL_FAIL' })
          return
        }
        if (node.type !== 'dir') {
          append([`cd: не каталог`])
          dispatch({ type: 'TERMINAL_FAIL' })
          return
        }
        setCwd(dest === '' ? '/' : dest)
        return
      }

      if (cmd0 === 'ls') {
        let pathTokIdx = 1
        while (
          pathTokIdx < tokens.length &&
          tokens[pathTokIdx].startsWith('-')
        ) {
          pathTokIdx++
        }
        const pathArg = tokens[pathTokIdx] ?? '.'
        const abs = normalizePath(cwd, pathArg)
        const node = getNodeAtPath(abs)
        if (!node) {
          append([`ls: нет доступа`])
          dispatch({ type: 'TERMINAL_FAIL' })
          return
        }
        if (node.type !== 'dir') {
          append([node.name])
          return
        }
        const kids = listDir(abs, state)
        append([kids.map((k) => k.name).join('  ') || '(пусто)'])
        return
      }

      if (cmd0 === 'cat') {
        if (tokens.length < 2) {
          append(['cat: укажите файл'])
          return
        }
        const pathArg = tokens.slice(1).join(' ')
        const abs = normalizePath(cwd, pathArg)
        const node = getNodeAtPath(abs)
        if (!node) {
          append([`cat: нет файла`])
          dispatch({ type: 'TERMINAL_FAIL' })
          return
        }
        if (node.type === 'dir') {
          append([`cat: это каталог`])
          return
        }
        if (node.fileKind === 'app-shortcut') {
          append(['cat: это приложение — откройте в проводнике.'])
          return
        }
        if (node.content) {
          append(node.content.split('\n'))
        } else {
          append(['(пусто)'])
        }
        return
      }

      append([`команда не найдена: ${cmd0}`])
      dispatch({ type: 'TERMINAL_FAIL' })
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
    <div className="terminal-window terminal-window--embedded">
      <div className="term-body">
        <div className="term-scroll" tabIndex={-1}>
          {lines.map((line, i) => (
            <div key={`${i}-${line.slice(0, 24)}`} className="term-line">
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
