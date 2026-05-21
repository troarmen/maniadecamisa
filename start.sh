#!/usr/bin/env bash
# ============================================================
#  Mania de Camisa - iniciar o servidor local
# ------------------------------------------------------------
#  COMO USAR:
#    1. Abra um terminal nesta pasta
#    2. Rode:  bash start.sh
#    3. Abra no navegador o endereco mostrado (http://localhost:5173)
#
#  Para PARAR o servidor: pressione  Ctrl + C  no terminal.
# ============================================================

cd "$(dirname "$0")" || exit 1

# Garante que o Node (instalado via nvm) esteja disponivel.
export PATH="$HOME/.nvm/versions/node/v22.11.0/bin:$PATH"

if ! command -v npm >/dev/null 2>&1; then
  echo "ERRO: Node/npm nao encontrado. Instale o Node.js (https://nodejs.org)."
  exit 1
fi

# Instala as dependencias na primeira vez.
if [ ! -d node_modules ]; then
  echo "Instalando dependencias (so na primeira vez)..."
  npm install
fi

echo "Iniciando o servidor... abra http://localhost:5173 no navegador."
npm run dev
