# serve.ps1 - Local static file web server for VD CREATION
$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

# Dynamically set web root to the script's folder location
$webRoot = $PSScriptRoot

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "         VD CREATION - LOCAL DEV WEB SERVER               " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host " Serving website files from: $webRoot"
Write-Host " Localhost Link: http://localhost:$port/" -ForegroundColor Green
Write-Host " Press Ctrl+C in this terminal to stop the server."
Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host ""

try {
    $listener.Start()
    
    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response
            
            # Extract path
            $urlPath = $request.Url.LocalPath
            if ($urlPath -eq "/") {
                $urlPath = "/index.html"
            }
            
            # Build local path
            $cleanPath = $urlPath.Replace("/", "\").TrimStart("\")
            $filePath = Join-Path $webRoot $cleanPath
            
            if (Test-Path $filePath -PathType Leaf) {
                # Map Content Type
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $contentType = switch ($ext) {
                    ".html" { "text/html; charset=utf-8" }
                    ".css"  { "text/css; charset=utf-8" }
                    ".js"   { "application/javascript; charset=utf-8" }
                    ".png"  { "image/png" }
                    ".jpg"  { "image/jpeg" }
                    ".jpeg" { "image/jpeg" }
                    ".webp" { "image/webp" }
                    ".svg"  { "image/svg+xml" }
                    default { "application/octet-stream" }
                }
                
                $response.ContentType = $contentType
                
                # Read bytes and send
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
                Write-Host "[200 OK] Served: $urlPath" -ForegroundColor Gray
            } else {
                $response.StatusCode = 404
                $response.ContentType = "text/plain"
                $msg = "404 Not Found: $urlPath"
                $bytes = [System.Text.Encoding]::UTF8.GetBytes($msg)
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
                Write-Host "[404 Not Found] File missing: $urlPath" -ForegroundColor Red
            }
            
            $response.Close()
        }
        catch {
            Write-Host "Error serving request: $_" -ForegroundColor Yellow
        }
    }
}
catch {
    Write-Error $_
}
finally {
    $listener.Stop()
    Write-Host "Web Server stopped." -ForegroundColor Yellow
}
