#!/bin/zsh
# Usage: npm run set-key -- ANTHROPIC_API_KEY
# Prompts for the value without echoing it and writes it to .env.local,
# replacing any existing line for that variable.
set -e
cd "$(dirname "$0")/.."
name="$1"
if [[ -z "$name" ]]; then
  echo "Usage: npm run set-key -- VARIABLE_NAME"; exit 1
fi
printf "Paste %s (input is hidden), then press Enter: " "$name"
read -rs value
echo
if [[ -z "$value" ]]; then
  echo "Nothing entered; .env.local unchanged."; exit 1
fi
touch .env.local
grep -v "^${name}=" .env.local > .env.local.tmp || true
printf '%s=%s\n' "$name" "$value" >> .env.local.tmp
mv .env.local.tmp .env.local
chmod 600 .env.local
echo "Saved ${name} (ends with ...${value: -4})"
