# Endpoints API Documentation

## POST /v1/todos

Create a new todo item

**Request body**

```
{
  "title": string,
  "completed?": boolean
}
```

**Responses**

| Code | Description                | Response                                                                      |
|------|----------------------------|-------------------------------------------------------------------------------|
| 201  | todo created               | { "id": number, "title": string, "completed": boolean, "createdAt": date }    |
| 400  | todo creation failed       | Error: Title is required                                                      |

## GET /v1/todos

Get all todo items

**Response**

| Code | Description                | Response                                                                            |
|------|----------------------------|-------------------------------------------------------------------------------------|
| 200  | todo list retrieved        | [{ "id": number, "title": string, "completed": boolean, "createdAt": date }, ...]   |

## GET /v1/todos

Get a specific todo item

**Parameters**

```
id: number
```

**Responses**

| Code | Description                | Response                                                                      |
|------|----------------------------|-------------------------------------------------------------------------------|
| 200  | todo item retrieved        | { "id": number, "title": string, "completed": boolean, "createdAt": date }    |
| 404  | todo item not found        | Error: Element not found                                                      |

## PUT /v1/todos

Update a todo item

**Request body**

```
{
  "title?": string,
  "completed?": boolean
}
```

**Responses**

| Code | Description                | Response                                                                      |
|------|----------------------------|-------------------------------------------------------------------------------|
| 200  | todo updated               | { "id": number, "title": string, "completed": boolean, "createdAt": date }    |
| 400  | todo update failed         | Error: Title is required                                                      |

## DELETE /v1/todos

Delete a todo item

**Parameters**

```
id: number
```

**Responses**

| Code | Description                | Response                  |
|------|----------------------------|---------------------------|
| 204  | todo item retrieved        |                           |
| 404  | todo item not found        | Error: Element not found  |
