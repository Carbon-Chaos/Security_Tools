@echo off
setlocal
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"
echo Launching Cyber Lab Mission Control...
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%game-mission-control.ps1"
exit /b 0
