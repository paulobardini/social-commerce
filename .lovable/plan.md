# B.I. Apolo — o que já existe, o que falta e como fechar as lacunas

## 1. Onde cada número pedido está hoje

**Já existe (Dashboard Diretoria / Carteira / Atendimento / Produto — `/gestor/painel/*`)**

| Pedido pelo Deyler | Onde está |
|---|---|
| Clientes atendidos / atendimentos por vendedora | Dashboard Atendimento (KPI "Atendimentos", "Cobertura por representante") |
| Quantos leads entraram | Dashboard Atendimento (funil de oportunidades) e Marketing → Dashboard (Leads gerados) |
| Taxa de conversão geral e por vendedora | Atendimento ("Leads que viraram cliente", "Aproveitamento de propostas por representante") |
| Curva ABC | Dashboard Produto (cruzamento Marca × Curva A/B/C) |
| Produto destaque / mais vendidos | Produto (Marca líder, Faturamento por marca, Vendas produto × cliente) |
| Ticket médio (geral e por cliente) | Diretoria e Carteira |
| Clientes ativos / inativos / perdidos, crescimento de carteira | Carteira (Saúde da carteira, Movimentação, Aging) |
| Análise de carteira por marca | Carteira (Positivação por cliente) e Produto |
| Análise de etapa do funil / descartes / motivos de perda | Atendimento (Funil, Motivos de perda) |
| Curva de tempo de atendimento e de decisão | Atendimento (Tempo de 1ª resposta, Tempo médio até fechar, Fila por tempo de espera) |
| Números do SAC e principais reclamações | Atendimento → bloco Tickets (assunto, setor, aging, atendente) |
| Margem, markup, giro, sell-through, produtos parados | Módulo separado **Inteligência de Mercado** (`/inteligencia-mercado`) — hoje desconectado do painel do gestor |
| Verba, ROI/ROAS, inbound | Módulo **Marketing** (`/marketing`) — também desconectado |
| Comparativos período a período | Existe o toggle "Comparar" no topo de cada dashboard |

**Não existe em lugar nenhum (dado nem tela)**

- Devoluções: valores, quantidade e **motivo** da devolução.
- Margem de contribuição do mês com decomposição do que puxou para cima/baixo (a margem existe só por produto na Inteligência de Mercado, não consolidada no período nem por cliente/vendedora).
- Lucro bruto e lucro líquido consolidados.
- Preço médio por peça e **preço médio por quilo** (não há peso no cadastro).
- Condição comercial: % de venda em cartão vs boleto, prazo médio de pagamento.
- Origem do cliente: inbound vs outbound e "por que o cliente escolheu a Apolo".
- Motivos de inativação de cliente (só existe motivo de perda de oportunidade).
- Produtos que não venderam nada no período (lista de encalhe comercial).
- Tempo em cada etapa do funil (existe o funil, não o tempo por etapa).
- Padronização de tags de CRM e uso de mensagens prontas por vendas (existe o dado de templates, falta o relatório).
- Análise de carteira por categoria e por estação.

## 2. O problema estrutural

Hoje há três mundos separados que não conversam: o painel do gestor (`cockpit`), a Inteligência de Mercado (custo/margem/estoque) e o Marketing (verba/ROI). O gestor precisa abrir três lugares para responder uma pergunta. Além disso, a base de pedidos do painel não guarda custo, devolução, forma de pagamento, peso nem canal — por isso metade da lista acima é impossível de calcular sem enriquecer o dado.

## 3. Proposta de execução

**Fase 1 — Enriquecer a base de dados (pré-requisito de tudo)**
Adicionar ao pedido e ao cliente: custo do item (para margem), devolução (valor, peças, motivo), forma de pagamento (cartão/boleto/pix) e prazo, peso em kg, canal de origem (inbound/outbound) e motivo de escolha, e motivo de inativação do cliente. Popular com dados simulados coerentes com o histórico atual.

**Fase 2 — Novo Dashboard Financeiro/Margem** (`/gestor/painel/financeiro`)
Margem de contribuição do mês, lucro bruto e líquido, ponte de margem (o que puxou para cima/baixo: mix de marca, desconto, devolução, frete), margem por marca/cliente/vendedora, preço médio por peça e por quilo, % cartão vs boleto e prazo médio.

**Fase 3 — Devoluções e SAC ampliados**
Bloco de devoluções (valor, % sobre faturamento, ranking de motivos, por marca/cliente/vendedora) dentro do dashboard Financeiro, e ampliação do SAC com "principais reclamações × principais acertos" e motivos de inativação de cliente.

**Fase 4 — Completar Produto e Carteira**
Produto: lista de itens sem venda no período, produtos por rentabilidade (maior/menor) e por velocidade de venda, trazendo a margem da Inteligência de Mercado para dentro do painel. Carteira: segmentação por categoria e por estação, e visão inbound vs outbound.

**Fase 5 — Completar Atendimento**
Tempo médio em cada etapa do funil, análise de descartes por motivo, uso de mensagens prontas por vendedora e auditoria de padronização de tags do CRM.

**Fase 6 — Diretoria como capa do B.I.**
Puxar para a tela de Diretoria os números novos (margem, lucro, devoluções, ROI de verba) e ligar os atalhos para Inteligência de Mercado e Marketing, para que tudo da lista seja acessível de um ponto só.

## 4. Notas técnicas

- Base de dados: estender `src/cockpit/data/seed.ts` (`Pedido`, `Conta`, `Marca`) com custo, devolução, pagamento, peso e canal; criar `seedDevolucoes` e `seedInativacoes`. Bumpar a versão do cache no `CockpitContext`.
- Cálculos novos em `src/cockpit/lib/`: `margem.ts`, `devolucoes.ts`, `condicoesComerciais.ts`, `funilTempo.ts`, `semVenda.ts`.
- Nova rota `/gestor/painel/financeiro` em `App.tsx` + `DashboardGerencial.tsx`, com item no `AppSidebar` sob Dashboard, reaproveitando `ExecTiles`, `SectionCard` e `Waterfall`.
- Consolidação: reaproveitar `mockInteligencia.ts` como fonte de custo/margem por SKU quando o produto do pedido tiver correspondência, evitando duplicar dados.

## 5. Antes de começar

Sugiro executar em ordem de valor: **Fase 1 + 2 + 3** (margem, lucro e devoluções) primeiro, que é o que hoje simplesmente não existe e é o coração do pedido; depois as fases 4 a 6, que são complementos sobre dados que já temos.
