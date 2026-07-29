@echo off
setlocal
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"
set "NODE_EXE=%SCRIPT_DIR%runtime\node.exe"
if not exist "%NODE_EXE%" (
  where node >nul 2>nul
  if errorlevel 1 (
    echo Node.js was not found. Please install Node.js 20+ from https://nodejs.org/
    pause
    exit /b 1
  )
  set "NODE_EXE=node"
)

echo Launching Cyber Security Operations Platform...
start "Cyber Security Operations Platform" cmd /k "\"%NODE_EXE%\" server.js"
start "" "http://localhost:3000"
exit /b 0
