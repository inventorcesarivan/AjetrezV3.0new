@echo off
REM --- Ajetrez: servidor local simple (requiere Python instalado) ---
set PORT=8000
cd /d %~dp0
where python >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Python no encontrado. Instala desde https://www.python.org/downloads/ y vuelve a ejecutar.
  pause
  exit /b 1
)
echo Iniciando servidor en http://localhost:%PORT%/
echo (Cierra esta ventana para detener el servidor)
start "" "http://localhost:%PORT%/diagnostico_stockfish.html"
python -m http.server %PORT%
