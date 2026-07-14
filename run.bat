@echo off
title Aura Med - AI Medical Report Analyzer Launcher
echo ==============================================================
echo             AURA MED - AI MEDICAL REPORT ANALYZER              
echo ==============================================================
echo.

:: Capture root dir without trailing backslash
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

echo [1/4] Verifying environment configurations...
if not exist "%ROOT%\venv\Scripts\python.exe" (
    echo Error: Python virtual environment not found.
    echo Please run: python -m venv venv
    echo Then run:   venv\Scripts\pip install -r backend\requirements.txt
    pause
    exit /b 1
)
if not exist "%ROOT%\frontend\node_modules" (
    echo Error: Frontend node_modules not found.
    echo Please run: cd frontend ^&^& npm install
    pause
    exit /b 1
)

echo.
echo [2/4] Detecting local network IP...
for /f "tokens=*" %%I in ('powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like '192.168.*' } | Select-Object -First 1 -ExpandProperty IPAddress)"') do set "HOST_IP=%%I"
if not defined HOST_IP set "HOST_IP=localhost"
echo Detected IP: %HOST_IP%

echo.
echo [2b/4] Writing frontend\.env for Vite...
echo VITE_API_BASE_URL=http://%HOST_IP%:5000/api> "%ROOT%\frontend\.env"
echo Created frontend\.env with VITE_API_BASE_URL=http://%HOST_IP%:5000/api

echo.
echo [3/4] Launching Flask AI Backend Server (Port 5000)...
start "Aura Med Backend" cmd /k "pushd "%ROOT%" && venv\Scripts\python.exe backend\app.py"

echo Waiting 3 seconds for backend to initialize...
timeout /t 3 /nobreak >nul

echo.
echo [4/4] Launching React Vite Development Server (Port 5173)...
start "Aura Med Frontend" cmd /k "pushd "%ROOT%\frontend" && npm.cmd run dev -- --host 0.0.0.0"

echo.
echo ==============================================================
echo Servers launched!
echo - Frontend:       http://localhost:5173
if not "%HOST_IP%"=="localhost" echo - Frontend (LAN): http://%HOST_IP%:5173
echo - Backend API:    http://localhost:5000/api
if not "%HOST_IP%"=="localhost" echo - Backend  (LAN): http://%HOST_IP%:5000/api
echo.
echo To test, upload sample files from the 'samples' folder:
echo   samples\digital_blood_report.pdf
echo   samples\scanned_blood_report.png
echo ==============================================================
pause
