$ErrorActionPreference = 'Stop'

$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourcePath = Join-Path $projectPath 'Hacking_Lab'
$outputDir = Join-Path $projectPath 'downloads'
$bundlePath = Join-Path $outputDir 'Hacking_Lab_bundle.zip'
$tempDir = Join-Path $outputDir 'Hacking_Lab_bundle'

if (-not (Test-Path $sourcePath)) {
  throw "Expected folder was not found: $sourcePath"
}

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
if (Test-Path $tempDir) {
  Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

Copy-Item -Recurse -Force -Path $sourcePath -Destination (Join-Path $tempDir 'Hacking_Lab')
Copy-Item -Force -Path (Join-Path $projectPath 'README.md') -Destination (Join-Path $tempDir 'README.md')

if (Test-Path $bundlePath) {
  Remove-Item -Force $bundlePath
}

Compress-Archive -Path (Join-Path $tempDir '*') -DestinationPath $bundlePath -Force
Remove-Item -Recurse -Force $tempDir
Write-Host "Hacking Lab bundle created at $bundlePath"
