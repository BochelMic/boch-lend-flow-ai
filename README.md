# Bochel Microcrédito

Sistema de gestão de microcrédito para Moçambique.

## Tecnologias

- **Frontend:** React + TypeScript + Tailwind CSS + ShadCN UI
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions, Realtime)
- **PWA:** Service Worker com suporte offline e notificações push

## Desenvolvimento Local

```bash
npm install
npm run dev
```

O servidor de desenvolvimento inicia em `http://localhost:8080`.

## Build de Produção

```bash
npm run build
npm run preview
```

## Variáveis de Ambiente

Crie um ficheiro `.env` na raiz:

```
VITE_SUPABASE_PROJECT_ID="<project_id>"
VITE_SUPABASE_URL="https://<project_id>.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="<anon_key>"
VITE_VAPID_PUBLIC_KEY="<vapid_key>"
```

## Estrutura

```
src/
├── components/     # Componentes React (módulos do sistema)
├── hooks/          # Custom hooks (auth, toast, etc.)
├── integrations/   # Configuração Supabase
├── pages/          # Páginas principais (GestorApp, AgentApp, ClientApp)
└── lib/            # Utilitários
supabase/
├── functions/      # Edge Functions (create-user, delete-agents, send-notification)
└── migrations/     # Migrações SQL
```
