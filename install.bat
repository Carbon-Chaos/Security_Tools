@echo off
setlocal
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Please install Node.js 20+ from https://nodejs.org/
  pause
  exit /b 1
)
if not exist "%SCRIPT_DIR%node_modules" (
  echo Installing dependencies...
  npm install
)
echo Creating Desktop and Start Menu shortcuts...
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%create-shortcuts.ps1"
if errorlevel 1 (
  echo Shortcut creation was skipped. You can run create-shortcuts.ps1 manually.
)
echo Starting application...
start "" "%SCRIPT_DIR%launch-cyber-ops.cmd"
exit /b 0
