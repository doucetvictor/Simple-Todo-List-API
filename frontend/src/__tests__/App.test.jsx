import { vi } from 'vitest'
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react'
import '@testing-library/jest-dom'

// mock the service before importing the app so mocks are effective
vi.mock('../api/todoService', () => ({
  getAllTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn()
}))

import App from '../App'
import * as api from '../api/todoService'

beforeEach(() => {
  vi.resetAllMocks()
})

test('loads and displays todos', async () => {
  api.getAllTodos.mockResolvedValue([
    { id: '1', title: 'Task 1', completed: false, createdAt: new Date().toISOString() }
  ])
  render(<App />)
  expect(screen.getByText(/Loading your todos/i)).toBeInTheDocument()
  await waitFor(() => expect(screen.getByText('Task 1')).toBeInTheDocument())
  expect(screen.getByText(/In Progress \(\d+\)/)).toBeInTheDocument()
})

test('adds a todo', async () => {
  api.getAllTodos.mockResolvedValue([])
  const newTodo = { id: '2', title: 'New task', completed: false, createdAt: new Date().toISOString() }
  api.createTodo.mockResolvedValue(newTodo)
  render(<App />)
  await waitFor(() => expect(screen.queryByText(/Loading your todos/i)).not.toBeInTheDocument())
  fireEvent.change(screen.getByPlaceholderText(/Add a new task/i), { target: { value: newTodo.title } })
  fireEvent.click(screen.getByText(/Add Task/i))
  await waitFor(() => expect(screen.getByText(newTodo.title)).toBeInTheDocument())
})

test('edits a todo title (click title -> edit -> Enter)', async () => {
  const todo = { id: '3', title: 'Edit me', completed: false, createdAt: new Date().toISOString() }
  api.getAllTodos.mockResolvedValue([todo])
  api.updateTodo.mockResolvedValue({ ...todo, title: 'Edited' })
  render(<App />)
  await waitFor(() => expect(screen.getByText('Edit me')).toBeInTheDocument())
  fireEvent.click(screen.getByText('Edit me'))
  const input = screen.getByDisplayValue('Edit me')
  fireEvent.change(input, { target: { value: 'Edited' } })
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
  await waitFor(() => expect(screen.getByText('Edited')).toBeInTheDocument())
})

test('toggles status via button moves item to Completed', async () => {
  const todo = { id: '4', title: 'Toggle me', completed: false, createdAt: new Date().toISOString() }
  api.getAllTodos.mockResolvedValue([todo])
  api.updateTodo.mockResolvedValue({ ...todo, completed: true })
  render(<App />)
  await waitFor(() => expect(screen.getByText('Toggle me')).toBeInTheDocument())
  const item = screen.getByText('Toggle me').closest('.todo-item')
  const { getByText: getByTextWithin } = within(item)
  fireEvent.click(getByTextWithin(/✓ Complete/i))
  await waitFor(() => expect(screen.getByText(/Completed \(\d+\)/)).toBeInTheDocument())
})

test('deletes a todo removes it from the list', async () => {
  const todo = { id: '5', title: 'Delete me', completed: false, createdAt: new Date().toISOString() }
  api.getAllTodos.mockResolvedValue([todo])
  api.deleteTodo.mockResolvedValue({})
  render(<App />)
  await waitFor(() => expect(screen.getByText('Delete me')).toBeInTheDocument())
  const item = screen.getByText('Delete me').closest('.todo-item')
  const { getByText: getByTextWithin } = within(item)
  fireEvent.click(getByTextWithin('🗑️'))
  await waitFor(() => expect(screen.queryByText('Delete me')).not.toBeInTheDocument())
})
