param(
  [string]$TerraformDir = "../terraform/proxmox"
)

$ErrorActionPreference = "Stop"

Push-Location $PSScriptRoot
try {
  Set-Location $TerraformDir
  terraform init
  terraform validate
  terraform plan -out lab.plan
  terraform apply lab.plan
}
finally {
  Pop-Location
}
