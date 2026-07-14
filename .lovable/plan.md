
# Plano — Fases 10 e 11 (Atendimento)

Escopo 100% front-end, mocks + localStorage. Divido em duas fases sequenciais.

## Fase 10 — Perda qualificada + devolução ao marketing + WhatsApp espelhado

### 10.1 Perda qualificada em duas camadas
- Em `mockAtendimentoComercial.ts`: `MOTIVOS_PERDA` vira árvore `{ motivo, subMotivos: string[] }`. Constante editável.
- Card e histórico ganham `perda: { motivo, subMotivo, explicacao, retomarEm? }`.
- Sub-motivos "retomar em Xd" → parseiam e gravam `retomarEm` (ISO date).
- Aplicar em dois pontos com UI unificada:
  - Painel inline do WhatsApp (Fase 9) — `PainelAtendimentoWpp`
  - `MotivoPerdaModal` do Kanban
- Ambos: select motivo → select sub-motivo dinâmico → textarea (mín 15 chars) — todos obrigatórios.
- Página de configuração do gestor (`ConfigMotivosPerda`) passa a editar árvore de dois níveis.

### 10.2 Devolução ao marketing
- Novo estado por card: `marketingStatus: 'ativo' | 'renutricao' | 'arquivado'` + `campanhaRenutricao?: { nome, data }`.
- Página **Leads & Atendimento** do marketing: nova aba **"Perdidos"** com sub-abas:
  - **Análise** — substitui "Perdas por motivo" atual; tabela + gráfico drill-down motivo → sub-motivo; filtros período/vendedor/tag/origem.
  - **Renutrição** — lista + ação "Mover para renutrição" (modal: nome campanha + data); cards com `retomarEm <= hoje` aparecem em "Sugeridos".
  - **Arquivados** — ação "Arquivar"; some da renutrição mas permanece na análise.
- Kanban do vendedor, coluna "Perdido": mostra apenas últimos 7 dias com nota "Gerenciados pelo marketing" + link.
- Reentrada automática (Fase 7): mensagem recebida em card perdido/arquivado → volta pra Fila, `marketingStatus='ativo'`, log "Reaberto — removido da renutrição".

### 10.3 WhatsApp central espelhado
- Nova página **`/marketing/whatsapp-central`** (rota + item no `MarketingLayout`).
- Layout 2 colunas reaproveitando estilo `WhatsAppInbox`: lista à esquerda, chat à direita.
- Read-only: composer substituído por barra com **"Distribuir para vendedor"** (popover busca + rodízio, reaproveitar componente da Fase 9).
- Abas: **Não distribuídas** (padrão) / **Distribuídas** (chip do vendedor + etapa atual do card).
- Mock: enriquecer conversas do inbox central com `mensagens[]` (hoje só tem `ultimaMensagem`).

## Fase 11 — Relatórios

### 11.1 Helpers compartilhados
- Extrair `src/lib/atendimentoAnalytics.ts` com funções puras que consomem cards/histórico do `AtendimentoComercialContext`:
  - `desempenhoPorVendedor(cards, periodo)`
  - `funilConsolidado(cards, filtros)`
  - `perdasDrilldown(cards, filtros)`
  - `slaEvolucao(cards, periodo)`
  - `origemCampanhaReceita(cards)`
  - `funilRenutricao(cards)`
  - `distribuicaoRodizio(cards)`
  - `qualidadeLeadPorOrigem(cards)`
- Painel Leads & Atendimento e Kanban migram para os helpers (mesma fonte).

### 11.2 Gestor — Central de Relatórios
- Em `mockAnalytics.ts`, `relatoriosProntos`: nova categoria **"Atendimento"** com 4 relatórios:
  1. Desempenho por vendedor (tabela + linha de total; destaque vermelho abaixo da média)
  2. Funil de atendimento consolidado (funil + tempos + gargalo + estagnados 2d+)
  3. Perdas detalhadas (drill-down motivo→sub-motivo→cards, gráfico por vendedor)
  4. SLA e tempos de resposta (KPIs + linha diária + tabela vendedor + estouros ativos)
- Renderização no `RelatorioViewer` existente; adicionar formatos que faltarem (drill-down table, funil com gargalo).
- Filtro por perfil: vendedor não vê a categoria "Atendimento" (o perfil atual do vendedor filtra `relatoriosProntos`).

### 11.3 Marketing — nova página `/marketing/relatorios-atendimento`
- Item novo no `MarketingLayout`.
- 4 relatórios em abas usando `KpiCard`, `FunnelChart`, `DonutChart` do módulo:
  1. Origem/campanha → receita (tabela + CPL + ROI mock)
  2. Perdas e renutrição (funil perdidos→renutrição→reabertos→reconvertidos)
  3. Distribuição e rodízio (tempo médio, rodízio vs manual, pausas)
  4. Qualidade do lead por origem (% por etapa + ranking qualidade vs volume)
- Export mock (botão download) em todos.

## Detalhes técnicos

**Arquivos principais a criar/editar**

- `src/data/mockAtendimentoComercial.ts` — árvore `MOTIVOS_PERDA`, campos `perda`, `marketingStatus`, `campanhaRenutricao`, mensagens do inbox central
- `src/contexts/AtendimentoComercialContext.tsx` — ações `registrarPerda`, `moverParaRenutricao`, `arquivarCard`, `reabrirCard`; reentrada automática já existente ganha limpeza de marketing
- `src/components/atendimentoComercial/PainelAtendimentoWpp.tsx` — form de perda qualificada
- `src/components/atendimentoComercial/MotivoPerdaModal.tsx` — mesmo form (extrair `PerdaQualificadaForm` reutilizável)
- `src/pages/gestor/ConfigMotivosPerda.tsx` — editor de dois níveis
- `src/pages/marketing/LeadsAtendimento.tsx` — nova aba "Perdidos" com sub-abas Análise/Renutrição/Arquivados
- `src/pages/marketing/WhatsAppCentral.tsx` — novo (layout 2 col read-only + distribuir)
- `src/layouts/MarketingLayout.tsx` — itens "WhatsApp Central" e "Relatórios"
- `src/pages/marketing/RelatoriosAtendimento.tsx` — novo (4 relatórios em abas)
- `src/lib/atendimentoAnalytics.ts` — helpers puros
- `src/data/mockAnalytics.ts` — categoria "Atendimento" nos `relatoriosProntos`
- `src/pages/vendedor/RelatorioViewer.tsx` — suporte a drill-down/funil-com-gargalo se faltar
- `src/pages/vendedor/RelatoriosCentral.tsx` — filtro por perfil (vendedor não vê "Atendimento")

**Persistência**

- Novos campos entram na versão de localStorage; bumpar chave (`cards_v4`) e manter merge com seed.

**Ordem de execução**

1. Modelagem: tipos + mocks + helpers analytics
2. Fase 10.1 perda qualificada (form + config gestor)
3. Fase 10.2 devolução marketing (aba Perdidos + reentrada)
4. Fase 10.3 WhatsApp Central
5. Fase 11.1 helpers migrados no painel existente
6. Fase 11.2 relatórios gestor
7. Fase 11.3 relatórios marketing

Cada passo valida via `tsgo` + inspeção de rota chave. Sem mudanças em backend/business logic fora do escopo do prompt.
