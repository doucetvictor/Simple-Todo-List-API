const { Mutex } = require('async-mutex');

class TodoListError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TodoListError';
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
            title = title.trim();
            if (title.length === 0) {
                throw new TodoListError('Error: Title cannot be blank');
            }
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
            if (todoElem) {
                return todoElem;
            }
            return null;
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
}

const todoListInst = new TodoList();

module.exports = { TodoListError, todoListInst };
