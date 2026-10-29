export interface Todo {
  id: string
  text: string
  completed: boolean
}

export type Filter = 'All' | 'Active' | 'Completed'

export function addTodo(todos: Todo[], text: string, id: string): Todo[] {
  const trimmed = text.trim()
  if (!trimmed) return todos
  return [...todos, { id, text: trimmed, completed: false }]
}

export function toggleTodo(todos: Todo[], id: string): Todo[] {
  return todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo)
}

export function updateTodo(todos: Todo[], id: string, text: string): Todo[] {
  const trimmed = text.trim()
  if (!trimmed) return todos
  return todos.map(todo => todo.id === id ? { ...todo, text: trimmed } : todo)
}

export function deleteTodo(todos: Todo[], id: string): Todo[] {
  return todos.filter(todo => todo.id !== id)
}

export function clearCompleted(todos: Todo[]): Todo[] {
  return todos.filter(todo => !todo.completed)
}

export function filterTodos(todos: Todo[], filter: Filter): Todo[] {
  return todos.filter(todo => filter === 'All' || todo.completed === (filter === 'Completed'))
}

export function remainingCount(todos: Todo[]): number {
  return todos.filter(todo => !todo.completed).length
}
