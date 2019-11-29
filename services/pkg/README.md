![Loa Package Manager](./repo-header.svg)

The hosted internal Package Manager service.

## Environment Variables

- `POSTGRES_HOST` – The hostname of the Postgres database to use.
- `POSTGRES_USER` – The username to use to connect to the database.
- `POSTGRES_PASS` – The password to use to connect to the database.
- `GOOGLE_APPLICATION_CREDENTIALS` – Path to a Google Cloud Service Account JSON file with write permissions to Cloud Storage.
- `AMQP_URL` – An `amqp:` URL for producing notification messages.

## API

### `GET /healthz`

Health check endpoint.

#### Example Response

```json
{
  "message": "OK"
}
```

### `PUT /packages/{package_name}?version={version}`

Package publication, or the publication of a new version of an existing package.

#### Example Request

```http
PUT /packages/My/Package?version=1.0.0 HTTP/1.1

X-Publisher-Id: xxxxxxxx-uuid-xxxx-xxxx-xxxxxxxxxxxx
Content-Type: application/tar+gzip

<<tar archive>>
```

> **Note:** The `pkg` service does not check the authenticity of the publisher ID. However, it does check that the publisher is authorized to publish a version of the named package.

#### Example Response

```json
{
  "message": "OK",
  "pkg": {
    "id": "yyyyyyyy-uuid-yyyy-yyyy-yyyyyyyyyyyy",
    "name": "My/Package",
    "versions": [
      {
        "version": "1.0.0",
        "url": "https://cdn-url-to/tarball-1.0.0.tar.gz",
        "published": "2019-11-29T09:45:24.161Z"
      }
    ]
  }
}
```

### `GET /packages/{package_name}`

Package inspection.

#### Example Request

```http
GET /packages/My/Package HTTP/1.1
```

#### Example Response

```json
{
  "message": "OK",
  "pkg": {
    "id": "yyyyyyyy-uuid-yyyy-yyyy-yyyyyyyyyyyy",
    "name": "My/Package",
    "versions": [
      {
        "version": "1.0.0",
        "url": "https://cdn-url-to/tarball-1.0.0.tar.gz",
        "published": "2019-11-29T09:45:24.161Z"
      }
    ]
  }
}
```

### `GET /packages/{package_name}?version={version}`

Package version inspection.

#### Example Request

```http
GET /packages/My/Package?version=1.0.0 HTTP/1.1
```

#### Example Response

```json
{
  "message": "OK",
  "version": {
    "version": "1.0.0",
    "url": "https://cdn-url-to/tarball-1.0.0.tar.gz",
    "published": "2019-11-29T09:45:24.161Z"
  }
}
```

### `GET /publishers/{user_uuid}`

Publisher inspection.

#### Example Request

```http
GET /publishers/xxxxxxxx-uuid-xxxx-xxxx-xxxxxxxxxxxx HTTP/1.1
```

#### Example Response

```json
{
  "message": "OK"
  // TBD
}
```
