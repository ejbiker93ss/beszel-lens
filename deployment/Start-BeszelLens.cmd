@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Scripts\Start-BeszelLens.ps1" -SourcePath "%~dp0" %*
if not "%ERRORLEVEL%"=="0" pause
exit /b %ERRORLEVEL%
