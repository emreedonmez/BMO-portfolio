@echo off
cd /d "%~dp0"
if not exist node_modules call npm ci
if errorlevel 1 goto failed
call npm run dev
exit /b 0
:failed
echo Setup failed. Node.js 22 or newer is required.
pause
exit /b 1
