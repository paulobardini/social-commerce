# Unificação: Ação como entidade única

Hoje já existem `TarefaExt` + `CompromissoExt` sincronizados no `TarefasContext`. O plano trata a **Tarefa como a Ação canônica** (fonte única) e o **Compromisso vira apenas uma projeção** (ação com hora que aparece no calendário). Nenhuma tela cria/edita compromisso "solto" — tudo passa por Ação.

## 1. Modelo (fonte única)

Em `TarefasContext` + `mockCRM360`:
- Adicionar em `TarefaExt`: `origem: "vendedor" | "sistema" | "atendimento" | "funil"`, `resultado?: string` (registro do "fiz"), `proximaAcaoId?: string` (encadeamento do loop).
- Remover status manual **"em_andamento"**. Status passa a ser **derivado** em runtime:
  - `concluida` se marcada
  - `atrasada` se `vencimento < hoje` e não concluída
  - `pendente` caso contrário
  Novo seletor `statusDerivado(t)` usado em todas as lentes; o campo `status` fica só para `concluida/cancelada`.
- Compromisso deixa de ser criado manualmente: `NovoCompromissoModal` passa a chamar `addTarefa` com `hora` obrigatória (mesma UI, outro título "Nova ação com horário"). O `syncCompromissoFromTarefa` existente já cobre a projeção.

## 2. Lente 2 — Tarefas (redesenho)

`src/pages/vendedor/TarefasPage.tsx`:
- Remover view **Board (A Fazer/Em Andamento/Concluídas)**.
- Novas views: **Lista agrupada por tempo** (padrão) e **Semana**.
- **Grupos temporais**: Atrasadas · Hoje · Amanhã · Esta semana · Depois · Sem data. Cada grupo colapsável com contador.
- **Contadores do topo** viram chips-filtro clicáveis: Total · Pendentes · Atrasadas · Concluídas (mantém busca + tipo + prioridade).
- **Linha da ação**: checkbox conclusão · título · badge de saúde do cliente · tipo · vínculo (opo/orçamento como link) · prioridade · vencimento + hora · ícone de **origem** com tooltip.
- **Quick add em 1 linha** no topo com parse simples de linguagem natural PT-BR:
  - Detecta cliente por nome contido ("AGK", "Boutique da Thay")
  - Detecta data: "hoje", "amanhã", "seg/ter/…", "DD/MM"
  - Detecta hora: "14h", "14:30", "às 9"
  - Detecta tipo por verbo: "ligar/visitar/enviar/cobrar/follow"
  - Fallback abre modal completo pré-preenchido
- **Recorrência** (já existe no context) exposta no modal: semanal/quinzenal/mensal.
- **Ações em lote**: seleção múltipla + barra flutuante (Adiar 1 dia · Reagendar · Concluir). Mobile: swipe direita = concluir, esquerda = adiar.
- **View Semana**: 7 colunas (dias), cards de ação drag & drop entre dias → chama `updateTarefa({vencimento})`.

## 3. Lente 3 — Agenda (calendário real)

`src/pages/vendedor/AgendaPage.tsx` reescrita:
- Renderiza **apenas ações com hora** (via `compromissos` do context, que já são projeção).
- Visões **Dia** (mobile) · **Semana** (desktop, default) · **Mês**. Cores por tipo.
- **Card de compromisso**: hora + duração, cliente, tipo, local, vínculo, ações rápidas (Whats, Registrar/Concluir, Reagendar).
- **Drag no calendário** = reagendar (chama `updateTarefa` na tarefa-mãe).
- **Criar por slot**: mini-form (cliente, tipo, duração, local) → cria Ação com hora.
- **Painel lateral "Sugestões de rota"** (desktop): lista clientes em risco na mesma cidade dos compromissos do dia/semana (join `clientes360 x compromissos`), botão "Adicionar visita" cria ação.
- Compromisso do dia não concluído até 23:59 → cai como **atrasado na fila de amanhã** (regra no seletor `statusDerivado`, sem mutação).

## 4. Lente 1 — Painel

`VendedorDashboard.tsx` só é conferido: já lê `useTarefas()`. Ajuste mínimo — trocar chamadas a `t.status === "atrasada"` por `statusDerivado(t) === "atrasada"` para refletir a nova regra derivada.

## 5. Loop do método — Modal "Concluir Ação"

Novo componente `ConcluirAcaoModal.tsx`:
- Dispara **sempre** que uma Ação com `clienteId` é concluída (checkbox na lista, botão na agenda, botão do Painel).
- 2 campos: **Resultado** (textarea curta) + **Próximo passo** (opcional, cria nova Ação encadeada com data/tipo sugeridos).
- Salva `resultado` na ação atual e, se preenchido, chama `addTarefa` retornando `proximaAcaoId`.
- Ação sem cliente conclui direto (sem modal).

## 6. Ícone de origem

Helper `origemMeta(origem)` → ícone + tooltip:
- `vendedor`: User · "criada por você"
- `sistema`: Sparkles · "sugerida pelo sistema"
- `atendimento`: MessageCircle · "criada no registro de atendimento"
- `funil`: Target · "gerada pelo funil"

Aplicado em Painel, Tarefas e cards da Agenda.

## 7. Integrações que fecham as verdades

- **WhatsApp**: em `WhatsAppInbox`, conversas com `aguardando_resposta_horas >= X` geram (uma vez) uma Ação sugerida com `origem: "sistema"` e `tipo: "follow_up"`. Registrar envio na conversa (fluxo já existente de "enviar mensagem" para aquele cliente) chama `toggleConcluida` da ação sugerida vinculada.
- **Alertas calculados** (cliente inativo prestes a virar perdido, orçamento parado): função `gerarAcoesSugeridas()` no context, executada no mount, insere Ações com `origem: "sistema"`. Vendedor pode "Dar hora" (vira compromisso) ou "Concluir registrando atendimento" (abre modal de conclusão).
- **Registrar atendimento** (Painel/360/Whats/Agenda): já grava histórico; passa a chamar `toggleConcluida(acaoId)` quando disparado a partir de uma ação vinculada.

## 8. Arquivos afetados

Editar:
- `src/data/mockCRM360.ts` — campo `origem` no tipo `TarefaCRM360`, mocks com origem variada, remoção de tarefas "em_andamento".
- `src/contexts/TarefasContext.tsx` — `statusDerivado`, `resultado`, `proximaAcaoId`, `gerarAcoesSugeridas`, `concluirComRegistro`.
- `src/pages/vendedor/TarefasPage.tsx` — reescrita (lista agrupada por tempo + view semana + quick add + bulk + filtros topo).
- `src/pages/vendedor/AgendaPage.tsx` — reescrita (Dia/Semana/Mês, drag, sugestões de rota).
- `src/pages/vendedor/VendedorDashboard.tsx` — usar `statusDerivado`, disparar modal de conclusão.
- `src/pages/vendedor/WhatsAppInbox.tsx` — hook de "aguardando resposta → ação sugerida" + concluir ao enviar.
- `src/components/vendedor/QuickTaskModal.tsx` — passa a receber `origem` e permite recorrência.
- `src/components/vendedor/NovoCompromissoModal.tsx` — passa a criar Ação com hora (não compromisso solto).

Criar:
- `src/components/vendedor/ConcluirAcaoModal.tsx` — modal Resultado + Próximo passo.
- `src/components/vendedor/AcaoQuickAdd.tsx` — input NL 1-linha reutilizável.
- `src/components/vendedor/AcaoOrigemIcon.tsx` — ícone + tooltip.
- `src/lib/acoes.ts` — `statusDerivado`, `parseAcaoNL`, `agruparPorTempo`, `origemMeta`.

## Detalhes técnicos

- Nada de backend: mocks + context, mantendo o padrão atual.
- Datas continuam em string `DD/MM/YYYY`; helpers de comparação em `src/lib/acoes.ts`.
- Drag & drop com HTML5 nativo (mesmo padrão do KanbanBoard existente) — sem nova dependência.
- Parse NL 100% client-side com regex/tokens; sem IA.
- Sugestões de rota: filtro por `cidade` já disponível em `mockClientes360`.
- Sem quebra de contrato do context: adições retrocompatíveis.
