$ErrorActionPreference = 'Stop'

$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$outputDir = Join-Path $projectPath 'windows-dist\game-installer'
$payloadDir = Join-Path $outputDir 'payload'
$issPath = Join-Path $projectPath 'windows-installer\inno\setup.iss'

if (-not (Test-Path $issPath)) {
  throw "Missing Inno Setup script at $issPath"
}

if (Test-Path $payloadDir) {
  Remove-Item -Recurse -Force $payloadDir
}
New-Item -ItemType Directory -Force -Path $payloadDir | Out-Null
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$filesToCopy = @(
  'package.json',
  'package-lock.json',
  'server.js',
  'safety-engine.js',
  'service-wrapper.js',
  'start.ps1',
  'install.bat',
  'install-service.ps1',
  'launch-cyber-ops.cmd',
  'run-cyber-ops.cmd',
  'README.md',
  'portable-readme.txt'
)

foreach ($relPath in $filesToCopy) {
  $sourcePath = Join-Path $projectPath $relPath
  if (-not (Test-Path $sourcePath)) {
    throw "Missing required file: $sourcePath"
  }
  Copy-Item -Path $sourcePath -Destination (Join-Path $payloadDir $relPath) -Force
}

$dirsToCopy = @('public', 'node_modules', 'tools', 'Hacking_Lab')
foreach ($relPath in $dirsToCopy) {
  $sourcePath = Join-Path $projectPath $relPath
  if (-not (Test-Path $sourcePath)) {
    throw "Missing required directory: $sourcePath"
  }
  Copy-Item -Recurse -Path $sourcePath -Destination (Join-Path $payloadDir $relPath) -Force
}

$runtimeDir = Join-Path $payloadDir 'runtime'
New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null
$nodeInstallDir = Join-Path $env:ProgramFiles 'nodejs'
$nodeExe = Join-Path $nodeInstallDir 'node.exe'
if (Test-Path $nodeExe) {
  Copy-Item -Path $nodeExe -Destination (Join-Path $runtimeDir 'node.exe') -Force
  Get-ChildItem -Path $nodeInstallDir -Filter '*.dll' -File -ErrorAction SilentlyContinue | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination (Join-Path $runtimeDir $_.Name) -Force
  }
}
else {
  Write-Warning 'node.exe was not found under Program Files\nodejs. Installer will require Node.js 20+ on target machine.'
}

$packageJson = Get-Content -Path (Join-Path $projectPath 'package.json') -Raw | ConvertFrom-Json
$appVersion = [string]$packageJson.version
if ([string]::IsNullOrWhiteSpace($appVersion)) {
  $appVersion = '1.0.0'
}

$isccCandidates = @()
$cmd = Get-Command 'iscc.exe' -ErrorAction SilentlyContinue
if ($cmd) { $isccCandidates += $cmd.Source }
$isccCandidates += @(
  (Join-Path $env:LOCALAPPDATA 'Programs\Inno Setup 6\ISCC.exe'),
  (Join-Path $env:LOCALAPPDATA 'Inno Setup 6\ISCC.exe'),
  (Join-Path ${env:ProgramFiles(x86)} 'Inno Setup 6\ISCC.exe'),
  (Join-Path $env:ProgramFiles 'Inno Setup 6\ISCC.exe')
)
$isccPath = $isccCandidates | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1

if (-not $isccPath) {
  throw "Inno Setup compiler was not found. Install it with: winget install -e --id JRSoftware.InnoSetup"
}

& $isccPath "/DAppVersion=$appVersion" "/DPayloadDir=$payloadDir" "/DOutputDir=$outputDir" $issPath
if ($LASTEXITCODE -ne 0) {
  throw "ISCC failed with exit code $LASTEXITCODE"
}

$setupExe = Get-ChildItem -Path $outputDir -Filter 'CyberSecurityOpsSetup-*.exe' -File | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $setupExe) {
  throw 'Setup executable was not generated.'
}

if (Test-Path $payloadDir) {
  Remove-Item -Recurse -Force $payloadDir
}

Write-Host "Game-style installer created at $($setupExe.FullName)"
