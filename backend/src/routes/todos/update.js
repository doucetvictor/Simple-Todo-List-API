const express = require('express');
const { todoListInst } = require('../../features/todoList');

const router = express.Router();

router.put('/', async (req, res) => {
    const { id, title, completed } = req.body;
    const todoElem = await todoListInst.updateTodo(id, title, completed);
    res.status(200).send(todoElem);
});

module.exports = router;
