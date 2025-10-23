const express = require('express');
const { todoListInst } = require('../../features/todoList');

const router = express.Router();

router.post('/', async (req, res) => {
    const { title, completed } = req.body;
    const todoElem = await todoListInst.addTodo(title, completed);
    res.status(201).send(todoElem);
});

module.exports = router;
