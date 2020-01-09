![Loa Link Shortening Service](./repo-header.svg)

Link shortening service hosted on [loal.ink](https://loal.ink).

## Environment Variables

- `POSTGRES_HOST` – The hostname of the Postgres database to use.
- `POSTGRES_PORT` – The port to use to connect to the database.
- `POSTGRES_USER` – The username to use to connect to the database.
- `POSTGRES_PASS` – The password to use to connect to the database.
- `POSTGRES_CA_CERT` – Path to CA certificate **[prod only]**

## API

### `POST /`

Register link.

#### Example Request

```json
{
  "id": "this-is-a-string",
  "target": "https://loalang.xyz/some/longer/path/probably"
}
```

Responds with HTML body (so don't attempt to parse it as JSON), with the following status codes:

- `201` - Link was created.
- `422` - ID is already in use.

### `GET /{id}`

Use link.

#### Example Request

```http
GET /this-is-a-string HTTP/1.1
```

#### Example Response

```http
HTTP/1.1 301 Moved Permanently
Location: https://loalang.xyz/some/longer/path/probably
```

Responds with `404` if the ID is not in use.
