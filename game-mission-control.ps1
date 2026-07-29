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

  throw 'Node.js was not found. Install Node.js 20+ from https://nodejs.org/ and run again.'
}

function Get-LabWorkspace {
  $installedLab = Join-Path $PSScriptRoot 'Gamified_Hacking_Lab'
  $workspaceRoot = Join-Path $env:USERPROFILE 'CyberLabOpsLab'
  $workspaceLab = Join-Path $workspaceRoot 'Gamified_Hacking_Lab'

  if (-not (Test-Path $workspaceLab)) {
    New-Item -ItemType Directory -Force -Path $workspaceRoot | Out-Null
    Copy-Item -Recurse -Force $installedLab $workspaceRoot
  }

  return $workspaceLab
}

function Ensure-EnvFile {
  param(
    [string]$LabPath
  )

  $envPath = Join-Path $LabPath '.env'
  $envExample = Join-Path $LabPath '.env.example'
  if (-not (Test-Path $envPath) -and (Test-Path $envExample)) {
    Copy-Item -Path $envExample -Destination $envPath -Force
  }

  return $envPath
}

function Start-CyberOpsDashboard {
  $nodeExe = Get-NodeExe
  Start-Process -FilePath 'cmd.exe' -ArgumentList "/k \"`"$nodeExe`" `"$PSScriptRoot\server.js`\"" -WorkingDirectory $PSScriptRoot
  Start-Process 'http://localhost:3000' | Out-Null
}

function Start-Ctfd {
  param(
    [string]$LabPath
  )

  $scriptPath = Join-Path $LabPath 'scripts\start-ctfd.ps1'
  if (-not (Test-Path $scriptPath)) {
    throw "Missing script: $scriptPath"
  }

  & $scriptPath
  Start-Process 'http://localhost:8000' | Out-Null
}

function Invoke-LabDeploy {
  param(
    [string]$LabPath
  )

  $scriptPath = Join-Path $LabPath 'scripts\load-env-and-deploy.ps1'
  if (-not (Test-Path $scriptPath)) {
    throw "Missing script: $scriptPath"
  }

  & $scriptPath
}

function Invoke-LabDestroy {
  param(
    [string]$LabPath
  )

  $destroyScript = Join-Path $LabPath 'scripts\destroy.ps1'
  $stopScript = Join-Path $LabPath 'scripts\stop-ctfd.ps1'

  if (Test-Path $destroyScript) {
    & $destroyScript
  }
  if (Test-Path $stopScript) {
    & $stopScript
  }
}

function Invoke-TemplateBuild {
  param(
    [string]$LabPath
  )

  $scriptPath = Join-Path $LabPath 'scripts\create-proxmox-templates.ps1'
  if (-not (Test-Path $scriptPath)) {
    throw "Missing script: $scriptPath"
  }

  $host = Read-Host 'Enter Proxmox host (IP or DNS, example 10.0.0.10)'
  if ([string]::IsNullOrWhiteSpace($host)) {
    throw 'Proxmox host is required.'
  }

  $includeKali = Read-Host 'Include Kali template if qcow2 exists? (y/N)'
  if ($includeKali -match '^[Yy]$') {
    & $scriptPath -ProxmoxHost $host -IncludeKali
  }
  else {
    & $scriptPath -ProxmoxHost $host
  }
}

function Invoke-ImageDownload {
  param(
    [string]$LabPath
  )

  $scriptPath = Join-Path $LabPath 'scripts\download-images.ps1'
  if (-not (Test-Path $scriptPath)) {
    throw "Missing script: $scriptPath"
  }

  & $scriptPath
}

function Invoke-ConfigureVms {
  param(
    [string]$LabPath
  )

  $wslPath = $LabPath -replace '\\', '/'
  if ($wslPath -match '^([A-Za-z]):(.*)$') {
    $drive = $Matches[1].ToLowerInvariant()
    $rest = $Matches[2]
    $wslPath = "/mnt/$drive$rest"
  }
  $cmd = "cd $wslPath/ansible && cp -n inventory.ini.example inventory.ini && ansible-playbook -i inventory.ini site.yml"
  wsl bash -lc $cmd
}

while ($true) {
  Clear-Host
  Write-Host '============================================='
  Write-Host ' Cyber Lab Ops - Mission Control'
  Write-Host '============================================='
  Write-Host '1) Prepare Local Lab Workspace'
  Write-Host '2) Download VM Cloud Images'
  Write-Host '3) Create Proxmox Templates'
  Write-Host '4) Configure Credentials (.env)'
  Write-Host '5) Deploy Lab Infrastructure'
  Write-Host '6) Configure VMs (WSL Ansible)'
  Write-Host '7) Start CTFd and Open Scoreboard'
  Write-Host '8) Launch Cyber Ops Dashboard'
  Write-Host '9) Stop/Destroy Lab'
  Write-Host '0) Exit'
  Write-Host ''

  $choice = Read-Host 'Select option'

  try {
    $labPath = Get-LabWorkspace
    switch ($choice) {
      '1' {
        $envPath = Ensure-EnvFile -LabPath $labPath
        Write-Host "Workspace ready at $labPath"
        Write-Host "Credential file: $envPath"
      }
      '2' {
        Invoke-ImageDownload -LabPath $labPath
      }
      '3' {
        Invoke-TemplateBuild -LabPath $labPath
      }
      '4' {
        $envPath = Ensure-EnvFile -LabPath $labPath
        Start-Process notepad.exe $envPath
        Write-Host 'Opened .env in Notepad. Save it, then return to deploy.'
      }
      '5' {
        Invoke-LabDeploy -LabPath $labPath
      }
      '6' {
        Invoke-ConfigureVms -LabPath $labPath
      }
      '7' {
        Start-Ctfd -LabPath $labPath
      }
      '8' {
        Start-CyberOpsDashboard
      }
      '9' {
        Invoke-LabDestroy -LabPath $labPath
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
