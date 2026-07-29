$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$ctfdDir = Join-Path $root 'ctfd'

Push-Location $ctfdDir
try {
  docker compose down
}
finally {
  Pop-Location
}
