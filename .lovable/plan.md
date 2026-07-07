# Painel Comercial · Gestor — Posto de Comando (v2)

Redesenho de `src/pages/vendedor/DashboardGerencial.tsx` em 5 abas orientadas a decisão, com escopo hierárquico (Nacional/Regional) e MARCA como dimensão principal. A tela Insights é **fundida** em "Decisões" para eliminar duas verdades.

## Arquitetura

```text
┌─ CockpitTopbar (estendido) ─────────────────────────────────┐
│ Escopo: [Nacional ▾]  Período: [30d ▾ Comparar]             │
│ (Regional: escopo travado na região do usuário)             │
├─────────────────────────────────────────────────────────────┤
│ Tabs: Decisões · Time & Metas · Carteira · Atendimento · Produto │
└─────────────────────────────────────────────────────────────┘
```

- Escopo é global: filtra reps (por região) e propaga em todos os KPIs.
- Período some apenas em **Decisões** (fila = agora).
- `useVendedorPerfil` ganha `regiao?: string`. Gestor regional entra travado.

## Aba 1 — Decisões (padrão)

Fila do gestor em 4 blocos. Cada card: motivo explícito + valor em jogo + ação de 1 clique.

### a) Aprovações pendentes — fluxo comercial completo

Tudo que **NÃO é fast-track** entra na fila, categorizado por `motivo`:

| Motivo | Condição | Ações |
|---|---|---|
| `fora_da_politica` | `desconto > politica.maxDesconto` ∨ `qtd < minimo` | Aprovar · Reprovar · Devolver com ajuste |
| `credito_cliente_novo` | cliente sem histórico OU status ≠ ativo (janela 2d da política) | Aprovar crédito · Reprovar · Solicitar docs |
| `aguardando_estoque` | itens sem cobertura de estoque | **Notificar quando disponível** · Ver alternativas · Cancelar |

Fast-track (dentro da política + cliente ativo + estoque OK) passa direto e **não aparece** aqui.

**Auditoria (`aprovacoesLog[]`):** toda decisão grava `{ orcamentoId, motivo, decisao, gestorId, timestamp, nota }` — mesmo padrão do `metasLog`. Persistido no `CockpitContext` + localStorage.

**Devolver com ajuste fecha o loop:** além de mudar o status do orçamento, cria uma Ação no `TarefasContext` com `origem:"sistema"`, `clienteId` e nota do gestor ("Gestor devolveu: reduzir desconto para 30% ou atingir mínimo"). A ação aparece imediatamente na fila do rep.

### b) Time fora do ritmo
Reps com `pace<80%` ∨ cobertura em queda (Δ ≤ -10pp) ∨ sem acesso >7d. Motivo textual + [WhatsApp] [Ver carteira].

### c) Clientes-chave em risco
Clientes classe A com saúde `risco` ∨ `perdido_iminente`. Mostra rep responsável. [Cobrar plano do rep] cria Ação `origem:"sistema"` para o rep com contexto do cliente.

### d) Negócios grandes parados
Oportunidades/orçamentos com `valor > R$ 20k` e sem movimento há >7d. Link para negociação.

**Anti-ruído:** se ≥60% dos reps disparam o mesmo alerta, colapsa em 1 insight estrutural ("carteira inativa média do time em 31%") em vez de N cards iguais.

**Redirect:** `/vendedor/insights` → `/vendedor/dashboard-gerencial?tab=decisoes`.

## Aba 2 — Time & Metas

### Tabela de reps orientada a desvio (com regra corrigida)

Colunas: Pace % · Cobertura · Em risco · Pipeline · Positivação.

**Regra de coloração (`desvio.ts` recebe `target?`):**
- **Se há alvo definido** (pace vs 100%, cobertura vs meta) → cor vs. alvo. Um time inteiro bom fica todo verde; um time inteiro ruim, todo vermelho — a verdade aparece.
- **Se não há alvo** (pipeline em R$) → cai para desvio vs. média (fallback).

Ordenação padrão: pior pace primeiro. Row-click abre `RepDrawer` com o mini-painel do MÉTODO do rep (fila, giro, funil, metas) usando os **mesmos helpers** do `VendedorDashboard` (fonte única). Ações: WhatsApp · Criar tarefa · Redistribuir.

### Gestão de Metas — `MetasWizardModal`

1. Meta agregada da marca/região no mês (R$).
2. Rateio sugerido por rep (proporcional a `historico_12m + carteira_total`) — editável linha a linha, com histórico de atingimento ao lado.
3. **Validação de soma em tempo real:** rodapé mostra `"Rateado R$ 148k de R$ 160k — faltam R$ 12k"` (ou "sobram"). Botão Publicar bloqueado quando `soma ≠ meta`, ou pede confirmação explícita ("Publicar com soma R$ 12k abaixo da meta agregada?").
4. Metas secundárias por rep: positivação, cobertura, novos, reativação.
5. Alterar em mês corrente → confirmação + entrada em `metasLog[]`.
6. **Publicar notifica os reps:** a nova meta aparece no painel do vendedor no mesmo instante (fonte única via context compartilhado).
7. **Escopo regional:** wizard lista apenas reps da região do gestor (aplicado em `escopo.ts::repsNoEscopo`).

### Rankings
Ranking por atingimento (mantido) + ranking de evolução (Δ mês vs mês anterior). Cada linha tem ação.

## Aba 3 — Carteira (enxugada)

**Mantém:** SaudeCarteiraBar, AgingBars, RfvHeatmap, AbcCurve, Waterfall movimento, Funil retenção.
**Remove:** StatusDonut, KPIs com "0,0%", gráficos vazios (empty state honesto).
**Adiciona:** todo gráfico clicável → `ListaClientesDrawer` com filtro aplicado + coluna Representante.

## Aba 4 — Atendimento

- KPIs: cobertura por rep, atendimentos, conversão lead→cliente, ciclo de vendas, win rate por rep, motivos de perda (agregado dos `motivoPerda` estruturados).
- **Tickets integrados** (`mockAtendimento`): contadores por setor (SAC · Cobrança · Financeiro · Logística) com aging, destacando urgentes/estourados. Link para o kanban.

## Aba 5 — Produto (por MARCA)

**Mantém:** faturamento/penetração de marca, marca×nicho (heatmap), ABC produtos, top/bottom, marcas sem giro por rep, recompra por coleção, ticket por categoria.

**Adiciona:**

- **`CampanhaPushModal` com idempotência.** Gera Ações `origem:"sistema"` na fila dos reps envolvidos, seguindo a **mesma regra das sugeridas do sistema**: chave `clienteId + motivo` (ex: `push_marca_malwee`), dispensáveis, entram no bloco SUGERIDO do rep. Rodar duas campanhas iguais **não duplica** a fila — a segunda faz upsert (atualiza texto se mudou, ignora se idêntica).
- **Cross-sell drill-down.** Clientes com só 1 marca → lista de marcas candidatas (cabem no nicho). Cada linha vira [Criar oportunidade] que **pré-preenche o briefing estruturado** (mesmo modelo de `NovaOportunidadeModal`): `demanda`, `marca`, `nichoCliente`, `clienteId`, `origem:"cross_sell"`. Nunca abre vazio.

## Padrões transversais

- **Fonte única:** KPIs de rep vêm dos mesmos helpers (`carteiraMetodo`, `saudeCliente`, `acoes`) usados no painel do vendedor. Números batem entre telas.
- **Formatação:** `fmtBRLc` → `R$ 9,1M`. Variação 0% oculta.
- **Tooltip de cálculo** em todo KPI (`KpiCard` ganha `tooltip`).
- **Mock com desvio realista:** `seed.representantes` com pace variado (112%, 94%, 76%, 58%, 41%), nunca idênticos.
- **Mobile:** Decisões como tela principal (cards empilhados, ações grandes); demais abas empilhadas com scroll horizontal em tabelas.

## Detalhes técnicos

**Arquivos novos:**
- `src/cockpit/components/EscopoSelector.tsx`
- `src/cockpit/components/decisoes/AprovacoesBlock.tsx` (com switch por `motivo`), `TimeForaRitmoBlock.tsx`, `ClientesChaveRiscoBlock.tsx`, `NegociosParadosBlock.tsx`, `DecisaoCard.tsx`
- `src/cockpit/components/time/RepTableDesvio.tsx`, `RepDrawer.tsx`, `MetasWizardModal.tsx` (com validação de soma), `RankingEvolucao.tsx`
- `src/cockpit/components/carteira/ListaClientesDrawer.tsx`
- `src/cockpit/components/produto/CampanhaPushModal.tsx`, `CrossSellDrillDown.tsx`
- `src/cockpit/lib/decisoes.ts` — `filaAprovacoes` (categoriza por motivo), `repsForaRitmo`, `clientesChaveRisco`, `negociosParados`, `agregarAlertas`, `registrarAprovacao` (log)
- `src/cockpit/lib/desvio.ts` — assinatura `corDesvio(valor, { target?, media })`: usa target quando presente, cai para média senão
- `src/cockpit/lib/escopo.ts` — `repsNoEscopo(seed, perfil, escopo)`; aplicado inclusive no MetasWizard

**Arquivos editados:**
- `src/pages/vendedor/DashboardGerencial.tsx` — reescrita em 5 abas
- `src/cockpit/contexts/CockpitContext.tsx` — adiciona `escopo`, `aprovacoesLog`, `metasLog`, `registrarAprovacao`, `publicarMetas` (com notificação/fonte única)
- `src/cockpit/components/CockpitTopbar.tsx` — plugar `EscopoSelector`, ocultar período em Decisões
- `src/cockpit/data/seed.ts` — reps com desvio realista + campo `regiao`; mock de orçamentos cobrindo os 3 motivos (política/crédito/estoque)
- `src/components/vendedor/VendedorSidebar.tsx` — remove item Insights (ou aponta pra aba)
- `src/App.tsx` — redirect `/vendedor/insights`
- `src/hooks/useVendedorPerfil.ts` — adiciona `regiao?: string`
- `src/components/vendedor/NovaOportunidadeModal.tsx` — aceita `briefingInicial` para pré-preenchimento (cross-sell)

**Sem novas dependências.**

## Fora de escopo

- Backend/persistência real (segue mock + localStorage).
- `VendedorDashboard` — só garantimos compartilhamento de helpers.
- Módulos Marketing e Inteligência.
