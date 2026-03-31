import { FILE_TREE, type FileNode } from './content'
import type { GameState } from './types'

export const SHELL_COMMANDS = [
  'cat',
  'cd',
  'clear',
  'echo',
  'help',
  'history',
  'ls',
  'pwd',
  'whoami',
]

function root(): FileNode {
  return FILE_TREE[0]
}

export function normalizePath(cwd: string, target: string): string {
  const base = target.startsWith('/') ? '' : cwd.replace(/\/$/, '')
  const raw = (base + '/' + target).replace(/\/+/g, '/')
  const segments = raw.split('/').filter((s) => s.length > 0)
  const stack: string[] = []
  for (const seg of segments) {
    if (seg === '..') stack.pop()
    else if (seg !== '.' && seg !== '') stack.push(seg)
  }
  return '/' + stack.join('/')
}

export function getNodeAtPath(absPath: string): FileNode | null {
  const path = absPath === '' ? '/' : absPath.replace(/\/$/, '') || '/'
  if (path === '/' || path === '/Ноутбук') return root()

  const segments = path.slice(1).split('/').filter(Boolean)
  let cur: FileNode = root()
  for (const seg of segments) {
    if (cur === root() && seg === root().name) continue
    if (cur.type !== 'dir' || !cur.children) return null
    const next = cur.children.find((c) => c.name === seg)
    if (!next) return null
    cur = next
  }
  return cur
}

export function listDir(absDir: string, _state: GameState): FileNode[] {
  const node = getNodeAtPath(absDir)
  if (!node || node.type !== 'dir' || !node.children) return []
  return node.children
}

export function listNames(absDir: string, state: GameState): string[] {
  return listDir(absDir, state).map((n) => n.name)
}
