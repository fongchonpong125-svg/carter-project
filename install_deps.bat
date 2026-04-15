@echo off
setlocal

cd /d "%~dp0"

echo ========================================
echo   FoodGuardian AI - Install Dependencies
echo ========================================
echo.

set "PY_CMD="
py -3.14 -c "import sys" >nul 2>nul && set "PY_CMD=py -3.14"

if not defined PY_CMD (
    py -3 -c "import sys" >nul 2>nul && set "PY_CMD=py -3"
)

if not defined PY_CMD (
    python -c "import sys" >nul 2>nul && set "PY_CMD=python"
)

if not defined PY_CMD (
    echo No usable Python was found.
    pause
    exit /b 1
)

echo Using %PY_CMD%
echo.
%PY_CMD% -m pip install -r "%~dp0requirements.txt"

if errorlevel 1 (
    echo.
    echo Dependency installation failed.
    pause
    exit /b 1
)

echo.
echo Dependencies installed successfully.
pause
