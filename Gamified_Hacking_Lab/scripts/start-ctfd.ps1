$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$ctfdDir = Join-Path $root 'ctfd'

Push-Location $ctfdDir
try {
  docker compose up -d
  Write-Host 'CTFd is starting at http://localhost:8000'
}
finally {
  Pop-Location
}
