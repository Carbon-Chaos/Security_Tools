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
