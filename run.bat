@echo off
title Aura Med - AI Medical Report Analyzer Launcher
echo ==============================================================
echo             AURA MED - AI MEDICAL REPORT ANALYZER              
echo ==============================================================
echo.
echo [1/3] Verifying environment configurations...
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
echo [2/3] Launching Flask AI Backend Server (Port 5000)...
start "Aura Med Backend" cmd /k ".\venv\Scripts\python backend/app.py"

echo.
echo [3/3] Launching React Vite Development Server (Port 5173)...
echo Dev server starting. Browser will open shortly...
npm.cmd --prefix frontend run dev

echo.
echo ==============================================================
echo Servers launched!
echo - Frontend: http://localhost:5173
echo - Backend: http://localhost:5000
echo.
echo To test, upload sample files from the 'samples' folder:
echo - samples/digital_blood_report.pdf
echo - samples/scanned_blood_report.png
echo ==============================================================
pause
