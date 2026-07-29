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
echo Launching Cyber Security Operations Platform...
start "Cyber Security Operations" cmd /k "npm start"
start "" "http://localhost:3000"
exit /b 0
