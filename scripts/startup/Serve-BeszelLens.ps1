[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$RootPath,
    [Parameter(Mandatory = $true)][ValidateRange(1, 65535)][int]$ListenPort,
    [string]$StatePath = "C:\ProgramData\BeszelLens"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$root = [IO.Path]::GetFullPath($RootPath).TrimEnd('\')
$rootPrefix = $root + '\'
$state = [IO.Path]::GetFullPath($StatePath).TrimEnd('\')
$pidPath = Join-Path $state "beszel-lens.pid"
if (-not (Test-Path -LiteralPath (Join-Path $root "index.html") -PathType Leaf)) {
    throw "Beszel Lens index.html was not found at $root."
}

New-Item -ItemType Directory -Force -Path $state | Out-Null
$PID | Set-Content -LiteralPath $pidPath -Encoding ASCII

$contentTypes = @{
    ".css" = "text/css; charset=utf-8"
    ".html" = "text/html; charset=utf-8"
    ".ico" = "image/x-icon"
    ".js" = "text/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png" = "image/png"
    ".svg" = "image/svg+xml"
    ".webp" = "image/webp"
    ".woff2" = "font/woff2"
}

function Write-HttpResponse {
    param(
        [Parameter(Mandatory = $true)][IO.Stream]$Stream,
        [Parameter(Mandatory = $true)][int]$StatusCode,
        [Parameter(Mandatory = $true)][string]$Reason,
        [string]$ContentType = "text/plain; charset=utf-8",
        [byte[]]$Body = @(),
        [switch]$HeadOnly,
        [string]$CacheControl = "no-store",
        [string]$AdditionalHeaders = ""
    )

    $header = "HTTP/1.1 $StatusCode $Reason`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`nCache-Control: $CacheControl`r`nX-Content-Type-Options: nosniff`r`nConnection: close`r`n$AdditionalHeaders`r`n"
    $headerBytes = [Text.Encoding]::ASCII.GetBytes($header)
    $Stream.Write($headerBytes, 0, $headerBytes.Length)
    if (-not $HeadOnly -and $Body.Length -gt 0) { $Stream.Write($Body, 0, $Body.Length) }
    $Stream.Flush()
}

$listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Any, $ListenPort)

try {
    try {
        $listener.Start()
    }
    catch {
        throw "Beszel Lens could not bind TCP port $ListenPort. Choose a free ListenPort in App\\appsettings.json. $($_.Exception.InnerException.Message)"
    }
    Write-Host "Beszel Lens static host listening on port $ListenPort"

    while ($true) {
        $client = $listener.AcceptTcpClient()
        $stream = $null
        try {
            $client.ReceiveTimeout = 5000
            $client.SendTimeout = 5000
            $stream = $client.GetStream()
            $reader = [IO.StreamReader]::new($stream, [Text.Encoding]::ASCII, $false, 4096, $true)
            $requestLine = $reader.ReadLine()
            do { $headerLine = $reader.ReadLine() } while ($null -ne $headerLine -and $headerLine.Length -gt 0)
            $requestParts = @($requestLine -split ' ')
            if ($requestParts.Count -lt 2) {
                Write-HttpResponse -Stream $stream -StatusCode 400 -Reason "Bad Request"
                continue
            }

            $method = $requestParts[0].ToUpperInvariant()
            $headOnly = $method -eq "HEAD"
            if ($method -notin @("GET", "HEAD")) {
                Write-HttpResponse -Stream $stream -StatusCode 405 -Reason "Method Not Allowed" -HeadOnly:$headOnly -AdditionalHeaders "Allow: GET, HEAD`r`n"
                continue
            }

            $requestPath = ($requestParts[1] -split '\?', 2)[0]
            $relativePath = [Uri]::UnescapeDataString($requestPath.TrimStart('/')).Replace('/', '\')
            if ([string]::IsNullOrWhiteSpace($relativePath)) { $relativePath = "index.html" }
            $candidate = [IO.Path]::GetFullPath((Join-Path $root $relativePath))
            if (-not $candidate.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase)) {
                Write-HttpResponse -Stream $stream -StatusCode 403 -Reason "Forbidden" -HeadOnly:$headOnly
                continue
            }

            if (-not (Test-Path -LiteralPath $candidate -PathType Leaf)) {
                if ([string]::IsNullOrEmpty([IO.Path]::GetExtension($relativePath))) {
                    $candidate = Join-Path $root "index.html"
                } else {
                    Write-HttpResponse -Stream $stream -StatusCode 404 -Reason "Not Found" -HeadOnly:$headOnly
                    continue
                }
            }

            $extension = [IO.Path]::GetExtension($candidate).ToLowerInvariant()
            $contentType = if ($contentTypes.ContainsKey($extension)) { $contentTypes[$extension] } else { "application/octet-stream" }
            $cacheControl = if ($candidate.EndsWith("appsettings.json", [StringComparison]::OrdinalIgnoreCase) -or $candidate.EndsWith("index.html", [StringComparison]::OrdinalIgnoreCase)) { "no-store" } else { "public, max-age=31536000, immutable" }
            $bytes = [IO.File]::ReadAllBytes($candidate)
            Write-HttpResponse -Stream $stream -StatusCode 200 -Reason "OK" -ContentType $contentType -Body $bytes -HeadOnly:$headOnly -CacheControl $cacheControl
        }
        catch {
            if ($null -ne $stream) {
                try { Write-HttpResponse -Stream $stream -StatusCode 500 -Reason "Internal Server Error" } catch { }
            }
            Write-Warning $_
        }
        finally {
            if ($null -ne $stream) { $stream.Dispose() }
            $client.Dispose()
        }
    }
}
finally {
    $listener.Stop()
    if (Test-Path -LiteralPath $pidPath) {
        $recordedPid = Get-Content -LiteralPath $pidPath -ErrorAction SilentlyContinue
        if ([string]$recordedPid -eq [string]$PID) { Remove-Item -LiteralPath $pidPath -Force }
    }
}
