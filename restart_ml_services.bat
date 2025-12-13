@echo off
echo ==============================================
echo      Stopping HealTrip ML Services...
echo ==============================================

:: Kill processes on ports 8000 (Hotels), 8001 (Hospitals), 8002 (Flights), 8003 (Visa)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8001') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8002') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8003') do taskkill /F /PID %%a 2>nul

echo.
echo ==============================================
echo      Starting ML Services...
echo ==============================================

:: Using 'call' to ensure python runs if it's a bat shim, and cd into directories for reliable imports

echo Starting Hotels Service (Port 8000)...
start "HealTrip - Hotels ML" cmd /k "cd backend\ml\hotels && python main.py"

echo Starting Hospitals Service (Port 8001)...
start "HealTrip - Hospitals ML" cmd /k "cd backend\ml\hospitals && python main.py"

echo Starting Flights Service (Port 8002)...
start "HealTrip - Flights ML" cmd /k "cd backend\ml\flights && python main.py"

echo Starting Visa Service (Port 8003)...
start "HealTrip - Visa ML" cmd /k "cd backend\ml\visa\backend && python main.py"

echo.
echo ==============================================
echo      All Services Restarted!
echo ==============================================
echo You can minimize the opened terminal windows.
pause
