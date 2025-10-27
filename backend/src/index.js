const express = require('express');
const http = require('http');
const cors = require('cors');
const { TodoListError } = require('./features/todoList');

const app = express();

/*
    CORS (Cross-Origin Resource Sharing) middleware configuration.
    For security reasons, browsers restrict cross-origin HTTP requests initiated from scripts.
    Allows requests from the specified origin defined in environment variable CORS_ORIGIN,
    or defaults to "http://localhost:5173" if not set.
 */
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173"
}));

/*
    This is a built-in middleware function in Express.
    It parses incoming requests with JSON payloads and is based on body-parser.
 */
app.use(express.json());

/*
    This is a built-in middleware function in Express.
    It parses incoming requests with URL-encoded payloads and is based on body-parser.
 */
app.use(express.urlencoded());

/*
    Custom middleware to ensure that POST and PUT requests contain a body.
    If the body is missing, it responds with a 400 Bad Request status code.
 */
app.use((req, res, next) => {
    if ((req.method === 'POST' || req.method === 'PUT') && !req.body) {
        res.status(400).send('Error: Request body is required');
    } else {
        next();
    }
});

/*
    Route handling for /v1/todos endpoint.
    All requests to this endpoint are forwarded to the router defined in ./routes/todos/index.js.
 */
app.use('/v1/todos', require('./routes/todos/index'));

/*
    404 Not Found handler for unmatched routes.
    If no route matches the incoming request, this middleware responds with a 404 status code.
 */
app.use((req, res) => {
    res.status(404).send();
});

/*
    Global error handling middleware.
    Catches errors thrown in the application and responds with appropriate status codes and messages.
 */
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

/*
    Start the HTTP server on port 8080.
    Logs a message to the console once the server is running.
 */
http.createServer(app).listen(8080, () => {
    console.log('Backend started!');
});
