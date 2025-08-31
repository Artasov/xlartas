# Repository Guidelines

## Project Structure & Module Organization

- backend/: Django project (apps/, config/settings.py, utils/, manage.py). Tests live under apps/*/tests/.
- frontend/: Next.js (src/, public/, build/). TypeScript.
- static/, media/, data/: mounted volumes for local/dev and Docker.
- docker-compose.yml: services for web, celery, beat, redis, nginx proxy.

## Build, Test, and Development Commands

- Run server: `poetry run python manage.py runserver 0.0.0.0:8000`. (Often the server is always launched for me)
- Backend tests: `cd backend; poetry run pytest`.
- Frontend dev: `cd frontend; npm start`.
  (Often the server is always launched for me)
- Build and migrate you are forbidden to do !!!

## Coding Style & Naming Conventions

- Python: 4-space indent
- Quotes: Prefer single quotes in Python and TS.

## Testing Guidelines

- Frameworks: pytest, pytest-django, pytest-cov (configured via backend/pytest.ini with
  DJANGO_SETTINGS_MODULE=config.settings).
- Location/naming: place tests in `backend/apps/<app>/tests/` named `test_*.py`.
- DB usage: mark tests requiring DB with `@pytest.mark.django_db`.
- Coverage: focus on `apps`, `config`, `utils`.

## Architecture & Design Preferences

- Patterns: I favor GRASP and GoF patterns (e.g., Strategy, Factory, Adapter) and other pragmatic architectures to
  improve cohesion and reduce coupling. Keep responsibilities explicit.
- Decomposition: Prefer small, focused modules/classes/functions. Encapsulate business rules in domain
  services/use-cases and isolate I/O/framework concerns behind adapters.

## Security & Configuration Tips

- Secrets: use `.env`; never commit credentials. Docker and Django read `DB_*` and related vars from `.env`.
