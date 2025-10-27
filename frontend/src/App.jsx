/*
  Main application component for the Simple Todo List API frontend.
  Handles displaying, adding, editing, deleting, and drag-and-drop of todo items.
 */

import { useState, useEffect } from 'react'
import './App.css'
import { getAllTodos, createTodo, updateTodo, deleteTodo as deleteTodoAPI } from './api/todoService'

function App() {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addingTodo, setAddingTodo] = useState(false)
  const [draggedTodo, setDraggedTodo] = useState(null)
  const [dragOverSection, setDragOverSection] = useState(null)
  const [touchStartY, setTouchStartY] = useState(null)
  const [isMobile, setIsMobile] = useState(false)

  // Add edit-related state
  const [editingTodoId, setEditingTodoId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingSaving, setEditingSaving] = useState(false)

  // Load todos from backend on component mount
  useEffect(() => {
    loadTodos()
  }, [])

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const loadTodos = async () => {
    try {
      setLoading(true)
      const todosData = await getAllTodos()
      setTodos(todosData)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Failed to load todos:', err)
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async () => {
    if (addingTodo) return

    try {
      setAddingTodo(true)
      const todoData = {
        title: newTodo.trim(),
        completed: false
      }
      const newTodoItem = await createTodo(todoData)
      setTodos([...todos, newTodoItem])
      setNewTodo('')
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Failed to create todo:', err)
    } finally {
      setAddingTodo(false)
    }
  }

  const toggleStatus = async (id) => {
    try {
      const todo = todos.find(t => t.id === id)
      if (!todo) return

      const updatedTodo = await updateTodo(id, { ...todo, completed: !todo.completed })

      setTodos(todos.map(t =>
        t.id === id ? updatedTodo : t
      ))
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Failed to update todo:', err)
    }
  }

  const deleteTodo = async (id) => {
    try {
      await deleteTodoAPI(id)
      setTodos(todos.filter(todo => todo.id !== id))
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Failed to delete todo:', err)
    }
  }

  // New: edit handlers
  const startEdit = (todo) => {
    setEditingTodoId(todo.id)
    setEditingTitle(todo.title || '')
  }

  const cancelEdit = () => {
    setEditingTodoId(null)
    setEditingTitle('')
    setEditingSaving(false)
  }

  const handleEditChange = (e) => {
    setEditingTitle(e.target.value)
  }

  const handleEditKeyDown = async (e, todo) => {
    if (e.key === 'Enter') {
      await saveEdit(todo)
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  const saveEdit = async (todo) => {
    if (!editingTodoId || editingSaving) return
    const trimmed = editingTitle.trim()
    if (!trimmed || trimmed === todo.title) {
      // nothing to do
      cancelEdit()
      return
    }

    try {
      setEditingSaving(true)
      const updatedTodo = await updateTodo(todo.id, { ...todo, title: trimmed })
      setTodos(todos.map(t => (t.id === todo.id ? updatedTodo : t)))
      cancelEdit()
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Failed to update todo title:', err)
      setEditingSaving(false)
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e, todo) => {
    setDraggedTodo(todo)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target.outerHTML)
  }

  const handleDragEnd = () => {
    setDraggedTodo(null)
    setDragOverSection(null)
  }

  const handleDragOver = (e, section) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverSection(section)
  }

  const handleDragLeave = (e) => {
    // Only clear if we're leaving the section entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverSection(null)
    }
  }

  const handleDrop = async (e, targetSection) => {
    e.preventDefault()

    if (!draggedTodo) return

    const newStatus = targetSection === 'in-progress' ? false : true

    // Don't update if the status is already correct
    if (draggedTodo.completed === newStatus) {
      setDragOverSection(null)
      return
    }

    try {
      const updatedTodo = await updateTodo(draggedTodo.id, {
        ...draggedTodo,
        completed: newStatus
      })

      setTodos(todos.map(t =>
        t.id === draggedTodo.id ? updatedTodo : t
      ))
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Failed to update todo:', err)
    } finally {
      setDragOverSection(null)
    }
  }

  // Mobile touch handlers
  const handleTouchStart = (e, todo) => {
    if (!isMobile) return
    setTouchStartY(e.touches[0].clientY)
    setDraggedTodo(todo)
  }

  const handleTouchMove = (e) => {
    if (!isMobile || !draggedTodo) return
    e.preventDefault()

    const touchY = e.touches[0].clientY
    const touchX = e.touches[0].clientX

    // Determine which section the touch is over
    const elementBelow = document.elementFromPoint(touchX, touchY)
    const section = elementBelow?.closest('.todo-section')

    if (section) {
      const sectionClass = section.classList.contains('in-progress') ? 'in-progress' : 'completed'
      setDragOverSection(sectionClass)
    }
  }

  const handleTouchEnd = async (e) => {
    if (!isMobile || !draggedTodo) return

    const touchY = e.changedTouches[0].clientY
    const touchX = e.changedTouches[0].clientX

    // Determine which section the touch ended over
    const elementBelow = document.elementFromPoint(touchX, touchY)
    const section = elementBelow?.closest('.todo-section')

    if (section && dragOverSection) {
      const targetSection = section.classList.contains('in-progress') ? 'in-progress' : 'completed'
      const newStatus = targetSection === 'in-progress' ? false : true

      // Don't update if the status is already correct
      if (draggedTodo.completed !== newStatus) {
        try {
          const updatedTodo = await updateTodo(draggedTodo.id, {
            ...draggedTodo,
            completed: newStatus
          })

          setTodos(todos.map(t =>
            t.id === draggedTodo.id ? updatedTodo : t
          ))
          setError(null)
        } catch (err) {
          setError(err.message)
          console.error('Failed to update todo:', err)
        }
      }
    }

    setDraggedTodo(null)
    setDragOverSection(null)
    setTouchStartY(null)
  }

  const inProgressTodos = todos.filter(todo => !todo.completed)
  const completedTodos = todos.filter(todo => todo.completed)

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return ''

    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your todos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📝 Simple Todo List API</h1>
        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
          </div>
        )}
        <div className="add-todo">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            placeholder="Add a new task..."
            className="todo-input"
            disabled={addingTodo}
          />
          <button
            onClick={addTodo}
            className="add-button"
            disabled={addingTodo}
          >
            {addingTodo ? 'Adding...' : 'Add Task'}
          </button>
        </div>
      </header>

      <main className="todo-container">
        <div
          className={`todo-section ${dragOverSection === 'in-progress' ? 'drag-over' : ''}`}
          onDragOver={(e) => handleDragOver(e, 'in-progress')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'in-progress')}
        >
          <h2>🚧 In Progress ({inProgressTodos.length})</h2>
          <div className="todo-list">
            {inProgressTodos.map(todo => (
              <div
                key={todo.id}
                className={`todo-item in-progress ${draggedTodo?.id === todo.id ? 'dragging' : ''}`}
                draggable={!isMobile && (!editingTodoId || editingSaving)}
                onDragStart={(e) => handleDragStart(e, todo)}
                onDragEnd={handleDragEnd}
                onTouchStart={(e) => handleTouchStart(e, todo)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="todo-content">
                  {editingTodoId === todo.id ? (
                    <input
                      className="edit-input"
                      value={editingTitle}
                      onChange={handleEditChange}
                      onKeyDown={(e) => handleEditKeyDown(e, todo)}
                      onBlur={() => saveEdit(todo)}
                      autoFocus
                      disabled={editingSaving}
                    />
                  ) : (
                    <span
                      className="todo-text"
                      role="button"
                      tabIndex={0}
                      title="Click to edit"
                      onClick={() => startEdit(todo)}
                      onKeyDown={(e) => { if (e.key === 'Enter') startEdit(todo) }}
                    >
                      {todo.title}
                    </span>
                  )}
                  {todo.createdAt && (
                    <span className="todo-date">Created {formatDate(todo.createdAt)}</span>
                  )}
                </div>
                <div className="todo-actions">
                  <button
                    onClick={() => toggleStatus(todo.id)}
                    className="complete-btn"
                  >
                    ✓ Complete
                  </button>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="delete-btn"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            {inProgressTodos.length === 0 && (
              <p className="empty-state">No tasks in progress</p>
            )}
          </div>
        </div>

        <div
          className={`todo-section ${dragOverSection === 'completed' ? 'drag-over' : ''}`}
          onDragOver={(e) => handleDragOver(e, 'completed')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'completed')}
        >
          <h2>✅ Completed ({completedTodos.length})</h2>
          <div className="todo-list">
            {completedTodos.map(todo => (
              <div
                key={todo.id}
                className={`todo-item completed ${draggedTodo?.id === todo.id ? 'dragging' : ''}`}
                draggable={!isMobile && (!editingTodoId || editingSaving)}
                onDragStart={(e) => handleDragStart(e, todo)}
                onDragEnd={handleDragEnd}
                onTouchStart={(e) => handleTouchStart(e, todo)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="todo-content">
                  {editingTodoId === todo.id ? (
                    <input
                      className="edit-input"
                      value={editingTitle}
                      onChange={handleEditChange}
                      onKeyDown={(e) => handleEditKeyDown(e, todo)}
                      onBlur={() => saveEdit(todo)}
                      autoFocus
                      disabled={editingSaving}
                    />
                  ) : (
                    <span
                      className="todo-text"
                      role="button"
                      tabIndex={0}
                      title="Click to edit"
                      onClick={() => startEdit(todo)}
                      onKeyDown={(e) => { if (e.key === 'Enter') startEdit(todo) }}
                    >
                      {todo.title}
                    </span>
                  )}
                  {todo.createdAt && (
                    <span className="todo-date">Created {formatDate(todo.createdAt)}</span>
                  )}
                </div>
                <div className="todo-actions">
                  <button
                    onClick={() => toggleStatus(todo.id)}
                    className="reopen-btn"
                  >
                    ↻ Reopen
                  </button>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="delete-btn"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            {completedTodos.length === 0 && (
              <p className="empty-state">No completed tasks</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
