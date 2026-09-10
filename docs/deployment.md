# Beszel Lens deployment

Beszel Lens supports a file-share deployment workflow while remaining a small static Preact application.

## Build and publish

From the repository:

```powershell
.\scripts\Build-BeszelLensOutput.ps1
.\scripts\Copy-BeszelLensOutputToFileServer.ps1
```

Or run `scripts\Publish-BeszelLens.cmd` to build and copy in one step. The defaults are:

- Local package: `output\BeszelLens`
- Internal app share: supplied with `-SharePath` or the `BESZEL_LENS_SHARE` environment variable

For a repeatable local setup, copy `deployment.local.example.json` to `deployment.local.json` and set `FileSharePath`. The local file is ignored by Git, so private deployment topology does not enter the public repository.

The build script runs `npm ci`, the production Vite build, packages only the static site and Docker runtime files, and writes `publish-manifest.json`.

## Install or update

Run `Start-BeszelLens.cmd` from the published share on the target computer. The launcher:

1. Requests administrator approval.
2. Mirrors the package to `C:\BeszelLens`.
3. Preserves the target computer's `App\appsettings.json`.
4. Builds and starts the `beszel-lens` Docker container.
5. Opens the local Lens URL.

Docker is the only target-machine prerequisite.

## Runtime app settings

`App\appsettings.json` is fetched by the browser with caching disabled:

```json
{
  "BeszelLens": {
    "HubUrl": "",
    "RefreshIntervalSeconds": 60,
    "ListenPort": 8080
  }
}
```

`HubUrl` may contain the internal Beszel Hub URL, but never a username, password, auth token, or PocketBase superuser credential. Browser authentication remains per user. The locally stored hub URL takes precedence after a user has connected once.

Because the app runs in each user's browser, that browser must be able to resolve and reach the internal Beszel Hub. If Lens is served over HTTPS, the Hub must also use HTTPS to avoid mixed-content blocking.
