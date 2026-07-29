$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$tfDir = Join-Path $root 'terraform\proxmox'

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
