$ErrorActionPreference = 'Stop'

$appName = 'Cyber Security Operations Platform'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$launcherPath = Join-Path $scriptDir 'launch-cyber-ops.cmd'

if (-not (Test-Path $launcherPath)) {
  throw "Launcher was not found at $launcherPath"
}

$desktopPath = [Environment]::GetFolderPath('Desktop')
$startMenuPrograms = Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs'
$desktopShortcut = Join-Path $desktopPath "$appName.lnk"
$startMenuShortcut = Join-Path $startMenuPrograms "$appName.lnk"
$iconPath = Join-Path $env:SystemRoot 'System32\shell32.dll'

$wshShell = New-Object -ComObject WScript.Shell

foreach ($shortcutPath in @($desktopShortcut, $startMenuShortcut)) {
  $shortcut = $wshShell.CreateShortcut($shortcutPath)
  $shortcut.TargetPath = $launcherPath
  $shortcut.WorkingDirectory = $scriptDir
  $shortcut.IconLocation = "$iconPath,220"
  $shortcut.Description = 'Launch Cyber Security Operations Platform'
  $shortcut.Save()
}

Write-Host "Shortcuts created:" 
Write-Host "- $desktopShortcut"
Write-Host "- $startMenuShortcut"
