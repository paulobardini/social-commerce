## Hub de Pedidos no Nextil 360

Criar uma nova área `/vendedor/360/pedidos` (e tornar `/vendedor/360` um hub navegável) que consolida **todos os pedidos** da carteira do vendedor — vindos de orçamentos aprovados, do marketplace direto e de lançamentos manuais — com visualização dual (lista/kanban), ações de status, edição de grade e ações financeiras (nota, boleto, link de pagamento).

### 1. Navegação

- **Sidebar do Vendedor** (`VendedorSidebar.tsx`): item "Nextil 360" hoje aponta para `/vendedor/360` mas não há rota raiz. Criar rota `/vendedor/360` com um **hub** que lista os módulos do 360 (Cliente 360, Pedidos, futuros). 
- Adicionar sub-item visual "Pedidos" abaixo de Nextil 360 (pequena indentação) apontando para `/vendedor/360/pedidos`.
- Atualizar o `isActive` para o caso `/vendedor/360/pedidos`.

### 2. Modelo de dados

Estender `src/data/mockCRM360.ts`:

- Adicionar a `Pedido`:
  - `origem: "orcamento" | "marketplace" | "manual"`
  - `orcamentoId?: string` (quando origem = orcamento)
  - `marca: string`, `pecas: number`
  - `previsaoEntrega?: string`
  - `pagamento: { status: "pendente" | "pago" | "parcial" | "atrasado"; metodo?: string; linkBoleto?: string; linkPagamento?: string; notaFiscal?: string }`
  - `itens: Array<{ produtoId: string; nome: string; sku: string; cor: string; tamanho: string; qtd: number; precoUnit: number }>` (para edição de grade)
  - `historico: Array<{ status: PedidoStatus; data: string; autor: string }>`
- Status novos: incluir `"faturado"` e `"em_transporte"` entre `confirmado` e `entregue`. Status final: `confirmado → em_producao → faturado → em_transporte → entregue` + `cancelado`.
- Mock: gerar ~25 pedidos cobrindo todas as origens, status e clientes da carteira (`MOCK_CLIENTES_360`). Manter coerência com `pedidosRealizados` por cliente.

### 3. Página `Nextil360HubPage` (`/vendedor/360`)

`src/pages/vendedor/Nextil360Hub.tsx`:

- Header "Nextil 360 — Visão consolidada da operação".
- Grid de 2-3 cards-módulo:
  - **Pedidos** (KPI: total ativo, total em produção, faturamento mês) → `/vendedor/360/pedidos`
  - **Cliente 360** (KPI: nº de clientes na carteira) → atalho que sugere selecionar cliente
  - Espaço reservado para futuros módulos
- Estilo: padrão dashboard vendedor (`bg-card`, `border`, ícones lucide).

### 4. Página `PedidosHubPage` (`/vendedor/360/pedidos`)

`src/pages/vendedor/PedidosHub.tsx`:

**Topo**
- Breadcrumb: Nextil 360 / Pedidos
- 4 KPIs: Em produção, Faturados, Em transporte, Entregues no mês
- Toggle de visualização: **Lista** | **Kanban** (default Lista)

**Filtros (barra)**
- Busca (cliente / nº pedido)
- Origem (todos | Orçamento | Marketplace | Manual) — chips
- Status (multi-select)
- Período (este mês / últimos 30d / customizado)
- Marca, Cliente

**Visão Lista (tabela)**
Colunas: Nº | Cliente | Marca | Origem (badge colorido) | Peças | Valor | Status (badge) | Pagamento | Previsão entrega | Ações (⋯)
- Click na linha → abre `PedidoDetalheModal`

**Visão Kanban**
- 5 colunas: Confirmado · Em produção · Faturado · Em transporte · Entregue
- Cards arrastáveis (drag & drop simples — `@dnd-kit` já presumido ausente; usar HTML5 DnD nativo ou apenas botões de avanço de status para MVP)
- Cada card mostra: cliente, marca, valor, peças, badge origem, badge pagamento

### 5. `PedidoDetalheModal`

`src/components/vendedor/PedidoDetalheModal.tsx` — modal técnico (max-h 90vh, flex-col, header/footer shrink-0, scroll central, z-[200]).

**Header**: nº pedido + cliente + badge origem + badge status + botão "Avançar status →"

**Tabs internas**:
1. **Resumo**: dados gerais, observações, totais, previsão entrega, link orçamento (se origem = orcamento)
2. **Grade / Itens**: tabela editável (qtd, preço unitário, remover linha, adicionar item). Salvar recalcula total. Bloqueado quando status ≥ faturado.
3. **Pagamento**: status, método, gerar boleto (mock toast), gerar link de pagamento (mock toast com link copiável), anexar nota fiscal (mock).
4. **Histórico**: timeline de mudanças de status com data/autor.

**Footer**: Cancelar pedido (destructive) | Salvar alterações.

### 6. Integração com Cliente 360

Na `Cliente360Page`, na aba Pedidos do cliente, adicionar link "Ver no Hub de Pedidos →" que leva ao hub filtrado por `?cliente=<id>`. Cards de pedido no 360 também abrem o `PedidoDetalheModal`.

### 7. Detalhes técnicos

- **Estado**: criar `PedidosContext` (`src/contexts/PedidosContext.tsx`) com `pedidos`, `updatePedidoStatus`, `updatePedidoItens`, `cancelarPedido`, `gerarBoleto/gerarLinkPagamento` (mock). Persistir em `localStorage` (`nextil_vendedor_pedidos`).
- Provider montado no `App.tsx` ao redor das rotas `/vendedor/*`.
- Cores de badge:
  - Origem: orçamento `bg-blue-500/15 text-blue-600`, marketplace `bg-purple-500/15 text-purple-600`, manual `bg-amber-500/15 text-amber-600`.
  - Status: confirmado azul, em_producao âmbar, faturado roxo, em_transporte ciano, entregue verde, cancelado vermelho.
  - Pagamento: pago verde, pendente cinza, parcial âmbar, atrasado vermelho.
- Toasts via `sonner` para todas as ações (status alterado, boleto gerado, link copiado).
- Mobile: lista vira cards stackados; kanban vira tabs por status.

### 8. Arquivos

**Criar**
- `src/pages/vendedor/Nextil360Hub.tsx`
- `src/pages/vendedor/PedidosHub.tsx`
- `src/components/vendedor/PedidoDetalheModal.tsx`
- `src/contexts/PedidosContext.tsx`

**Editar**
- `src/data/mockCRM360.ts` (interface `Pedido` + mock estendido)
- `src/components/vendedor/VendedorSidebar.tsx` (sub-item Pedidos + isActive)
- `src/App.tsx` (rotas `/vendedor/360` e `/vendedor/360/pedidos`, provider)
- `src/pages/vendedor/Cliente360Page.tsx` (link para hub + abrir modal)

Posso seguir com a implementação?
