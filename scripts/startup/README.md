# Beszel Lens deployment

Run `Start-BeszelLens.cmd` from the root of the published folder. It requests administrator approval, mirrors the package to `C:\BeszelLens`, preserves the installed `App\appsettings.json`, and starts or updates the Docker container.

Edit `C:\BeszelLens\App\appsettings.json` once per target machine:

- `BeszelLens.HubUrl`: the internal URL shown initially on the Lens sign-in screen. Leave blank to require entry.
- `BeszelLens.RefreshIntervalSeconds`: fleet refresh interval; values below 15 disable timed refresh. PocketBase realtime updates remain enabled.
- `BeszelLens.ListenPort`: local port exposed by Docker.

Credentials never belong in appsettings. Each user signs in directly to the configured Beszel Hub.

Use `Scripts\Stop-BeszelLens.cmd` to stop and remove the running container without deleting the installed package or settings.
