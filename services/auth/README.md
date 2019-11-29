![Loa Authentication Service](./repo-header.svg)

The hosted internal Authentication service.

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

### `POST /register`

User registration.

#### Example Request

```json
{
  "email": "email@example.com",
  "password": "some-password"
}
```

#### Example Response

```json
{
  "message": "OK",
  "token": "<<base64-encoded token>>"
}
```

### `POST /login`

User login.

#### Example Request

```json
{
  "email": "email@example.com",
  "password": "some-password"
}
```

#### Example Response

```json
{
  "message": "OK",
  "token": "<<base64-encoded token>>"
}
```

### `GET /whois`

User data inspection.

#### Example Request

```http
X-Token: <<base64-encoded token>>
```

#### Example Response

```json
{
  "message": "OK",
  "user": {
    "id": "xxxxxxxx-uuid-xxxx-xxxx-xxxxxxxxxxxx",
    "email": "email@example.com"
  },
  "secondsLeftUntilExpiry": 86627
}
```

### `GET /refresh`

Refreshing an authentication token.

#### Example Request

```http
X-Token: <<base64-encoded token>>
```

#### Example Response

```json
{
  "message": "OK",
  "token": "<<base64-encoded token>>"
}
```
