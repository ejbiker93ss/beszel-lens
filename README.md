# Beszel Lens

A lightweight, read-only companion dashboard for [Beszel](https://github.com/henrygd/beszel).

Lens connects directly from your browser to an existing Beszel Hub. It leaves collection, alerts, accounts, and administration in stock Beszel while providing a focused fleet overview and simple utilization history.

> Beszel Lens is an independent community project and is not affiliated with or endorsed by Beszel.

## Why this stack

- **Preact** provides familiar React-style components and hooks with a very small runtime.
- **Vite** starts and builds quickly.
- **TypeScript** keeps Beszel's compact metric fields behind a typed adapter.
- **PocketBase SDK** uses Beszel's supported API and normal user permissions.
- No backend, database, server-side rendering, UI kit, chart library, or image assets.

## Features

- Authenticate as a normal Beszel user.
- Scan online, offline, paused, and pending systems.
- Compare current CPU, memory, and disk utilization.
- Inspect 1-hour, 12-hour, and 24-hour history.
- Receive current system updates through PocketBase realtime events.
- Jump back to Beszel for administration.
- Responsive desktop and mobile layout.

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL and enter your Beszel Hub URL and user credentials.

## Production build

```bash
npm run build
```

Serve the generated `dist` directory from any static host. If the dashboard and Beszel Hub use different origins, your proxy and Beszel deployment must allow the browser to reach the Hub API.

## Security

- Credentials are sent directly from the browser to the Beszel Hub you enter.
- The application does not have its own server and does not receive or proxy credentials.
- Authentication state is stored by the PocketBase browser SDK.
- Use a normal Beszel user account. Never expose a PocketBase superuser token or administrator password in this app.
- Host both services over HTTPS outside a trusted local network.

## Compatibility

The initial release targets Beszel `0.19.x`. Beszel currently warns that API response structures may change in minor releases. API-specific mapping is isolated in `src/beszel.ts` so compatibility updates stay small.

## License

MIT
