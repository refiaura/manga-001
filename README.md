# Manga Reader MVP

A responsive Indonesian manga discovery and reading-list app. Jikan v4 supplies public metadata only; the app does not host manga pages or proxy third-party reading content.

## What is implemented

- React + TypeScript + Vite frontend with home, catalog, search, genre filter, pagination, manga details, responsive loading/error/empty states, and cover fallback.
- Spring Boot REST API facade for Jikan manga search, top manga, detail, and genre endpoints. Results are normalized to internal DTOs, cached in memory, and upstream calls are conservatively spaced.
- Guest library persisted in versioned localStorage; malformed data is ignored safely.
- Email/password account registration and login, BCrypt password hashing, server-side session authentication, user-owned PostgreSQL library, idempotent guest sync, and a minimal last-opened/progress API.
- Flyway schema for users, library entries, reading sources, and reading progress.
- Source links are returned only when active and verified. No reader or fabricated chapter list is provided.

## Requirements

- Node.js 20+ and npm.
- Java 21+ and Maven 3.9+.
- PostgreSQL 15+; Docker Compose is an optional local shortcut.

## Run locally

1. Copy `.env.example` to `.env` and adjust local PostgreSQL values. The example password is for local development only.
2. Start PostgreSQL with `docker compose up -d postgres` or start a local PostgreSQL server yourself.
3. Start the backend from the repository root: `mvn -f backend/pom.xml spring-boot:run`. Flyway applies the schema on startup.
4. In another terminal, run `npm install` then `npm run dev`.
5. Open the URL printed by Vite (usually `http://localhost:5173`). Vite proxies `/api` to `http://localhost:8080`.

To check the frontend, run `npm test` and `npm run build`. Backend tests can be run with `mvn -f backend/pom.xml test`.

## Configuration

Backend environment variables: `SERVER_PORT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, `CORS_ORIGIN`, and `COOKIE_SECURE`.

Jikan variables: `JIKAN_BASE_URL`, `JIKAN_CONNECT_TIMEOUT_MS`, `JIKAN_READ_TIMEOUT_MS`, `JIKAN_CACHE_TTL_SECONDS`, and `JIKAN_MAX_REQUESTS_PER_MINUTE`. Keep the internal request cap conservative and review upstream terms before deployment. `VITE_API_BASE_URL` can be set for a separately hosted API; otherwise the development proxy is used.

## API

Public: `GET /api/v1/manga?q=&genre=&status=&type=&orderBy=&sort=&page=&limit=`, `GET /api/v1/manga/{id}`, `GET /api/v1/manga/top`, `GET /api/v1/genres`, and `GET /api/v1/reading-sources/{provider}/{mangaId}`.

Account session: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/users/me`, `GET|POST /api/v1/library`, `PATCH|DELETE /api/v1/library/{id}`, `POST /api/v1/sync/guest-library`, `GET /api/v1/reading-progress`, `PUT /api/v1/reading-progress/{provider}/{mangaId}`. OpenAPI UI is available at `/swagger-ui/index.html` when the backend is running.

Responses wrap payloads in `data`; catalog pages also include `pagination`. Errors use a `code` and safe `message`.

## Data, privacy, and content limits

Guest data stays in that browser's local storage until the user chooses to sync. Account libraries are scoped to the authenticated principal and stored in PostgreSQL. Passwords are BCrypt-hashed. Session cookies are HttpOnly and SameSite=Lax; enable `COOKIE_SECURE=true` behind HTTPS. The API currently disables CSRF because it accepts JSON only and uses same-site cookies; deployments on separate sites must revisit the session/CSRF design.

Jikan provides metadata, not readable manga pages. Cover/artwork usage remains subject to its original rights and provider terms. Reading sources default to unavailable until an administrator verifies them. This MVP has no source-management admin UI or initial verified source data, and no internal reader.

## Current limitations

- The backend requires a reachable PostgreSQL database; an actual database migration/startup was not verified in this development environment.
- The UI exposes keyword and genre filters and sorting. The API accepts status/type filters, but the corresponding controls are not in the current UI yet.
- Guest synchronization is idempotent and keeps guest storage until success; because the current API validates the batch transactionally, it returns full success or fails as one unit rather than partial per-item results.
- Reading progress endpoints only accept chapter/page details when a verified source exists. The frontend does not yet expose progress editing.
- Admin source verification/management and account deletion are not implemented.
- Auth endpoints do not yet have an application-level IP rate limiter. Add one before exposing registration/login to public production traffic.
