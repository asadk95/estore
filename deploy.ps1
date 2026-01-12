# deploy.ps1 - E-Store Deployment Script
# Run: .\deploy.ps1

param(
    [switch]$SkipBuild,
    [switch]$BackendOnly,
    [switch]$FrontendOnly
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   E-Store Deployment Script" -ForegroundColor Cyan
Write-Host "   Target: shop.buyinn.pk" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Build Frontend
if (-not $SkipBuild -and -not $BackendOnly) {
    Write-Host "🔨 Building frontend..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Frontend build failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Frontend build complete!" -ForegroundColor Green
    Write-Host ""
}

# Create dist.zip
if (-not $BackendOnly) {
    Write-Host "📦 Packaging frontend (dist.zip)..." -ForegroundColor Yellow
    if (Test-Path "dist.zip") { Remove-Item "dist.zip" -Force }
    Compress-Archive -Path "dist\*" -DestinationPath "dist.zip" -Force
    $distSize = (Get-Item "dist.zip").Length / 1KB
    Write-Host "✅ dist.zip created ($([math]::Round($distSize, 2)) KB)" -ForegroundColor Green
}

# Create backend.zip
if (-not $FrontendOnly) {
    Write-Host "📦 Packaging backend (backend.zip)..." -ForegroundColor Yellow
    if (Test-Path "backend.zip") { Remove-Item "backend.zip" -Force }
    
    # Create temp folder without node_modules
    $tempDir = "backend_temp"
    if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
    
    Copy-Item -Path "backend" -Destination $tempDir -Recurse
    Remove-Item "$tempDir\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item "$tempDir\.env" -Force -ErrorAction SilentlyContinue
    
    Compress-Archive -Path "$tempDir\*" -DestinationPath "backend.zip" -Force
    Remove-Item $tempDir -Recurse -Force
    
    $backendSize = (Get-Item "backend.zip").Length / 1MB
    Write-Host "✅ backend.zip created ($([math]::Round($backendSize, 2)) MB)" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   📤 UPLOAD INSTRUCTIONS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

if (-not $BackendOnly) {
    Write-Host "1. Frontend (dist.zip):" -ForegroundColor White
    Write-Host "   → Upload to: /public_html/shop/" -ForegroundColor Gray
    Write-Host "   → Extract and overwrite existing files" -ForegroundColor Gray
    Write-Host ""
}

if (-not $FrontendOnly) {
    Write-Host "2. Backend (backend.zip):" -ForegroundColor White
    Write-Host "   → Upload to: /public_html/shop/api/" -ForegroundColor Gray
    Write-Host "   → Extract and overwrite existing files" -ForegroundColor Gray
    Write-Host "   → DO NOT overwrite .env file on server!" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "3. After Upload:" -ForegroundColor White
Write-Host "   → Go to cPanel > Setup Node.js App" -ForegroundColor Gray
Write-Host "   → Click 'Restart' on E-Store app" -ForegroundColor Gray
Write-Host ""

Write-Host "🌐 Test at: https://shop.buyinn.pk" -ForegroundColor Cyan
Write-Host ""
