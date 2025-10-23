const express = require('express');
const { todoListInst } = require('../../features/todoList');

const router = express.Router();

router.get('/', async (req, res) => {
    const { id } = req.query;
    if (id) {
        const todoElem = await todoListInst.getTodo(id);
        if (todoElem) {
            res.status(201).send(todoElem);
        } else {
            res.status(404).send('Error: Element not found');
        }
    } else {
        const todoList = await todoListInst.getTodoList(id);
        res.status(201).send(todoList);
    }
});

module.exports = router;
