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
echo [3/6] Starting Flights Service on Port 8002...
start "Flights ML Service" cmd /k "cd backend\ml\flights && python main.py"
timeout /t 2 /nobreak >nul

REM Start Visa Service (Port 8003)
echo [4/6] Starting Visa Service on Port 8003...
start "Visa ML Service" cmd /k "cd backend\ml\visa\backend && python main.py"
timeout /t 2 /nobreak >nul

REM Start Mental Health Service (Port 8004)
echo [5/6] Starting Mental Health Service on Port 8004...
start "Mental Health ML Service" cmd /k "cd backend\ml\ml-mental && python main.py"
timeout /t 2 /nobreak >nul

REM Start Yoga Service (Port 8005)
echo [6/6] Starting Yoga Service on Port 8005...
start "Yoga ML Service" cmd /k "cd backend\ml\ml-yoga && python main.py"

echo.
echo ========================================
echo All 6 ML Services Started!
echo ========================================
echo Hotels:    http://localhost:8000
echo Hospitals: http://localhost:8001
echo Flights:   http://localhost:8002
echo Visa:      http://localhost:8003
echo Mental:    http://localhost:8004
echo Yoga:      http://localhost:8005
echo ========================================
echo.
echo Press any key to exit this window...
pause >nul
