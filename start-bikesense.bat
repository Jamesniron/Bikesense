@echo off
title BikeSense - Local Dev Launcher

where powershell >nul 2>&1
if errorlevel 1 (
    echo ERROR: PowerShell was not found on this system.
    pause
    exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-bikesense.ps1"
