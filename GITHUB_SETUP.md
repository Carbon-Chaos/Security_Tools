# GitHub setup

## Repository contents
This project now includes:
- the safety monitoring engine
- a background monitor service wrapper
- Windows and Linux service install scripts
- deployment and usage documentation

## Files to commit
- service-wrapper.js
- install-service.ps1
- install-service.sh
- service-install-notes.txt
- GITHUB_SETUP.md
- package.json
- README.md
- safety-engine.js
- server.js
- public/*
- test/*

## Suggested Git commands
```bash
git init
git add .
git commit -m "Add background safety monitor and service deployment support"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Notes
If you want the project to be fully portable, keep the service scripts and documentation in the repository root so they are easy to discover.
