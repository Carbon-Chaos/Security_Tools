param(
  [Parameter(Mandatory = $true)]
  [string]$ProxmoxHost,
  [string]$ProxmoxUser = 'root',
  [string]$Node = 'pve',
  [string]$Storage = 'local-lvm',
  [string]$Bridge = 'vmbr1',
  [string]$ImagesDir = 'C:\Users\Public\Downloads\lab-images',
  [string]$RemoteImageDir = '/var/lib/vz/template/qcow2',
  [int]$UbuntuTemplateId = 9001,
  [int]$DebianTemplateId = 9002,
  [int]$KaliTemplateId = 9000,
  [switch]$IncludeKali,
  [switch]$ForceRecreate
)

$ErrorActionPreference = 'Stop'

$ubuntuImage = Join-Path $ImagesDir 'jammy-server-cloudimg-amd64.img'
$debianImage = Join-Path $ImagesDir 'debian-12-genericcloud-amd64.qcow2'

if (-not (Test-Path $ubuntuImage)) {
  throw "Missing Ubuntu image: $ubuntuImage"
}

if (-not (Test-Path $debianImage)) {
  throw "Missing Debian image: $debianImage"
}

$kaliImage = $null
if ($IncludeKali) {
  $kaliCandidates = Get-ChildItem -Path $ImagesDir -Filter '*.qcow2' | Where-Object { $_.Name -match 'kali' }
  if (-not $kaliCandidates) {
    throw "IncludeKali was set but no Kali qcow2 image was found in $ImagesDir"
  }
  $kaliImage = $kaliCandidates[0].FullName
}

$sshTarget = "$ProxmoxUser@$ProxmoxHost"

Write-Host "Preparing remote image directory on $sshTarget"
ssh $sshTarget "mkdir -p $RemoteImageDir"

Write-Host 'Uploading Ubuntu and Debian images to Proxmox...'
scp $ubuntuImage "$sshTarget`:$RemoteImageDir/"
scp $debianImage "$sshTarget`:$RemoteImageDir/"

if ($IncludeKali -and $kaliImage) {
  Write-Host 'Uploading Kali image to Proxmox...'
  scp $kaliImage "$sshTarget`:$RemoteImageDir/"
}

$forceFlag = if ($ForceRecreate) { '1' } else { '0' }
$kaliName = if ($kaliImage) { [IO.Path]::GetFileName($kaliImage) } else { '' }

$remoteScript = @"
set -euo pipefail

FORCE_RECREATE=$forceFlag
NODE='$Node'
STORAGE='$Storage'
BRIDGE='$Bridge'
REMOTE_DIR='$RemoteImageDir'

create_template() {
  local vmid="\$1"
  local name="\$2"
  local memory="\$3"
  local cores="\$4"
  local image="\$5"

  if qm config "\$vmid" >/dev/null 2>&1; then
    if [ "\$FORCE_RECREATE" = "1" ]; then
      qm stop "\$vmid" >/dev/null 2>&1 || true
      qm destroy "\$vmid" --destroy-unreferenced-disks 1 --purge 1
    else
      echo "VMID \$vmid already exists. Re-run with -ForceRecreate to rebuild."
      exit 1
    fi
  fi

  qm create "\$vmid" --name "\$name" --memory "\$memory" --cores "\$cores" --net0 virtio,bridge="\$BRIDGE" --agent enabled=1 --ostype l26 --scsihw virtio-scsi-pci
  qm importdisk "\$vmid" "\$REMOTE_DIR/\$image" "\$STORAGE"
  qm set "\$vmid" --scsi0 "\$STORAGE:vm-\$vmid-disk-0"
  qm set "\$vmid" --ide2 "\$STORAGE:cloudinit"
  qm set "\$vmid" --boot c --bootdisk scsi0
  qm set "\$vmid" --serial0 socket --vga serial0
  qm template "\$vmid"
}

create_template '$UbuntuTemplateId' 'ubuntu-target-template' 4096 2 'jammy-server-cloudimg-amd64.img'
create_template '$DebianTemplateId' 'debian-soc-template' 4096 2 'debian-12-genericcloud-amd64.qcow2'
"@

if ($IncludeKali -and $kaliName) {
  $remoteScript += "`ncreate_template '$KaliTemplateId' 'kali-attacker-template' 8192 4 '$kaliName'`n"
}

Write-Host 'Creating templates on Proxmox...'
$remoteScript | ssh $sshTarget "bash -s"

Write-Host 'Template creation complete.'
Write-Host "Attacker template VMID: $KaliTemplateId (if -IncludeKali used)"
Write-Host "Target template VMID: $UbuntuTemplateId"
Write-Host "SOC template VMID: $DebianTemplateId"
