/*
    Router for handling creation of new todo items.
    Expects a body with 'title' and optional 'completed' fields.
    Responds with the created todo item and a 201 status code.
 */

const express = require('express');
const { todoListInst } = require('../../features/todoList');

const router = express.Router();

router.post('/', async (req, res) => {
    const { title, completed } = req.body;
    const todoElem = await todoListInst.addTodo(title, completed);
    res.status(201).send(todoElem);
});

module.exports = router;
