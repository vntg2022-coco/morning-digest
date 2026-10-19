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
if [[ "$value" == *[[:space:]]* || "$value" == *"$name"* ]]; then
  echo "That doesn't look like a key (it contains spaces or the variable name)."
  echo "Copy the key itself from the website, then run this command again. .env.local unchanged."
  exit 1
fi
# Catch the most common mix-up: pasting one Supabase key into the other's slot.
case "$name" in
  SUPABASE_SECRET_KEY) expected="sb_secret_" ;;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) expected="sb_publishable_" ;;
  NEXT_PUBLIC_SUPABASE_URL) expected="https://" ;;
  *) expected="" ;;
esac
if [[ -n "$expected" && "$value" != "$expected"* ]]; then
  echo "${name} should start with \"${expected}\" but this doesn't. Check you copied the right one. .env.local unchanged."
  exit 1
fi
touch .env.local
grep -v "^${name}=" .env.local > .env.local.tmp || true
printf '%s=%s\n' "$name" "$value" >> .env.local.tmp
mv .env.local.tmp .env.local
chmod 600 .env.local
echo "Saved ${name} (ends with ...${value: -4})"
