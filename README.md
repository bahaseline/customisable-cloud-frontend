# ISTA1 — Customisable Cloud Platform Front-end

A web application that sits as a presentation layer over Google Drive. Sign in with Google, browse your Drive files, organise them into custom lists, and share those lists with teammates — without duplicating any file content.

## Stack

- **Client:** React (Vite)
- **Server:** Node.js / Express
- **Database:** PostgreSQL
- **Auth:** Google OAuth2 + JWT
- **File storage:** Google Drive API (metadata only — Drive remains the source of truth)

## Project structure

```
client/   React app
server/   Express API
```

## Getting started

### Server

```
cd server
cp ../.env.example .env   # fill in your own values
npm install
npm run dev
```

### Client

```
cd client
npm install
npm run dev
```

See `.env.example` at the repo root for required environment variables.
