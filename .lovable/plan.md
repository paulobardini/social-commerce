# Automação de Followup por Etapa do Funil

Implementação completa do fluxo de automações de tarefas por etapa do Kanban de oportunidades, mantendo o design system atual (sidebar única, cards, badges, modais de altura fixa).

## 1. Modelo de dados (mock)

Novo arquivo `src/data/mockAutomacoes.ts`:

- `AutomacaoTarefa`: `{ id, nome, tipo: "ligacao"|"whatsapp"|"email"|"visita"|"proposta"|"personalizado", intervaloDias, responsavelPadrao? }`
- `Automacao`: `{ id, nome, descricao, etapasVinculadas: EtapaId[], isPosVenda?: boolean, tarefas: AutomacaoTarefa[], createdAt }`
- `AutomacaoAplicada` (histórico por oportunidade): `{ id, oportunidadeId, automacaoId, automacaoNome, dataAplicacao, aplicadaPor, encerradaEm? }`
- 4 mocks de exemplo: "Followup Proposta Enviada" (3 tarefas D+0, D+2, D+5), "Reativação de Lead Frio", "Qualificação inicial", "Pós-venda padrão" (marcado `isPosVenda`).

Estender `mockTarefas` em `mockCRM.ts` com campos opcionais: `automacaoId?`, `automacaoNome?`, `status: "pendente"|"concluida"|"cancelada"`, `tipo` mapeado para os tipos de automação.

## 2. Configurações > Automações

Atualizar `src/pages/vendedor/VendedorConfiguracoes.tsx`: adicionar card "Automações de followup" com botão "Configurar" → navega para nova rota `/vendedor/configuracoes/automacoes`.

Nova página `src/pages/vendedor/AutomacoesPage.tsx`:
- Header com título, descrição e botão "Nova automação".
- Lista em cards: nome, badge das etapas vinculadas, badge "Pós-venda" se aplicável, contagem de tarefas, ações (editar, duplicar, excluir).
- Estado local (useState) — sem persistência real.

Novo componente `src/components/vendedor/AutomacaoFormModal.tsx`:
- Modal alto (max-h 90vh, header/footer fixos, corpo scrollável — segue padrão `FunilConfigModal`).
- Campos: Nome, Descrição, multiselect de etapas do funil (chips), toggle "Etapa de fechamento (pós-venda)".
- Editor de sequência de tarefas: lista ordenável, cada linha com nome, select de tipo, input numérico "D+ dias desde anterior", select de responsável (opcional). Botões "Adicionar tarefa" e remover.
- Footer fixo: Cancelar / Salvar.

## 3. Disparo no Kanban (drag-and-drop)

Em `src/components/vendedor/KanbanBoard.tsx`, no `handleDrop`:

1. Mover o card normalmente.
2. Cancelar tarefas pendentes vinculadas a `automacaoId` ativo da oportunidade (status → "cancelada"); manter "concluida".
3. Buscar automações cuja `etapasVinculadas` inclua a nova etapa.
4. Se 0: sem modal. Se 1: abrir direto modal de prévia. Se ≥2: abrir modal de seleção.
5. Se a etapa for de fechamento (`ganho`): aplicar automaticamente a automação `isPosVenda` se houver.

Novo componente `src/components/vendedor/AplicarAutomacaoModal.tsx` em duas etapas:
- **Passo 1 (escolha)** — exibido só quando há múltiplas: lista de automações disponíveis com nome, descrição, contagem de tarefas, radio para selecionar, botão "Continuar".
- **Passo 2 (prévia)**: campo de data "Data da primeira tarefa" (default = hoje), tabela com prévia das tarefas: nome, ícone do tipo, data calculada (data inicial + soma cumulativa dos `intervaloDias`). Botões "Voltar" / "Confirmar e criar tarefas".

Ao confirmar: insere tarefas no estado de tarefas com `automacaoId`, `automacaoNome`, status "pendente"; registra `AutomacaoAplicada` no histórico; adiciona entrada na timeline da oportunidade ("Automação X aplicada por Vendedor em DD/MM").

## 4. Visualização nas oportunidades

Em `src/pages/vendedor/OportunidadeDetalhe.tsx`:
- Aba/seção "Tarefas" já existente: renderizar lista com status (pendente/concluída/cancelada), tipo (ícone), data, nome, badge cinza com nome da automação de origem quando aplicável. Tarefas canceladas com `line-through` e `text-muted-foreground`.
- Cada item: botão "Concluir" (status pendente) e botão "Editar" (modal simples: nome, tipo, data).
- Aba "Histórico/Timeline": adicionar eventos "Automação aplicada" e "Automação encerrada" usando o padrão de `atividadeIcons` existente (novo tipo `automacao` com ícone `Zap`).

## 5. Página de Tarefas (lista global)

Em `src/pages/vendedor/TarefasPage.tsx`:
- Adicionar coluna/badge "Automação" quando a tarefa veio de uma; chip cinza com o nome.
- Adicionar filtro "Automação" (select) ao lado dos filtros existentes.
- Status "cancelada" passa a aparecer no filtro de status; visual riscado igual ao detalhe.

## 6. Detalhes técnicos

- Estado: como o app é mock, criar `src/hooks/useAutomacoesStore.ts` (Zustand-like via React context simples ou apenas `useState` em nível de página com `useMemo`). Para manter simples sem nova dependência: context provider `AutomacoesProvider` em `App.tsx` expondo `automacoes`, `tarefas`, `historico`, `aplicarAutomacao(opId, automacaoId, dataInicial)`, `cancelarTarefasPendentes(opId)`, `concluirTarefa(id)`, `editarTarefa(id, patch)`.
- `KanbanBoard` e `OportunidadeDetalhe` consomem esse contexto em vez de `mockTarefas` direto (mantendo o mock como seed inicial).
- Tipos centralizados em `src/data/mockAutomacoes.ts`.
- Ícones por tipo: `Phone`, `MessageCircle` (whatsapp), `Mail`, `MapPin` (visita), `FileText` (proposta), `Sparkles` (personalizado).
- Acessibilidade: todos os modais com `DialogTitle`, foco no primeiro campo, contraste ≥ AA nos badges (usar tokens `muted`, `accent`, `destructive`).
- Mobile: modais ocupam `w-[95vw]`, lista de prévia com scroll horizontal mínimo; passos do modal empilhados.

## 7. Arquivos criados / alterados

Criados:
- `src/data/mockAutomacoes.ts`
- `src/pages/vendedor/AutomacoesPage.tsx`
- `src/components/vendedor/AutomacaoFormModal.tsx`
- `src/components/vendedor/AplicarAutomacaoModal.tsx`
- `src/contexts/AutomacoesContext.tsx`

Alterados:
- `src/App.tsx` (rota `/vendedor/configuracoes/automacoes` e provider)
- `src/pages/vendedor/VendedorConfiguracoes.tsx` (novo card)
- `src/components/vendedor/KanbanBoard.tsx` (handleDrop dispara automação)
- `src/pages/vendedor/OportunidadeDetalhe.tsx` (tarefas + timeline)
- `src/pages/vendedor/TarefasPage.tsx` (filtro + badge automação)
- `src/data/mockCRM.ts` (campos extras em Tarefa)

## Fora de escopo

- Persistência real / backend.
- Notificações automáticas por e-mail/WhatsApp das tarefas.
- Reordenação drag-and-drop dentro do editor de sequência (usar setas ↑↓ por simplicidade).
