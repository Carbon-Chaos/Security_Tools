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
echo Starting application...
start "Cyber Security Operations" cmd /k "npm start"
exit /b 0
