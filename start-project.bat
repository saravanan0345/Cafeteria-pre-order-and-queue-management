@echo off
setlocal enabledelayedexpansion
title Cafeteria Project Launcher

echo ========================================================
echo  CAFETERIA PRE-ORDER AND QUEUE MANAGEMENT SYSTEM
echo  College Academic Project - Launching System Servers...
echo ========================================================
echo.

:: Ensure current working directory is the script folder
cd /d "%~dp0"

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found on this computer!
    echo Please install Node.js from https://nodejs.org and try again.
    echo.
    pause
    exit /b 1
)

:: 2. Check if backend dependencies are installed
if not exist "%~dp0backend\node_modules" (
    echo [1/3] Setting up backend dependencies for first-time run...
    cd /d "%~dp0backend"
    call npm.cmd install
    cd /d "%~dp0"
)

:: 3. Check if frontend dependencies are installed
if not exist "%~dp0frontend\node_modules" (
    echo [2/3] Setting up frontend dependencies for first-time run...
    cd /d "%~dp0frontend"
    call npm.cmd install
    cd /d "%~dp0"
)

echo [3/3] Starting Backend and Frontend Servers...

:: Launch Backend Server in dedicated window
start "Cafeteria-Backend (Port 5000)" cmd /k "cd /d ""%~dp0backend"" && npm.cmd start"

:: Safe delay across all Windows versions
ping 127.0.0.1 -n 3 >nul

:: Launch Frontend Server in dedicated window
start "Cafeteria-Frontend (Port 5173)" cmd /k "cd /d ""%~dp0frontend"" && npm.cmd run dev"

:: Safe delay
ping 127.0.0.1 -n 3 >nul

:: Automatically open default browser
echo.
echo ========================================================
echo  Both Servers are RUNNING!
echo  Opening http://localhost:5173 in your browser...
echo.
echo  - Frontend Web App:     http://localhost:5173
echo  - Live Queue TV Board:  http://localhost:5173/queue-board
echo  - Backend API:          http://localhost:5000
echo ========================================================
echo.

start http://localhost:5173

pause
