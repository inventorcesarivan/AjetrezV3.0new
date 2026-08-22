$port = 8000
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
  Write-Error "Python no encontrado. Instala desde https://www.python.org/downloads/ y vuelve a ejecutar."
  exit 1
}
Start-Process "http://localhost:$port/diagnostico_stockfish.html"
python -m http.server $port
