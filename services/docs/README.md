![Loa Documentation Service](./repo-header.svg)

Hosted generated documentation of packages and standard library.

## Environment Variables

- `REDIS_HOST` – The host for Redis.
- `REDIS_PORT` – The port for Redis.
- `REDIS_PASS` – The password for Redis.
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

### `GET /root-namespaces`

Gets all root namespaces available in the docs.

#### Example Response

```json
{
  "message": "OK",
  "namespaces": ["Loa", "SomePackage", "OtherRoot"]
}
```
