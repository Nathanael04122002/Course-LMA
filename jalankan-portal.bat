@echo off
title Menjalankan Website & Portal Belajar LMA (Bali)
echo ========================================================
echo   LMA - Lerne mit Andre (Bali, Indonesia)
echo   Menjalankan Server Lokal & Membuka Portal Belajar...
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Membuka Portal Belajar di Browser...
start "" "http://localhost:8000/portal/login.html"

echo [2/2] Memulai Local Web Server di Port 8000...
echo Tekan Ctrl+C di jendela ini jika ingin menghentikan server.
echo.
python -m http.server 8000
pause
