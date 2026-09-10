[CmdletBinding()]
param(
    [string]$InstallPath = "C:\BeszelLens",
    [string]$StatePath = "C:\ProgramData\BeszelLens"
)

$ErrorActionPreference = "Stop"
$InstallPath = [IO.Path]::GetFullPath($InstallPath).TrimEnd('\')
$StatePath = [IO.Path]::GetFullPath($StatePath).TrimEnd('\')
$pidPath = Join-Path $StatePath "beszel-lens.pid"
if (-not (Test-Path -LiteralPath $pidPath -PathType Leaf)) {
    Write-Host "Beszel Lens is not running."
    return
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
        "-InstallPath", (Quote-Argument $InstallPath),
        "-StatePath", (Quote-Argument $StatePath)
    )
    $elevated = Start-Process -FilePath "powershell.exe" -ArgumentList $arguments -Verb RunAs -Wait -PassThru
    exit $elevated.ExitCode
}

$serverPid = [int](Get-Content -LiteralPath $pidPath -Raw)
$process = Get-Process -Id $serverPid -ErrorAction SilentlyContinue
if ($null -eq $process) {
    Remove-Item -LiteralPath $pidPath -Force
    Write-Host "Removed a stale Beszel Lens process record."
    return
}

$expectedScript = Join-Path $InstallPath "Scripts\Serve-BeszelLens.ps1"
$processDetails = Get-CimInstance Win32_Process -Filter "ProcessId = $serverPid" -ErrorAction Stop
if ($null -eq $processDetails -or $processDetails.CommandLine.IndexOf($expectedScript, [StringComparison]::OrdinalIgnoreCase) -lt 0) {
    throw "Process $serverPid does not match the installed Beszel Lens host. It was not stopped."
}

Stop-Process -Id $serverPid -Force -ErrorAction Stop
Remove-Item -LiteralPath $pidPath -Force -ErrorAction SilentlyContinue
Write-Host "Beszel Lens stopped."
