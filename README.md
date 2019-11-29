![Loa Hosted Service](./repo-header.svg)

The hosted services for Loa tooling.

## Services

- [www](./services/www) – Public Web UI
- [api](./services/api) – Public API, exposing the internal services through a GraphQL server
- [auth](./services/auth) – Internal authentication service
- [pkg](./services/pkg) – Internal package manager service
- [search](./services/search) – Internal search service

## Development

```shell
# Start all services in dev mode
$ sh infra/dev.sh up

# Start only selected services
$ sh infra/dev.sh up api pkg postgres
```

In development, the services will be exposed on these ports:

- `www` – [:8090](https://localhost:8090)
- `api` – [:8091](https://localhost:8091)
- `auth` – [:8092](https://localhost:8092)
- `search` – [:8093](https://localhost:8093)
- `pkg` – [:8094](https://localhost:8094)

Also, in development, a local database will be spun up as:

- `postgres` – [:5432](https://localhost:5432)
