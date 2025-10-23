const express = require('express');
const http = require('http');

const app = express();

app.use((req, res) => {
    res.status(404).send();
});

http.createServer(app).listen(8080, () => {
    console.log('Backend started!');
});
