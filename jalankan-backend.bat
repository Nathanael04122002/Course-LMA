@echo off
title Menjalankan Backend Express LMA (Port 5000)
echo ========================================================
echo   LMA - Lerne mit Andre (Backend Server)
echo ========================================================
echo.

cd /d "%~dp0my-backend"

if not exist node_modules (
    echo Mengunduh dependencies Node.js pertama kali...
    npm install
)

echo Menjalankan Backend Express di http://localhost:5000 ...
npm start
pause
