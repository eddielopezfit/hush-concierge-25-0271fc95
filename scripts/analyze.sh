#!/usr/bin/env bash
# One-command bundle audit: build for production, then open the treemap report.
# Usage: bash scripts/analyze.sh
set -euo pipefail

cd "$(dirname "$0")/.."

echo "→ Building production bundle..."
npx vite build

REPORT="dist/stats.html"
if [ ! -f "$REPORT" ]; then
  echo "✗ Expected $REPORT but it was not generated."
  exit 1
fi

echo "✓ Report ready at $REPORT"

# Try to open in the user's default browser (macOS / Linux / WSL).
if command -v open >/dev/null 2>&1; then
  open "$REPORT"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$REPORT"
elif command -v wslview >/dev/null 2>&1; then
  wslview "$REPORT"
else
  echo "ℹ Open it manually: file://$(pwd)/$REPORT"
fi
