$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$ansibleDirWin = Join-Path $root 'ansible'
$ansibleDirWsl = '/mnt/c/Users/rober/cyber-lab-platform/Gamified_Hacking_Lab/ansible'

if (-not (Test-Path (Join-Path $ansibleDirWin 'inventory.ini'))) {
  Copy-Item (Join-Path $ansibleDirWin 'inventory.ini.example') (Join-Path $ansibleDirWin 'inventory.ini')
  Write-Host 'Created inventory.ini. Edit IPs if needed, then run this script again.'
  exit 0
}

wsl bash -lc "cd $ansibleDirWsl && ansible-playbook -i inventory.ini site.yml"
