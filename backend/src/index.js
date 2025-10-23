const express = require('express');
const http = require('http');

const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use((req, res, next) => {
    if (req.method === 'POST' && !req.body) {
        res.status(400).send('Error: Request body is required');
    } else {
        next();
    }
});

app.use('/v1/todos', require('./routes/todos/index'));

app.use((req, res) => {
    res.status(404).send();
});

http.createServer(app).listen(8080, () => {
    console.log('Backend started!');
});
