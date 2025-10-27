/*
    Router for handling retrieval of todo items.
    Supports fetching a single todo by 'id' query parameter or all todos if no 'id' is provided.
    Responds with the requested todo item(s) and a 200 status code.
 */

const express = require('express');
const { todoListInst } = require('../../features/todoList');

const router = express.Router();

router.get('/', async (req, res) => {
    const { id } = req.query;
    if (id) {
        const todoElem = await todoListInst.getTodo(id);
        res.status(200).send(todoElem);
    } else {
        const todoList = await todoListInst.getTodoList(id);
        res.status(200).send(todoList);
    }
});

module.exports = router;
