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
- VM templates in Proxmox:
  - Kali/attacker template
  - Ubuntu target template
  - Optional SOC Ubuntu template

## Quick Start (Windows + WSL)
1. Copy variables file:
   - `Copy-Item .\terraform\proxmox\terraform.tfvars.example .\terraform\proxmox\terraform.tfvars`
2. Fill values in `terraform.tfvars`.
3. Deploy VMs:
   - `./scripts/deploy.ps1`
4. Configure VMs from WSL:
   - `wsl bash -lc "cd /mnt/c/Users/$USER/cyber-lab-platform/Gamified_Hacking_Lab/ansible && cp -n inventory.ini.example inventory.ini && ansible-playbook -i inventory.ini site.yml"`
5. Start scoreboard:
   - `./scripts/start-ctfd.ps1`
6. Open CTFd:
   - `http://localhost:8000`

## Teardown
- `./scripts/destroy.ps1`
- `./scripts/stop-ctfd.ps1`

## Safety Rules
- Keep this lab off your production/home LAN routing path.
- Allowlist only lab CIDRs in scanning scripts.
- Never test unknown binaries outside isolated target VMs.
