[CmdletBinding()]
param(
    [string]$InstallPath = "C:\BeszelLens"
)

$ErrorActionPreference = "Stop"
$resolvedInstallPath = [IO.Path]::GetFullPath($InstallPath).TrimEnd('\')
$composePath = Join-Path $resolvedInstallPath "compose.yaml"
if (-not (Test-Path -LiteralPath $composePath -PathType Leaf)) {
    throw "Beszel Lens is not installed at $resolvedInstallPath."
}

Push-Location $resolvedInstallPath
try {
    & docker compose -f $composePath down
    if ($LASTEXITCODE -ne 0) {
        throw "docker compose failed with exit code $LASTEXITCODE."
    }
}
finally {
    Pop-Location
}
