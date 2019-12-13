![Loa Search Service](./repo-header.svg)

The hosted internal Search service.

## Environment Variables

- `ALGOLIA_APPLICATION_ID` – The ID of an Algolia application.
- `ALGOLIA_INDEX` – The name of the index to use.
- `ALGOLIA_ADMIN_KEY` – An auth key giving permission to read and write from the index.
- `AMQP_URL` – The URL for the messaging queue.

## API

### `GET /healthz`

Health check endpoint.

#### Example Response

```json
{
  "message": "OK"
}
```

### `GET /search?term={term}&limit={limit}&offset={offset}`

Global search.

#### Example Request

```http
GET /search?term=My&limit=2&offset=0 HTTP/1.1
```

#### Example Response

```json
{
  "count": 12,
  "results": [
    {
      "__type": "PACKAGE",
      "name": "My/Package"
    },
    {
      "__type": "CLASS_DOC",
      "simpleName": "MyClass",
      "qualifiedName": "My/Package/MyClass"
    }
  ]
}
```
