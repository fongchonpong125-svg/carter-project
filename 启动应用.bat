@echo off
setlocal

cd /d "%~dp0"

echo ========================================
echo   FoodGuardian AI
echo ========================================
echo.
echo Starting app...
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

%PY_CMD% "%~dp0food_guardian_ai.py"

if errorlevel 1 (
    echo.
    echo App exited with an error.
    echo If needed, run install_deps.bat or ??????.bat first.
    pause
)
