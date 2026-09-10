[CmdletBinding()]
param(
    [string]$OutputPath = "",
    [string]$SharePath = ""
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($OutputPath)) {
    $OutputPath = Join-Path $repoRoot "output\BeszelLens"
}
if ([string]::IsNullOrWhiteSpace($SharePath)) {
    $SharePath = $env:BESZEL_LENS_SHARE
}
if ([string]::IsNullOrWhiteSpace($SharePath)) {
    $localSettingsPath = Join-Path $repoRoot "deployment.local.json"
    if (Test-Path -LiteralPath $localSettingsPath -PathType Leaf) {
        $localSettings = Get-Content -LiteralPath $localSettingsPath -Raw | ConvertFrom-Json
        $SharePath = [string]$localSettings.FileSharePath
    }
}
if ([string]::IsNullOrWhiteSpace($SharePath)) {
    throw "Provide -SharePath, set BESZEL_LENS_SHARE, or create deployment.local.json from the example."
}

if (-not (Test-Path -LiteralPath (Join-Path $OutputPath "App\index.html") -PathType Leaf)) {
    throw "Local output is incomplete. Run scripts\Build-BeszelLensOutput.ps1 first."
}

New-Item -ItemType Directory -Force -Path $SharePath | Out-Null
$arguments = @(
    "`"$OutputPath`"",
    "`"$SharePath`"",
    "/MIR",
    "/Z",
    "/R:3",
    "/W:2",
    "/FFT"
)
$process = Start-Process -FilePath "robocopy.exe" -ArgumentList $arguments -NoNewWindow -Wait -PassThru
if ($process.ExitCode -gt 7) {
    throw "Robocopy failed with exit code $($process.ExitCode)."
}

Write-Host "Copied Beszel Lens output from $OutputPath to $SharePath"
