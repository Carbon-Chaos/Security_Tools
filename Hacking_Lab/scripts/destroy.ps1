param(
  [string]$TerraformDir = "../terraform/proxmox"
)

$ErrorActionPreference = "Stop"

Push-Location $PSScriptRoot
try {
  Set-Location $TerraformDir
  terraform init
  terraform destroy
}
finally {
  Pop-Location
}
