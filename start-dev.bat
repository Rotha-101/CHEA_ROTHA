@echo off
REM Portfolio CMS - Start Both Servers
REM This script starts the frontend and backend simultaneously

echo.
echo ========================================
echo  Portfolio CMS - Development Server
echo ========================================
echo.
echo Starting both frontend and backend...
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3001
echo.
echo Press Ctrl+C to stop both servers
echo ========================================
echo.

npm run dev:full
