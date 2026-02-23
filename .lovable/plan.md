
# Plano: Dividir o Sistema em 3 Aplicativos Separados

## Resumo

O sistema atual usa uma unica tela de login para todos os perfis. Vamos separar em **tres experiencias completamente distintas**, cada uma com a sua propria tela de login, visual e rotas, dentro da mesma aplicacao React.

---

## Como vai funcionar

### 1. Tela Principal (/) -- App do Cliente
- A rota raiz (`/`) mostra o login do **Cliente** com branding roxo
- Visual amigavel, focado no cliente final
- Apos login, valida que o utilizador tem papel `cliente` -- se nao, rejeita com erro generico

### 2. Portal do Agente (/agente) -- App do Agente
- Rota dedicada `/agente` com tela de login propria, branding azul
- Visual mais profissional, sem estatisticas publicas
- Apos login, valida papel `agente` -- rejeita outros papeis

### 3. Portal do Gestor (/gestor) -- App do Admin
- Rota dedicada `/gestor` com tela de login propria, branding verde
- Visual minimalista e discreto, sem informacoes publicas
- Apos login, valida papel `gestor` -- rejeita outros papeis
- **Acesso secreto**: a rota `/gestor` nao aparece em nenhum link visivel na aplicacao. So quem sabe o caminho pode aceder.

### Seguranca
- Cada portal valida o papel do utilizador no servidor apos login
- Se alguem com papel `cliente` tentar entrar pelo `/gestor`, o login e rejeitado e o utilizador e deslogado imediatamente
- Mensagens de erro sao genericas ("Credenciais invalidas") para nao revelar informacao
- As rotas `/gestor` e `/agente` nao tem links publicos -- sao "secretas por obscuridade"
- A protecao real continua no servidor via RLS (Row Level Security)

---

## Etapas de implementacao

### Etapa 1 -- Criar componentes de login por perfil

**`src/components/auth/ClientLoginForm.tsx`** (novo)
- Baseado no `LoginForm` atual com branding roxo/cliente
- Apos login, verifica se papel = `cliente`, senao faz logout + erro

**`src/components/auth/AgentLoginForm.tsx`** (novo)
- Visual azul, titulo "Portal do Agente", sem estatisticas
- Apos login, verifica se papel = `agente`, senao faz logout + erro

**`src/components/auth/GestorLoginForm.tsx`** (novo)
- Visual verde escuro, minimalista, titulo "Acesso Interno"
- Apos login, verifica se papel = `gestor`, senao faz logout + erro

### Etapa 2 -- Criar paginas separadas por perfil

**`src/pages/ClientApp.tsx`** (novo)
- Contem as rotas do cliente (dashboard-cliente, historico, pedidos, chat)

**`src/pages/AgentApp.tsx`** (novo)
- Contem as rotas do agente (dashboard-agente, clientes, emprestimos, cobrancas, chat)

**`src/pages/GestorApp.tsx`** (novo)
- Contem todas as rotas do gestor (dashboard, usuarios, emprestimos, relatorios, etc.)

### Etapa 3 -- Atualizar `App.tsx`

Reorganizar as rotas principais:

```text
/                    --> ClientApp (login cliente + rotas cliente)
/agente/*            --> AgentApp (login agente + rotas agente)
/gestor/*            --> GestorApp (login gestor + rotas gestor)
/formulario-credito  --> PublicCreditForm (mantem)
```

### Etapa 4 -- Atualizar `useAuth.ts`

- Adicionar funcao `loginWithRoleValidation(email, password, expectedRole)` que:
  1. Faz `signInWithPassword`
  2. Consulta `user_roles` para verificar o papel
  3. Se o papel nao corresponde, faz `signOut` e retorna erro generico
- Manter a funcao `login` original como fallback

### Etapa 5 -- Atualizar sidebars e navegacao

- Cada app usa o seu proprio layout/sidebar (ja existente via `AppSidebar` que filtra por papel)
- Ajustar os links para serem relativos ao prefixo da app (`/agente/clientes`, `/gestor/dashboard`, etc.)

### Etapa 6 -- Atualizar manifestos PWA

- Cada app instala com o manifesto correto automaticamente
- O `InstallPWA` ja detecta o papel e carrega o manifesto correspondente

---

## Estrutura final de rotas

```text
Rota                          App        Quem acede
---------------------------   --------   ----------
/                             Cliente    Clientes
/dashboard-cliente            Cliente    Clientes
/historico                    Cliente    Clientes
/pedidos                      Cliente    Clientes
/agente                       Agente     Agentes
/agente/dashboard             Agente     Agentes
/agente/clientes              Agente     Agentes
/agente/emprestimos           Agente     Agentes
/agente/cobrancas             Agente     Agentes
/gestor                       Gestor     Gestores
/gestor/dashboard             Gestor     Gestores
/gestor/usuarios              Gestor     Gestores
/gestor/emprestimos           Gestor     Gestores
/gestor/relatorios            Gestor     Gestores
... (todos os modulos)
```

---

## Ficheiros a criar/modificar

| Ficheiro | Acao |
|---|---|
| `src/components/auth/ClientLoginForm.tsx` | Criar |
| `src/components/auth/AgentLoginForm.tsx` | Criar |
| `src/components/auth/GestorLoginForm.tsx` | Criar |
| `src/pages/ClientApp.tsx` | Criar |
| `src/pages/AgentApp.tsx` | Criar |
| `src/pages/GestorApp.tsx` | Criar |
| `src/App.tsx` | Modificar -- novas rotas raiz |
| `src/hooks/useAuth.ts` | Modificar -- adicionar validacao de papel |
| `src/components/layout/AppSidebar.tsx` | Modificar -- ajustar prefixos de rotas |
| `src/pages/Index.tsx` | Remover ou simplificar |
| `src/components/auth/LoginForm.tsx` | Pode ser removido (substituido pelos 3 novos) |
