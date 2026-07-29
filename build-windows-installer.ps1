$ErrorActionPreference = 'Stop'
$projectPath = 'C:\Users\rober\cyber-lab-platform'
$outputDir = Join-Path $projectPath 'windows-dist'
$installerDir = Join-Path $outputDir 'installer-root'
New-Item -ItemType Directory -Force -Path $installerDir | Out-Null

Copy-Item -Path (Join-Path $projectPath 'package.json') -Destination $installerDir -Force
Copy-Item -Path (Join-Path $projectPath 'server.js') -Destination $installerDir -Force
Copy-Item -Path (Join-Path $projectPath 'safety-engine.js') -Destination $installerDir -Force
Copy-Item -Path (Join-Path $projectPath 'service-wrapper.js') -Destination $installerDir -Force
Copy-Item -Path (Join-Path $projectPath 'start.ps1') -Destination $installerDir -Force
Copy-Item -Path (Join-Path $projectPath 'install.bat') -Destination $installerDir -Force
Copy-Item -Path (Join-Path $projectPath 'launch-cyber-ops.cmd') -Destination $installerDir -Force
Copy-Item -Path (Join-Path $projectPath 'run-cyber-ops.cmd') -Destination $installerDir -Force
Copy-Item -Path (Join-Path $projectPath 'create-shortcuts.ps1') -Destination $installerDir -Force
Copy-Item -Path (Join-Path $projectPath 'portable-readme.txt') -Destination $installerDir -Force
Copy-Item -Recurse -Path (Join-Path $projectPath 'public') -Destination $installerDir -Force
Copy-Item -Recurse -Path (Join-Path $projectPath 'node_modules') -Destination $installerDir -Force

$installerZip = Join-Path $outputDir 'cyber-security-operations-platform-installer.zip'
Compress-Archive -Path (Join-Path $installerDir '*') -DestinationPath $installerZip -Force
Write-Host "Windows installer package created at $installerZip"
