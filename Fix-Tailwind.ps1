# Tailwind CSS Fix Script for PowerShell (Windows)
# Run this script with: powershell -ExecutionPolicy Bypass -File .\Fix-Tailwind.ps1

Write-Host "=== Fixing Tailwind CSS Configuration ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Delete old lock files and node_modules
Write-Host "Step 1: Cleaning up old dependencies..." -ForegroundColor Yellow
$itemsToRemove = @("package-lock.json", "pnpm-lock.yaml", "node_modules", ".vite", "dist")

foreach ($item in $itemsToRemove) {
    if (Test-Path $item) {
        Write-Host "  Removing: $item"
        Remove-Item -Path $item -Recurse -Force -ErrorAction SilentlyContinue
    }
}
Write-Host "  ✓ Cleanup complete!" -ForegroundColor Green
Write-Host ""

# Step 2: Install dependencies
Write-Host "Step 2: Installing fresh dependencies with pnpm..." -ForegroundColor Yellow
& pnpm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "  ✗ Error during installation" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Success message
Write-Host "=== ✓ Configuration Fixed Successfully ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Run: pnpm dev"
Write-Host "  2. Open your browser"
Write-Host "  3. Check if Tailwind CSS is applied correctly"
Write-Host ""
Write-Host "If still having issues:" -ForegroundColor Yellow
Write-Host "  - Hard refresh browser (Ctrl + Shift + R)"
Write-Host "  - Check browser DevTools Console for errors"
Write-Host "  - Verify postcss.config.js has tailwindcss plugin"
Write-Host ""

