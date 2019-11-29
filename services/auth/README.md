![Loa Authentication Service](./repo-header.svg)

The hosted internal Authentication service.

## Environment Variables

- `POSTGRES_HOST` – The hostname of the Postgres database to use.
- `POSTGRES_USER` – The username to use to connect to the database.
- `POSTGRES_PASS` – The password to use to connect to the database.
- `PASSWORD_HASH_SALT` – A secret string to use to salt the password hash algorithm.
- `TOKEN_ENCRYPTION_PRIVATE_KEY` – A private RSA key used for encryption of the authentication token.
