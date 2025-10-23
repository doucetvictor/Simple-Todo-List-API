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
