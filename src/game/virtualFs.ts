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
  'status',
  'unlock',
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
  if (path === '/') return root()

  const segments = path.slice(1).split('/')
  let cur: FileNode = root()
  for (const seg of segments) {
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
  return node.children.filter(() => true)
}

export function listNames(absDir: string, state: GameState): string[] {
  return listDir(absDir, state).map((n) => n.name)
}

export function formatLsLine(node: FileNode, long: boolean): string {
  if (!long) return node.name
  const mode = node.type === 'dir' ? 'drwx------' : '-rw-------'
  const sz =
    node.type === 'dir' ? 4096 : (node.content?.length ?? node.id.length * 7)
  const owner = 'user'
  const grp = 'users'
  return `${mode} 1 ${owner} ${grp} ${String(sz).padStart(6)} Mar 15 14:22 ${node.name}`
}
