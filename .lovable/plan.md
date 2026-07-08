# Reestruturação da área do Gestor

Painel volta a ser leitura pura (Carteira · Atendimento · Produto, cada aba com Insights → KPIs → Gráficos). Aprovações vira submenu próprio com fila e histórico. Representantes absorve Time & Metas + Planos de recuperação. Tudo o que era operacional no painel migra para os submenus corretos, acessível via insights com ação.

---

## Parte 1 — Navegação

Editar `src/components/vendedor/VendedorSidebar.tsx` (seção Gestão):

```text
Painel Gestor           /gestor/painel
Aprovações  [7]         /gestor/aprovacoes       ← NOVO, badge vermelho
Representantes          /vendedor/representantes  (absorve Time & Metas)
Pedidos (Empresa)       (inalterado)
Carteira                (inalterado)
Atendimento             (inalterado)
Relatórios              (inalterado)
Segmentações            (inalterado)
```

- Badge numérico lê `useAprovacoesPendentes()` (novo hook wrapper em `cockpit/lib/decisoes.ts`). Visível em `collapsed` como pílula pequena sobreposta ao ícone.
- Rotas em `App.tsx`:
  - `/gestor/painel` → `GestorPainel` (existente `DashboardGerencial` renomeado internamente, sem abas Decisões/Time)
  - `/gestor/aprovacoes` → nova `GestorAprovacoes`
  - Redirects: `/vendedor/insights` e `/gestor/painel?tab=decisoes` → `/gestor/aprovacoes` (via `<Navigate>` e effect que lê `searchParams`).
- Escopo/período globais permanecem no `CockpitTopbar`. `GestorAprovacoes` ignora o período (fila é sempre agora); o topbar mostra o filtro cinza/desabilitado nessa rota.

---

## Parte 2 — Tela Aprovações (nova)

Arquivo: `src/pages/vendedor/GestorAprovacoes.tsx`.

Layout:

```text
Aprovações · Análise comercial
Fora da política · crédito · estoque. Fast-track passa direto e não aparece aqui.

[Todas 7] [Fora da política 3] [Crédito 2] [Estoque 2]      Abas: Fila | Histórico

── FILA (ordenada por espera DESC) ──
┌────────────────────────────────────────────┐
│ 🔴 Fora da política · há 5d                │  borda vermelha (>4d) / laranja (>2d)
│ Desconto 35% sem mínimo atingido           │
│ Atacado Bella · Sérgio · R$ 24.300         │
│ [Aprovar] [Devolver com ajuste] [Reprovar] │
│ Ver orçamento →                            │
└────────────────────────────────────────────┘
```

- Reaproveita o `DecisaoCard` já usado na antiga aba. Aprovação `fora_da_politica` acima de R$ 20k pede confirmação de 1 passo (AlertDialog).
- Contadores por motivo filtram a lista.
- Aba **Histórico**: tabela de `aprovacoesLog` (data · orçamento · cliente · rep · motivo · decisão · gestor · nota) com busca e filtro por decisão.
- Mobile: coluna única, botões grandes (h-11), CTAs empilhados.

Planos de recuperação NÃO ficam aqui — vão para Representantes.

---

## Parte 3 — Painel Gestor (3 pilares, leitura)

Editar `src/pages/vendedor/DashboardGerencial.tsx`: remover abas `Decisões` e `Time & Metas`. Ficam:

```text
[Faixa de saúde da carteira — mantida]

Tabs:  Carteira | Atendimento | Produto
```

Cada aba tem exatamente 3 camadas:

```text
(a) Faixa de INSIGHTS         2–4 cards acionáveis, cor por severidade
(b) KPIs do pilar             cards com tooltip
(c) GRÁFICOS do pilar         os já refinados
```

### Motor de insights

Novo arquivo `src/cockpit/lib/insights.ts` — funções puras que recebem escopo/período e retornam `Insight[]`:

```ts
type Severidade = "critico" | "atencao" | "oportunidade";
interface Insight {
  id: string;
  severidade: Severidade;
  texto: string;          // 1 frase com números
  acao: { label: string; href?: string; drawer?: DrawerKey };
}
```

- Máx 4 por pilar (ordenados por severidade + valor em R$).
- Anti-ruído: se ≥60% dos reps têm o mesmo problema → 1 insight estrutural.
- Estado vazio: card verde "Nenhum ponto crítico neste pilar ✓".
- Componente visual: `src/cockpit/components/InsightsStrip.tsx` (grid 1/2/4 cols responsivo, cores vermelho/laranja/azul/verde).

### Aba Carteira
- Insights: clientes grandes escorregando · classe A a <15d de perder · carteira inativa estrutural · recuperados no período.
- Ação "Ver lista e cobrar planos" abre novo `ClientesRiscoDrawer` (tabela + botão "Cobrar plano do rep" por linha, reusa `SolicitarPlanoModal`). Essa tabela **sai do corpo** do painel.
- KPIs e gráficos: mantidos (Mapa da Carteira, Top clientes, Movimentação, Fluxo, Tempo desde a última compra).

### Aba Atendimento
- Insights: reps fora de ritmo (agregado, link p/ Representantes) · negócios grandes parados (drawer) · cobertura caiu Xpp · tickets estourados por setor.
- Cards individuais de rep **saem** do painel — só agregados.
- Novo drawer: `NegociosParadosDrawer` (encapsula tabela hoje inline).
- Gráfico "Motivos de perda": trocar pizza por barras horizontais.

### Aba Produto
- Insights: queda de faturamento por marca · concentração (marca líder %) · multimarcas com 1 marca só · marcas sem giro por N reps.
- KPIs e gráficos: mantidos (heatmap Marca×Nicho, Cross-sell, concentração, top/bottom).

O painel **não** tem mais: botões de aprovação, cards de rep individuais, tabelas operacionais soltas.

---

## Parte 4 — Representantes (absorve Time & Metas + Planos)

Editar `src/pages/vendedor/RepresentantesPage.tsx` — organizar em abas:

```text
Tabs: Visão geral | Metas | Planos
```

- **Visão geral**: tabela por desvio (pace · cobertura · em risco · em negociação · positivação, cores vs. alvo), ordenada do pior pace; row-click abre `RepDrawer`. Rankings de atingimento + evolução ficam aqui.
- **Metas**: botão "Gestão de metas" abre `MetasWizardModal` + acompanhamento (rateio, validação, log). Migrado de `TimeMetasTab`.
- **Planos**: `PlanosEmAndamento` (migrado de `DecisoesTab`) — cards com progresso automático, SLA, escalada, histórico por rep.
- Badge no item do menu quando houver plano `escalado` ou rep sem resposta (contagem dos dois somada).

---

## Parte 5 — Consistência

- Fonte única: insights/KPIs/gráficos usam os mesmos helpers já existentes (`cockpit/lib/*`, `saudeCliente`, `carteiraMetodo`).
- Badge de Aprovações = mesma contagem da fila (`aprovacoesPendentes(scope).length`).
- Linguagem: sem aging/churn/win rate/RFV nos insights (usar glossário já corrigido).
- Mobile: Painel com abas em scroll horizontal, insights empilhados no topo; Aprovações em coluna única.

---

## Detalhes técnicos

**Novos arquivos**
- `src/pages/vendedor/GestorAprovacoes.tsx` — tela Aprovações (Fila + Histórico).
- `src/cockpit/lib/insights.ts` — motor de regras (por pilar).
- `src/cockpit/components/InsightsStrip.tsx` — faixa visual.
- `src/cockpit/components/carteira/ClientesRiscoDrawer.tsx` — drawer clientes-chave em risco.
- `src/cockpit/components/atendimento/NegociosParadosDrawer.tsx` — drawer negócios parados.

**Editados**
- `src/App.tsx` — rotas `/gestor/painel`, `/gestor/aprovacoes`, redirects.
- `src/components/vendedor/VendedorSidebar.tsx` — reordem + badge Aprovações.
- `src/cockpit/components/CockpitTopbar.tsx` — desabilita filtro de período em `/gestor/aprovacoes`.
- `src/pages/vendedor/DashboardGerencial.tsx` — remove abas Decisões/Time; monta camadas Insights/KPIs/Gráficos por pilar.
- `src/cockpit/components/carteira/CarteiraTab.tsx`, `.../atendimento/AtendimentoTab.tsx`, `.../produto/ProdutoTab.tsx` — insere `<InsightsStrip>` no topo; tira tabelas operacionais que viraram drawer; troca pizza de "Motivos de perda" por barras horizontais.
- `src/pages/vendedor/RepresentantesPage.tsx` — 3 abas (Visão geral · Metas · Planos), badge.
- `src/cockpit/lib/decisoes.ts` — expor `useAprovacoesPendentes()` + contagem por motivo.
- Remover uso de `DecisoesTab` e `TimeMetasTab` do painel (arquivos permanecem, agora renderizados via Aprovações/Representantes ou aposentados).

**Sem novas dependências.** Zero mudança de dado — só reorganização + motor de insights sobre selectors já existentes.
