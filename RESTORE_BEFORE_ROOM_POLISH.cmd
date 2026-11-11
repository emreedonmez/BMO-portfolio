@echo off
cd /d "%~dp0"
echo Restoring the published v1.3.0 room before the surface and camera corrections.
if not exist node_modules call npm ci
if errorlevel 1 goto failed
call npx wrangler rollback d0730143-d5a7-4fae-be0d-55a41deb6c20 --message "Restore room before v1.4.0 detail corrections"
if errorlevel 1 goto failed
pause
exit /b 0
:failed
echo Restore stopped. Read the error above or redeploy the complete v1.3.0 backup.
pause
exit /b 1
