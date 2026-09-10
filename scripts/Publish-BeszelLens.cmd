@echo off
setlocal

set "SCRIPT_DIR=%~dp0"

echo Building Beszel Lens...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%Build-BeszelLensOutput.ps1"
if not "%ERRORLEVEL%"=="0" exit /b %ERRORLEVEL%

echo Publishing Beszel Lens to the internal app share...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%Copy-BeszelLensOutputToFileServer.ps1" %*
if not "%ERRORLEVEL%"=="0" exit /b %ERRORLEVEL%

echo Beszel Lens published successfully.
pause
