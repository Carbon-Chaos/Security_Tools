$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$tfDir = Join-Path $root 'terraform\proxmox'

Push-Location $tfDir
try {
  terraform init
  terraform destroy
}
finally {
  Pop-Location
}
