const express = require('express');
const http = require('http');
const cors = require('cors');
const { TodoListError } = require('./features/todoList');

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173"
}));

app.use(express.json());
app.use(express.urlencoded());
app.use((req, res, next) => {
    if ((req.method === 'POST' || req.method === 'PUT') && !req.body) {
        res.status(400).send('Error: Request body is required');
    } else {
        next();
    }
});

app.use('/v1/todos', require('./routes/todos/index'));

app.use((req, res) => {
    res.status(404).send();
});

app.use((err, req, res, next) => {
    if (err instanceof TodoListError) {
        res.status(err.code).send(err.message);
    } else if (err instanceof SyntaxError) {
        res.status(400).send();
    } else {
        console.error(err);
        res.status(500).send();
    }
});

http.createServer(app).listen(8080, () => {
    console.log('Backend started!');
});
