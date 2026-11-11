@echo off
cd /d "%~dp0"
call npm ci
if errorlevel 1 goto failed
call npm run deploy
if errorlevel 1 goto failed
echo Deployment completed.
pause
exit /b 0
:failed
echo Deployment stopped. Read the error above. For Cloudflare login: npx wrangler login
pause
exit /b 1
