$ErrorActionPreference = 'Stop'
$projectPath = 'C:\Users\rober\cyber-lab-platform'
$outputDir = Join-Path $projectPath 'dist'
$installerDir = Join-Path $outputDir 'portable-app'

New-Item -ItemType Directory -Force -Path $installerDir | Out-Null

Copy-Item -Path (Join-Path $projectPath 'package.json') -Destination $installerDir -Force
Copy-Item -Path (Join-Path $projectPath 'server.js') -Destination $installerDir -Force
Copy-Item -Path (Join-Path $projectPath 'safety-engine.js') -Destination $installerDir -Force
Copy-Item -Path (Join-Path $projectPath 'service-wrapper.js') -Destination $installerDir -Force
Copy-Item -Path (Join-Path $projectPath 'start.ps1') -Destination $installerDir -Force
Copy-Item -Path (Join-Path $projectPath 'README.md') -Destination $installerDir -Force
Copy-Item -Path (Join-Path $projectPath '.env.example') -Destination $installerDir -Force
Copy-Item -Path (Join-Path $projectPath 'Dockerfile') -Destination $installerDir -Force
Copy-Item -Path (Join-Path $projectPath 'docker-compose.yml') -Destination $installerDir -Force
Copy-Item -Path (Join-Path $projectPath 'Procfile') -Destination $installerDir -Force
Copy-Item -Recurse -Path (Join-Path $projectPath 'public') -Destination $installerDir -Force
Copy-Item -Recurse -Path (Join-Path $projectPath 'node_modules') -Destination $installerDir -Force

$installerZip = Join-Path $outputDir 'cyber-security-operations-platform-portable.zip'
if (Get-Command Compress-Archive -ErrorAction SilentlyContinue) {
  Compress-Archive -Path (Join-Path $installerDir '*') -DestinationPath $installerZip -Force
} else {
  Write-Host 'Compress-Archive is unavailable. The portable directory is ready at:'
  Write-Host $installerDir
}

Write-Host "Portable package created at $installerZip"
