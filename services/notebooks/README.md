![Loa Code Notebooks Service](./repo-header.svg)

The hosted internal service for storage of Code Notebooks.

## Environment Variables

- `POSTGRES_HOST` – The hostname of the Postgres database to use.
- `POSTGRES_USER` – The username to use to connect to the database.
- `POSTGRES_PASS` – The password to use to connect to the database.

## API

### `GET /healthz`

Health check endpoint.

#### Example Response

```json
{
  "message": "OK"
}
```
