@echo off
echo Starting HealTrip ML Services...
echo.

REM Start Hotels Service (Port 8000)
echo [1/3] Starting Hotels Service on Port 8000...
start "Hotels ML Service" cmd /k "cd backend\ml\hotels && python main.py"
timeout /t 2 /nobreak >nul

REM Start Hospitals Service (Port 8001)
echo [2/3] Starting Hospitals Service on Port 8001...
start "Hospitals ML Service" cmd /k "cd backend\ml\hospitals && python main.py"
timeout /t 2 /nobreak >nul

REM Start Flights Service (Port 8002)
echo [3/3] Starting Flights Service on Port 8002...
start "Flights ML Service" cmd /k "cd backend\ml\flights && python main.py"

echo.
echo ========================================
echo All ML Services Started!
echo ========================================
echo Hotels:    http://localhost:8000
echo Hospitals: http://localhost:8001
echo Flights:   http://localhost:8002
echo ========================================
echo.
echo Press any key to exit this window...
pause >nul
