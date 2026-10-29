import type { Todo } from './todos'

export const STORAGE_KEY = 'todo-list-webapp:v1'
export const STORAGE_WARNING = 'Browser storage is unavailable. Your tasks are available in this session, but changes may not survive a reload.'
export const INVALID_DATA_WARNING = 'Saved tasks could not be loaded. Starting with an empty list; adding a task will replace the unreadable saved data.'

interface LoadResult {
  todos: Todo[]
  warning: string | null
}

function isTodo(value: unknown): value is Todo {
  if (!value || typeof value !== 'object') return false
  const todo = value as Record<string, unknown>
  return typeof todo.id === 'string' && todo.id.trim().length > 0
    && typeof todo.text === 'string' && todo.text.trim().length > 0
    && typeof todo.completed === 'boolean'
}

export function loadTodos(): LoadResult {
  let raw: string | null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return { todos: [], warning: STORAGE_WARNING }
  }
  if (raw === null) return { todos: [], warning: null }
  try {
    const data: unknown = JSON.parse(raw)
    if (!data || typeof data !== 'object') throw new Error('Invalid envelope')
    const envelope = data as Record<string, unknown>
    if (envelope.version !== 1 || !Array.isArray(envelope.todos)
      || !envelope.todos.every(isTodo)
      || new Set(envelope.todos.map(todo => todo.id)).size !== envelope.todos.length) {
      throw new Error('Invalid tasks')
    }
    return { todos: envelope.todos.map(({ id, text, completed }) => ({ id, text: text.trim(), completed })), warning: null }
  } catch {
    return { todos: [], warning: INVALID_DATA_WARNING }
  }
}

export function saveTodos(todos: Todo[]): string | null {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, todos }))
    return null
  } catch {
    return STORAGE_WARNING
  }
}
