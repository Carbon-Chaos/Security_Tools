$ErrorActionPreference = 'Stop'

function Get-NodeExe {
  $localNode = Join-Path $PSScriptRoot 'runtime\node.exe'
  if (Test-Path $localNode) {
    return $localNode
  }

  $resolved = Get-Command node -ErrorAction SilentlyContinue
  if ($resolved) {
    return $resolved.Source
  }

  throw 'Node.js was not found. Install Node.js 20+ and run again.'
}

function Start-FakeHackingGame {
  $nodeExe = Get-NodeExe
  $gameScript = Join-Path $PSScriptRoot 'fake-hacking-game.js'
  if (-not (Test-Path $gameScript)) {
    throw "Missing game file: $gameScript"
  }

  Start-Process -FilePath 'cmd.exe' -ArgumentList "/k \"`"$nodeExe`" `"$gameScript`\"" -WorkingDirectory $PSScriptRoot
}

function Reset-GameProgress {
  $saveFile = Join-Path $PSScriptRoot 'data\fake-hacking-game-save.json'
  if (Test-Path $saveFile) {
    Remove-Item -Path $saveFile -Force
    Write-Host 'Game progress reset.'
  }
  else {
    Write-Host 'No save file found. Nothing to reset.'
  }
}

while ($true) {
  Clear-Host
  Write-Host '============================================='
  Write-Host ' Carbon Chaos - Fake Hacking Game'
  Write-Host '============================================='
  Write-Host '1) Play Game'
  Write-Host '2) Reset Progress'
  Write-Host '3) Open Game README'
  Write-Host '0) Exit'
  Write-Host ''

  $choice = Read-Host 'Select option'

  try {
    switch ($choice) {
      '1' {
        Start-FakeHackingGame
      }
      '2' {
        Reset-GameProgress
      }
      '3' {
        $readmePath = Join-Path $PSScriptRoot 'README.md'
        if (Test-Path $readmePath) {
          Start-Process notepad.exe $readmePath
        }
        else {
          Write-Host 'README not found.'
        }
      }
      '0' {
        break
      }
      default {
        Write-Host 'Invalid selection.'
      }
    }
  }
  catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
  }

  Write-Host ''
  Read-Host 'Press Enter to continue'
}
