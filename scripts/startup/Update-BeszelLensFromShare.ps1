[CmdletBinding()]
param(
    [string]$SourcePath = "",
    [string]$InstallPath = "C:\BeszelLens"
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($SourcePath)) {
    $SourcePath = Split-Path -Parent $PSScriptRoot
}
$SourcePath = $SourcePath.Trim().Trim('"')
$InstallPath = $InstallPath.Trim().Trim('"')
$resolvedSource = Resolve-Path -LiteralPath $SourcePath -ErrorAction Stop
$resolvedSourcePath = [IO.Path]::GetFullPath([string]$resolvedSource.ProviderPath).TrimEnd('\')
$resolvedInstallPath = [IO.Path]::GetFullPath($InstallPath).TrimEnd('\')
if ($resolvedSourcePath.Equals($resolvedInstallPath, [StringComparison]::OrdinalIgnoreCase)) {
    throw "SourcePath and InstallPath must be different."
}
if (-not (Test-Path -LiteralPath (Join-Path $resolvedSourcePath "App\index.html") -PathType Leaf)) {
    throw "The Beszel Lens package is incomplete: $resolvedSourcePath"
}

New-Item -ItemType Directory -Force -Path $resolvedInstallPath | Out-Null
$arguments = @(
    "`"$resolvedSourcePath`"",
    "`"$resolvedInstallPath`"",
    "/MIR",
    "/Z",
    "/R:3",
    "/W:2",
    "/FFT",
    "/XF",
    "appsettings.json"
)
$process = Start-Process -FilePath "robocopy.exe" -ArgumentList $arguments -NoNewWindow -Wait -PassThru
if ($process.ExitCode -gt 7) {
    throw "Robocopy failed with exit code $($process.ExitCode)."
}

$installedSettings = Join-Path $resolvedInstallPath "App\appsettings.json"
if (-not (Test-Path -LiteralPath $installedSettings -PathType Leaf)) {
    Copy-Item -LiteralPath (Join-Path $resolvedSourcePath "App\appsettings.json") -Destination $installedSettings -Force
}

$settings = Get-Content -LiteralPath $installedSettings -Raw | ConvertFrom-Json
if ([int]$settings.BeszelLens.ListenPort -eq 8080) {
    $settings.BeszelLens.ListenPort = 8093
    $settings | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $installedSettings -Encoding UTF8
}

Write-Host "Updated Beszel Lens at $resolvedInstallPath"
