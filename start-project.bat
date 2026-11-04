@echo off
echo ========================================================
echo  CAFETERIA PRE-ORDER & QUEUE MANAGEMENT SYSTEM
echo  College Academic Project - Launching System Servers...
echo ========================================================
echo.

start "Cafeteria Backend Server (Port 5000)" cmd /k "cd backend && npm start"
timeout /t 2 /nobreak >nul
start "Cafeteria Frontend App (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo Servers started successfully!
echo Backend API & WebSockets: http://localhost:5000
echo Frontend Web Application: http://localhost:5173
echo.
pause
