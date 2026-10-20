# Driveboard

[![CI](https://github.com/bahaseline/customisable-cloud-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/bahaseline/customisable-cloud-frontend/actions/workflows/ci.yml)

This project presents a web-based system where users can create their own list of Google Drive files, color-code these lists as per their choice, and then share these lists with other users.

In this project, files are neither stored nor duplicated because only the IDs of the chosen Drive files are stored, and thus the same file can be present in multiple lists without duplication.

Dissertation project for MSc Web & Mobile Development program at CITY College/University of York Europe Campus.

## Features

- Custom lists of Drive files
- Coloured labels (tags) you can filter by
- Sharing with viewer or editor permissions
- Search inside a list or across all files
- Preview PDFs, images and Google Docs, Sheets, Slides and Drawings in the app

## Tech stack

- Client: React + Vite, TanStack Query, Tailwind CSS
- Server: Node.js + Express
- Database: PostgreSQL (no ORM, plain SQL)
- Auth: Google OAuth2 + JWT (access token kept in memory, refresh token in an httpOnly cookie)
- Files: Google Drive API
- Rate limiting: in memory, or Redis (optional)

## Setup

You need Node 22+ (run `nvm use` to pick it up from `.nvmrc`), PostgreSQL 14+ and a Google account.

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Create the databases

```bash
createdb ista1
createdb ista1_test
```

The second one is used by the tests. The names come from the old project title,
they just have to match `DATABASE_URL`.

### 3. Set up Google OAuth

In the [Google Cloud Console](https://console.cloud.google.com):

1. Create a project and enable the Google Drive API
2. In Credentials, create an OAuth 2.0 Client ID (Web application)
3. Add the redirect URI: `http://localhost:3001/auth/google/callback`
4. In the OAuth consent screen, add these scopes:
   - `openid`, `userinfo.email`, `userinfo.profile`
   - `https://www.googleapis.com/auth/drive.readonly`
5. Add your Google account as a test user

Step 4 is important. If the Drive scope is only requested in the code and not
added on the consent screen, login fails with "insufficient authentication
scopes".

### 4. Environment variables

```bash
cp server/.env.example server/.env
```

Fill in the Google client ID and secret, then generate the two keys:

```bash
openssl rand -hex 32    # JWT_SECRET
openssl rand -hex 32    # TOKEN_ENCRYPTION_KEY
```

`REDIS_URL` is optional. Leave it out to run with an in-memory rate limiter.

### 5. Create the tables

```bash
psql -d ista1 -f server/src/db/schema.sql
```

You can run this again later, it will not delete anything.

### 6. Run it

In two terminals:

```bash
npm run dev:server    # http://localhost:3001
npm run dev:client    # http://localhost:3000
```

Then open http://localhost:3000 and sign in with Google.

## Tests and linting

```bash
npm run check              # lint + backend tests
npm run lint               # lint only
npm test                   # backend tests only
cd client && npm test      # frontend tests
```

There are 47 backend tests. They use the `ista1_test` database and clear it
before each run, so the normal database is not affected.

There are 40 frontend tests, written with Vitest and Testing Library.

## Project structure

```
server/src
  routes/       the API endpoints and who can use them
  middleware/   login check, permissions, rate limit, errors
  controllers/  read the request, send the response
  services/     the logic, the SQL and the Google Drive calls
  db/           connection and schema
  config/       env, Passport and Redis setup
  constants/    role names
  utils/        small helpers

client/src
  pages/        one file per screen
  components/   only the UI
  hooks/        state and logic
  context/      login state, theme, toasts, confirm dialogs, query client
  api/          axios setup
  constants/    roles, tag colours, visibility options
  utils/        small helpers
```

Requests always go through the same path:

```
route -> middleware -> controller -> service -> database
```

Each layer has one job. Controllers do not write SQL and services do not know
about HTTP.

On the client, the components only contain JSX. All the state and the handlers
are in hooks, and TanStack Query handles the data coming from the server.

## Some design decisions

Access tokens are short-lived and are accompanied by refresh tokens. After logging in through Google, a 15-minute JSON Web Token (JWT) is received from the service along with a refresh token which is long-lived but whose hash value is stored in the database. Logout causes the revocation of both refresh token and the underlying Google OAuth2 grant, which is not possible to do using only a stateless JWT. Drive access tokens are encrypted before saving to the database.

Authorization checks in the middleware. Interface controls are just aesthetic hiding buttons; real authorization happens in the middleware layer. When the list is not accessible by the user requesting access, the API returns a 404 status instead of 403 status, since the 403 status would indicate the presence of the list.

Tags are private by default and shareable by design. In similarity to Gmail labels, the user tags are only visible to the creator unless the tag is explicitly made shareable; in this case, it is visible to all users able to view a file with such a tag. Shareable tag status is a property of the tag, not of any particular list.

Server-based preview for files. To display file content using Google's preview functionality, it is necessary to provide a cookie, which the iframe does not have. The current solution uses the server to fetch the file content using the token and sends it to the client.

Rate limiting is performed centrally if Redis is enabled. Without setting REDIS_URL parameter, each instance of the application uses in-memory counter, so multi-server deployments behind the load balancer can exceed the maximum number of requests. When REDIS_URL is specified, counters are saved in Redis.

## Limitations

Only Google Drive is supported. All the Google specific code is in
`driveService.js`, so another provider would only need a different version of
that file.