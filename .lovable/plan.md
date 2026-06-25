
# Dashboard Comercial Nextil — Plano Mestre

Reconstrução completa dos dois cockpits (Gestor + Vendedor) seguindo a spec densa. Dividido em **6 fases sequenciais**. Cada fase entrega algo testável antes da próxima.

> Identidade não-negociável: fundo `#F6F7F9`, cards `#FFFFFF` borda `#E7E9EE` raio 12, primária `#2D3A8C`, acento `#F26B21`. Cores de status SEMPRE: Ativo `#16A34A` · Inativo `#F59E0B` · Perdido `#DC2626` · Lead `#64748B` · Reativado `#0D9488`. Fonte Inter, números `tabular-nums font-semibold`, sentence case, sem emoji, sem gradiente decorativo.

---

## FASE 1 — Fundação (tokens, contexto, seed, libs de cálculo)

### 1.1 Tokens visuais

**`src/cockpit/styles/tokens.ts`** (novo):
```ts
export const NX = {
  appBg: "#F6F7F9", card: "#FFFFFF", border: "#E7E9EE",
  text: "#0F172A", muted: "#64748B",
  primary: "#2D3A8C", accent: "#F26B21",
};
export const STATUS_COLORS = {
  ativo: "#16A34A", inativo: "#F59E0B", perdido: "#DC2626",
  lead: "#64748B", reativado: "#0D9488",
} as const;
export type Status = keyof typeof STATUS_COLORS;
export const STATUS_LABEL: Record<Status,string> = { ativo:"Ativo", inativo:"Inativo", perdido:"Perdido", lead:"Lead", reativado:"Reativado" };
export const fmtBRL = (n:number)=> n.toLocaleString("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0});
export const fmtBRLc = (n:number)=> n>=1e6?`R$ ${(n/1e6).toFixed(1)}M`: n>=1e3?`R$ ${(n/1e3).toFixed(0)}k`:fmtBRL(n);
export const fmtPct = (n:number,d=1)=> `${n.toFixed(d).replace(".",",")}%`;
export const fmtNum = (n:number)=> n.toLocaleString("pt-BR");
export const fmtDias = (n:number)=> `${Math.round(n)} dias`;
export const deltaColor = (d:number, invert=false)=> (invert?-d:d) >=0 ? "text-emerald-600":"text-rose-600";
```

**`src/index.css`** — adicionar utilitárias específicas do cockpit (NÃO mexer no resto):
```css
.nx-shell { background:#F6F7F9; }
.nx-card  { background:#fff; border:1px solid #E7E9EE; border-radius:12px; box-shadow:0 1px 2px rgba(15,23,42,.04); }
.nx-num   { font-feature-settings:"tnum"; font-variant-numeric:tabular-nums; }
```

### 1.2 Contexto global de período/config

**`src/cockpit/contexts/CockpitContext.tsx`**:
- Estado: `period: "hoje"|"7d"|"30d"|"90d"|"trimestre"|"semestre"|"ano"|"custom"`; `customRange?: {from:Date;to:Date}`; `comparar:boolean` (default true); `diasAtivo:number` (60); `diasPerdido:number` (180); `repId:string|"todos"`.
- Persistência: `diasAtivo`, `diasPerdido` em `localStorage("cockpit:cfg")`.
- Derivados expostos: `range:{from,to}`, `previousRange:{from,to}` (mesmo tamanho imediatamente anterior), `repList`.
- Hook `useCockpit()`.
- Provider montado em `App.tsx` apenas envolvendo `Route path="/vendedor/*"` (não global para não afetar outros módulos).

### 1.3 Seed determinístico

**`src/cockpit/data/seed.ts`** — função `buildSeed()` memoizada, usando RNG seeded (mulberry32, seed=42):

Entidades:
- `Representante { id, nome, email }` — 6 fixos: André Lima, Alexandre Souza, Carla Mendes, Daniel Rocha, Giovanna Pires, Sérgio Tavares.
- `Marca { id, nome, categorias:string[] }` — 9 marcas com 3-4 categorias e 4 coleções (Verão 25, Inverno 25, Resort 25, Básicos).
- `Nicho` — Boutique, Multimarca, Atacadista, E-commerce, Rede, Franquia.
- `Conta { id, razao, nicho, cidade, uf, repId, criadoEm }` — 120 contas distribuídas entre reps.
- `Pedido { id, contaId, repId, data:Date, valor:number, itens:number, marcaId, categoria, colecao }` — ~1500 pedidos nos últimos 365 dias, distribuídos para garantir:
  - 30% contas com pedido nos últimos 30d (Ativo)
  - 20% últimos 31-60d (Ativo borda)
  - 15% 61-90d (Inativo)
  - 15% 91-180d (Inativo)
  - 15% 181-365d (Perdido)
  - 5% sem pedido nenhum (Lead)
- `Atendimento { id, contaId, repId, data, tipo:"visita"|"ligacao"|"whatsapp", resultado, leadOuCliente }` — ~600.
- `Oportunidade { id, contaId, repId, etapa:"novo_lead"|"em_negociacao"|"proposta_enviada"|"orcamento_aprovado"|"ganha"|"perdida", valor, abertaEm, ultimaMov, motivoPerda? }` — ~80.
- `Meta { repId|"consolidada", tipo:"faturamento"|"positivacao"|"cobertura"|"novos"|"reativacao", valor, mes }` — 6 reps × 5 tipos × 6 meses.

### 1.4 Libs de cálculo

**`src/cockpit/lib/range.ts`** — `resolveRange(period, custom)` → `{from,to}`; `previousOf(range)` → mesmo tamanho imediatamente anterior; `inRange(date,range)`.

**`src/cockpit/lib/classificar.ts`** — `statusDe(conta, todosPedidos, hoje, diasAtivo, diasPerdido): Status` (recência baseada no último pedido global; `novo` e `reativado` calculados em relação ao range).

**`src/cockpit/lib/kpis.ts`** — funções puras:
- `kpisCarteira(seed, range, prev, cfg)` → 14 valores listados na spec, todos com `{atual,anterior,delta}`.
- `kpisAtendimento(...)` → 11 valores.
- `kpisProduto(...)` → 9 valores.
- `kpisMetas(...)` → atingimento, pace, gap, dias úteis restantes, R$/dia necessário.

**`src/cockpit/lib/aging.ts`** — buckets `[0-30, 31-60, 61-90, 91-180, 180+]`.
**`src/cockpit/lib/rfv.ts`** — quintis R/F/V; segmentos: Campeões (R5F5V5/V4), Fiéis (R≥4,F≥4), Em risco (R≤2,F≥3), Hibernando (R≤2,F≤2), Novos (R5,F1).
**`src/cockpit/lib/abc.ts`** — curva Pareto A(80%)/B(15%)/C(5%) para clientes e produtos.
**`src/cockpit/lib/movimento.ts`** — waterfall (saldo inicial, novos, reativados, −perdidos, saldo final); funil retenção; crescimento acumulado.
**`src/cockpit/lib/funis.ts`** — funil oportunidades com taxa entre etapas; aging de oportunidades; estagnadas (>N dias na etapa).
**`src/cockpit/lib/series.ts`** — `serieDiaria(metric, range)` + média móvel 7d; `serieMensal` para YoY/MoM; `heatmapMesRep`.
**`src/cockpit/lib/fila.ts`** — `filaAcaoVendedor(seed, repId, cfg, hoje)` retornando 3 blocos com motivo textual.

**Entregável Fase 1:** dados navegáveis via console; nada ainda na UI.

---

## FASE 2 — Componentes reutilizáveis

Todos em `src/cockpit/components/`. Todos usam `STATUS_COLORS` ou `NX.primary`; nenhum hard-code de cor.

### 2.1 Primitivos

- `KpiCard.tsx` — props `{label, value, delta?:{pct:number; invert?:boolean}, hint?, icon?}`; valor `text-xl nx-num`, delta com seta e cor automática.
- `SectionCard.tsx` — wrapper `.nx-card p-4` com título + ação opcional.
- `EmptyState.tsx` — ícone + msg direcional.
- `Legend.tsx` — chips de cor.

### 2.2 Identidade — Saúde da Carteira

`SaudeCarteiraBar.tsx` — barra horizontal segmentada full-width:
- 3 segmentos com `STATUS_COLORS.ativo/inativo/perdido`, largura proporcional.
- Em cima: números absolutos por segmento + % + delta vs período anterior com seta.
- Mobile: empilha cards.

### 2.3 Charts (Recharts)

- `StatusDonut.tsx` — PieChart 3 fatias.
- `AgingBars.tsx` — BarChart horizontal 5 buckets.
- `RfvHeatmap.tsx` — grid 5×5 com cor por densidade + legenda dos 5 segmentos sobrepostos com bordas.
- `AbcCurve.tsx` — ComposedChart (barras valor + linha acumulada %).
- `TreemapClientes.tsx` — Recharts Treemap.
- `Waterfall.tsx` — BarChart custom (positivos verdes, negativos vermelhos, totais cinza).
- `FunnelChart.tsx` — barras horizontais escalonadas + % conversão entre etapas.
- `Gauge.tsx` — RadialBarChart semicírculo.
- `ProgressBar.tsx` — barra simples com label e %.
- `Sparkline.tsx` — LineChart minimalista para tabelas.
- `HeatmapMesRep.tsx` — grid 6m × 6 reps com escala de cor primária.
- `StackedBarRep.tsx` — barras empilhadas Ativo/Inativo/Perdido por rep.
- `MultiLineSerie.tsx` — wrapper LineChart com MM7 opcional.

### 2.4 Controles globais

`CockpitTopbar.tsx`:
- Esquerda: título da tela.
- Direita: `PeriodPicker` (botões segmentados Hoje/7d/30d/90d/Trim/Sem/Ano + popover custom) + switch "Comparar com período anterior" + (só no painel vendedor) `Select` de representante.
- Sticky `top-0 z-20 nx-card` borda inferior.

**Entregável Fase 2:** Storybook-like via rota `/vendedor/_cockpit-preview` (opcional) listando todos os componentes com dados do seed.

---

## FASE 3 — Painel Gestor (`DashboardGerencial.tsx`)

Reescrita completa. Estrutura:

```
<div className="nx-shell min-h-screen">
  <CockpitTopbar title="Painel Comercial · Gestor" />
  <div className="px-4 md:px-6 py-4 space-y-4">
    <SaudeCarteiraBar/>
    <Tabs defaultValue="carteira">
      <TabsList> Carteira · Atendimento · Produto · Metas · Progressões </TabsList>
      <TabsContent ...>
```

### 3.1 Aba Carteira

**Sub-seção 1 — Resumo** (grid `grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3`):
14 KpiCards: Total clientes · Leads · Ativos · Inativos · Perdidos · Novos · Reativados · Positivados · Taxa positivação · Churn · Taxa reativação · Recência média · Ticket médio cliente · Frequência média.

**Sub-seção 2 — Composição** (`grid-cols-1 lg:grid-cols-2 gap-4`):
- SectionCard "Distribuição por status" → `StatusDonut`.
- SectionCard "Aging da carteira" → `AgingBars` 5 buckets.
- SectionCard "Distribuição por nicho" → PieChart 6 fatias.
- SectionCard "Top clientes (curva ABC)" → `TreemapClientes` + chips A/B/C.

**Sub-seção 3 — RFV** (full width):
- SectionCard "Matriz RFV" → `RfvHeatmap` com 5 segmentos rotulados (Campeões, Fiéis, Em risco, Hibernando, Novos) + tabela lateral com contagem por segmento.

**Sub-seção 4 — Movimento** (`grid-cols-1 lg:grid-cols-2`):
- Waterfall movimentação líquida.
- MultiLineSerie status no tempo.
- BarChart movimentação por marca.
- FunnelChart retenção (Ativo→Inativo→Perdido→Reativado).
- LineChart crescimento líquido acumulado (full width).

**Sub-seção 5 — Por representante**:
- `StackedBarRep` full width.
- Tabela: Rep · Ativos · Inativos · Perdidos · Positivados · % base inativa · Δ vs anterior · sparkline 30d.

**Sub-seção 6 — Ação**:
- Tabela "Em risco" (inativos ≤15 dias de virar perdidos): Cliente · Rep · Dias restantes (badge âmbar) · Último valor · CTA "Ver".
- Cards de alertas (gerados via regras: rep com >30% inativo, marca com queda >20%, etc).

### 3.2 Aba Atendimento

**Resumo** (11 KPIs em 4col): Cobertura · N atendimentos · A leads · A clientes · Conversão L→C · Ciclo dias · Win rate · Ticket oportunidade · Op abertas · Pipeline R$ · Tempo médio etapa.

**Funil e pipeline**:
- FunnelChart 4 etapas com % entre etapas.
- BarChart valor pipeline por etapa.
- Tabela estagnadas (>14d na etapa): Op · Cliente · Etapa · Dias parada · Valor.
- AgingBars oportunidades abertas.

**Esforço comercial**:
- BarChart atendimentos por rep.
- PieChart por tipo.
- StackedBar Lead vs Cliente por rep.
- LineChart evolução atendimentos.
- BarChart horizontal cobertura % por rep.

**Conversão e perda**:
- PieChart motivos de perda.
- FunnelChart comparativo Lead vs Cliente lado a lado.
- BarChart win rate por rep.

### 3.3 Aba Produto

**Resumo** (9 KPIs): Faturamento · Marcas ativas · Ticket por marca · Cross-sell (marcas/cliente) · Marca líder · Maior crescimento · Maior queda · Itens/pedido · % marca top.

**Mix**:
- BarChart faturamento por marca.
- BarChart por categoria/coleção.
- TreemapMarcaCategoria.
- BarChart top 10 + bottom 10 produtos (2 cards).
- AbcCurve de produtos.

**Penetração**:
- BarChart horizontal penetração de marca (% base que compra).
- Heatmap marca × nicho.
- Tabela "Marcas sem giro" por rep.

**Sazonalidade**:
- MultiLineSerie faturamento por marca.
- BarChart recompra por coleção.
- BarChart mix por rep (stacked).
- BarChart ticket médio por categoria.

### 3.4 Aba Metas

**Atingimento consolidado**:
- `Gauge` meta faturamento (grande, full row).
- Cards lado a lado: Pace projetado · Gap R$ · Dias úteis restantes · R$/dia necessário.
- 4 mini-gauges: positivação · cobertura · novos · reativação.

**Projeção**:
- LineChart realizado × projetado × linha de meta.
- BarChart histórico 6m de atingimento %.

**Por representante**:
- Tabela ranqueada: Rep · Meta R$ · Realizado · % (ProgressBar inline) · Pace · Δ.
- BarChart agrupado: atingimento % por tipo de meta × rep.

### 3.5 Aba Progressões

**Tendências** (5 cards com `MultiLineSerie` + MM7): Faturamento · Carteira por status · Positivação · Cobertura · Conversão.

**Comparativos**:
- BarChart MoM agrupado.
- BarChart YoY agrupado.
- Tabela comparativa completa (todas métricas × atual × anterior × Δ%).
- MultiLineSerie comparativo entre reps (toggle por rep).

**Evolução**:
- LineChart crescimento da base acumulado (novos − perdidos).
- Ranking quem mais cresceu (tabela + barras).
- `HeatmapMesRep` performance mensal por rep.

**Entregável Fase 3:** painel gestor 100% funcional, mudando ao trocar período/config.

---

## FASE 4 — Painel Vendedor (`VendedorDashboard.tsx`)

Reescrita completa. Topbar com `Select` de representante (default: primeiro rep). Abas: **Hoje · Minha Carteira · Minhas Metas · Meu Funil**.

### 4.1 Aba Hoje (default — fila de ação)

Layout single-column, foco em densidade vertical:

**Header**: card grande com `Você tem N clientes para atender hoje` + breakdown dos 3 blocos (chips coloridos).

**Bloco 1 — Inativos prestes a virar perdidos** (cabeçalho vermelho/âmbar, expandido):
- Lista de cards, ordenada por `diasRestantes` ASC.
- Cada item: avatar inicial · razão · badge status · `Faltam X dias para virar perdido` (vermelho se ≤5) · valor último pedido · motivo "Sem compra há Yd" · botões `Registrar atendimento` (abre modal mock com tipo + nota) e `Ver ficha`.

**Bloco 2 — Leads/oportunidades quentes paradas** (cabeçalho âmbar, expandido):
- Item: razão · etapa · `Sem movimento há Zd` · valor op · CTA igual.

**Bloco 3 — Ativos sem cobertura no período** (cabeçalho cinza, colapsado por default):
- Item: razão · último contato · CTA.

**Rodapé sticky**: 3 mini-KPIs: Atendimentos feitos hoje · Positivados hoje · Meta do dia (com progress).

### 4.2 Aba Minha Carteira

- `SaudeCarteiraBar` filtrada ao rep.
- 6 KpiCards: Ativos · Inativos · Perdidos · Positivados · Novos · Reativados.
- `StatusDonut` + `AgingBars`.
- Tabela filtrável (search + filter por status) listando todos os clientes do rep: Razão · Status (badge) · Último pedido · Recência · Valor 12m · CTA.

### 4.3 Aba Minhas Metas

- `Gauge` grande meta faturamento + cards Pace · Falta R$.
- 2 mini-gauges: positivação · cobertura.
- BarChart histórico 6m do rep.

### 4.4 Aba Meu Funil

- `FunnelChart` das oportunidades do rep com botão "Avançar etapa" em cada op listada abaixo.
- Tabela estagnadas: Op · Cliente · Etapa · Dias parada · Valor · CTA "Mover".
- Mini-KPIs: Meu ciclo de vendas · Minha win rate · Pipeline R$.

**Entregável Fase 4:** painel vendedor completo.

---

## FASE 5 — Configurações

Em `src/pages/vendedor/VendedorConfiguracoes.tsx`, adicionar nova seção (Card):

**"Cockpit comercial — classificação de carteira"**:
- Input numérico `diasAtivo` (default 60, min 7, max 365).
- Input numérico `diasPerdido` (default 180, min 30, max 730).
- Texto derivado: "Inativo: entre {diasAtivo+1} e {diasPerdido} dias sem comprar".
- Banner âmbar: "Alterar esses valores reclassifica toda a carteira em todos os painéis. A mudança é imediata."
- Botão "Salvar" (persiste via `useCockpit().setConfig`).
- Botão "Restaurar padrões".

---

## FASE 6 — Integração, polimento, QA

### 6.1 Roteamento

`src/App.tsx`:
- Envolver as rotas existentes `/vendedor/*` com `<CockpitProvider>` (não tocar em rotas de outros módulos).
- Manter `/vendedor` → `VendedorDashboard`, `/vendedor/gerencial` → `DashboardGerencial`.

### 6.2 Sidebar — sem mudanças funcionais

Confirmar que "Painel gerencial" e "Dashboard vendedor" continuam apontando para as rotas existentes.

### 6.3 QA

- Trocar período → todos os KPIs/charts recalculam.
- Trocar `diasAtivo` → SaudeCarteiraBar reflete imediatamente em ambos os painéis.
- Trocar `repId` no painel vendedor → fila de ação muda.
- Zero hard-code de cor em componente (`grep` por `text-white|bg-black|#fff|#000`).
- `tsgo` limpo.
- Responsivo 320→1920.
- Estados vazios renderizam com mensagem direcional quando filtro elimina dados.

---

## Estrutura final de arquivos

**Novos** (`src/cockpit/`):
```
contexts/CockpitContext.tsx
data/seed.ts
lib/{range,classificar,kpis,aging,rfv,abc,movimento,funis,series,fila,comparativo}.ts
styles/tokens.ts
components/{KpiCard,SectionCard,EmptyState,Legend,SaudeCarteiraBar,
  StatusDonut,AgingBars,RfvHeatmap,AbcCurve,TreemapClientes,
  Waterfall,FunnelChart,Gauge,ProgressBar,Sparkline,HeatmapMesRep,
  StackedBarRep,MultiLineSerie,CockpitTopbar,PeriodPicker}.tsx
components/vendedor/{FilaCardInativo,FilaCardLead,FilaCardSemCobertura,RegistrarAtendimentoModal}.tsx
```

**Reescritos**:
- `src/pages/vendedor/DashboardGerencial.tsx`
- `src/pages/vendedor/VendedorDashboard.tsx`

**Editados**:
- `src/App.tsx` (CockpitProvider envolvendo `/vendedor/*`)
- `src/index.css` (3 classes `.nx-*`)
- `src/pages/vendedor/VendedorConfiguracoes.tsx` (seção cockpit)

---

## Ordem de execução

1. **Fase 1** completa antes de tocar em UI (fundação sólida evita retrabalho).
2. **Fase 2** completa antes das telas (todos os charts prontos).
3. **Fase 3 + 4** podem ser implementadas em paralelo aba a aba.
4. **Fase 5** é uma única seção, rápida.
5. **Fase 6** valida tudo.

Tempo estimado: Fase 1 e 2 são as mais densas (volume de código de cálculo e ~20 componentes). Fases 3 e 4 são montagem.
