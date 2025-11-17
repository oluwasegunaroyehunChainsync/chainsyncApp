@echo off
echo Fixing Tailwind CSS Configuration...
echo.

echo Step 1: Deleting old lock files and node_modules...
if exist "package-lock.json" del package-lock.json
if exist "pnpm-lock.yaml" del pnpm-lock.yaml
if exist "node_modules" rmdir /s /q node_modules
echo Done!
echo.

echo Step 2: Installing dependencies with pnpm...
call pnpm install
echo.

echo Step 3: Clearing Vite cache...
if exist ".vite" rmdir /s /q .vite
if exist "dist" rmdir /s /q dist
echo Done!
echo.

echo Configuration fixed! You can now run:
echo   pnpm dev
echo.
pause

