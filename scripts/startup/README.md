# Beszel Lens deployment

Run `Start-BeszelLens.cmd` from the root of the published folder. It requests administrator approval, mirrors the package to `C:\BeszelLens`, preserves the installed `App\appsettings.json`, and starts a hidden dependency-free Windows static host on TCP 8093 by default.

Edit `C:\BeszelLens\App\appsettings.json` once per target machine:

- `BeszelLens.HubUrl`: the internal URL shown initially on the Lens sign-in screen. Leave blank to require entry.
- `BeszelLens.RefreshIntervalSeconds`: fleet refresh interval; values below 15 disable timed refresh. PocketBase realtime updates remain enabled.
- `BeszelLens.ListenPort`: local backend port. Default `8093`. Change this if another app on the same machine already owns that port, then point WebProxy at `http://127.0.0.1:<port>`.

Credentials never belong in appsettings. Each user signs in directly to the configured Beszel Hub.

Use `Scripts\Stop-BeszelLens.cmd` to stop the local host without deleting the installed package or settings. Runtime logs and the process record are stored in `C:\ProgramData\BeszelLens`.
