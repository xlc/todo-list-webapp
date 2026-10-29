import { describe, expect, it } from 'vitest'
import { addTodo, clearCompleted, deleteTodo, filterTodos, remainingCount, toggleTodo, updateTodo } from './todos'
import type { Todo } from './todos'

const tasks: Todo[] = [
  { id: 'a', text: 'Read a book', completed: false },
  { id: 'b', text: 'Take a walk', completed: true },
]

describe('task operations', () => {
  it('trims additions, permits duplicate text, and preserves insertion order', () => {
    const next = addTodo(tasks, '  Read a book  ', 'c')
    expect(next.map(todo => todo.id)).toEqual(['a', 'b', 'c'])
    expect(next[2]).toEqual({ id: 'c', text: 'Read a book', completed: false })
    expect(tasks).toHaveLength(2)
  })

  it('rejects blank additions and edits without changing data', () => {
    expect(addTodo(tasks, ' \n ', 'c')).toBe(tasks)
    expect(updateTodo(tasks, 'a', ' \t ')).toBe(tasks)
  })

  it('updates and toggles immutably without affecting other tasks', () => {
    const next = updateTodo(toggleTodo(tasks, 'a'), 'a', '  New title  ')
    expect(next[0]).toEqual({ id: 'a', text: 'New title', completed: true })
    expect(next[1]).toBe(tasks[1])
    expect(tasks[0]).toEqual({ id: 'a', text: 'Read a book', completed: false })
    expect(toggleTodo(next, 'a')[0].completed).toBe(false)
  })

  it('deletes by ID and clears only completed tasks', () => {
    expect(deleteTodo(tasks, 'a')).toEqual([tasks[1]])
    expect(clearCompleted(tasks)).toEqual([tasks[0]])
    expect(tasks).toHaveLength(2)
  })

  it('derives filtered lists and the remaining count', () => {
    expect(filterTodos(tasks, 'All')).toEqual(tasks)
    expect(filterTodos(tasks, 'Active')).toEqual([tasks[0]])
    expect(filterTodos(tasks, 'Completed')).toEqual([tasks[1]])
    expect(remainingCount(tasks)).toBe(1)
    expect(remainingCount([])).toBe(0)
  })
})
