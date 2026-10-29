import { useLayoutEffect, useRef, useState } from 'react'
import { TodoForm } from './components/TodoForm'
import { TodoItem } from './components/TodoItem'
import { addTodo, clearCompleted, deleteTodo, filterTodos, remainingCount, toggleTodo, updateTodo } from './todos'
import type { Filter } from './todos'
import { useTodos } from './useTodos'
import './App.css'

const filters: Filter[] = ['All', 'Active', 'Completed']

function App() {
  const { todos, warning, mutate } = useTodos()
  const [filter, setFilter] = useState<Filter>('All')
  const [editing, setEditing] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState({ text: '', sequence: 0 })
  const addInput = useRef<HTMLInputElement>(null)
  const checkboxes = useRef(new Map<string, HTMLInputElement>())
  const editButtons = useRef(new Map<string, HTMLButtonElement>())
  const pendingFocus = useRef<(() => void) | null>(null)
  const visible = filterTodos(todos, filter)
  const remaining = remainingCount(todos)
  const completed = todos.length - remaining

  useLayoutEffect(() => {
    pendingFocus.current?.()
    pendingFocus.current = null
  })

  function announce(text: string) {
    setAnnouncement(previous => ({ text, sequence: previous.sequence + 1 }))
  }

  function focusAfterRemoval(ids: string[]) {
    const removedIndex = visible.findIndex(todo => ids.includes(todo.id))
    const survivors = visible.filter(todo => !ids.includes(todo.id))
    const next = survivors[Math.min(Math.max(removedIndex, 0), survivors.length - 1)]
    pendingFocus.current = () => {
      const target = (next ? checkboxes.current.get(next.id) : null) ?? addInput.current
      target?.focus()
    }
  }

  function finishEditing(id: string) {
    setEditing(null)
    pendingFocus.current = () => {
      const target = editButtons.current.get(id) ?? addInput.current
      target?.focus()
    }
  }

  const empty = todos.length === 0
    ? ['A little space for what’s next.', 'Add your first task above. One small step is a great start.']
    : filter === 'Active'
      ? ['All caught up.', 'No active tasks. Take a breath — you’ve earned it.']
      : ['Good things take small steps.', 'No completed tasks yet. Check one off when you’re ready.']

  return (
    <main className="app-shell">
      <header className="page-header">
        <div className="brand"><span className="brand-mark" aria-hidden="true">✓</span> A LITTLE EVERY DAY</div>
        <h1>Your day, a little clearer.</h1>
        <p>A simple place for your tasks. Room to focus on what matters.</p>
      </header>

      <section className="task-panel" aria-labelledby="list-heading">
        <div className="panel-heading">
          <div><p className="eyebrow">ONE THING AT A TIME</p><h2 id="list-heading">My tasks</h2></div>
          <span className="total-badge">{todos.length} {todos.length === 1 ? 'task' : 'tasks'}</span>
        </div>
        <TodoForm inputRef={addInput} onAdd={text => {
          mutate(current => addTodo(current, text, crypto.randomUUID()))
          announce('Task added.')
        }} />
        <div className="storage-notice" role="status">{warning && <p>{warning}</p>}</div>
        <div className="list-toolbar">
          <div className="filters" role="group" aria-label="Filter tasks">
            {filters.map(value => <button key={value} type="button" aria-pressed={filter === value}
              onClick={() => { setFilter(value); setEditing(null) }}>{value}</button>)}
          </div>
          <span className="progress-label">{completed} completed</span>
        </div>

        {visible.length > 0 ? <ul className="todo-list" aria-label="Tasks">
          {visible.map(todo => <TodoItem key={todo.id} todo={todo} editing={editing === todo.id}
            registerCheckbox={node => { if (node) checkboxes.current.set(todo.id, node); else checkboxes.current.delete(todo.id) }}
            registerEdit={node => { if (node) editButtons.current.set(todo.id, node); else editButtons.current.delete(todo.id) }}
            onEdit={() => setEditing(todo.id)}
            onCancel={() => { finishEditing(todo.id); announce('Edit cancelled.') }}
            onSave={text => {
              mutate(current => updateTodo(current, todo.id, text))
              finishEditing(todo.id)
              announce('Task updated.')
            }}
            onToggle={() => {
              if (filter !== 'All') focusAfterRemoval([todo.id])
              mutate(current => toggleTodo(current, todo.id))
              announce(todo.completed ? 'Task marked active.' : 'Task completed.')
            }}
            onDelete={() => {
              focusAfterRemoval([todo.id])
              mutate(current => deleteTodo(current, todo.id))
              announce('Task deleted.')
            }} />)}
        </ul> : <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">✓</span>
          <h3>{empty[0]}</h3><p>{empty[1]}</p>
        </div>}

        <footer className="panel-footer">
          <p><strong>{remaining}</strong> {remaining === 1 ? 'task' : 'tasks'} remaining</p>
          <button type="button" disabled={completed === 0} onClick={() => {
            focusAfterRemoval(todos.filter(todo => todo.completed).map(todo => todo.id))
            if (todos.some(todo => todo.id === editing && todo.completed)) setEditing(null)
            mutate(clearCompleted)
            announce('Completed tasks cleared.')
          }}>Clear completed</button>
        </footer>
      </section>
      <p className="page-note">Your list, your browser. No account needed.</p>
      <div className="sr-only" role="status" aria-atomic="true">
        <span key={announcement.sequence}>{announcement.text}</span>
      </div>
    </main>
  )
}

export default App
