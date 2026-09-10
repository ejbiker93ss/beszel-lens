[CmdletBinding()]
param(
    [string]$OutputPath = "",
    [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$startupFolder = Join-Path $repoRoot "scripts\startup"
if ([string]::IsNullOrWhiteSpace($OutputPath)) {
    $OutputPath = Join-Path $repoRoot "output\BeszelLens"
}

$resolvedRepoRoot = [IO.Path]::GetFullPath($repoRoot).TrimEnd('\')
$resolvedOutputPath = [IO.Path]::GetFullPath($OutputPath).TrimEnd('\')
if (-not $resolvedOutputPath.StartsWith($resolvedRepoRoot + '\', [StringComparison]::OrdinalIgnoreCase)) {
    throw "OutputPath must stay inside the Beszel Lens repository: $resolvedRepoRoot"
}

Push-Location $repoRoot
try {
    if (-not $SkipInstall) {
        npm ci
    }
    npm run build
}
finally {
    Pop-Location
}

if (Test-Path -LiteralPath $resolvedOutputPath) {
    Remove-Item -LiteralPath $resolvedOutputPath -Recurse -Force
}

$appOutput = Join-Path $resolvedOutputPath "App"
$scriptsOutput = Join-Path $resolvedOutputPath "Scripts"
New-Item -ItemType Directory -Force -Path $appOutput, $scriptsOutput | Out-Null

Get-ChildItem -LiteralPath (Join-Path $repoRoot "dist") -Force | Copy-Item -Destination $appOutput -Recurse -Force
Get-ChildItem -LiteralPath $startupFolder -File | Copy-Item -Destination $scriptsOutput -Force
Copy-Item -LiteralPath (Join-Path $repoRoot "deployment\Start-BeszelLens.cmd") -Destination $resolvedOutputPath -Force

$sourceCommit = "unknown"
if (Get-Command git -ErrorAction SilentlyContinue) {
    $candidateCommit = & git -c "safe.directory=$repoRoot" -C $repoRoot rev-parse HEAD 2>$null
    if ($LASTEXITCODE -eq 0 -and -not [string]::IsNullOrWhiteSpace($candidateCommit)) {
        $sourceCommit = [string]$candidateCommit
    }
}

$manifest = [ordered]@{
    app = "BeszelLens"
    builtAtUtc = (Get-Date).ToUniversalTime().ToString("O")
    sourceCommit = $sourceCommit
    sourceMachine = $env:COMPUTERNAME
}
$manifest | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $resolvedOutputPath "publish-manifest.json") -Encoding UTF8

Write-Host "Built Beszel Lens output to $resolvedOutputPath"
