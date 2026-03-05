---
description: Resolve erros de compilação ou cache encravada no servidor Vite.
---
Este comando deve ser usado quando o ecrã da aplicação mostra um erro vermelho de "Failed to resolve import" que não desaparece mesmo após o código ter sido corrigido, ou quando o Vite não reconhece novos ficheiros instalados.

1. Pára o servidor de desenvolvimento que está a correr.
// turbo
2. Força a remoção da pasta de cache corrompida do Vite:
`Remove-Item -Recurse -Force node_modules\.vite, node_modules\.cache -ErrorAction SilentlyContinue`

// turbo
3. Reinicia o servidor pedindo explicitamente ao Vite para refazer os imports:
`npm run dev -- --force`
