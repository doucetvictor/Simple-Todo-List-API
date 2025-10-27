/*
    Module for managing a todo list with concurrency control.
    Uses async-mutex to ensure thread-safe operations.
    Defines a TodoList class with methods to add, get, update, and delete todo items.
    Also defines a custom error class TodoListError for handling specific errors.
    Exports an instance of TodoList for use in other parts of the application.
 */

const { Mutex } = require('async-mutex');

let checkTitle = (title) => {
    title = title.trim();
    if (title.length === 0) {
        throw new TodoListError('Error: Title cannot be blank');
    }
}

class TodoListError extends Error {
    constructor(message, code = 400) {
        super(message);
        this.name = 'TodoListError';
        this.code = code;
    }
}

class TodoList {
    constructor() {
        this.todoList = [];
        this.index = 0;
        this.mutex = new Mutex();
    }

    async addTodo(title, completed) {
        const release = await this.mutex.acquire();
        try {
            if (!title) {
                throw new TodoListError('Error: Title is required');
            }
            checkTitle(title);
            const todoElem = {
                id: ++this.index,
                title: title,
                completed: completed === true,
                createdAt: new Date().toISOString()
            };
            this.todoList.push(todoElem);
            return todoElem;
        } finally {
            release();
        }
    }

    async getTodo(id) {
        const release = await this.mutex.acquire();
        try {
            const todoElem = this.todoList.find(elem => elem.id == id);
            if (!todoElem) {
                throw new TodoListError('Error: Element not found', 404);
            }
            return todoElem;
        } finally {
            release();
        }
    }

    async getTodoList(id) {
        const release = await this.mutex.acquire();
        try {
            return this.todoList;
        } finally {
            release();
        }
    }

    async updateTodo(id, title, completed) {
        const release = await this.mutex.acquire();
        try {
            let todoElem = this.todoList.find(elem => elem.id == id);
            if (!todoElem) {
                throw new TodoListError('Error: Element not found', 404);
            }
            if (title) {
                checkTitle(title);
                todoElem.title = title;
            }
            todoElem.completed = completed === true;
            return todoElem;
        } finally {
            release();
        }
    }

    async deleteTodo(id) {
        const release = await this.mutex.acquire();
        try {
            const todoListLength = this.todoList.length;
            this.todoList = this.todoList.filter(elem => elem.id != id);
            if (this.todoList.length === todoListLength) {
                throw new TodoListError('Error: Element not found', 404);
            }
        } finally {
            release();
        }
    }
}

const todoListInst = new TodoList();

module.exports = { TodoListError, todoListInst };
