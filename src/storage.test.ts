import { describe, expect, it, vi } from 'vitest'
import { INVALID_DATA_WARNING, loadTodos, saveTodos, STORAGE_KEY, STORAGE_WARNING } from './storage'

const task = { id: 'a', text: 'Read', completed: false }

describe('browser storage', () => {
  it('loads missing data without writing on initialization', () => {
    const write = vi.spyOn(Storage.prototype, 'setItem')
    expect(loadTodos()).toEqual({ todos: [], warning: null })
    expect(write).not.toHaveBeenCalled()
  })

  it('round-trips a versioned envelope, including an empty collection', () => {
    expect(saveTodos([task])).toBeNull()
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({ version: 1, todos: [task] })
    expect(loadTodos()).toEqual({ todos: [task], warning: null })
    expect(saveTodos([])).toBeNull()
    expect(loadTodos().todos).toEqual([])
  })

  it.each([
    'not json', 'null', '[]', '{}',
    JSON.stringify({ version: 2, todos: [task] }),
    JSON.stringify({ version: 1, todos: null }),
    ...[
      null, {}, { ...task, id: '' }, { ...task, id: 1 },
      { ...task, text: '  ' }, { ...task, text: 123 },
      { ...task, completed: 'false' },
    ].map(invalid => JSON.stringify({ version: 1, todos: [invalid] })),
    JSON.stringify({ version: 1, todos: [task, task] }),
  ])('rejects invalid data without overwriting it: %s', raw => {
    localStorage.setItem(STORAGE_KEY, raw)
    expect(loadTodos()).toEqual({ todos: [], warning: INVALID_DATA_WARNING })
    expect(localStorage.getItem(STORAGE_KEY)).toBe(raw)
  })

  it('handles storage access, read, and write failures', () => {
    const getter = vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => { throw new Error('Blocked') })
    expect(loadTodos().warning).toBe(STORAGE_WARNING)
    expect(saveTodos([task])).toBe(STORAGE_WARNING)
    getter.mockRestore()
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Blocked') })
    expect(loadTodos().warning).toBe(STORAGE_WARNING)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Quota exceeded') })
    expect(saveTodos([task])).toBe(STORAGE_WARNING)
  })
})
