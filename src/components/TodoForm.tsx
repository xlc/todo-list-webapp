import { useState } from 'react'
import type { RefObject } from 'react'

interface Props {
  inputRef: RefObject<HTMLInputElement | null>
  onAdd: (text: string) => void
}

export function TodoForm({ inputRef, onAdd }: Props) {
  const [text, setText] = useState('')
  const [error, setError] = useState(false)

  return (
    <form className="add-form" onSubmit={event => {
      event.preventDefault()
      if (!text.trim()) {
        setError(true)
        inputRef.current?.focus()
        return
      }
      onAdd(text)
      setText('')
      setError(false)
      inputRef.current?.focus()
    }}>
      <label htmlFor="new-todo">What would you like to get done?</label>
      <div className="add-controls">
        <input id="new-todo" ref={inputRef} value={text}
          placeholder="Add a task, make a little progress…" autoComplete="off"
          aria-invalid={error} aria-describedby={error ? 'add-error' : undefined}
          onChange={event => { setText(event.target.value); setError(false) }} />
        <button className="primary" type="submit"><span aria-hidden="true">＋</span> Add task</button>
      </div>
      {error && <p className="error" id="add-error" role="alert">Give your task a name first.</p>}
    </form>
  )
}
