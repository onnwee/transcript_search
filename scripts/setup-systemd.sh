#!/bin/bash
set -e

echo "🔧 Installing systemd service and timer for transcript batch..."

sudo cp scripts/transcript-batch.service /etc/systemd/system/
sudo cp scripts/transcript-batch.timer /etc/systemd/system/
sudo cp scripts/transcript-batch-email.service /etc/systemd/system/

sudo systemctl daemon-reexec
sudo systemctl daemon-reload

echo "📅 Enabling timer..."
sudo systemctl enable --now transcript-batch.timer

echo "✅ Systemd timer active. View with:"
echo "   systemctl list-timers | grep transcript-batch"
