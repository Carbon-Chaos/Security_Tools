# Gamified Hacking Lab (VM + Virtual LAN + Scoreboard)

This is a real lab stack for local training:
- Multiple VMs on Proxmox
- Isolated virtual LAN segments
- Terminal-based attacker workflow with common tools
- Gamification using CTFd (missions, points, progress)

## What You Get
- `terraform/proxmox`: Creates VM topology and VLAN-backed network interfaces
- `ansible`: Installs attacker tools and vulnerable target packages
- `ctfd`: Runs a CTFd scoreboard and challenge UI via Docker
- `scripts`: One-command deploy, configure, and teardown for Windows PowerShell

## Lab Topology
- `10.40.40.0/24` Attacker net (Kali or Ubuntu attacker VM)
- `10.30.30.0/24` Target net (vulnerable Linux hosts)
- `10.60.60.0/24` SOC net (optional blue-team box)
- `10.99.99.0/24` Control net (automation/admin)

## Prerequisites
- Proxmox host with API token
- Terraform 1.7+
- Ansible (run from WSL/Ubuntu on Windows)
- Docker Desktop (for CTFd)
- OpenSSH client (`ssh`, `scp`) available in PowerShell

## Quick Start (Windows + WSL)
1. Download supported cloud images:
   - `./scripts/download-images.ps1`
2. Create Proxmox VM templates from your Windows machine via SSH:
   - `./scripts/create-proxmox-templates.ps1 -ProxmoxHost 10.0.0.10 -Node pve -Storage local-lvm`
   - Optional Kali template if Kali qcow2 is in the images folder:
   - `./scripts/create-proxmox-templates.ps1 -ProxmoxHost 10.0.0.10 -Node pve -Storage local-lvm -IncludeKali`
3. Prepare credentials and template IDs:
   - `Copy-Item .\.env.example .\.env`
   - Edit `.env` with your Proxmox API token, node, storage, SSH key, and VMID values.
4. Generate local Terraform vars from `.env` (kept out of git):
   - `./scripts/load-secrets.ps1`
5. Deploy VMs:
   - `./scripts/deploy.ps1`
   - Or one-step load + deploy:
   - `./scripts/load-env-and-deploy.ps1`
6. Configure VMs from WSL:
   - `wsl bash -lc "cd /mnt/c/Users/$USER/cyber-lab-platform/Gamified_Hacking_Lab/ansible && cp -n inventory.ini.example inventory.ini && ansible-playbook -i inventory.ini site.yml"`
7. Start scoreboard:
   - `./scripts/start-ctfd.ps1`
8. Open CTFd:
   - `http://localhost:8000`

## Image Notes
- Automated download:
  - Ubuntu 22.04 cloud image
  - Debian 12 cloud image
- Manual download only (licensing/distribution constraints):
  - Kali images: `https://www.kali.org/get-kali/`
  - Windows evaluation images/ISOs: `https://www.microsoft.com/en-us/evalcenter/`

## Teardown
- `./scripts/destroy.ps1`
- `./scripts/stop-ctfd.ps1`

## Safety Rules
- Keep this lab off your production/home LAN routing path.
- Allowlist only lab CIDRs in scanning scripts.
- Never test unknown binaries outside isolated target VMs.
