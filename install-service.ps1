$ErrorActionPreference = 'Stop'
$projectPath = 'C:\Users\rober\cyber-lab-platform'
$serviceName = 'CyberLabMonitor'
$nodeExe = 'C:\Program Files\nodejs\node.exe'
$wrapperPath = Join-Path $projectPath 'service-wrapper.js'
$binaryPath = '"' + $nodeExe + '" "' + $wrapperPath + '"'

if (-not (Test-Path $nodeExe)) {
  throw "Node.js was not found at $nodeExe"
}

if (Get-Service -Name $serviceName -ErrorAction SilentlyContinue) {
  Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue
  sc.exe delete $serviceName | Out-Null
}

New-Service -Name $serviceName -BinaryPathName $binaryPath -DisplayName 'Cyber Lab Monitor' -StartupType Automatic -Description 'Background safety monitoring service for links, downloads, and attachments' | Out-Null
Set-Service -Name $serviceName -StartupType Automatic
Start-Service -Name $serviceName

Write-Host "Installed and started $serviceName"
