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

- Margem de contribuição do período com decomposição do que puxou para cima/baixo (a margem existe só por produto na Inteligência de Mercado, não consolidada por período, cliente ou vendedora).
- Preço médio por peça e **preço médio por quilo** (não há peso no cadastro).
- Origem do cliente: inbound vs outbound e "por que o cliente escolheu a Apolo".
- Motivos de inativação de cliente (só existe motivo de perda de oportunidade).
- Produtos que não venderam nada no período (lista de encalhe comercial).
- Tempo em cada etapa do funil (existe o funil, não o tempo por etapa).
- Padronização de tags de CRM e uso de mensagens prontas por vendas (existe o dado de templates, falta o relatório).
- Análise de carteira por categoria e por estação.
- Visão consolidada de devoluções (o dado nasce nos tickets de SAC, mas não é agregado em nenhum dashboard).

## 2. Decisões já tomadas

- **Forma de pagamento e prazo:** já existem no cadastro do pedido — só precisam ser lidos e agregados.
- **Custo do produto:** passa a ser campo do cadastro de produto, e a margem é derivada dele.
- **Devolução:** nasce do SAC (ticket com motivo de devolução), não como entidade separada.
- **Financeiro (lucro líquido, DRE):** fora do escopo — não temos esse dado. Ficamos em margem de contribuição / lucro bruto comercial.

## 3. Proposta de execução

**Fase 1 — Custo no cadastro de produto**
Adicionar campo de custo ao produto e usá-lo como fonte única de margem. Onde não houver custo informado, o produto aparece como "sem custo cadastrado" em vez de margem zero. Popular os mocks existentes com custos coerentes.

**Fase 2 — Margem dentro dos dashboards atuais**
Sem tela nova de financeiro. A margem entra como camada nos painéis que já existem:
- **Produto:** margem por marca e por produto, ranking de maior e menor rentabilidade, ponte de margem (mix, desconto, marca).
- **Carteira:** margem por cliente e ticket médio com margem.
- **Diretoria:** tile de margem de contribuição do período com a seta de variação.

**Fase 3 — Condições comerciais e preço médio**
Bloco no Dashboard Carteira usando os dados de pagamento que já existem: % cartão vs boleto vs pix por mês, prazo médio de pagamento, preço médio por peça e preço médio por quilo (requer peso no cadastro de produto, adicionado junto com o custo na Fase 1).

**Fase 4 — Devoluções a partir do SAC**
Marcar tickets como devolução com motivo estruturado e criar o bloco "Devoluções" dentro do Dashboard Atendimento: valor devolvido, % sobre faturamento, ranking de motivos, por marca, cliente e vendedora.

**Fase 5 — Completar Produto e Carteira**
Produto: lista de itens sem venda no período e produtos por velocidade de venda. Carteira: segmentação por categoria e por estação, origem inbound vs outbound e motivos de inativação de cliente.

**Fase 6 — Completar Atendimento**
Tempo médio em cada etapa do funil, análise de descartes por motivo, uso de mensagens prontas por vendedora e auditoria de padronização das tags do CRM.

**Fase 7 — Diretoria como capa do B.I.**
Trazer para a Diretoria os números novos (margem, devoluções, ROI de verba do marketing) e ligar atalhos para Inteligência de Mercado e Marketing, para que a lista inteira seja acessível de um ponto só.

## 4. Notas técnicas

- Custo e peso entram no tipo de produto do cadastro (`mockProducts.ts` / `StartProduto` conforme o módulo) e são resolvidos por `produtoId` nos pedidos do `seed.ts`.
- Cálculos novos em `src/cockpit/lib/`: `margem.ts`, `devolucoes.ts`, `condicoesComerciais.ts`, `funilTempo.ts`, `semVenda.ts`.
- Devoluções derivam de `src/data/mockAtendimento.ts` (novo campo de tipo/motivo no ticket), consumidas pelo `TicketsAnalytics` e por um novo bloco de devoluções.
- Origem (inbound/outbound), motivo de escolha e motivo de inativação entram em `Conta` no `seed.ts`; bumpar a versão do cache no `CockpitContext`.
- Nenhuma rota nova: tudo é adicionado dentro de Carteira, Atendimento, Produto e Diretoria, reaproveitando `ExecTiles`, `SectionCard` e `Waterfall`.

## 5. Ordem sugerida

Fases 1 a 4 primeiro (custo → margem → condições comerciais → devoluções), que é o núcleo do que hoje não existe; depois 5 a 7, que são complementos sobre dados que já temos.

