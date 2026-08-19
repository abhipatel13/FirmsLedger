#!/usr/bin/env bash
# Restarts the dev server with SQL round-trip logging enabled, writing to /tmp/dev.log.
# Kept as a script so the pkill pattern never matches the invoking shell's own
# command line (which silently kills the caller when run inline).
set -u
pkill -f "[n]ext-server" 2>/dev/null || true
pkill -f "[n]ext dev" 2>/dev/null || true
sleep 2
rm -f /tmp/dev.log
NEON_LOG_QUERIES=1 nohup npm run dev > /tmp/dev.log 2>&1 &
echo "dev server starting, pid $!"
