import { useRef, useState } from 'react'
import { loadTodos, saveTodos } from './storage'
import type { Todo } from './todos'

export function useTodos() {
  const [initial] = useState(loadTodos)
  const [todos, setTodos] = useState(initial.todos)
  const [warning, setWarning] = useState(initial.warning)
  const current = useRef(todos)

  function mutate(operation: (todos: Todo[]) => Todo[]) {
    const next = operation(current.current)
    if (next === current.current) return
    current.current = next
    setTodos(next)
    // Persist only explicit mutations, never mounting or replayed React updaters.
    setWarning(saveTodos(next))
  }

  return { todos, warning, mutate }
}
