![Loa Link Shortening Service](./repo-header.svg)

Link shortening service hosted on [loal.ink](https://loal.ink).

## Environment Variables

- `POSTGRES_HOST` – The hostname of the Postgres database to use.
- `POSTGRES_USER` – The username to use to connect to the database.
- `POSTGRES_PASS` – The password to use to connect to the database.
- `PASSWORD_HASH_SALT` – A secret string to use to salt the password hash algorithm.
- `TOKEN_ENCRYPTION_PRIVATE_KEY` – A private RSA key used for encryption of the authentication token.

## API

### `GET /healthz`

Health check endpoint.

#### Example Response

```json
{
  "message": "OK"
}
```
