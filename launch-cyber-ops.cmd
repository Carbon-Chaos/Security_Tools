@echo off
setlocal
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"
call "%SCRIPT_DIR%run-cyber-ops.cmd"
exit /b %ERRORLEVEL%
