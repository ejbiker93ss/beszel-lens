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
- Compare current CPU, RAM, and every reported drive with compact, threshold-colored utilization bars.
- Rank systems by an explainable risk score so likely problems stay at the top.
- Surface the dominant condition on every card, including offline systems, failed services, high CPU or memory, load, and the fullest primary or extra filesystem.
- Click anywhere on a server card or row to inspect its uptime, current readings, and every historical telemetry category that system reports, including CPU breakdown and cores, memory, disks, bandwidth, load, disk I/O, temperatures, filesystems, and GPU usage.
- Change graph history between 1 minute, 1 hour, 12 hours, 24 hours, 1 week, and 30 days.
- Receive current system updates through PocketBase realtime events.
- Jump back to Beszel for administration.
- Use the full browser width with a fluid card grid that grows readings when space is available and collapses cleanly on mobile.
- Follow the operating system's light or dark appearance automatically.
- Keep desktop navigation out of the way until the pointer reaches the top edge, while preserving visible controls on touch devices.
- Switch between aligned telemetry cards and a compact single-line, one-server-per-row data grid; the selected view is remembered in the browser.
- Reveal the top-edge toolbar to quick-filter systems, choose visible fields, switch layout, and sort by Smart priority, system, CPU, RAM, fullest drive, or uptime.
- Drag row-column dividers to resize them; filter, sort, visible columns, widths, and layout persist in local browser storage.

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL and enter your Beszel Hub URL and user credentials.

## Self-host with Docker

The container builds the static app and serves it as an unprivileged Nginx process on port `8080`.

```bash
docker compose up -d --build
```

Open `http://your-server:8080`, or put the container behind your existing internal HTTPS reverse proxy. No environment variables, database, volumes, or outbound server access are required.

Example Caddy route:

```caddyfile
lens.internal.example {
    reverse_proxy 127.0.0.1:8080
}
```

Example Nginx route:

```nginx
server {
    listen 443 ssl;
    server_name lens.internal.example;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

When you open Lens, enter the internal HTTPS URL of your Beszel Hub. The browser running Lens must be able to resolve and reach that address.

## Internal Windows deployment

The repository includes a build/package/file-share workflow for internal Windows deployment:

```powershell
.\scripts\Build-BeszelLensOutput.ps1
.\scripts\Copy-BeszelLensOutputToFileServer.ps1
```

Run `scripts\Publish-BeszelLens.cmd -SharePath "\\server\share\Beszel Lens"` to perform both steps. For repeat use, copy `deployment.local.example.json` to the ignored `deployment.local.json` and set `FileSharePath`; the publish command can then be double-clicked without arguments. `BESZEL_LENS_SHARE` is also supported. On the target computer, run the package's root `Start-BeszelLens.cmd`; it installs under `C:\BeszelLens`, preserves machine-local settings across updates, and starts the Docker container.

See [deployment notes](docs/deployment.md) for settings, update behavior, and prerequisites.

## Runtime app settings

`public\appsettings.json` becomes `App\appsettings.json` in the deployment package. It can provide the initial Beszel Hub URL, timed refresh interval, and listening port without rebuilding the frontend. The target-machine copy is preserved during later updates.

Do not place credentials or tokens in this file. Users continue to authenticate directly with the Beszel Hub.

## Manual production build

```bash
npm run build
```

Serve the generated `dist` directory from any internal static host. If the dashboard and Beszel Hub use different origins, your proxy and Beszel deployment must allow the browser to reach the Hub API.

## Security

- Credentials are sent directly from the browser to the Beszel Hub you enter.
- The application does not have its own server and does not receive or proxy credentials.
- Authentication state is stored by the PocketBase browser SDK.
- Use a normal Beszel user account. Never expose a PocketBase superuser token or administrator password in this app.
- Host both services over HTTPS outside a trusted local network.

## Risk ranking

Lens scores current system state with nonlinear warning and critical thresholds. Offline systems and failed services rank first, followed by storage, memory, CPU, and normalized system load. Multiple elevated signals add urgency, while system name and ID provide stable tie-breakers. The score is used only to order the dashboard; Lens never changes Beszel settings or alerts.

## Compatibility

The initial release targets Beszel `0.19.x`. Beszel currently warns that API response structures may change in minor releases. API-specific mapping is isolated in `src/beszel.ts` so compatibility updates stay small.

## License

MIT
