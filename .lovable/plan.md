
# Loop de Cobrança Gestor ↔ Representante

Nova entidade **PlanoRecuperacao** unificando "Cobrar plano" (clientes em risco) e "Time fora do ritmo", com resposta estruturada do rep, acompanhamento automático por ações reais e escalada por SLA.

## 1. Modelo e persistência

**Novo arquivo:** `src/contexts/PlanosContext.tsx`
```ts
type PlanoTipo = "cliente_risco" | "ritmo";
type PlanoStatus = "aguardando_resposta" | "ativo" | "concluido" | "escalado" | "cancelado";

interface Compromisso {
  id: string;
  tipo: "cobrir_clientes" | "resgatar_cliente" | "enviar_proposta" | "visita";
  descricao: string;      // "Cobrir 15 clientes da região Sul"
  alvo?: number;          // 15 (para cobertura)
  clienteId?: string;     // para resgatar/visita
  prazo: string;          // DD/MM/YYYY
  progresso: number;      // 0..1 calculado por atendimentos
  concluido: boolean;
}

interface PlanoRecuperacao {
  id: string;
  repId: string;
  repNome: string;
  tipo: PlanoTipo;
  contexto: {
    clienteId?: string; clienteNome?: string; valor?: number;
    pace?: number; coberturaDelta?: number;
  };
  notaGestor: string;
  solicitadoEm: string;   // ISO
  prazoResposta: string;  // ISO (+24h úteis)
  respondidoEm?: string;
  status: PlanoStatus;
  compromissos: Compromisso[];
  log: Array<{ ts: string; autor: "gestor"|"rep"|"sistema"; texto: string }>;
  encerradoEm?: string;
  notaEncerramento?: string;
}
```
Persistência `localStorage["planos:v1"]`. Registrado em `App.tsx` dentro dos providers do vendedor.

## 2. Lado do gestor — disparo

Editar `src/cockpit/components/decisoes/DecisoesTab.tsx`:

- **Novo modal `SolicitarPlanoModal`** (`src/cockpit/components/decisoes/SolicitarPlanoModal.tsx`): campo nota pré-preenchida do contexto ("Atacado Bella · R$ 150k · 5d p/ virar perdido — qual o plano?"). Cria Plano + Ação `origem:"sistema"` na fila do rep.
- Botão "Cobrar plano do rep" (Clientes-chave em risco) → abre esse modal com `tipo:"cliente_risco"`.
- **Terceira ação em Time fora do ritmo:** `[Solicitar plano de recuperação]` (`tipo:"ritmo"`, contexto com pace/cobertura).
- Botão WhatsApp abre link com mensagem sugerida montada do contexto ("Sérgio, vi que o pace está em 41%…"). Coexiste com o plano formal.

## 3. Bloco "Planos em andamento" (aba Decisões)

Novo componente `src/cockpit/components/decisoes/PlanosEmAndamento.tsx`:

- Cards com rep · motivo · lista de compromissos com **barra de progresso alimentada por ações reais** · prazo · badge de status.
- Ações: `[Ver detalhe]` `[Reforçar no Whats]` `[Encerrar]` (com nota).
- Card fica **vermelho** quando `status:"escalado"` (sem resposta > 24h úteis) com CTAs `[Chamar no Whats]` `[Reatribuir cliente]` `[Deixar registrado]`.
- Alerta parcial quando compromissos vencidos ("2 de 3 compromissos atrasados").
- Rodapé com métricas do loop em linguagem simples: "o time responde em média em 6h · 8 de 10 planos cumpridos".

## 4. Lado do rep — resposta

- **Ação destacada** no Painel do rep (bloco "Urgente", badge "Solicitado pelo gestor", cor própria). Adicionar variação em `VendedorDashboard.tsx` / lista de ações urgentes: quando `tarefa.origem === "sistema"` E `tarefa.planoId` presente, renderizar com destaque roxo.
- Novo modal `src/components/vendedor/ResponderPlanoModal.tsx`:
  - Diagnóstico curto (1 linha).
  - 1 a 3 compromissos: select (`cobrir_clientes|resgatar_cliente|enviar_proposta|visita`) + campos contextuais (N clientes / cliente / prazo).
  - **Sugestões automáticas** por contexto: `cliente_risco` sugere "Resgatar agora" + "Visita em 7d"; `ritmo` sugere "Cobrir N clientes em 5d" + "Enviar proposta cliente-chave".
  - Mobile: layout compacto com sugestões prontas em 2 toques.
- Salvar → cada compromisso vira Ação encadeada no `TarefasContext` com `origem:"plano"`, `planoId`, `compromissoId`. Plano → `status:"ativo"`.

## 5. Acompanhamento automático (`src/lib/planos.ts`)

Selectors puros que recomputam o progresso a partir das ações concluídas do rep dentro da janela do plano:

- `cobrir_clientes`: `min(1, contagem_atendimentos_distintos / alvo)`.
- `resgatar_cliente`: `1` se houver atendimento concluído para `clienteId` após `solicitadoEm`.
- `enviar_proposta`: `1` se tarefa `follow_up` concluída para o cliente.
- `visita`: `1` se tarefa `visita` concluída após `solicitadoEm`.

## 6. Encerramento

Hook `usePlanosAutoclose` roda no provider a cada mount + change:

- `cliente_risco`: encerra `concluido` quando cliente sai do risco (status ≠ `inativo` OU tem atendimento positivo).
- `ritmo`: `concluido` quando `pace ≥ 80%` por 2 semanas (mock: usa `repPace2sem` do seed) OU todos compromissos concluídos.
- Manual: sempre exige nota.

## 7. Escalada por SLA

Selector `escalarSePendente(plano, agora)`: se `status === "aguardando_resposta"` e `agora > prazoResposta` (24h úteis), promove para `escalado` e registra no log. Cards escalados destacados em vermelho no bloco.

## 8. Rastreabilidade

- **360 do cliente** (`ClienteAtendimentoTab` / timeline): quando `tipo:"cliente_risco"`, plotar eventos "Gestor solicitou plano · Rep comprometeu resgate até 12/05" e progresso.
- **RepDrawer** de Time & Metas (`src/cockpit/components/time/TimeMetasTab.tsx` → drawer): nova aba/seção "Histórico de planos" com contagem total, cumpridos, em andamento, escalados.

## 9. Métricas do loop

Selector `metricasLoop(planos)`: tempo médio de resposta, % cumpridos. Renderizado no rodapé de "Planos em andamento" em texto natural.

## Arquivos

**Novos**
- `src/contexts/PlanosContext.tsx`
- `src/lib/planos.ts` (selectors puros: progresso, escalada, métricas)
- `src/cockpit/components/decisoes/SolicitarPlanoModal.tsx`
- `src/cockpit/components/decisoes/PlanosEmAndamento.tsx`
- `src/cockpit/components/decisoes/EncerrarPlanoModal.tsx`
- `src/components/vendedor/ResponderPlanoModal.tsx`

**Editados**
- `src/App.tsx` — envolve rotas do vendedor com `<PlanosProvider>`.
- `src/cockpit/components/decisoes/DecisoesTab.tsx` — troca `cobrarPlanoRep` pelo modal; adiciona ação em Time fora do ritmo; renderiza `<PlanosEmAndamento>`.
- `src/cockpit/components/time/TimeMetasTab.tsx` — histórico de planos no drawer.
- `src/pages/vendedor/VendedorDashboard.tsx` — badge/cor especial para ações com `planoId`; abre `ResponderPlanoModal` no clique.
- `src/contexts/TarefasContext.tsx` — campos opcionais `planoId`, `compromissoId` em `TarefaExt`.
- `src/components/atendimento/ClienteAtendimentoTab.tsx` (ou timeline do 360) — eventos de plano na timeline do cliente.

Sem novas dependências. Mock data via localStorage seguindo o padrão do projeto.
