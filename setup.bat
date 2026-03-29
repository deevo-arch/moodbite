@echo off
title MoodBite: Zero-Config Setup
echo 🍷 MoodBite: Initiating Atmospheric Setup Wrapper...
powershell -ExecutionPolicy Bypass -File "%~dp0setup.ps1"
echo.
echo Setup script finished.
pause
