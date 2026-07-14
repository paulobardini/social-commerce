
# Fases 6 e 7 — Fluxo de atendimento dentro do WhatsApp + gatilhos automáticos

Escopo 100% front-end (mocks + localStorage). Duas fases numa rodada, porque a Fase 7 depende da Fase 6.

## Fase 6 — Painel de atendimento dentro do WhatsAppInbox

### 6.1 Vínculo card ↔ conversa
- `CardAC` ganha `conversaId?: string` em `mockAtendimentoComercial.ts`.
- Seed: cada card ativo referencia uma conversa de `mockConversas`. Cards sem conversa correspondente ganham entradas mock em `mockConversas` + `mockMensagens` coerentes com a etapa (Fila: só cliente escreveu; Atendimento: vendedor já respondeu; Cadastro/Qualificação: troca pedindo dados).
- `AtendimentoComercialContext`: helpers `cardDaConversa(conversaId)` e `conversaDoCard(cardId)`; `criarLead` aceita `conversaId` opcional.
- `CardAtendimento` e `CardDrawer`: botão "Abrir no WhatsApp" navega com `?cardId=`.
- `WhatsAppInbox`: ao ler `?cardId=` seleciona a conversa vinculada; segue aceitando `?telefone=`.

### 6.2 Bloco "Atendimento" no painel lateral direito
Novo componente `src/components/atendimentoComercial/PainelAtendimentoWpp.tsx` no topo do painel direito:
- **Sem card**: botão discreto "Iniciar atendimento comercial" → cria card tag `carteira` (se conversa vinculada a cliente) ou `lead` (se não) na Fila.
- **Com card**:
  - **Stepper compacto** Fila → Atendimento → Cadastro → Qualificação → Oportunidade, etapa atual com a cor da coluna. `perdido` mostra badge "Perdido: {motivo}" + botão "Reabrir na fila". `conflito` mostra "⚠ Já atendido por {vendedor}" e trava avanços.
  - **Seções colapsáveis por etapa** (mesmo padrão do painel atual):
    - Cadastro: nome, CNPJ, cidade/UF, email, Instagram. Cada campo vazio tem ⚡ que envia mensagem via `appendMessage` + template do `MessageTemplatesContext`. Salvar chama `atualizarCadastro`. Cards `carteira` escondem o bloco de cadastro.
    - Qualificação: 5-6 perguntas do `CardAC["qualificacao"]`, cada uma com ⚡. Progresso "N de 5".
    - Qualificação completa: bloco inline "Gerar oportunidade?" com valor pré-sugerido pelo `volume` + Confirmar (`gerarOportunidade`).
    - Oportunidade gerada: resumo + link.
  - **Rodapé**: "Marcar como perdido" abre lista de motivos **inline** no próprio painel (reaproveita lista de `MotivoPerdaModal` extraída para constante). "Outros" exige texto.

### 6.3 Chip de etapa na lista de conversas
Conversas com card ativo mostram chip pequeno (dot da cor da coluna + rótulo curto) ao lado do horário.

### 6.4 Ajustes no WhatsAppInbox
- Expor `appendMessage(conversaId, texto)` para o painel disparar mensagens.
- Envolver o envio de resposta do vendedor com hook que informa o context (base da Fase 7).
- Importa `useAtendimentoComercial` e renderiza o painel novo no topo do painel direito, sem tocar no que já existe abaixo.

## Fase 7 — Dinâmicas e gatilhos automáticos

### 7.1 Gatilhos de movimentação
Função central `registrarEventoConversa(conversaId, evento)` no `AtendimentoComercialContext`:
- `mensagem_recebida` de contato **sem card e sem cliente** → cria card na Fila tag `lead`, origem **`whats_direto`** (novo valor de `OrigemLead` — contato desconhecido no whats do vendedor). `whats_central` fica reservado para leads distribuídos pelo inbox do marketing, para não poluir o painel de campanhas com tráfego orgânico.
- `mensagem_recebida` de cliente **inativo/perdido** (via `mockClientes360`) → cria card na Fila tag `reativacao`, atribuído ao dono da conta.
- `mensagem_recebida` de cliente **ativo sem card** → cria card na Fila tag `carteira`.
- `mensagem_recebida` em contato com card `perdido` → `reabrirCard` mantendo `motivoPerda` no histórico.
- `primeira_resposta_vendedor` em card em Leads/Fila → move para Em Atendimento + histórico "Primeira resposta enviada".
- **Carteira em Atendimento — avanço automático**: card com tag `carteira` em "Em Atendimento" que recebe a **primeira resposta de qualquer campo de qualificação** (via `atualizarQualificacao`) move automaticamente para "Em Qualificação". O pulo do Cadastro já é permitido pelo `moverCard` (`carteiraPulaCad`); aqui adicionamos o gatilho que efetivamente tira o card de "Em Atendimento".
- Para simulação: botão dev discreto "Simular mensagem recebida" no header do painel direito do WhatsApp.

### 7.2 Duplicidade e conflito
- Em `atualizarCadastro` e `criarLead`, ao receber CNPJ/telefone: buscar em `mockClientes360` e outros cards por match pertencente a outro vendedor.
- Match → `status: "conflito"` no card + histórico + alerta no painel do WhatsApp e no card do Kanban "⚠ Já atendido por {vendedor}".
- Cria entrada em novo mock `src/data/mockAprovacoesConflito.ts` (localStorage) alimentando a tela `GestorAprovacoes` existente em **`/gestor/aprovacoes`** (rota corrigida) com card "Conflito de lead — {nome}: {A} × {B}" e botões "Manter com dono da conta" (`redistribuirCard`) / "Liberar para o novo vendedor".
- Enquanto `conflito`: `moverCard` já bloqueia; garantir que os auto-avanços do `atualizarCadastro` e o gatilho novo do 7.1 (carteira) também sejam ignorados.
- Decisão do gestor: remove flag, notifica ambos os vendedores (via 7.3), grava histórico.

### 7.3 Notificações (sino do AppTopbar)
Novo `NotificacoesContext` (`src/contexts/NotificacoesContext.tsx`), persistido em localStorage, com `push({tipo, titulo, msg, cardId?, conversaId?})`, `marcarLida`, `naoLidas`. Registrado no `App.tsx`.
Eventos:
1. Lead distribuído para o vendedor.
2. SLA de 1ª resposta estourado (varredura `setInterval` a cada minuto usando `slaEstourado`).
3. Card 2d+ parado em Em Atendimento (mesma varredura, `estagnado`).
4. Conflito resolvido.
5. Card reaberto.

Sino no `AppTopbar` ganha badge com contador, dropdown (ícone por tipo, tempo relativo, negrito para não lidas); clique navega para `/vendedor/whatsapp?cardId=...` (ou Kanban) e marca como lida.

### 7.4 Itens na Fila de Ação do VendedorDashboard
Estender `FilaAcao` com itens vindos do `AtendimentoComercialContext`:
- Urgente: SLA estourado na Fila; card 2d+ parado em Em Atendimento; conflito (para gestor).
- Sugerido: leads na Fila dentro do SLA sem resposta; qualificação incompleta há 3d+.
- Botão: "Abrir conversa" → `/vendedor/whatsapp?cardId=`.
- Padrão visual atual (chips de urgência, metaLinha, contadores).

## Arquivos

**Novos**
```
src/components/atendimentoComercial/PainelAtendimentoWpp.tsx
src/components/atendimentoComercial/MotivoPerdaInline.tsx
src/contexts/NotificacoesContext.tsx
src/data/mockAprovacoesConflito.ts
```

**Editados**
```
src/data/mockAtendimentoComercial.ts        (conversaId, OrigemLead + "whats_direto", seed vinculado)
src/data/mockCRM360.ts                      (conversas/mensagens para cards órfãos)
src/contexts/AtendimentoComercialContext.tsx (helpers, gatilhos, conflito, avanço carteira, auto-avanço)
src/pages/vendedor/WhatsAppInbox.tsx        (painel novo, chip na lista, appendMessage, gatilhos, botão dev)
src/components/atendimentoComercial/CardAtendimento.tsx   (link cardId)
src/components/atendimentoComercial/CardDrawer.tsx        (link cardId, badge conflito)
src/components/AppTopbar.tsx                (sino funcional)
src/pages/vendedor/VendedorDashboard.tsx    (itens de atendimento na FilaAcao)
src/pages/vendedor/GestorAprovacoes.tsx     (seção de conflitos — rota /gestor/aprovacoes)
src/App.tsx                                 (NotificacoesProvider)
```

## Fora de escopo
- Integração real com WhatsApp/Meta.
- Reescrita da lista de conversas do WhatsAppInbox (só adiciona chip).
- Refatorar `MotivoPerdaModal`; segue existindo, compartilha só a constante de motivos.

## Critérios de aceite
1. Conversa com card → painel direito com stepper + ações; sem card → botão iniciar.
2. Preencher cadastro pelo painel move o card no Kanban.
3. Botões ⚡ mandam mensagem imediatamente.
4. Perda e reabertura funcionam de dentro do WhatsApp.
5. Confirmação de oportunidade aparece inline ao completar qualificação.
6. Simular mensagem recebida cria/reabre card conforme regra; contato desconhecido vira `whats_direto`.
7. Responder card da Fila move para Em Atendimento sozinho.
8. Card carteira responde 1ª qualificação → sobe para Em Qualificação sozinho.
9. Salvar CNPJ de conta de outro vendedor gera conflito + item em `/gestor/aprovacoes`; decisão destrava e notifica.
10. Sino mostra os 5 tipos com contador e navegação.
11. Fila de ação do painel do vendedor lista urgentes/sugeridos do atendimento.
12. Nada quebra no modo Método/buckets; tudo persiste em localStorage.
