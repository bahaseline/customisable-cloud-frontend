# Driveboard

A web app that lets you organise your Google Drive files into custom lists,
label them with colours, and share those lists with other people.

It does not store or copy any files. It only saves which Drive file you picked,
so the same file can be in more than one list without being duplicated.

MSc Web & Mobile Development dissertation project, CITY College / University of
York Europe Campus.

## Features

- Custom lists of Drive files
- Coloured labels (tags) you can filter by
- Sharing with viewer or editor permissions
- Search inside a list or across all files
- Preview PDFs, images and Google Docs in the app

## Tech stack

- Client: React + Vite, TanStack Query, Tailwind CSS
- Server: Node.js + Express
- Database: PostgreSQL (no ORM, plain SQL)
- Auth: Google OAuth2 + JWT
- Files: Google Drive API

## Setup

You need Node 20+, PostgreSQL 14+ and a Google account.

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
npm run check    # lint + tests
npm run lint     # lint only
npm test         # tests only
```

There are 18 backend tests. They use the `ista1_test` database and clear it
before each run, so the normal database is not affected.

## Project structure

```
server/src
  routes/       the API endpoints and who can use them
  middleware/   login check, permissions, rate limit, errors
  controllers/  read the request, send the response
  services/     the logic, the SQL and the Google Drive calls
  db/           connection and schema
  constants/    role names

client/src
  pages/        one file per screen
  components/   only the UI
  hooks/        state and logic
  context/      login state and theme
  api/          axios setup
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

**No sessions on the server.** After Google login the user gets a JWT, so the
server does not need to store anything. The Drive tokens are encrypted before
being saved in the database.

**Permissions are checked on the server.** The UI hides buttons but that is not
the real protection, the middleware is. If a list is not shared with you the API
returns 404 instead of 403, because a 403 would tell you the list exists.

**Tags are personal.** Like Gmail labels, each member only sees and manages their
own tags on a shared list. List contents are shared; personal organisation is not.

**File preview goes through the server.** Google's preview needs a cookie that
an iframe cannot send, so private files showed a login screen. Now the server
downloads the file with its own token and sends it to the browser.

**Rate limiting is shared across instances when Redis is configured.** Without
`REDIS_URL` set, each server process counts requests in its own memory, so
running more than one instance behind a load balancer would let a client get
away with more requests than intended. Setting `REDIS_URL` moves the counters
into Redis so every instance enforces the same limit.

## Limitations

Only Google Drive is supported. All the Google specific code is in
`driveService.js`, so another provider would only need a different version of
that file.