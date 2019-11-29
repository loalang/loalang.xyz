![Loa Package Manager](./repo-header.svg)

The hosted internal Package Manager service.

## Environment Variables

- `POSTGRES_HOST` – The hostname of the Postgres database to use.
- `POSTGRES_USER` – The username to use to connect to the database.
- `POSTGRES_PASS` – The password to use to connect to the database.
- `GOOGLE_APPLICATION_CREDENTIALS` – Path to a Google Cloud Service Account JSON file with write permissions to Cloud Storage.
- `AMQP_URL` – An `amqp:` URL for producing notification messages.
