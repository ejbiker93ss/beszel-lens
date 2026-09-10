@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-BeszelLens.ps1" %*
if not "%ERRORLEVEL%"=="0" pause
exit /b %ERRORLEVEL%
