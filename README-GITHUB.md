# Cyber Security Operations Platform

A full-stack security operations platform with:
- a web UI for alerts, incidents, asset inventory, and playbooks
- a Windows installer bundle
- a Linux CLI tool for security operations tasks

## Quick Linux install

```bash
curl -fsSL https://raw.githubusercontent.com/your-org/cyber-security-ops/main/linux-cli/install.sh | bash
```

## Linux CLI usage

```bash
cyber-sec overview
cyber-sec assets
cyber-sec alerts
cyber-sec incidents
cyber-sec scan localhost
cyber-sec decrypt <base64-ciphertext> [key]
```

## Windows usage

Extract the Windows installer package and run install.bat.

## Authentication

Default demo credentials:
- Username: admin
- Password: SecurePass2026!
