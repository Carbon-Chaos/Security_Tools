param(
  [string]$OutputDir = 'C:\Users\Public\Downloads\lab-images'
)

$ErrorActionPreference = 'Stop'

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$downloads = @(
  @{ Name = 'ubuntu-22.04-server-cloudimg-amd64.img'; Url = 'https://cloud-images.ubuntu.com/jammy/current/jammy-server-cloudimg-amd64.img' },
  @{ Name = 'debian-12-genericcloud-amd64.qcow2'; Url = 'https://cloud.debian.org/images/cloud/bookworm/latest/debian-12-genericcloud-amd64.qcow2' }
)

foreach ($item in $downloads) {
  $dest = Join-Path $OutputDir $item.Name
  if (Test-Path $dest) {
    Write-Host "Skipping existing $dest"
    continue
  }
  Write-Host "Downloading $($item.Url)"
  Invoke-WebRequest -Uri $item.Url -OutFile $dest
}

Write-Host "Downloaded cloud images to $OutputDir"
Write-Host 'For Kali and Windows images, download manually from official sources:'
Write-Host '- Kali: https://www.kali.org/get-kali/'
Write-Host '- Windows eval: https://www.microsoft.com/en-us/evalcenter/'
