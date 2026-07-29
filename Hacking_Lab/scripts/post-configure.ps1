param(
  [string]$Inventory = "../ansible/inventory.ini",
  [string]$AnsibleDir = "../ansible"
)

$ErrorActionPreference = "Stop"

Push-Location $PSScriptRoot
try {
  if (-not (Test-Path $Inventory)) {
    throw "Missing inventory file at $Inventory. Copy inventory.ini.example first."
  }

  Set-Location $AnsibleDir
  ansible-playbook -i $Inventory lab-router.yml
  ansible-playbook -i $Inventory lab-clients.yml
}
finally {
  Pop-Location
}
