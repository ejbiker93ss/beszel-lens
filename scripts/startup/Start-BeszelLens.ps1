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
$SourcePath = $SourcePath.Trim().Trim('"')
$InstallPath = $InstallPath.Trim().Trim('"')

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

$installedStopScript = Join-Path $InstallPath "Scripts\Stop-BeszelLens.ps1"
$installedServeScript = Join-Path $InstallPath "Scripts\Serve-BeszelLens.ps1"
if ((Test-Path -LiteralPath $installedStopScript -PathType Leaf) -and
    (Test-Path -LiteralPath $installedServeScript -PathType Leaf)) {
    & $installedStopScript -InstallPath $InstallPath
}
if (-not $SkipUpdate) {
    & (Join-Path $PSScriptRoot "Update-BeszelLensFromShare.ps1") -SourcePath $SourcePath -InstallPath $InstallPath
}

$settingsPath = Join-Path $InstallPath "App\appsettings.json"
if (-not (Test-Path -LiteralPath $settingsPath -PathType Leaf)) {
    throw "appsettings.json was not found after update: $settingsPath"
}

$settings = Get-Content -LiteralPath $settingsPath -Raw | ConvertFrom-Json
$listenPort = [int]$settings.BeszelLens.ListenPort
if ($listenPort -lt 1 -or $listenPort -gt 65535) {
    throw "BeszelLens.ListenPort must be between 1 and 65535."
}

$serveScript = Join-Path $InstallPath "Scripts\Serve-BeszelLens.ps1"
$appPath = Join-Path $InstallPath "App"
if (-not (Test-Path -LiteralPath $serveScript -PathType Leaf)) {
    throw "The Beszel Lens static host was not found after update: $serveScript"
}

$statePath = Join-Path $env:ProgramData "BeszelLens"
New-Item -ItemType Directory -Force -Path $statePath | Out-Null
$stdoutPath = Join-Path $statePath "beszel-lens.log"
$stderrPath = Join-Path $statePath "beszel-lens.err.log"
$serverArguments = @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-File", (Quote-Argument $serveScript),
    "-RootPath", (Quote-Argument $appPath),
    "-ListenPort", [string]$listenPort,
    "-StatePath", (Quote-Argument $statePath)
)
$server = Start-Process -FilePath "powershell.exe" -ArgumentList $serverArguments -WindowStyle Hidden -RedirectStandardOutput $stdoutPath -RedirectStandardError $stderrPath -PassThru

$url = "http://127.0.0.1:$listenPort"
$ready = $false
$deadline = (Get-Date).AddSeconds(15)
do {
    Start-Sleep -Milliseconds 250
    if ($server.HasExited) {
        $details = if (Test-Path -LiteralPath $stderrPath) { ((Get-Content -LiteralPath $stderrPath) | Select-Object -Last 8) -join " " } else { "No error log was created." }
        throw "Beszel Lens stopped before it became ready. $details"
    }
    try {
        $response = Invoke-WebRequest -Uri "$url/appsettings.json" -UseBasicParsing -TimeoutSec 2
        $ready = $response.StatusCode -eq 200
    }
    catch { }
} while (-not $ready -and (Get-Date) -lt $deadline)

if (-not $ready) {
    Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue
    $details = if (Test-Path -LiteralPath $stderrPath) { ((Get-Content -LiteralPath $stderrPath) | Select-Object -Last 8) -join " " } else { "No error log was created." }
    throw "Beszel Lens did not become ready at $url within 15 seconds. $details"
}

if (-not $NoBrowser) {
    Start-Process -FilePath $url | Out-Null
}
Write-Host "Beszel Lens is running at $url (PID $($server.Id))"
