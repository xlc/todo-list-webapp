import { useEffect, useId, useRef, useState } from 'react'
import type { Todo } from '../todos'

interface Props {
  todo: Todo
  editing: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: (text: string) => void
  onToggle: () => void
  onDelete: () => void
  registerCheckbox: (node: HTMLInputElement | null) => void
  registerEdit: (node: HTMLButtonElement | null) => void
}

function Editor({ text, onSave, onCancel }: Pick<Props, 'onSave' | 'onCancel'> & { text: string }) {
  const [draft, setDraft] = useState(text)
  const [error, setError] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const id = useId()
  useEffect(() => { input.current?.focus(); input.current?.select() }, [])

  return (
    <form className="edit-form" onSubmit={event => {
      event.preventDefault()
      if (!draft.trim()) {
        setError(true)
        input.current?.focus()
        return
      }
      onSave(draft)
    }} onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); onCancel() }
    }}>
      <label className="sr-only" htmlFor={id}>Edit task</label>
      <input id={id} ref={input} value={draft} aria-invalid={error}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={event => { setDraft(event.target.value); setError(false) }} />
      <div className="row-actions">
        <button className="primary" type="submit">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
      {error && <p id={`${id}-error`} className="error" role="alert">Task text cannot be empty.</p>}
    </form>
  )
}

export function TodoItem(props: Props) {
  const { todo, editing, onToggle, onEdit, onDelete, registerCheckbox, registerEdit } = props
  return (
    <li className={`todo-item${todo.completed ? ' is-complete' : ''}`}>
      {editing ? <Editor text={todo.text} onSave={props.onSave} onCancel={props.onCancel} /> : <>
        <label className="todo-label">
          <input type="checkbox" checked={todo.completed} onChange={onToggle} ref={registerCheckbox} />
          <span className="todo-text">{todo.text}</span>
        </label>
        <div className="row-actions">
          <button type="button" ref={registerEdit} aria-label={`Edit ${todo.text}`} onClick={onEdit}>Edit</button>
          <button type="button" className="delete" aria-label={`Delete ${todo.text}`} onClick={onDelete}>Delete</button>
        </div>
      </>}
    </li>
  )
}
