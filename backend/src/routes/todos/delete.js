/*
    Router for handling deletion of todo items.
    Expects an 'id' query parameter to identify the todo item to delete.
    Responds with a 204 No Content status code upon successful deletion.
 */

const express = require('express');
const { todoListInst } = require('../../features/todoList');

const router = express.Router();

router.delete('/', async (req, res) => {
    const { id } = req.query;
    await todoListInst.deleteTodo(id);
    res.status(204).send();
});

module.exports = router;
