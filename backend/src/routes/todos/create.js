const express = require('express');
const { TodoListError, todoListInst } = require('../../features/todoList');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { title, completed } = req.body;
        const todoElem = await todoListInst.addTodo(title, completed);
        res.status(201).send(todoElem);
    } catch (err) {
        if (err instanceof TodoListError) {
            res.status(400).send(err.message);
        } else {
            console.error(err);
            res.status(500).send();
        }
    }
});

module.exports = router;
