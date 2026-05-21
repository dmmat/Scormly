#!/bin/bash
set -euo pipefail

# Запускаємо лише у віддаленому середовищі (Claude Code on the web).
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Встановлюємо залежності, щоб dev/build одразу були доступні.
# npm install (а не ci) краще використовує кешування стану контейнера.
npm install
