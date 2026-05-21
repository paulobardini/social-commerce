## Módulo Atendimento — Tickets WhatsApp com Setores

Novo módulo de tickets de atendimento totalmente mockado, com divisão por setores (SAC, Cobrança, Financeiro, Logística), kanbans configuráveis por setor e perfil supervisor vs. atendente. Segue o design system do Nextil (sidebar dark navy, cards brancos, Poppins, badges arredondados, padrão visual da tela Oportunidades).

### 1. Mock de dados — `src/data/mockAtendimento.ts`

Tipos principais:
- `Setor` = `"sac" | "cobranca" | "financeiro" | "logistica"` + labels e cor por setor (azul, vermelho, verde, roxo).
- `TicketTipo` = `financeiro | pedido | troca | reclamacao | duvida | cobranca | outro`.
- `TicketPrioridade` = `urgente | normal | baixa`.
- `TicketOrigem` = `whatsapp | manual`.
- `Atendente` = `{ id, nome, iniciais, setores: Setor[], role: "supervisor" | "atendente" }`.
- `FunilSetor` = `{ setor, colunas: { id, label, cor, ordem }[] }` — colunas configuráveis por setor, persistidas em `localStorage` (`nextil_atendimento_funis`).
- `Ticket` = `{ id, setor, statusColunaId, clienteId, clienteNome, empresa, whatsapp, tipo, prioridade, origem, responsavelId, dataAbertura, ultimaAtividade, proximaAcao, descricao, oportunidadeId?, historicoCompras[3], mensagensWhatsApp[4-5], anexos[] }`.

Sementes:
- 4 funis default, um por setor, cada um com 4-5 colunas customizadas:
  - SAC: Aberto / Em atendimento / Aguardando cliente / Resolvido / Encerrado.
  - Cobrança: Em aberto / Em negociação / Aguardando comprovante / Pago / Perdido.
  - Financeiro: Pendente / Em análise / Aguardando NF / Conciliado / Encerrado.
  - Logística: Recebido / Em separação / Aguardando rastreio / Entregue / Devolvido.
- 6-8 atendentes mock: 1 supervisor (Paulo Bardini) com acesso a todos os setores e 1-2 atendentes por setor.
- ~16 tickets distribuídos pelos 4 setores e respectivas colunas, usando clientes existentes (Fashion Kids Store, Rei das Crianças, Milykids etc.); Fashion Kids Store recebe 3 tickets para popular a timeline no Cliente 360. 1-2 tickets vinculados a oportunidades existentes. Origem mista whatsapp/manual.

### 2. Permissões mockadas

Em `src/lib/atendimentoAuth.ts`:
- `getCurrentAtendente()` retorna o usuário corrente (default: supervisor). Persistido em `localStorage` (`nextil_atendimento_user_id`) para permitir alternar manualmente.
- Helpers `canSeeSetor(setor)`, `visibleSetores()` aplicando regra: supervisor vê todos; atendente vê só os setores em que está alocado.

### 3. Rota e sidebar

- `src/App.tsx`: importar `AtendimentoPage` e registrar rota `/vendedor/atendimento`.
- `src/components/AppSidebar.tsx`: adicionar item `{ icon: Headphones, label: "Atendimento", path: "/vendedor/atendimento" }` na seção **Gestão**, logo após "Tarefas" (se "Tarefas" não estiver nessa seção atualmente, inserir após "Relatórios"; manter ordem coerente com o restante).
- `src/components/vendedor/VendedorSidebar.tsx`: mesmo item, mesma posição relativa.

### 4. Página principal — `src/pages/vendedor/AtendimentoPage.tsx`

Visão **unificada com filtros laterais**, espelhando o padrão de `VendedorOportunidades`:

- Header: título "Atendimento", subtítulo "Gerencie os tickets de atendimento dos seus clientes", botão primário "+ Novo ticket" e (apenas para supervisor) botão "Configurar funis". Ao lado, `ToggleGroup` com 3 visões: Kanban / Lista / Timeline.
- Toolbar: busca + botão "Filtros" com contador. O filtro **principal** é por setor (chips multi-select com cor do setor), exibindo apenas setores visíveis ao usuário corrente. Filtros adicionais: tipo, prioridade, responsável, origem.
- Indicador de perfil: badge discreto no topo "Supervisor — vendo todos os setores" ou "Atendente — Setor X". Selector de usuário (somente em dev/mock) para alternar entre supervisor e atendentes.
- Estado local: `view`, `search`, `filtroSetores`, `filtroTipo`, `filtroPrioridade`, `filtroResponsavel`, `filtroOrigem`, `selectedTicket`, `drawerOpen`, `funilConfigOpen`.

### 5. Kanban unificado — `src/components/atendimento/AtendimentoKanban.tsx`

- **Quando 1 setor está selecionado**: exibe diretamente as colunas customizadas daquele funil.
- **Quando múltiplos setores estão selecionados** (default na visão unificada): renderiza grupos verticais por setor (faixa com cor + nome do setor) e abaixo as colunas daquele funil; cada setor é um sub-kanban horizontal scrollável. Mantém densidade visual sob controle e respeita a configuração de cada setor.
- Coluna: header com bolinha colorida + nome + contador.
- `TicketCard.tsx`: cliente + empresa, badge tipo (cor por tipo), badge prioridade, ícone WhatsApp verde se origem=whatsapp, badge "Via WhatsApp" (verde claro) ou "Manual" (cinza), badge do setor (cor do setor), avatar/iniciais do responsável, data de abertura, linha "→ próxima ação", link sutil "↗ Ver oportunidade" quando vinculado. Click abre drawer.

### 6. Lista — `src/components/atendimento/AtendimentoLista.tsx`

Tabela shadcn com colunas: Cliente | Setor | Tipo | Status | Responsável | Abertura | Última atividade | Ação. Zebra suave (`even:bg-muted/30`), linhas clicáveis. Badges idênticas ao Kanban.

### 7. Timeline geral — `src/components/atendimento/AtendimentoTimeline.tsx`

Lista vertical agrupada por dia (mais recente no topo). Cada item: ícone do tipo, badge do setor, status badge, cliente, responsável, resumo da última mensagem WhatsApp truncado a 1 linha. Click abre drawer.

### 8. Drawer de Ticket — `src/components/atendimento/TicketDrawer.tsx`

Sheet à direita, `w-[480px]`, `flex flex-col h-full`:
- Header fixo: "Novo ticket" ou "Ticket #ID — Setor X", botão fechar.
- Body scrollável:
  1. Cliente (Combobox com autocomplete).
  2. Número WhatsApp (Input pré-preenchido se houver).
  3. **Setor** (Select; restrito aos setores visíveis ao usuário).
  4. Tipo de atendimento (Select).
  5. Status (Select dinâmico, refletindo as colunas do funil do setor selecionado).
  6. Prioridade (Select).
  7. Responsável (Select com iniciais coloridas; só atendentes daquele setor + supervisores).
  8. Vínculo com Oportunidade (Select opcional filtrado pelo cliente).
  9. Histórico de compras (Collapsible com 3 pedidos: data, valor, produto).
  10. Descrição/Observações (Textarea).
  11. Anexos (área tracejada + 1 thumbnail mock).
  12. Histórico WhatsApp: balões alternados (cliente esquerda cinza-claro, atendente direita azul-claro), fonte pequena, fundo `bg-muted/40`.
  13. Campo de resposta travado: input disabled com ícone de cadeado + "Responda diretamente pelo WhatsApp".
- Footer fixo: "Cancelar" e "Salvar ticket" (toast + fecha; persiste no `localStorage` apenas para a sessão de demo).

### 9. Configurador de Funis — `src/components/atendimento/FunisConfigModal.tsx`

Disponível apenas para supervisor (botão "Configurar funis" no header). Modal técnico (`max-h-[90vh]`, flex-col, header/footer shrink-0, body com overflow-y-auto) com abas — uma por setor. Em cada aba: lista de colunas reordenáveis com nome, cor (palette presets) e botões adicionar/remover. Salva em `localStorage`.

### 10. Cliente 360 — Aba "Atendimento"

Em `src/pages/vendedor/Cliente360Page.tsx`:
- Adicionar nova aba **Atendimento** no `Tabs` (logo após "Histórico" ou similar).
- Conteúdo: timeline vertical dos tickets filtrados por `clienteId`, mostrando ícone do tipo, badge do setor, data, status badge, responsável e última mensagem WhatsApp truncada a 1 linha. Click abre `TicketDrawer` (estado local).
- Fashion Kids Store já chega com 3 tickets no mock.

### 11. Detalhes técnicos

- Reutilizar `Badge`, `Button`, `Input`, `Select`, `Sheet`, `Tabs`, `Table`, `Collapsible`, `Avatar`, `ToggleGroup`, `Dialog`, `Combobox` (Popover + Command). Sem novas dependências.
- Cores via tokens do design system + Tailwind utilities padrão já usados no projeto (`bg-blue-100 text-blue-700` etc.). Sem hex inline novos.
- Ícones (lucide-react): `Headphones`, `MessageCircle`, `Lock`, `Paperclip`, `Settings2`, `ChevronDown`, `Link`, `Search`, `Filter`, `Plus`, `Kanban`, `List`, `Clock`, `Users`.
- Persistência: `localStorage` para funis configurados, usuário corrente mock e tickets criados. Nenhum backend.
- Sem alterações fora dos arquivos listados abaixo.

### Arquivos a criar

- `src/data/mockAtendimento.ts`
- `src/lib/atendimentoAuth.ts`
- `src/pages/vendedor/AtendimentoPage.tsx`
- `src/components/atendimento/AtendimentoKanban.tsx`
- `src/components/atendimento/AtendimentoLista.tsx`
- `src/components/atendimento/AtendimentoTimeline.tsx`
- `src/components/atendimento/TicketCard.tsx`
- `src/components/atendimento/TicketDrawer.tsx`
- `src/components/atendimento/FunisConfigModal.tsx`

### Arquivos a editar

- `src/App.tsx` — registrar rota.
- `src/components/AppSidebar.tsx` — item "Atendimento" na seção Gestão.
- `src/components/vendedor/VendedorSidebar.tsx` — item equivalente.
- `src/pages/vendedor/Cliente360Page.tsx` — aba "Atendimento" com timeline + drawer.
