# Módulo Atendimento Comercial — Kanban vinculado ao WhatsApp

Novo módulo que rastreia leads e reativações de WhatsApp desde a chegada até virarem oportunidade. Cinco fases, executadas em sequência numa única rodada.

## Fase 1 — Kanban de Atendimento

- Nova rota `/vendedor/atendimento-comercial` com item "Atendimento" no menu Nextil 360 (abaixo de Painel, ícone Inbox).
- Renomear item existente da seção Gestão de "Atendimento" para "Atendimento Setores" (rota `/vendedor/atendimento` mantida).
- Novo mock `src/data/mockAtendimentoComercial.ts` com:
  - Tipos `CardAtendimento`, `ColunaAtendimento`, `TagCard` (lead/reativacao/carteira), `OrigemLead` (meta_ads/instagram/whats_central/manual), `MotivoPerda`.
  - Seed de ~30 cards distribuídos nas 7 colunas, vinculando a conversas de `mockConversas` quando possível.
  - Persistência do funil em `localStorage` (padrão de `mockAtendimento.ts`).
- Board com 7 colunas configuráveis (Leads, Fila, Em Atendimento, Em Cadastro, Em Qualificação, Gerou Oportunidade, Perdido).
- Card: avatar, nome, tag tipo (dot azul/âmbar/verde), origem, última msg, tempo, badge não lidas, valor estimado, badge estagnação.
- Toolbar: busca, filtros (tag/origem/vendedor), botão "+ Lead" (modal simples).
- Topo do board: contadores por coluna + tempo médio por etapa.
- Drag & drop restrito (1 etapa por vez, não pula Cadastro exceto tag Carteira, arrastar para Perdido abre modal de motivo).
- Modal de configuração de colunas (reaproveita padrão do `FunisConfigModal`).
- Drawer ao clicar no card com resumo e botão "Abrir no WhatsApp".

## Fase 2 — Painel lateral no WhatsApp

- Editar `WhatsAppInbox.tsx`: adicionar bloco "Atendimento" no topo do painel direito.
- Stepper compacto com etapa atual do card.
- Bloco de cadastro (nome, CNPJ, cidade/UF, e-mail, Instagram) com botão de ação rápida por campo que envia template no chat.
- Verificação de duplicidade por CNPJ/telefone: se pertencer a outro vendedor, cria conflito na tela de Aprovações e badge "Em conflito" no card.
- Checklist de qualificação (nicho, marcas, volume, frequência, cidade principal, sazonalidade).
- Ao concluir qualificação: confirmação de oportunidade com valor estimado (usa fluxo existente de `NovaOportunidadeModal`).
- Botão "Marcar como perdido" com lista de 11 motivos (Outros exige texto).
- Auto-transições: primeiro campo → Em Cadastro; cadastro completo → Em Qualificação.

## Fase 3 — Painel Marketing + distribuição

- Nova página `src/marketing/pages/LeadsAtendimentoPage.tsx` (rota `/marketing/leads-atendimento`) no menu do marketing.
- KPIs: leads no período, CPL (mock), taxa fila→oportunidade, leads aguardando distribuição.
- Seções:
  - Tabela por origem/campanha (Meta Ads com criativos, Instagram, Manual, Whats central) com volume/CPL/conversão.
  - Funil de conversão por etapa + tabela de perdas por motivo (recharts).
  - Inbox do whats central (conversas não distribuídas) com ações "Distribuir para..." e "Redistribuir".
  - Controle de distribuição: lista de vendedores com switch "Pausar rodízio", leads recebidos e oportunidades abertas.
- Motor de rodízio simples em util `src/marketing/lib/distribuicaoLeads.ts` (round-robin sobre vendedores ativos não pausados; telefone existente vai direto ao vendedor dono).
- Botão "+ Lead" reaproveita o modal da Fase 1.

## Fase 4 — SLAs, notificações e integração com Painel

- Config do gestor em `src/pages/vendedor/AtendimentoConfigPage.tsx` (rota `/vendedor/configuracoes/atendimento`):
  - SLA primeira resposta (default 4h úteis).
  - Dias para alerta de estagnação (default 2d).
  - Gerenciar colunas, motivos de perda e perguntas de qualificação.
  - Persistente em `localStorage`.
- Badges no card:
  - "SLA estourado · Xh" (vermelho) na coluna Fila.
  - "Nd parado" (âmbar até 3d, vermelho a partir de 4d) na coluna Em Atendimento.
- Fila ordenada por FIFO com estourados no topo.
- Novos itens no `FilaAcao` do `VendedorDashboard`:
  - Urgente: SLA estourado, 2d+ parado, conflito de duplicidade (gestor).
  - Sugerido: leads na Fila dentro do SLA sem resposta; qualificação incompleta há 3+ dias.
- Sino no `AppTopbar`: 5 eventos (lead distribuído, SLA estourado, estagnação, conflito resolvido, card reaberto). Clique navega ao WhatsApp ou ao Kanban.

## Fase 5 — Perfil Marketing e permissões

- Adicionar papel "Marketing" ao seletor "Visualizar como" existente (`mockAtendentes` + `useVendedorPerfil`).
- Contexto de perfil disponível globalmente; menu reage:
  - Vendedor: vê seu Kanban + WhatsApp.
  - Gestor: vê tudo + conflitos + configuração.
  - Marketing: vê módulo Marketing + Kanban em leitura + inbox central.
- Ações bloqueadas ficam ocultas (não desabilitadas).
- Matriz aplicada nas 4 telas (Kanban, WhatsApp, Painel Marketing, Configurações).

## Detalhes técnicos

- **Nada de backend**: tudo em memória/`localStorage`, seguindo o padrão dos demais mocks.
- **Estado global**: novo `AtendimentoComercialContext` (`src/contexts/AtendimentoComercialContext.tsx`) fornecendo cards, colunas, configs, ações de mover, marcar perda, gerar oportunidade, distribuir lead, cadastrar, qualificar. Provider no `App.tsx`.
- **Novos arquivos** (principais):
  - `src/data/mockAtendimentoComercial.ts`
  - `src/contexts/AtendimentoComercialContext.tsx`
  - `src/pages/vendedor/AtendimentoComercial.tsx`
  - `src/components/atendimentoComercial/BoardKanban.tsx`
  - `src/components/atendimentoComercial/CardAtendimento.tsx`
  - `src/components/atendimentoComercial/CardDrawer.tsx`
  - `src/components/atendimentoComercial/NovoLeadModal.tsx`
  - `src/components/atendimentoComercial/MotivoPerdaModal.tsx`
  - `src/components/atendimentoComercial/PainelAtendimentoWpp.tsx` (bloco lateral)
  - `src/marketing/pages/LeadsAtendimentoPage.tsx`
  - `src/marketing/lib/distribuicaoLeads.ts`
  - `src/pages/vendedor/AtendimentoConfigPage.tsx`
- **Editados**: `App.tsx` (rotas + provider), `AppSidebar.tsx` (menu + rename), `WhatsAppInbox.tsx` (painel lateral), `AppTopbar.tsx` (sino), `VendedorDashboard.tsx` (fila de ação), `MarketingLayout` (item de menu), `mockAtendimento.ts`/`useVendedorPerfil` (perfil marketing).
- **Sem novas dependências.** Reutiliza `lucide-react`, `recharts`, `dnd-kit` se já instalado (senão, drag & drop nativo HTML5 — plano B).

## Fora de escopo (conforme visão geral)

- Integração real com API do WhatsApp Cloud / Meta Ads.
- Captação real via Instagram DM.
- Templates aprovados de fato (usam mock existente).

Confirma para eu executar as 5 fases numa rodada só?
