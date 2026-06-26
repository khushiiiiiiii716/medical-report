@echo off
title Aura Med - AI Medical Report Analyzer Launcher
echo ==============================================================
echo             AURA MED - AI MEDICAL REPORT ANALYZER              
echo ==============================================================
echo.
echo [1/4] Verifying environment configurations...
if not exist "venv\Scripts\python.exe" (
    echo Error: Python virtual environment not found. Please ensure venv is created.
    pause
    exit /b
)
if not exist "frontend\node_modules" (
    echo Error: Frontend node_modules not found. Please run 'npm install' in frontend folder.
    pause
    exit /b
)

echo.
echo [2/4] Detecting local network IP...
for /f "tokens=*" %%I in ('powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 `
    | Where-Object { $_.IPAddress -like '192.168.*' -and $_.IPAddress -ne '127.0.0.1' } `
    | Select-Object -First 1 -ExpandProperty IPAddress)"') do set "HOST_IP=%%I"
if not defined HOST_IP set "HOST_IP=localhost"
set "VITE_API_BASE_URL=http://%HOST_IP%:5000/api"

echo.
echo [3/4] Launching Flask AI Backend Server (Port 5000)...
start "Aura Med Backend" cmd /k ".\venv\Scripts\python backend/app.py"

echo.
echo [4/4] Launching React Vite Development Server (Port 5173)...
echo Dev server starting. Browser will open shortly...
set "VITE_API_BASE_URL=http://%HOST_IP%:5000/api"
start "Aura Med Frontend" cmd /k "cd frontend && npm.cmd run dev -- --host 0.0.0.0"

echo.
echo ==============================================================
echo Servers launched!
echo - Frontend: http://localhost:5173
if not "%HOST_IP%"=="localhost" echo - Frontend mobile: http://%HOST_IP%:5173
echo - Backend mobile API: http://%HOST_IP%:5000/api
echo.
echo To test, upload sample files from the 'samples' folder:
echo - samples/digital_blood_report.pdf
echo - samples/scanned_blood_report.png
echo ==============================================================
pause
