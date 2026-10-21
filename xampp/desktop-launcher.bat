@echo off
:: =========================================================================
:: KANU G. AGABI & ASSOCIATES - CASE FILE INVENTORY AND TRACKING SYSTEM
:: Dedicated Windows Desktop Application Launcher
:: =========================================================================
title Kanu G. Agabi & Associates - Case Inventory
color 0F

echo =========================================================================
echo  KANU G. AGABI & ASSOCIATES - CENTRAL REGISTRY & FILE TRACKING SYSTEM
echo  Initializing Local Chambers Registry Desktop Interface...
echo =========================================================================
echo.

:: 1. Define chambers host URL
set APP_URL=http://localhost:3000
set SECURE_URL=https://localhost:8443/LawFirmInventory
set XAMPP_URL=http://localhost:8080/LawFirmInventory

:: 2. Search for Microsoft Edge or Google Chrome for Standalone App Window Mode
set CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
set CHROME_PATH_X86="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
set EDGE_PATH="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
set EDGE_PATH_X64="C:\Program Files\Microsoft\Edge\Application\msedge.exe"

if exist %EDGE_PATH_X64% (
    echo [OK] Launching via Microsoft Edge Desktop Window...
    start "" %EDGE_PATH_X64% --app=%APP_URL% --window-size=1400,900
    goto END
)

if exist %EDGE_PATH% (
    echo [OK] Launching via Microsoft Edge Desktop Window...
    start "" %EDGE_PATH% --app=%APP_URL% --window-size=1400,900
    goto END
)

if exist %CHROME_PATH% (
    echo [OK] Launching via Google Chrome Desktop Window...
    start "" %CHROME_PATH% --app=%APP_URL% --window-size=1400,900
    goto END
)

if exist %CHROME_PATH_X86% (
    echo [OK] Launching via Google Chrome Desktop Window...
    start "" %CHROME_PATH_X86% --app=%APP_URL% --window-size=1400,900
    goto END
)

:: Fallback: Open Default Browser
echo [OK] Launching in Default Browser...
start "" %APP_URL%

:END
echo.
echo Application window opened. You may minimize this console.
timeout /t 3 >nul
exit
