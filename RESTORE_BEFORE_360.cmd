@echo off
cd /d "%~dp0"
echo Restoring the approved full 3D room before 360-degree navigation.
echo Cloudflare will ask for confirmation before switching production.
if not exist node_modules call npm ci
if errorlevel 1 goto failed
call npx wrangler rollback 3cf52e69-45b6-4d22-a81b-657d83f304ab --message "Restore approved room before 360-degree navigation"
if errorlevel 1 goto failed
pause
exit /b 0
:failed
echo Restore stopped. Read the error above. You can also deploy the complete before-360 backup.
pause
exit /b 1
