const express = require('express');
const { todoListInst } = require('../../features/todoList');

const router = express.Router();

router.delete('/', async (req, res) => {
    const { id } = req.query;
    await todoListInst.deleteTodo(id);
    res.status(204).send();
});

module.exports = router;
