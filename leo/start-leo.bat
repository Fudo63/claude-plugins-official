@echo off
title J.A.R.V.I.S. Launcher
cd /d "%~dp0"

REM Kill any old agent/cloudflared so we have a clean slate
for /f "tokens=5" %%P in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do taskkill /F /PID %%P >nul 2>&1
taskkill /F /IM cloudflared.exe >nul 2>&1

REM Start the agent server (serves the web app + agent tools on port 3000)
start "LEO Agent" /min cmd /c "cd leo-agent && node server.js"

REM Give the agent a moment to bind port 3000
timeout /t 3 /nobreak >nul

REM Start the Cloudflare tunnel — public HTTPS URL for phone access.
REM Visible (not minimized) so you can read off the URL for your phone.
start "LEO Tunnel — your phone URL appears here" cmd /c "echo. && echo ============================================ && echo   Your phone-accessible URL will appear below && echo ============================================ && echo. && cloudflared.exe tunnel --url http://localhost:3000 --no-autoupdate"

REM Open Chrome on the desktop using direct localhost (no tunnel needed locally)
set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe"

if exist "%CHROME%" (
  start "" "%CHROME%" --app=http://localhost:3000/LEO.html --new-window --autoplay-policy=no-user-gesture-required
) else (
  start "" "http://localhost:3000/LEO.html"
)

exit
