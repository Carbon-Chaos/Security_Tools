#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVICE_NAME="cyber-lab-monitor"
NODE_BIN="$(command -v node || true)"

if [[ -z "$NODE_BIN" ]]; then
  echo "Node.js is not installed or not on PATH." >&2
  exit 1
fi

cat > /tmp/${SERVICE_NAME}.service <<EOF
[Unit]
Description=Cyber Lab Monitor
After=network.target

[Service]
Type=simple
WorkingDirectory=${PROJECT_DIR}
ExecStart=${NODE_BIN} ${PROJECT_DIR}/service-wrapper.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
User=root

[Install]
WantedBy=multi-user.target
EOF

sudo install -m 0644 /tmp/${SERVICE_NAME}.service /etc/systemd/system/${SERVICE_NAME}.service
sudo systemctl daemon-reload
sudo systemctl enable --now ${SERVICE_NAME}

echo "Installed ${SERVICE_NAME} as a systemd service."
