# Deploy DOD Shop and Admin Dashboard to Vercel (separate projects)
# Prerequisites: run `vercel login` first, or set $env:VERCEL_TOKEN

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent

Write-Host "=== Deploying DOD Shop (dodshop) ===" -ForegroundColor Cyan
Set-Location "$Root\dodshop"
vercel link --yes 2>$null
vercel deploy --prod --yes --name dodshop-final

Write-Host "`n=== Deploying Admin Dashboard (Dashbord) ===" -ForegroundColor Cyan
Set-Location "$Root\Dashbord"
vercel link --yes 2>$null
vercel deploy --prod --yes --name dodshop-dashboard

Write-Host "`nDone! Set env vars in each Vercel project:" -ForegroundColor Green
Write-Host "  DATABASE_URL, JWT_SECRET"
Write-Host "  dodshop: NEXT_PUBLIC_SITE_URL"
Write-Host "  Dashbord: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, JWT_EXPIRY"
