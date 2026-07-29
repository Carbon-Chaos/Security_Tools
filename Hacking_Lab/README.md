# Hacking_Lab Virtual LAN Platform

This module builds an isolated virtual LAN training environment on Proxmox using Terraform and Ansible.

## What this builds

- Segmented VLAN-style internal network using simulated RFC1918 ranges
- Router VM that provides VLAN gateways, DHCP, and internal DNS
- Linux lab nodes for attacker, victim, and SOC workflows
- Optional Windows victim VM
- Default-deny inter-VLAN policy with only explicit training paths allowed

## Network Plan

- VLAN 20: User LAN (`10.20.20.0/24`)
- VLAN 30: Server LAN (`10.30.30.0/24`)
- VLAN 40: Red Team (`10.40.40.0/24`)
- VLAN 50: Detonation (`10.50.50.0/24`)
- VLAN 60: SOC (`10.60.60.0/24`)
- VLAN 99: Quarantine (`10.99.99.0/24`)

## Safety Expectations

- Use a dedicated Proxmox host for this lab.
- Use an internal-only bridge for `lab_bridge` (no physical uplink).
- Do not mount host folders or share clipboard into untrusted VMs.
- Keep outbound internet disabled unless you explicitly build a controlled gateway.

## Prerequisites

- Proxmox VE with API access
- Existing VM templates in Proxmox:
  - Ubuntu template for router
  - Kali template
  - Ubuntu victim template
  - Ubuntu SOC template
  - Optional Windows 11 template
- Terraform CLI installed
- Ansible installed on your operator machine

## Quick Start

1. Copy vars file:
   - `cp terraform/proxmox/terraform.tfvars.example terraform/proxmox/terraform.tfvars`
2. Edit `terraform.tfvars` with your Proxmox endpoint, token, node, datastore, template IDs, and SSH key.
3. Deploy VMs:
   - PowerShell: `./scripts/deploy.ps1`
4. Copy inventory template and update host IPs:
   - `cp ansible/inventory.ini.example ansible/inventory.ini`
5. Configure router and clients:
   - PowerShell: `./scripts/post-configure.ps1`
6. Destroy the lab when done:
   - PowerShell: `./scripts/destroy.ps1`

## Downloadable Bundle

- Build a portable bundle zip from repository root:
   - `powershell -ExecutionPolicy Bypass -File .\package-hacking-lab.ps1`
- Output file:
   - `downloads/Hacking_Lab_bundle.zip`

## Notes

- Terraform creates VM topology and VLAN tags.
- Ansible applies router DHCP/DNS/firewall behavior.
- Router policy is default deny for forwarding with scoped exceptions.
