#!/bin/zsh
# Checks that the API keys in .env.local work, without printing them.
cd "$(dirname "$0")/.."
set -a; source ./.env.local; set +a
code=$(curl -s -o /dev/null -w "%{http_code}" https://api.anthropic.com/v1/models \
  -H "x-api-key: $ANTHROPIC_API_KEY" -H "anthropic-version: 2023-06-01")
[[ $code == 200 ]] && echo "Anthropic: OK" || echo "Anthropic: FAILED (HTTP $code)"
code=$(curl -s -o /dev/null -w "%{http_code}" \
  "https://gnews.io/api/v4/top-headlines?lang=en&country=us&max=1&apikey=$GNEWS_API_KEY")
[[ $code == 200 ]] && echo "GNews: OK" || echo "GNews: FAILED (HTTP $code)"
