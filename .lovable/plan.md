
# Marketing → Motor Comercial Bidirecional (v2)

Objetivo: introduzir **Lead Score** como espinha dorsal entre todas as telas, separar **receita estimada vs receita CRM real**, e renomear Handoff em **Central de Vendas** com fila inteligente, sugestões automáticas e notificações em tempo real.

## 1. Fundação de dados

**`src/marketing/data/leadScoring.ts`** (novo)
- Tipos: `SinalLead` (`tipo`, `pts`, `data`, `meta?`), `LeadScore` (`leadId`, `score`, `tendencia: "subindo"|"estavel"|"caindo"`, `sinais[]`, `breakdown`, `ultimoSinal: {label, dataRelativa}`, `sugestaoAbordagem: string`).
- Pontos: email aberto +5, email click +10, lookbook view +15, click produto +20, click ad Meta +10, 2 visitas semana +15, resposta WhatsApp +25, abriu proposta +30, inativo 7d −10, inativo 15d −20. Cap 0–100.
- `classificar(score)` → `quente ≥70 | morno 40-69 | frio <40`.
- **`gerarSugestaoAbordagem(lead, sinais, lookbooksVistos)`** com regras determinísticas (ordem de prioridade):
  1. Visitou lookbook nas últimas 48h → `"Mencione "${nomeLookbook}" — lojista visualizou ${n} vezes"`.
  2. Abriu email sem clicar → `"Reforce o assunto "${assuntoEmail}" com abordagem direta"`.
  3. Tendência subindo + sem contato registrado → `"Momento ideal: entre em contato hoje"`.
  4. Tendência caindo + última compra >90 dias → `"Ofereça condição especial de reativação"`.
  5. Fallback → `"Iniciar abordagem comercial padrão"`.

**`mockMarketing.ts`**: gerar `sinais[]` por lead a partir dos touchpoints + interações fictícias com lookbooks/jornadas; `score`, `tendencia`, `ultimoSinalLabel` ("Abriu email há 2h"); novo campo `receitaCrmConfirmada` (≈70% da `receita` em ganhos).

**`mockMeta.ts`**: derivar `leadsQuentes` e `receitaCrmConfirmada` por campanha.

**`mockLookbooks.ts`**: `lojistasIdentificados[]` (leadIds, 30-40% dos leads das campanhas vinculadas), `oportunidadesAbertas`.

**`mockAudiencias.ts`**: `scoreMedio`, novo tipo `score_based` (faixa quente/morno/frio), flag `bidirecional`.

## 2. Context (`MarketingDataContext.tsx`)

- `leadScores` (Map por leadId, `useMemo`).
- Derivados: `leadsQuentes`, `leadsAquecendo` (2+ sinais nos últimos 3d), `leadsEmRiscoEsfriar` (qualificados sem atividade ≥7d).
- `registrarPedidoCrm(leadId, valor, data, obs)` → atualiza `receitaCrmConfirmada` no lead e propaga para campanha; persiste em `localStorage`.
- `marcarLeadVisualizado(leadId)` → remove badge da sidebar.
- 3 audiências score-based seedadas.

## 3. Notificações em tempo real (novo)

**`src/marketing/contexts/MarketingNotificationsContext.tsx`** (novo)
- Estado: `filaNaoVisualizada: Set<leadId>` persistido.
- Detecção: ao montar, simular leads que "acabaram de atingir score ≥70" (3 leads aleatórios da fila, com setTimeout escalonado de 5s/15s/30s) → dispara `toast` sonner: `🔥 ${nome} acabou de atingir score quente` com action `"Ver lead →"` que navega para Central de Vendas + abre o sheet do lead.
- Provider envolve `MarketingLayout`.
- Hook `useFilaNaoVisualizada()` retorna o count para badge.

**`MarketingLayout.tsx`**: item "Central de Vendas" exibe badge numérico vermelho (`bg-rose-500 text-white text-[10px]`) com `filaNaoVisualizada.size`. Ao abrir sheet de um lead → `marcarLeadVisualizado(leadId)` zera-o desse lead.

## 4. Telas

### Dashboard
- **Faixa "Temperatura comercial agora"** (acima dos KPIs): 3 cards (Quentes 🔥 / Aquecendo ✨ / Em risco ❄️) com número grande, mini-trend, botão "Ver fila" → `/marketing/central-vendas?filtro=quente`.
- KPI "Receita atribuída" → 2 KPIs: "Estimada" (cinza) + "Confirmada CRM" (verde, badge "Real").
- Funil: estágio final "Pedidos fechados CRM" com R$ confirmado e taxa desde 1º clique.

### Meta Ads Hub
- Badge ao lado dos 4 KPIs: `"X leads desta conta estão quentes agora"` → link Central de Vendas.
- Tabela: colunas "Leads quentes" (badge laranja) e "Receita CRM" (verde + %vs estimada).

### Atribuição
- Toggle "Estimada / Real" controlando os números.
- Tabela "Jornada dos leads": coluna "Score atual" (badge verde/amarelo/cinza); leads ganhos exibem valor do pedido.

### Campanhas próprias
- Coluna "Conversões CRM".
- Card expandido: "Leads → Oportunidade CRM" com nº e %.
- **Alerta automático** quando CTR ≥ 2% e 0 conversões CRM em 7d, texto exato: 
  `"Esta campanha tem CTR de ${ctr}% mas nenhum lead converteu no CRM em 7 dias. Possíveis causas: público amplo demais, página de destino desalinhada com o anúncio, ou leads não qualificados chegando ao vendedor sem contexto."`

### Jornadas
- Novo gatilho "Mudança de estágio CRM" com 4 sub-opções (Qualificado / Sem movimento X dias / Pedido fechado / Perdido).
- Card: "Conv. jornada" + "Conv. CRM".

### Lookbooks
- Cards: "Lojistas identificados" e "Oportunidades abertas".
- Click → `LookbookViewersSheet` (lista por score, botão "Notificar vendedor" para ≥70 com `toast.success`).

### Audiências
- Coluna "Score médio".
- Botão "Criar audiências por score" → cria as 3 (Quentes/Mornos/Frios) com sync Meta correspondente.
- Badge "Sync bidirecional ativo".

### Central de Vendas (`CentralVendasPage.tsx`, substitui `HandoffPage.tsx`)
Rota `/marketing/central-vendas` (alias `/marketing/handoff`). Item da sidebar renomeado, ícone `Flame`.

- **Topo**: 4 KPIs (Fila agora / Abordados hoje / Convertidos semana / Receita CRM).
- **Filtros (chips)**: score, canal, jornada, vendedor.
- **Fila** (`LeadFilaCard`): nome + canal, barra de score colorida, último sinal, sugestão automática, botões WhatsApp / E-mail / Marcar contatado / Mover pipeline.
- **Estado vazio**: ilustração (ícone `Flame` cinza grande) + 
  `"Nenhum lead quente no momento. Os próximos leads serão notificados conforme atingirem score ≥ 70."` + botão `"Ver leads mornos"` (aplica filtro morno).
- **`LeadDetailSheet`** ao clicar em um card:
  - Timeline cronológica de sinais (ícone por tipo + data relativa).
  - Breakdown do score (lista de sinais com pts).
  - Histórico de contatos do vendedor.
  - **Form "Registrar resultado"**:
    - Select `Status da abordagem`: Contatado / Sem resposta / Qualificado / Perdido / Pedido fechado.
    - Se "Pedido fechado": inputs `valor R$`, `data`, `textarea observação`.
    - Botão `Confirmar` → chama `registrarPedidoCrm(leadId, valor, data, obs)` + `toast.success("Pedido vinculado a ${campanhaOrigem}")` + fecha sheet.

## 5. Roteamento e navegação
- `App.tsx`: nova rota `/marketing/central-vendas`, alias redireciona `/marketing/handoff`.
- `MarketingLayout.tsx`: rename item + badge de notificações.

## 6. Detalhes técnicos
- Cores: quente `text-orange-600 bg-orange-500/10`, morno `text-amber-600 bg-amber-500/10`, frio `text-slate-500 bg-slate-500/10`.
- Persistência: pedidos CRM em `nextil_mkt_state_v1_crm_orders`; fila visualizada em `nextil_mkt_state_v1_fila_visualizada`.
- Coerência: `receitaCrmConfirmada` total ≈ 70% da estimada; quentes 8-12% do total; lookbooks com 30-40% dos leads das campanhas vinculadas.
- Reaproveita `KpiCard`, `Badge`, `Sheet`, sonner `toast`, tokens existentes.

## Arquivos novos
- `src/marketing/data/leadScoring.ts`
- `src/marketing/contexts/MarketingNotificationsContext.tsx`
- `src/marketing/components/ScoreBadge.tsx`
- `src/marketing/components/LeadFilaCard.tsx`
- `src/marketing/components/LeadDetailSheet.tsx`
- `src/marketing/components/LookbookViewersSheet.tsx`
- `src/marketing/pages/CentralVendasPage.tsx`

## Arquivos editados
- `mockMarketing.ts`, `mockMeta.ts`, `mockLookbooks.ts`, `mockAudiencias.ts`
- `MarketingDataContext.tsx`, `MarketingLayout.tsx`, `App.tsx`
- `MarketingDashboard.tsx`, `MetaAdsHub.tsx`, `AtribuicaoPage.tsx`, `CampanhasPage.tsx`, `JornadasPage.tsx`, `JornadaEditorPage.tsx`, `LookbooksPage.tsx`, `AudienciasPage.tsx`
