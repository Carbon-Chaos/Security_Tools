$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$tfDir = Join-Path $root 'terraform\proxmox'

& (Join-Path $PSScriptRoot 'load-secrets.ps1')

Push-Location $tfDir
try {
  terraform init
  terraform validate
  terraform plan -out lab.plan
  terraform apply lab.plan
}
finally {
  Pop-Location
}
