# Plano Final: Módulo "Nextil Inteligência de Mercado"

Camada estratégica de decisão comercial com 8 telas clicáveis. Foco: responder "o que exige atenção agora?", não apenas exibir relatórios.

## 1. Navegação e rotas

`src/components/AppSidebar.tsx` — nova seção **"Inteligência"** (collapsible) com ícone `Radar` ou `Brain`:
- Inteligência de Mercado (`/inteligencia-mercado`)
- Radar de Produtos (`/inteligencia-mercado/radar-produtos`)
- Recomendações (`/inteligencia-mercado/recomendacoes`)
- Comparativos (`/inteligencia-mercado/comparativos`)
- Fornecedores (`/inteligencia-mercado/fornecedores`)
- Coleções (`/inteligencia-mercado/colecoes`)
- Relatórios (`/inteligencia-mercado/relatorios`)

`src/App.tsx` — registrar 8 rotas dentro de `LayoutRoute`, incluindo `/inteligencia-mercado/produto/:sku`.

## 2. Estrutura de arquivos

```text
src/
├── pages/inteligencia/
│   ├── VisaoGeral.tsx
│   ├── RadarProdutos.tsx
│   ├── ProdutoDetalhe.tsx
│   ├── Recomendacoes.tsx
│   ├── Comparativos.tsx
│   ├── Fornecedores.tsx
│   ├── Colecoes.tsx
│   └── Relatorios.tsx
├── components/inteligencia/
│   ├── IMHeader.tsx          (título, subtítulo, microcopy de fonte de dados)
│   ├── IMFilters.tsx         (filtros globais)
│   ├── KpiCard.tsx
│   ├── DecisionCard.tsx      (card grande do Painel de Decisão)
│   ├── InsightCard.tsx       (estrutura completa obrigatória)
│   ├── StatusBadge.tsx       (13 status inteligentes)
│   ├── ConfidenceBadge.tsx   (Alta/Média/Baixa)
│   ├── ScoreBreakdown.tsx    (6 critérios em barras)
│   ├── ColumnsCustomizer.tsx (modal "Personalizar colunas")
│   ├── CriarTarefaModal.tsx
│   ├── RecompraModal.tsx
│   ├── SimularPrecoModal.tsx
│   ├── CriarCampanhaModal.tsx
│   ├── ExportarAnaliseModal.tsx
│   └── RelatorioPreviewModal.tsx
├── contexts/
│   └── RecomendacoesContext.tsx  (estado aceita/ignorada/pendente + localStorage)
└── data/
    └── mockInteligencia.ts
```

## 3. Microcopy de cabeçalho (em todas as telas do módulo)

`IMHeader` exibe abaixo do título uma linha discreta:

> "Análises baseadas nos dados internos de compra, venda, estoque, pedidos, reservas e comportamento comercial da operação."

## 4. Tela Visão Geral — hierarquia visual

Ordem rígida, com peso visual decrescente para gráficos:

1. **Filtros globais** (barra horizontal sticky abaixo do header): Período, Coleção, Marca, Categoria, Canal, Região, Fornecedor.
2. **KPIs executivos** — 8 `KpiCard` em grid `grid-cols-2 md:grid-cols-4 xl:grid-cols-8`, altura compacta.
3. **Painel de Decisão** — destaque máximo: 4 `DecisionCard` grandes (`grid-cols-1 md:grid-cols-2 xl:grid-cols-4`), com sombra acentuada, ícone colorido, indicador grande, mensagem e CTA navegável (Recompra → `/recomendacoes?tipo=recompra`; Ruptura → `/recomendacoes?tipo=ruptura`; Estoque parado → `/radar-produtos?status=parado`; Margem → `/recomendacoes?tipo=margem`).
4. **Insights Estratégicos Prioritários** — 4 `InsightCard` em destaque (uso de `border-l-4` colorida por prioridade).
5. **Análise Visual** (recolhível ou em accordion "Ver análise visual"): linha receita×margem, barras estoque parado, donut canal, barras horizontais sell-through, colunas margem.
6. **Rankings Estratégicos** — 2 colunas: Top 10 mais rentáveis | Top 10 maior risco comercial.

Decisão e Insights ocupam aproximadamente 60% da dobra inicial; gráficos ficam abaixo.

## 5. InsightCard — estrutura obrigatória

Cada card renderiza, na ordem:

1. **Tipo de insight** (chip): Recompra / Liquidação / Revisão de preço / Atenção à margem / Renegociação / Campanha.
2. **Produto ou grupo analisado** (título + SKU/marca).
3. **Prioridade** (badge Alta/Média/Baixa, cor semântica).
4. **Motivo** (frase descritiva orientada a dados).
5. **Evidências numéricas** (lista de 2–4 métricas: sell-through, dias em estoque, margem, estoque atual).
6. **Impacto estimado** (linha destacada com valor em R$ ou %).
7. **Ação sugerida** (frase imperativa).
8. **Confiança da recomendação** — `ConfidenceBadge` (Alta/Média/Baixa) com tooltip explicando base.
9. **Base analisada** — texto secundário, ex.: "820 unidades compradas, 672 vendidas, 21 dias de histórico".
10. **Botões**: Ver detalhe, Criar tarefa, Aceitar, Ignorar, Atribuir responsável.
11. **Estado visual**: pendente (default), aceita (`border-emerald-500`, badge "Aceita"), ignorada (`opacity-60`, badge "Ignorada", ação "Reabrir").

Regra: nenhum texto genérico; o motivo sempre cita o dado que justifica.

## 6. Persistência de estado das recomendações

`RecomendacoesContext` mantém `Record<recId, { status: 'pendente'|'aceita'|'ignorada', responsavel?, aceitaEm? }>` em `localStorage` (`im:recomendacoes:v1`). Ações `aceitar(id)`, `ignorar(id)`, `reabrir(id)`, `atribuir(id, user)`. Filtros de Recomendações respeitam status.

## 7. Radar de Produtos

- Busca grande no topo + filtros avançados em painel collapsible (não exibidos por default).
- Botões: Aplicar, Limpar, Salvar visão, Exportar, Comparar selecionados, **Personalizar colunas** (abre `ColumnsCustomizer` — checklist simulado das 20 colunas, persistido em `localStorage`).
- Tabela densa: `text-xs`, `py-2`, zebra sutil, **scroll horizontal** (`overflow-x-auto`) com **primeira coluna (Produto+miniatura) sticky** (`sticky left-0 bg-card z-10 shadow-[2px_0_4px_rgba(0,0,0,0.04)]`).
- Status e Ação como badges compactos. Linha clicável → Detalhe.
- Suporta querystring `?status=parado|ruptura|...`.

## 8. Detalhe do Produto — Score de Performance composto

Card "Score de Performance: 91/100" com componente `ScoreBreakdown` exibindo 6 critérios em barras horizontais:

```text
Giro            ████████░░ 88
Margem          █████████░ 92
Sell-through    █████████░ 90
Estoque         ███████░░░ 75
Recorrência     ████████░░ 84
Risco (inv.)    █████████░ 95
```

Cada barra tem cor por faixa (verde ≥80, âmbar 60–79, rose <60) e tooltip com leitura curta. Score global = média ponderada visível em "Como calculamos" (popover).

Restante da tela conforme briefing: 12 KPIs, bloco Markup, 8 visualizações, Histórico de Compras/Vendas, 4 InsightCards específicos.

## 9. Telas restantes

- **Recomendações**: filtros + 7 abas + lista de InsightCards (estrutura completa). Filtro extra por Status (Pendente/Aceita/Ignorada) e por Confiança.
- **Comparativos**: seletor 6 modos + layout 3 colunas (A | Δ% | B) + conclusão automática textual.
- **Fornecedores**: 6 KPIs + tabela 12 colunas + 4 gráficos.
- **Coleções**: 8 cards + tabela 13 colunas + áreas de cores/tamanhos/categorias/recomendação para próxima coleção.
- **Relatórios**: grid 8 cards → `RelatorioPreviewModal` com resumo executivo, KPIs, insights, tabela e próximas ações.

## 10. Modais (técnicos, `max-h-[90vh]` flex-col)

Criar tarefa, Marcar para recompra, Simular preço, Criar campanha, Exportar análise, Preview de relatório. Todos os botões relevantes abrem modal ou navegam — nada inerte. Ações disparam `toast` e atualizam contexto quando aplicável.

## 11. Dados mock (`mockInteligencia.ts`)

8 produtos completos do briefing, 8 fornecedores, 4 coleções, 5+ recomendações tipadas (cada uma com `confianca`, `baseAnalisada`, `evidencias[]`, `impactoEstimado`, `acaoSugerida`), séries temporais (receita+margem mensal, vendas semanais, estoque/tempo, vendas por canal/região/grade/cor), top clientes, top vendedores. Helpers: `computeStatus`, `computeScoreBreakdown`, `formatBRL`, `formatPct`.

## 12. Padrão visual

- Sidebar dark navy existente; cards `bg-card border-border rounded-xl shadow-sm hover:shadow-md transition-all`.
- Poppins, hierarquia: títulos `text-2xl font-bold`, KPI `text-2xl tabular-nums`, auxiliar `text-xs text-muted-foreground uppercase tracking-wide`.
- Cores semânticas: emerald (positivo), amber (atenção), rose (crítico), persian-blue/sky-blue (neutro/info).
- Microinterações: `transition-all`, hover sutil em cards e linhas.

## 13. Sem backend

Tudo client-side. Persistência via `localStorage` para: status de recomendações, colunas personalizadas do Radar, visões salvas.
