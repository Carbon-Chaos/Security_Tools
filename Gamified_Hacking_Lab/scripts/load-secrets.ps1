$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root '.env'
$tfDir = Join-Path $root 'terraform\proxmox'

if (-not (Test-Path $envFile)) {
  throw "Missing $envFile. Copy .env.example to .env and fill values first."
}

Get-Content $envFile | ForEach-Object {
  $line = $_.Trim()
  if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith('#')) { return }
  $parts = $line.Split('=', 2)
  if ($parts.Count -eq 2) {
    [Environment]::SetEnvironmentVariable($parts[0], $parts[1], 'Process')
  }
}

$required = @(
  'PROXMOX_API_URL',
  'PROXMOX_API_TOKEN',
  'PROXMOX_NODE',
  'PROXMOX_DATASTORE',
  'PROXMOX_INSECURE_TLS',
  'SSH_PUBLIC_KEY',
  'TEMPLATE_ATTACKER',
  'TEMPLATE_TARGET',
  'BRIDGE'
)

$missing = @()
foreach ($name in $required) {
  if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($name, 'Process'))) {
    $missing += $name
  }
}

if ($missing.Count -gt 0) {
  throw "Missing required .env keys: $($missing -join ', ')"
}

$templateSoc = [Environment]::GetEnvironmentVariable('TEMPLATE_SOC', 'Process')
if ([string]::IsNullOrWhiteSpace($templateSoc)) {
  $templateSoc = ''
}

$insecureTls = [Environment]::GetEnvironmentVariable('PROXMOX_INSECURE_TLS', 'Process').ToLowerInvariant()
if ($insecureTls -notin @('true', 'false')) {
  throw 'PROXMOX_INSECURE_TLS must be true or false.'
}

$tfvars = @"
proxmox_api_url      = "$env:PROXMOX_API_URL"
proxmox_api_token    = "$env:PROXMOX_API_TOKEN"
proxmox_insecure_tls = $insecureTls

proxmox_node      = "$env:PROXMOX_NODE"
proxmox_datastore = "$env:PROXMOX_DATASTORE"

template_attacker = "$env:TEMPLATE_ATTACKER"
template_target   = "$env:TEMPLATE_TARGET"
template_soc      = "$templateSoc"

ssh_public_key = "$env:SSH_PUBLIC_KEY"
bridge         = "$env:BRIDGE"
"@

$tfvarsPath = Join-Path $tfDir 'terraform.tfvars'
Set-Content -Path $tfvarsPath -Value $tfvars -Encoding ASCII

Write-Host "Loaded secrets and wrote $tfvarsPath"
