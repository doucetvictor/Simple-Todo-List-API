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
                throw new TodoListError('Error: a title is required');
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
}

const todoListInst = new TodoList();

module.exports = { TodoListError, todoListInst };
