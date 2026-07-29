# Corporate Security Operations Platform

A production-style security operations console for authorized corporate environments. It provides a role-based interface for monitoring assets, alerts, incidents, playbooks, and safety controls.

## Features
- Role-based authentication and session handling
- Asset inventory and exposure tracking
- Alert queue with acknowledgment workflow
- Incident management and response playbooks
- Safety containment gateway for policy-aware action review
- Health endpoints for deployment checks
- Threat analyzer CLI for intrusion tracing and malware triage
- Enterprise threat analysis API with report persistence and audit logging

## Run locally
1. Install Node.js 20+ and npm
2. Open a terminal in this folder
3. Run:
   ```powershell
   npm install
   npm start
   ```
4. Open http://localhost:3000
5. Sign in with admin / SecurePass2026!

## Production deployment options
- Docker: `docker compose up --build`
- Process manager: `node server.js`
- Service wrapper: `npm run service`
- Health check: `http://localhost:3000/healthz`

## Install as a service

Windows:
- Install NSSM first if needed.
- Run: `powershell -ExecutionPolicy Bypass -File .\install-service.ps1`

Linux:
- Run: `bash ./install-service.sh`

## Standard Windows Installer (Setup.exe)

This project includes a full game-style installer that launches Mission Control (guided setup/play menu) after installation.

1. Install Inno Setup:
   - `winget install -e --id JRSoftware.InnoSetup`
2. Build Setup.exe from repository root:
   - `npm run build:windows:setup`
3. Output location:
   - `windows-dist/game-installer/CyberSecurityOpsSetup-<version>.exe`

Installer behavior:
- Installs under Program Files
- Adds Start Menu shortcut for Mission Control
- Optional desktop shortcut
- Adds uninstall entry in Windows Apps & Features
- Launches Mission Control at the end of setup

Mission Control options include:
- Prepare local lab workspace in your user profile
- Download VM cloud images
- Create Proxmox templates over SSH
- Open `.env` for credentials and template IDs
- Deploy/destroy lab infrastructure
- Configure VMs with WSL Ansible
- Start CTFd scoreboard and open browser

## Notes
This application is a professional prototype for authorized internal use and is not intended for direct internet exposure without hardening, secrets management, and real SIEM integration.

## Threat Analyzer CLI
The repository includes a defensive analysis program at `tools/threat-analyzer/cli.js`.

Intrusion analysis (reconstruct likely origin IP and hop chain):

```powershell
npm run analyze:intrusion
```

Malware analysis (static file triage with actor heuristics and repair guidance):

```powershell
npm run analyze:malware
```

Custom usage examples:

```powershell
node tools/threat-analyzer/cli.js intrusion --input .\my-events.json --output .\intrusion-report.json
node tools/threat-analyzer/cli.js malware --file .\sample1.bin --file .\sample2.ps1 --output .\malware-report.json
```

Input samples are provided in `tools/threat-analyzer/samples`.

## Enterprise Threat Analysis API
Authenticated roles: Administrator, Analyst, Responder.

- `POST /api/threat/intrusion/analyze`
   - Body: `{ "events": [ ... ] }`
   - Stores full report and audit trail entry.
- `POST /api/threat/malware/analyze`
   - Body: `{ "files": [{ "name": "sample.ps1", "contentBase64": "..." }] }`
   - Decodes in memory, analyzes, stores report and audit trail entry.
- `GET /api/threat/reports?limit=25`
   - Returns report metadata list.
- `GET /api/threat/reports/:id`
   - Returns full report record.
- `POST /api/threat/reports/prune`
   - Administrator only, removes reports older than retention window.

Enterprise configuration (`.env`):

- `THREAT_MAX_EVENTS` max events per intrusion request (default 5000)
- `THREAT_MAX_FILES` max files per malware request (default 20)
- `THREAT_MAX_FILE_SIZE_BYTES` max per-file size in malware request (default 5MB)
- `REPORT_RETENTION_DAYS` retention window for persisted reports (default 30)
- `DATA_DIR` report/audit storage directory (default `data`)
