[CmdletBinding()]
param(
    [string]$SourcePath = "",
    [string]$InstallPath = "C:\BeszelLens"
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($SourcePath)) {
    $SourcePath = Split-Path -Parent $PSScriptRoot
}
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

Write-Host "Updated Beszel Lens at $resolvedInstallPath"
