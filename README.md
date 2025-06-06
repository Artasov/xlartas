# XLARTAS

This project contains the backend and frontend sources for the XLARTAS platform.

## Setup

1. Install dependencies using [Poetry](https://python-poetry.org/):
   ```bash
   poetry install
   ```
2. Copy `.env.production TEMPLATE` to `.env` and adjust the variables for your
   environment.
3. Build services with Docker Compose:
   ```bash
   docker compose up --build
   ```

## Docker

Several Dockerfiles are provided for running the application components.
The `docker-compose.yml` file orchestrates all services required for
local development.

## Environment Variables

See `.env.production TEMPLATE` for an overview of the required variables and
their default values.

## License

The contents of this repository are provided for reference only. See the
[LICENSE](LICENSE) file for details.
