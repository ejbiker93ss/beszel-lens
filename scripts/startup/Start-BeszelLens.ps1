[CmdletBinding()]
param(
    [string]$SourcePath = "",
    [string]$InstallPath = "C:\BeszelLens",
    [switch]$SkipUpdate,
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($SourcePath)) {
    $SourcePath = Split-Path -Parent $PSScriptRoot
}

function Test-IsAdministrator {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Quote-Argument {
    param([Parameter(Mandatory = $true)][string]$Value)
    return '"' + $Value.Replace('"', '\"') + '"'
}

if (-not (Test-IsAdministrator)) {
    $arguments = @(
        "-NoProfile",
        "-ExecutionPolicy", "Bypass",
        "-File", (Quote-Argument $PSCommandPath),
        "-SourcePath", (Quote-Argument $SourcePath),
        "-InstallPath", (Quote-Argument $InstallPath)
    )
    if ($SkipUpdate) { $arguments += "-SkipUpdate" }
    if ($NoBrowser) { $arguments += "-NoBrowser" }
    $elevated = Start-Process -FilePath "powershell.exe" -ArgumentList $arguments -Verb RunAs -Wait -PassThru
    exit $elevated.ExitCode
}

if (-not $SkipUpdate) {
    & (Join-Path $PSScriptRoot "Update-BeszelLensFromShare.ps1") -SourcePath $SourcePath -InstallPath $InstallPath
}

$composePath = Join-Path $InstallPath "compose.yaml"
$settingsPath = Join-Path $InstallPath "App\appsettings.json"
if (-not (Test-Path -LiteralPath $composePath -PathType Leaf)) {
    throw "compose.yaml was not found after update: $composePath"
}
if (-not (Test-Path -LiteralPath $settingsPath -PathType Leaf)) {
    throw "appsettings.json was not found after update: $settingsPath"
}
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker is required on the target computer. Install Docker, then run Start-BeszelLens.cmd again."
}

$settings = Get-Content -LiteralPath $settingsPath -Raw | ConvertFrom-Json
$listenPort = [int]$settings.BeszelLens.ListenPort
if ($listenPort -lt 1 -or $listenPort -gt 65535) {
    throw "BeszelLens.ListenPort must be between 1 and 65535."
}

$env:BESZEL_LENS_PORT = [string]$listenPort
Push-Location $InstallPath
try {
    & docker compose -f $composePath up -d --build --remove-orphans
    if ($LASTEXITCODE -ne 0) {
        throw "docker compose failed with exit code $LASTEXITCODE."
    }
}
finally {
    Pop-Location
}

$url = "http://localhost:$listenPort"
if (-not $NoBrowser) {
    Start-Process -FilePath $url | Out-Null
}
Write-Host "Beszel Lens is running at $url"
