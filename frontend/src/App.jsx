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

  // Load todos from backend on component mount
  useEffect(() => {
    loadTodos()
  }, [])

  const loadTodos = async () => {
    try {
      setLoading(true)
      setError(null)
      const todosData = await getAllTodos()
      setTodos(todosData)
    } catch (err) {
      setError(err.message)
      console.error('Failed to load todos:', err)
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async () => {
    if (!newTodo.trim() || addingTodo) return

    try {
      setAddingTodo(true)
      setError(null)
      const todoData = {
        title: newTodo.trim(),
        completed: false
      }
      const newTodoItem = await createTodo(todoData)
      setTodos([...todos, newTodoItem])
      setNewTodo('')
    } catch (err) {
      setError(err.message)
      console.error('Failed to create todo:', err)
    } finally {
      setAddingTodo(false)
    }
  }

  const toggleStatus = async (id) => {
    try {
      setError(null)
      const todo = todos.find(t => t.id === id)
      if (!todo) return

      const updatedTodo = await updateTodo(id, { ...todo, completed: !todo.completed })
      
      setTodos(todos.map(t => 
        t.id === id ? updatedTodo : t
      ))
    } catch (err) {
      setError(err.message)
      console.error('Failed to update todo:', err)
    }
  }

  const deleteTodo = async (id) => {
    try {
      setError(null)
      await deleteTodoAPI(id)
      setTodos(todos.filter(todo => todo.id !== id))
    } catch (err) {
      setError(err.message)
      console.error('Failed to delete todo:', err)
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
      setError(null)
      const updatedTodo = await updateTodo(draggedTodo.id, { 
        ...draggedTodo, 
        completed: newStatus 
      })
      
      setTodos(todos.map(t => 
        t.id === draggedTodo.id ? updatedTodo : t
      ))
    } catch (err) {
      setError(err.message)
      console.error('Failed to update todo:', err)
    } finally {
      setDragOverSection(null)
    }
  }

  const inProgressTodos = todos.filter(todo => !todo.completed)
  const completedTodos = todos.filter(todo => todo.completed)

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
            <button onClick={loadTodos} className="retry-btn">Retry</button>
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
            disabled={addingTodo || !newTodo.trim()}
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
                draggable
                onDragStart={(e) => handleDragStart(e, todo)}
                onDragEnd={handleDragEnd}
              >
                <span className="todo-text">{todo.title}</span>
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
                draggable
                onDragStart={(e) => handleDragStart(e, todo)}
                onDragEnd={handleDragEnd}
              >
                <span className="todo-text">{todo.title}</span>
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
