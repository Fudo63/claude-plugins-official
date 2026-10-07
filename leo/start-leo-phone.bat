@echo off
title J.A.R.V.I.S. Phone Launcher
cd /d "%~dp0"

REM Stop any old agent so we have port 3000 to ourselves
for /f "tokens=5" %%P in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do taskkill /F /PID %%P >nul 2>&1

REM Start the agent server (now also serves the web app on the same port)
start "LEO Agent" /min cmd /c "cd leo-agent && node server.js"

REM Give the agent a moment to bind port 3000
timeout /t 3 /nobreak >nul

REM Start the Cloudflare quick tunnel — public HTTPS URL, no signup, free
echo.
echo ============================================================
echo   Cloudflare tunnel starting. Your public URL will appear
echo   below. Open it in your phone's browser to use LEO.
echo ============================================================
echo.

cloudflared.exe tunnel --url http://localhost:3000 --no-autoupdate
