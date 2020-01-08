![Loa Code Notebooks Service](./repo-header.svg)

The hosted internal service for storage of Code Notebooks.

## Environment Variables

- `POSTGRES_HOST` – The hostname of the Postgres database to use.
- `POSTGRES_PORT` – The port to use to connect to the database.
- `POSTGRES_USER` – The username to use to connect to the database.
- `POSTGRES_PASS` – The password to use to connect to the database.
- `POSTGRES_CA_CERT` – Path to CA certificate **[prod only]**

## API

### `GET /healthz`

Health check endpoint.

#### Example Response

```json
{
  "message": "OK"
}
```

### `POST /notebooks`

Upsert a notebook. `title` and `blocks` fields optional in patch.

#### Example Request

```json
{
  "id": "90995692-b2e3-46f6-84ee-084e5b899251",
  "author": "b959bf66-03cc-4675-ac77-4eb94975be3a"
}
```

#### Example Response

```json
{
  "message": "OK",
  "notebook": {
    "id": "90995692-b2e3-46f6-84ee-084e5b899251",
    "title": "",
    "author": "b959bf66-03cc-4675-ac77-4eb94975be3a",
    "createdAt": "2020-01-07T15:29:22.104Z",
    "updatedAt": "2020-01-07T15:29:22.104Z",
    "blocks": []
  }
}
```

### `GET /notebooks/{id}`

Get a notebook by ID.

#### Example Response

```json
{
  "message": "OK",
  "notebook": {
    "id": "b1948777-0812-4376-a205-81ff95312221",
    "title": "Some Notebook",
    "author": "e1611d87-dd2f-420f-91ba-dcb073bb7e76",
    "createdAt": "2020-01-07T15:29:22.104Z",
    "updatedAt": "2020-01-07T15:29:22.104Z",
    "blocks": [
      {
        "__type": "TEXT",
        "id": "c91cca0c-11c6-4947-bf7a-61670460bdf8",
        "text": "Here is an example of a class:"
      },
      {
        "__type": "CODE",
        "id": "db945a67-cb49-493e-99a9-3395cfec08c5",
        "code": "class Test.\n\nTest."
      }
    ]
  }
}
```

### `GET /notebooks?author={authorId}`

Get all notebooks by an author.

#### Example Request

```http
GET /notebooks?author=e1611d87-dd2f-420f-91ba-dcb073bb7e76 HTTP/1.1
```

#### Example Response

```json
{
  "message": "OK",
  "notebooks": [
    {
      "id": "b1948777-0812-4376-a205-81ff95312221",
      "title": "Some Notebook",
      "author": "e1611d87-dd2f-420f-91ba-dcb073bb7e76",
      "createdAt": "2020-01-07T15:29:22.104Z",
      "updatedAt": "2020-01-07T15:29:22.104Z",
      "blocks": [
        {
          "__type": "TEXT",
          "id": "c91cca0c-11c6-4947-bf7a-61670460bdf8",
          "text": "Here is an example of a class:"
        },
        {
          "__type": "CODE",
          "id": "db945a67-cb49-493e-99a9-3395cfec08c5",
          "code": "class Test.\n\nTest."
        }
      ]
    }
  ]
}
```
