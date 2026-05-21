# Separar módulo Atendimento + WhatsApp por setor

## 1. Sidebar — submenu "Atendimento" com filhos

Editar `src/components/vendedor/VendedorSidebar.tsx`:

- Remover os itens soltos `WhatsApp` e `Atendimento` da lista atual.
- Criar um item agrupador **"Atendimento"** (ícone `Headphones`) que expande/colapsa e mostra os filhos indentados (mesmo padrão visual dos atuais `indent: true`):
  - **Tickets** → `/vendedor/atendimento` (ícone `Kanban`)
  - **WhatsApp** → `/vendedor/atendimento/whatsapp` (ícone `MessageCircle`)
  - **Configurar funis** → abre `FunisConfigModal` (apenas supervisor) — opcional, pode ficar só dentro da página de Tickets
- Estado de expansão: aberto por padrão quando a rota atual começa com `/vendedor/atendimento`.
- Permissões na sidebar: atendentes só veem os filhos correspondentes ao seu setor (todos veem Tickets e WhatsApp; "Configurar funis" só supervisor).

Repetir o mesmo agrupamento em `src/components/AppSidebar.tsx` se aplicável.

## 2. WhatsApp filtrado por setor

Criar `src/pages/vendedor/AtendimentoWhatsApp.tsx`:

- Reaproveita o componente/markup de `WhatsAppInbox.tsx` (extrair lógica em um componente compartilhado `WhatsAppInboxView` recebendo `conversas` filtradas, ou simplesmente envolver o atual com um filtro prévio).
- Vincular cada conversa de `mockConversas` (em `src/data/mockCRM360.ts`) a um `setor: Setor` via mapeamento adicional em `mockAtendimento.ts` (`conversaSetorMap: Record<string, Setor>`), sem alterar `mockCRM360`.
- Lógica de visibilidade (reutilizar `getCurrentAtendente()` e `visibleSetores()` de `mockAtendimento.ts`):
  - **Supervisor**: vê todas as conversas, com filtro por setor (chips no topo, igual à página de Tickets).
  - **Atendente**: vê apenas conversas cujo setor mapeado ∈ `me.setores`.
- Header da página: título "WhatsApp · Atendimento", chip do setor ativo + perfil bar (mesmo componente reutilizado da `AtendimentoPage`), e contador de não lidas por setor.
- Cada item da lista de conversas ganha um dot colorido do setor (`setorDot`).
- Rota adicionada em `src/App.tsx`: `/vendedor/atendimento/whatsapp` → `AtendimentoWhatsApp`.

## 3. Rota antiga `/vendedor/whatsapp`

Manter funcionando (compatibilidade), mas remover da sidebar. Opcional: redirecionar `/vendedor/whatsapp` → `/vendedor/atendimento/whatsapp`.

## 4. Página de Tickets

Sem mudanças funcionais. Apenas:

- O botão "Configurar funis" continua no header da página (não duplicar como item de sidebar se preferir).
- Adicionar um pequeno botão/atalho no header "Ir para WhatsApp →" linkando para a rota irmã.

## 5. Permissões (recap)

| Papel       | Tickets | WhatsApp                   | Configurar funis |
|-------------|---------|----------------------------|------------------|
| Supervisor  | Todos   | Todas as conversas         | Sim              |
| Atendente   | Setor   | Apenas conversas do setor  | Não              |

## Detalhes técnicos

- Reutilizar `mockAtendentes`, `getCurrentAtendente`, `saveCurrentUserId`, `visibleSetores` de `src/data/mockAtendimento.ts`.
- Acrescentar em `mockAtendimento.ts`:
  ```ts
  export const conversaSetor: Record<string, Setor> = {
    // distribuir as ~N conversas de mockConversas entre os 4 setores
  };
  export function visibleConversas(me: Atendente, todas: typeof mockConversas) { ... }
  ```
- Sem backend, sem novas dependências, mantém design system (sidebar dark navy, cards brancos).

## Arquivos

**Criar**
- `src/pages/vendedor/AtendimentoWhatsApp.tsx`

**Editar**
- `src/components/vendedor/VendedorSidebar.tsx` (submenu agrupador)
- `src/components/AppSidebar.tsx` (se aplicável)
- `src/data/mockAtendimento.ts` (mapeamento conversa→setor + helper)
- `src/App.tsx` (nova rota)
- `src/pages/vendedor/AtendimentoPage.tsx` (atalho para WhatsApp no header)
