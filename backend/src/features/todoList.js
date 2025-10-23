const { Mutex } = require('async-mutex');

let checkTitle = (title) => {
    title = title.trim();
    if (title.length === 0) {
        throw new TodoListError('Error: Title cannot be blank');
    }
}

class TodoListError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TodoListError';
        this.code = 400;
    }

    constructor(code, message) {
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
                throw new TodoListError(404, 'Error: Element not found');
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
                throw new TodoListError(404, 'Error: Element not found');
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
}

const todoListInst = new TodoList();

module.exports = { TodoListError, todoListInst };
