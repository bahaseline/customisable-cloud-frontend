# Driveboard client

React single-page app for Driveboard. Setup for the whole project (database,
Google OAuth credentials, environment variables) is in the
[root README](../README.md).

## Scripts

Run from this folder:

```bash
npm run dev      # dev server on http://localhost:3000
npm run build    # production build into dist/
npm run preview  # serve the production build locally
npm run lint     # ESLint
npm test         # Vitest + React Testing Library
```

The client expects the API at `http://localhost:3001` by default. Set
`VITE_API_URL` to point it somewhere else.

## Structure

```
src/
├── api/         Axios client: in-memory access token, refresh-on-401
├── components/  reusable UI components
├── constants/   shared values (roles, tag colours, visibility)
├── context/     auth, theme, toasts, confirm dialogs
├── hooks/       data fetching (TanStack Query) and UI logic
├── pages/       route-level pages
├── test/        test setup
├── utils/       small pure helpers
├── App.jsx      providers and routes
└── main.jsx     entry point
```

## Authentication

The refresh token is an httpOnly cookie set by the server, so the client
never sees it. The access token is kept in memory only; on page load the
client calls `/auth/refresh` to get a new one.
