# Módulo de Marketing — Plano completo (protótipo navegável)

Tudo segue o padrão atual do projeto: protótipo navegável, sem backend real, dados mockados em `useState` + Context API + `localStorage`. Mesma estética do Modo Vendedor (sidebar dark navy, Poppins, mobile-first).

**Pilar central: Meta Ads + ROI end-to-end.** Toda a arquitetura do módulo é desenhada em torno de capturar a origem do lead (UTM/Pixel/Click ID) e amarrar até o ganho na oportunidade do CRM, fechando o ciclo "anúncio → lead → oportunidade → receita". As demais ferramentas (Mailchimp, WhatsApp Cloud, GA4) orbitam esse núcleo.

## Visão geral do módulo

```text
/marketing
├── /dashboard          ← visão executiva (KPIs, ROAS, funil end-to-end)
├── /meta-ads           ← HUB DEDICADO Meta Ads (contas, campanhas, conjuntos, anúncios, criativos)
├── /atribuicao         ← jornada do cliente, modelos de atribuição, ROI por touchpoint
├── /campanhas          ← campanhas próprias (WhatsApp / E-mail) — disparo
│   └── /:id
├── /jornadas           ← fluxos automatizados (canvas visual)
│   └── /:id
├── /lookbooks          ← catálogos digitais enviáveis + tracking
│   └── /:id
├── /publico/lookbook/:slug   ← visualização pública rastreada
├── /audiencias         ← segmentações + sync Meta Custom/Lookalike
├── /integracoes        ← Meta Ads (destaque), Mailchimp, WhatsApp, GA4, Google Ads
└── /configuracoes      ← time, UTMs padrão, Pixel/Conversion API, regras de atribuição
```

Novo perfil **"Marketing"** na sidebar geral. Vê o CRM em modo leitura, escreve em tudo do `/marketing/*`.

---

## Etapa 1 — Fundação + Dashboard + HUB Meta Ads (núcleo do ROI)

Esta etapa entrega o coração analítico: dashboard executivo + área dedicada Meta Ads com ROI real fechado contra oportunidades do CRM.

### Estrutura base
- `src/marketing/` espelhando `src/start/`: contexts, components, pages, data, styles, tokens
- `MarketingLayout` reusando padrão dark navy do Vendedor
- `MarketingDataContext` persistido em `localStorage` (`nextil_mkt_*`)
- Rota `/marketing/*` no `App.tsx`, item "Marketing" na sidebar geral

### Dashboard `/marketing/dashboard`
Filtros: período (7d/30d/90d/custom), conta de anúncio, canal, campanha.

- **Topo — 8 KPIs**: Investimento total, Receita atribuída, **ROAS**, **CPL**, Leads gerados, Oportunidades criadas, Taxa lead→ganho, Ticket médio originado por marketing
- **Funil end-to-end** (cruza Meta Ads + CRM): Impressões → Cliques → Leads → Oportunidades → Orçamentos → Ganhos. Cada etapa com volume, % de conversão e valor monetário.
- **ROAS por campanha Meta** (tabela ordenável): campanha, gasto, impressões, CPC, leads, CPL, oportunidades, receita ganha, **ROAS**, status (ativa/pausada)
- **Origem dos leads** (donut + tabela): Meta Ads (quebrado por campanha), Google, Orgânico, WhatsApp, E-mail, Indicação, Direto
- **Tendências** (Sparkline reusado): 6 meses de investimento, leads, receita e ROAS sobrepostos
- **Heatmap**: melhores dias/horários de conversão
- **Alertas inteligentes**: campanha com ROAS abaixo da meta, CPL subindo, audiência saturando (mockados)

### HUB Meta Ads `/marketing/meta-ads` — área dedicada
Estrutura espelhando o Ads Manager para familiaridade:

**Topo**: seletor de conta de anúncio, seletor de período, KPIs resumidos (gasto, ROAS, leads, CPL).

**3 abas hierárquicas** (padrão Meta):
1. **Campanhas**: lista com objetivo, gasto, alcance, leads, **receita atribuída**, **ROAS**, status. Botão "Pausar/Ativar" (mockado). Drill-down → conjuntos.
2. **Conjuntos de anúncios**: audiência, posicionamentos, orçamento, performance + ROAS por conjunto.
3. **Anúncios**: criativos (thumbnail), CTR, CPL, leads, ROAS por anúncio. Identifica criativo vencedor.

**Detalhe de campanha Meta `/marketing/meta-ads/:campaignId`**
- Cabeçalho com KPIs + investimento total
- Gráfico evolução diária (gasto vs receita atribuída vs leads)
- **Lista de leads originados** com link para Cliente 360 e status atual no funil CRM
- **Receita fechada** quebrada por oportunidade (qual orçamento ganhou, qual cliente)
- **Criativos**: cards com preview de imagem/vídeo, métricas individuais, botão "duplicar com variação"
- Botão "Sincronizar agora" (mock — atualiza timestamps)

### Integração Meta Ads (tela de conexão simulada na Etapa 1)
- `/marketing/integracoes` com card Meta Ads em destaque
- Modal de conexão simulando OAuth Meta Business: seleciona Business Manager → conta(s) de anúncio → Pixel → Conversion API
- Após "conectar": status verde, conta vinculada, último sync, lista de Pixels disponíveis
- Configuração de **Conversion API**: snippet de eventos a enviar (Lead, Opportunity, Purchase) — campos visíveis para futura ativação real
- Configuração de **mapeamento UTM ↔ campanha Meta** para atribuição precisa

### Atribuição básica `/marketing/atribuicao`
- Seletor de modelo: First-touch, Last-touch, Linear, Time-decay, Data-driven (mock)
- Tabela "Jornada do lead": cliente → primeiro toque (campanha Meta X) → toques intermediários → conversão → valor → ROAS individual
- Drill-down por canal mostra quais campanhas Meta geraram qual receita
- Toggle "Ver jornada completa" abre timeline visual

### Mock data (`src/marketing/data/mockMeta.ts` + `mockMarketing.ts`)
- 3 contas de anúncio Meta, 12 campanhas (com objetivos: Leads, Conversões, Tráfego, Reconhecimento)
- 30 conjuntos, 80+ anúncios com criativos (imagens fashion já existentes)
- 200+ leads atribuídos com `utm_source/medium/campaign/content`, `fbclid`, `touchpoints[]`
- **Vinculação cruzada com `mockCRM`**: mesmos clientIds e oportunidadesIds — o ROAS é calculado a partir das oportunidades ganhas reais do mock CRM
- Métricas realistas (CPL R$ 15-80, ROAS 1.5x-8x, mix de campanhas boas e ruins para testar alertas)

**Entregável Etapa 1**: dashboard + hub Meta Ads + atribuição básica navegáveis, com ROI fechado lead→ganho usando dados do CRM existente.

---

## Etapa 2 — Campanhas próprias (WhatsApp Cloud + Mailchimp) + Integrações

Disparo ativo pelo time de marketing, complementando o tráfego pago.

### Lista `/marketing/campanhas`
Abas: Rascunho / Agendada / Enviando / Concluída / Pausada. Cards com canal, audiência, KPIs (abertura, resposta, leads, receita, ROI).

### Wizard de criação (4 passos)
1. **Tipo + canal**: WhatsApp (Cloud API), E-mail (Mailchimp), Multicanal
2. **Audiência**: segmentação existente OU builder de filtros (temperatura, tags, última compra, ticket, cidade). Preview "X clientes impactados"
3. **Conteúdo**:
   - WhatsApp: template aprovado (estrutura Cloud API: header/body/footer/botões), variáveis `{{1}}`, preview de bolha
   - E-mail: assunto, pré-header, editor em blocos (texto/imagem/produto/lookbook/CTA), preview desktop/mobile
   - Multicanal: lógica "se não responder em N dias → e-mail"
4. **Agendamento + revisão**: enviar agora, agendar, ou via gatilho de jornada. Estimativa de custo. Aprovação se base > 1000.

### Detalhe `/marketing/campanhas/:id`
- KPIs em tempo real (mock)
- Funil: Enviado → Entregue → Lido → Respondido → Clicou → Oportunidade → Ganho
- Evolução por hora nas primeiras 48h
- Lista de destinatários com status individual + link Cliente 360
- Heatmap de horários
- Ações: Pausar, Duplicar, Exportar CSV, Criar variação A/B

### A/B Testing
Dividir audiência em 2-4 variações, winner automático por taxa de resposta/conversão.

### Integrações (telas completas, sem backend real ainda)
Cards em `/marketing/integracoes`: **Meta Ads** (já feita Etapa 1), **WhatsApp Cloud API**, **Mailchimp**, **Google Analytics 4**, **Google Ads**.

Cada uma: modal de conexão simulando OAuth, status, conta vinculada, último sync, mapping de campos, botão Reconectar/Desconectar.

---

## Etapa 3 — Jornadas automatizadas + Lookbooks

### Jornadas `/marketing/jornadas`
Lista com cards: nome, gatilho, # contatos ativos, taxa conversão, status.

**Editor visual `/marketing/jornadas/:id`** — canvas drag-and-drop (divs absolutas + linhas SVG):
- **Gatilhos**: novo lead, lead com tag X, sem comprar há N dias, aniversário, abandonou carrinho, **clicou em anúncio Meta Y**, **converteu em campanha Meta Z**, mudou etapa do funil, formulário preenchido
- **Ações**: WhatsApp, e-mail, enviar lookbook, criar tarefa para vendedor, mover etapa kanban, adicionar tag, **adicionar a Custom Audience Meta**, notificar
- **Esperas**: X dias/horas, até dia/hora, até evento (resposta/clique/abertura)
- **Condições**: respondeu? clicou? VIP? tem tag X? abriu lookbook?
- **Saída**: sair / mover para outra jornada
- Painel lateral configura nó. Modo "simular" passa cliente fake. Stats por nó.

**Templates pré-prontos**:
- Reativação cliente inativo (60+ dias)
- Boas-vindas novo lead Meta Ads
- Follow-up pós-orçamento sem resposta
- Aniversário com cupom + lookbook personalizado
- Recuperação de lead frio que clicou em anúncio mas não respondeu

### Lookbooks `/marketing/lookbooks`
Lista grid de capas. Editor com:
- Capa: imagem, título, marca, coleção, paleta
- Páginas drag-and-drop: capa, texto, produto único, grid de produtos, inspiração, CTA
- Seleção de produtos reusa catálogo Start/Vendedor
- Preview tela cheia (modo apresentação)
- Configuração: público/protegido por senha, expiração, exige cadastro, link `/publico/lookbook/:slug`, **UTM automático embutido**

### Página pública `/publico/lookbook/:slug` (mobile-first)
- Capa fullscreen, swipe entre páginas
- Tracking: cada abertura, tempo por página, cliques em produto, encaminhamentos
- **Pixel Meta disparado** (mock) para retargeting de quem viu o lookbook
- CTA "Falar com vendedor" (WhatsApp prefilado) e "Pedir orçamento"
- Pedido vira lead atribuído ao lookbook → aparece no dashboard com ROAS próprio

### Métricas de lookbook
Aberturas únicas, taxa de conclusão, página mais vista, produtos mais clicados, leads gerados, orçamentos, receita, **ROI** (custo de produção mockado vs receita atribuída).

---

## Etapa 4 — Atribuição avançada + Audiências + Polish

### Audiências `/marketing/audiencias`
- Listagem (estende `SegmentacoesPage`)
- Builder visual com filtros AND/OR aninhados
- Dinâmicas (atualizam) vs estáticas (snapshot)
- **Sync Meta Custom Audiences** (botão "Sincronizar agora", status, tamanho na Meta)
- **Lookalike Meta**: criar 1%/3%/5%/10% baseada em audiência semente
- Sync Mailchimp Audiences

### Atribuição avançada
- **Pixel/Conversion API**: snippet copiável + checklist de eventos (PageView, Lead, ViewContent, AddToCart, Purchase)
- UTMs padrão por campanha + validador
- Tela "Jornada de um cliente": busca por cliente → timeline cronológica de TODOS os toques (ad clicado, e-mail aberto, WhatsApp respondido, lookbook visto, oportunidade, ganho)
- **Comparador de modelos** lado a lado: mostra como ROAS muda entre First/Last/Linear/Time-decay para a mesma campanha — ajuda decidir o modelo padrão
- Relatório de **incrementalidade** (mock): comparação grupo controle vs exposto

### Configurações `/marketing/configuracoes`
- Time de marketing (admin/editor/viewer)
- UTMs padrão da empresa
- Domínio personalizado para lookbooks (`lookbook.suamarca.com`)
- Regras globais de atribuição (janela de conversão pós-clique e pós-impressão)
- Webhooks (mock)
- Limite mensal de envios + alertas

### Polish
- Estados vazios ilustrados, skeletons, toasts, 404 do módulo
- Onboarding de marketing (4 passos): conectar Meta → WhatsApp → Mailchimp → primeira campanha
- Tour guiado opcional no dashboard
- Mobile-first em tudo

---

## Detalhes técnicos

### Convenções
- Pasta isolada `src/marketing/` (não toca Vendedor nem Start)
- Tokens próprios reusando paleta dark navy
- LocalStorage namespaces: `nextil_mkt_meta`, `nextil_mkt_campanhas`, `nextil_mkt_jornadas`, `nextil_mkt_lookbooks`, `nextil_mkt_leads`, `nextil_mkt_eventos`, `nextil_mkt_audiencias`, `nextil_mkt_integracoes`
- Tipos TS fortes: `MetaAccount`, `MetaCampaign`, `MetaAdSet`, `MetaAd`, `Campanha`, `Jornada`, `NoJornada`, `Lookbook`, `LeadAtribuido`, `Touchpoint`, `Audiencia`, `Integracao`

### Reaproveitamento
- `Sparkline.tsx` para tendências
- `MessageTemplatesContext` para templates
- `SegmentacoesPage` como base do builder de audiências
- **Cliente 360 ganha aba "Marketing"**: campanhas recebidas, jornadas ativas, lookbooks vistos, anúncios Meta clicados, score de engajamento, custo de aquisição individual
- **Kanban de oportunidades**: badge "origem marketing" + tooltip com campanha Meta + custo
- **Detalhe de oportunidade**: card "Atribuição" com investimento de marketing × valor da oportunidade

### Caminho para integração real (após protótipo aprovado)
- **Meta Ads**: Lovable Cloud + edge function chamando Meta Marketing API + Conversion API. Não há connector nativo hoje, faremos via API + secret manual quando o usuário quiser ativar. Pixel via snippet em `<head>`.
- **WhatsApp Cloud API**: via Twilio connector (já disponível) ou direto Meta Business
- **Mailchimp**: API key manual + edge function
- **GA4**: Measurement Protocol via edge function

Toda configuração de integração no protótipo já contempla os campos reais necessários (Pixel ID, Access Token, Account ID, etc.) para facilitar a transição.

---

## O que NÃO entra (conforme decidido)
- Landing pages
- Calendário editorial / planejamento social
- MVP enxuto

---

## Sequência de entrega

1. **Etapa 1**: Fundação + Dashboard executivo + **Hub Meta Ads completo** + Atribuição básica + Conexão Meta simulada
2. **Etapa 2**: Campanhas próprias (WhatsApp/E-mail) + A/B + demais integrações (Mailchimp, WhatsApp, GA4)
3. **Etapa 3**: Jornadas (canvas) com gatilhos Meta + Lookbooks com tracking e Pixel
4. **Etapa 4**: Audiências avançadas + Sync Meta Custom/Lookalike + Atribuição multi-modelo + Polish + Onboarding

Cada etapa termina com preview navegável e confirmação. Posso começar pela Etapa 1?
