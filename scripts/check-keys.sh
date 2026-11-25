#!/bin/zsh
# Checks that the API keys in .env.local work, without printing them.
cd "$(dirname "$0")/.."
set -a; source ./.env.local; set +a
body=$(curl -s -w "\n%{http_code}" https://api.anthropic.com/v1/models \
  -H "x-api-key: $ANTHROPIC_API_KEY" -H "anthropic-version: 2023-06-01")
code=${body##*$'\n'}
if [[ $code == 200 ]]; then
  echo "Anthropic: OK"
else
  echo "Anthropic: FAILED (HTTP $code) ${body%$'\n'*}"
fi
code=$(curl -s -o /dev/null -w "%{http_code}" \
  "https://gnews.io/api/v4/top-headlines?lang=en&country=us&max=1&apikey=$GNEWS_API_KEY")
[[ $code == 200 ]] && echo "GNews: OK" || echo "GNews: FAILED (HTTP $code)"
if [[ -n "$NEXT_PUBLIC_SUPABASE_URL" ]]; then
  [[ "$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" == sb_publishable_* ]] || echo "Supabase NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: should start with sb_publishable_"
  [[ "$SUPABASE_SECRET_KEY" == sb_secret_* ]] || echo "Supabase SUPABASE_SECRET_KEY: should start with sb_secret_ (a publishable key was pasted here?)"
  for var in NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY SUPABASE_SECRET_KEY; do
    code=$(curl -s -o /dev/null -w "%{http_code}" "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/settings" -H "apikey: ${(P)var}")
    [[ $code == 200 ]] && echo "Supabase $var: OK" || echo "Supabase $var: FAILED (HTTP $code)"
  done
else
  echo "Supabase: not set yet"
fi
