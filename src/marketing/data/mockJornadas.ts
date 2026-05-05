// Mock de jornadas automatizadas (workflows) do módulo Marketing
// Modelo: nodes (gatilhos, ações, condições, esperas) + edges direcionados.

export type NodeKind = "trigger" | "action" | "condition" | "delay" | "exit";

export type TriggerType =
  | "lead_novo"            // novo lead criado no CRM
  | "lookbook_view"        // visualizou lookbook X
  | "ad_click"             // clicou em anúncio Meta
  | "carrinho_abandonado"  // grade montada sem fechamento
  | "tag_aplicada"         // ganhou tag específica
  | "data_calendario"      // data fixa (aniversário, datas comerciais)
  | "inativo_xdias";       // sem interação por N dias

export type ActionType =
  | "enviar_whatsapp"
  | "enviar_email"
  | "criar_tarefa_vendedor"
  | "atribuir_vendedor"
  | "aplicar_tag"
  | "mover_etapa_crm"
  | "notificar_marketing"
  | "sync_meta_audience";  // adiciona à audiência custom Meta

export type ConditionType =
  | "respondeu"
  | "abriu_email"
  | "clicou_link"
  | "comprou"
  | "tem_tag"
  | "valor_maior_que";

export interface JourneyNode {
  id: string;
  kind: NodeKind;
  // posição no canvas
  x: number;
  y: number;
  // conteúdo específico
  triggerType?: TriggerType;
  actionType?: ActionType;
  conditionType?: ConditionType;
  label: string;
  description?: string;
  // configurações
  config?: Record<string, string | number | boolean>;
  // métricas (executados / sucesso)
  stats?: { entrou: number; saiu: number; falhou?: number };
}

export interface JourneyEdge {
  id: string;
  from: string;
  to: string;
  branch?: "sim" | "nao" | "default";
}

export type StatusJornada = "ativa" | "pausada" | "rascunho" | "arquivada";

export interface Jornada {
  id: string;
  nome: string;
  descricao: string;
  status: StatusJornada;
  criadaEm: string;
  ultimaEdicao: string;
  responsavel: string;
  tags: string[];
  // execuções
  totalEntraram: number;
  ativos: number;       // contatos atualmente em execução
  concluiram: number;
  conversoes: number;   // ações de objetivo concluídas
  receitaAtribuida: number;
  // estrutura
  nodes: JourneyNode[];
  edges: JourneyEdge[];
}

export const triggerLabels: Record<TriggerType, string> = {
  lead_novo: "Novo lead criado",
  lookbook_view: "Visualizou lookbook",
  ad_click: "Clicou em anúncio Meta",
  carrinho_abandonado: "Carrinho abandonado",
  tag_aplicada: "Tag aplicada",
  data_calendario: "Data do calendário",
  inativo_xdias: "Inativo por N dias",
};

export const actionLabels: Record<ActionType, string> = {
  enviar_whatsapp: "Enviar WhatsApp",
  enviar_email: "Enviar e-mail",
  criar_tarefa_vendedor: "Criar tarefa para vendedor",
  atribuir_vendedor: "Atribuir vendedor",
  aplicar_tag: "Aplicar tag",
  mover_etapa_crm: "Mover etapa no CRM",
  notificar_marketing: "Notificar time marketing",
  sync_meta_audience: "Sincronizar com Meta Audience",
};

export const conditionLabels: Record<ConditionType, string> = {
  respondeu: "Respondeu mensagem?",
  abriu_email: "Abriu o e-mail?",
  clicou_link: "Clicou no link?",
  comprou: "Realizou compra?",
  tem_tag: "Tem tag?",
  valor_maior_que: "Valor maior que?",
};

// ===== Catálogo de gatilhos / ações / condições para a paleta do editor =====
export const triggerCatalog: { type: TriggerType; icon: string; description: string }[] = [
  { type: "lead_novo", icon: "🆕", description: "Dispara quando um novo lead chega no CRM" },
  { type: "lookbook_view", icon: "📖", description: "Quando alguém visualiza um lookbook específico" },
  { type: "ad_click", icon: "🎯", description: "Após um clique em campanha Meta Ads" },
  { type: "carrinho_abandonado", icon: "🛒", description: "Grade montada não fechada em N horas" },
  { type: "tag_aplicada", icon: "🏷️", description: "Quando uma tag específica é aplicada" },
  { type: "data_calendario", icon: "📅", description: "Datas fixas: aniversário, sazonais, etc." },
  { type: "inativo_xdias", icon: "💤", description: "Cliente sem interação por N dias" },
];

export const actionCatalog: { type: ActionType; icon: string; description: string }[] = [
  { type: "enviar_whatsapp", icon: "💬", description: "Disparo via WhatsApp Cloud API" },
  { type: "enviar_email", icon: "📧", description: "E-mail via Mailchimp" },
  { type: "criar_tarefa_vendedor", icon: "✅", description: "Cria tarefa atribuída ao vendedor responsável" },
  { type: "atribuir_vendedor", icon: "👤", description: "Define o vendedor responsável pelo lead" },
  { type: "aplicar_tag", icon: "🏷️", description: "Aplica tag no contato/lead" },
  { type: "mover_etapa_crm", icon: "➡️", description: "Move oportunidade de etapa no funil" },
  { type: "notificar_marketing", icon: "🔔", description: "Notificação interna no painel" },
  { type: "sync_meta_audience", icon: "📡", description: "Sincroniza com audiência customizada Meta" },
];

export const conditionCatalog: { type: ConditionType; icon: string; description: string }[] = [
  { type: "respondeu", icon: "↩️", description: "Bifurca conforme resposta no canal" },
  { type: "abriu_email", icon: "👁️", description: "Verifica se o e-mail foi aberto" },
  { type: "clicou_link", icon: "🖱️", description: "Verifica se o link foi clicado" },
  { type: "comprou", icon: "💰", description: "Conversão em pedido fechado" },
  { type: "tem_tag", icon: "🏷️", description: "Verifica se possui tag específica" },
  { type: "valor_maior_que", icon: "📈", description: "Compara valor numérico" },
];

// ===== Jornadas mock pré-configuradas =====
export const mockJornadas: Jornada[] = [
  {
    id: "jor_001",
    nome: "Boas-vindas — novo lojista",
    descricao: "Onboarding em 4 passos para todo lojista que se cadastra com PJ aprovado",
    status: "ativa",
    criadaEm: "10/02/2026",
    ultimaEdicao: "08/04/2026",
    responsavel: "Ana Marketing",
    tags: ["onboarding", "alto impacto"],
    totalEntraram: 412,
    ativos: 38,
    concluiram: 374,
    conversoes: 187,
    receitaAtribuida: 612000,
    nodes: [
      { id: "n1", kind: "trigger", triggerType: "tag_aplicada", x: 60, y: 60, label: "Tag 'PJ aprovado'", description: "Quando recebe a tag de cadastro PJ aprovado", stats: { entrou: 412, saiu: 412 } },
      { id: "n2", kind: "action", actionType: "enviar_whatsapp", x: 60, y: 200, label: "WhatsApp boas-vindas", description: "Template: boas_vindas_v3", stats: { entrou: 412, saiu: 401 } },
      { id: "n3", kind: "delay", x: 60, y: 340, label: "Espera 2 dias", stats: { entrou: 401, saiu: 401 } },
      { id: "n4", kind: "condition", conditionType: "respondeu", x: 60, y: 480, label: "Respondeu?", stats: { entrou: 401, saiu: 401 } },
      { id: "n5", kind: "action", actionType: "criar_tarefa_vendedor", x: -120, y: 620, label: "Tarefa: ligar para lojista", description: "Atribuída ao vendedor da carteira", stats: { entrou: 187, saiu: 187 } },
      { id: "n6", kind: "action", actionType: "enviar_email", x: 240, y: 620, label: "E-mail nutrição #1", description: "Template: lookbook_galeria", stats: { entrou: 214, saiu: 209 } },
      { id: "n7", kind: "exit", x: 60, y: 760, label: "Fim da jornada" },
    ],
    edges: [
      { id: "e1", from: "n1", to: "n2" },
      { id: "e2", from: "n2", to: "n3" },
      { id: "e3", from: "n3", to: "n4" },
      { id: "e4", from: "n4", to: "n5", branch: "sim" },
      { id: "e5", from: "n4", to: "n6", branch: "nao" },
      { id: "e6", from: "n5", to: "n7" },
      { id: "e7", from: "n6", to: "n7" },
    ],
  },
  {
    id: "jor_002",
    nome: "Recuperação grade abandonada",
    descricao: "Sequência de 3 toques quando a grade é montada e não fechada em 24h",
    status: "ativa",
    criadaEm: "25/02/2026",
    ultimaEdicao: "12/04/2026",
    responsavel: "Bruno CRM",
    tags: ["recuperação", "alto ROI"],
    totalEntraram: 184,
    ativos: 22,
    concluiram: 162,
    conversoes: 68,
    receitaAtribuida: 298000,
    nodes: [
      { id: "n1", kind: "trigger", triggerType: "carrinho_abandonado", x: 60, y: 60, label: "Grade > 24h sem fechamento", stats: { entrou: 184, saiu: 184 } },
      { id: "n2", kind: "action", actionType: "enviar_whatsapp", x: 60, y: 200, label: "WhatsApp lembrete", description: "Template: grade_pendente", stats: { entrou: 184, saiu: 178 } },
      { id: "n3", kind: "delay", x: 60, y: 340, label: "Espera 48h", stats: { entrou: 178, saiu: 178 } },
      { id: "n4", kind: "condition", conditionType: "comprou", x: 60, y: 480, label: "Fechou pedido?", stats: { entrou: 178, saiu: 178 } },
      { id: "n5", kind: "exit", x: -120, y: 620, label: "Saída — convertido" },
      { id: "n6", kind: "action", actionType: "enviar_email", x: 240, y: 620, label: "E-mail: 5% off", stats: { entrou: 110, saiu: 108 } },
      { id: "n7", kind: "delay", x: 240, y: 760, label: "Espera 72h", stats: { entrou: 108, saiu: 108 } },
      { id: "n8", kind: "action", actionType: "criar_tarefa_vendedor", x: 240, y: 900, label: "Tarefa: contato pessoal", stats: { entrou: 90, saiu: 90 } },
      { id: "n9", kind: "exit", x: 240, y: 1040, label: "Fim" },
    ],
    edges: [
      { id: "e1", from: "n1", to: "n2" },
      { id: "e2", from: "n2", to: "n3" },
      { id: "e3", from: "n3", to: "n4" },
      { id: "e4", from: "n4", to: "n5", branch: "sim" },
      { id: "e5", from: "n4", to: "n6", branch: "nao" },
      { id: "e6", from: "n6", to: "n7" },
      { id: "e7", from: "n7", to: "n8" },
      { id: "e8", from: "n8", to: "n9" },
    ],
  },
  {
    id: "jor_003",
    nome: "Pós-clique Meta Ads — qualificação",
    descricao: "Capta leads vindos de anúncios Meta e qualifica antes de passar ao CRM",
    status: "ativa",
    criadaEm: "01/03/2026",
    ultimaEdicao: "10/04/2026",
    responsavel: "Ana Marketing",
    tags: ["meta ads", "qualificação"],
    totalEntraram: 728,
    ativos: 84,
    concluiram: 644,
    conversoes: 198,
    receitaAtribuida: 412000,
    nodes: [
      { id: "n1", kind: "trigger", triggerType: "ad_click", x: 60, y: 60, label: "Clique em campanha Meta", description: "Qualquer campanha ativa", stats: { entrou: 728, saiu: 728 } },
      { id: "n2", kind: "action", actionType: "aplicar_tag", x: 60, y: 200, label: "Tag 'fonte_meta'", stats: { entrou: 728, saiu: 728 } },
      { id: "n3", kind: "delay", x: 60, y: 340, label: "Espera 1h", stats: { entrou: 728, saiu: 728 } },
      { id: "n4", kind: "action", actionType: "enviar_whatsapp", x: 60, y: 480, label: "WhatsApp lookbook", description: "Template: lookbook_share", stats: { entrou: 728, saiu: 712 } },
      { id: "n5", kind: "condition", conditionType: "abriu_email", x: 60, y: 620, label: "Engajou em 7 dias?", stats: { entrou: 712, saiu: 712 } },
      { id: "n6", kind: "action", actionType: "atribuir_vendedor", x: -120, y: 760, label: "Atribuir vendedor", description: "Round-robin por região", stats: { entrou: 198, saiu: 198 } },
      { id: "n7", kind: "action", actionType: "sync_meta_audience", x: 240, y: 760, label: "Sync Meta — não engajados", stats: { entrou: 514, saiu: 514 } },
      { id: "n8", kind: "exit", x: 60, y: 900, label: "Fim" },
    ],
    edges: [
      { id: "e1", from: "n1", to: "n2" },
      { id: "e2", from: "n2", to: "n3" },
      { id: "e3", from: "n3", to: "n4" },
      { id: "e4", from: "n4", to: "n5" },
      { id: "e5", from: "n5", to: "n6", branch: "sim" },
      { id: "e6", from: "n5", to: "n7", branch: "nao" },
      { id: "e7", from: "n6", to: "n8" },
      { id: "e8", from: "n7", to: "n8" },
    ],
  },
  {
    id: "jor_004",
    nome: "Reativação carteira fria",
    descricao: "Reativa lojistas sem compra há mais de 180 dias com sequência de e-mails",
    status: "pausada",
    criadaEm: "15/01/2026",
    ultimaEdicao: "30/03/2026",
    responsavel: "Bruno CRM",
    tags: ["reativação"],
    totalEntraram: 1247,
    ativos: 0,
    concluiram: 1247,
    conversoes: 89,
    receitaAtribuida: 184000,
    nodes: [
      { id: "n1", kind: "trigger", triggerType: "inativo_xdias", x: 60, y: 60, label: "Inativo 180 dias", stats: { entrou: 1247, saiu: 1247 } },
      { id: "n2", kind: "action", actionType: "enviar_email", x: 60, y: 200, label: "E-mail: sentimos sua falta", stats: { entrou: 1247, saiu: 1182 } },
      { id: "n3", kind: "delay", x: 60, y: 340, label: "Espera 5 dias", stats: { entrou: 1182, saiu: 1182 } },
      { id: "n4", kind: "action", actionType: "enviar_email", x: 60, y: 480, label: "E-mail: 10% off retorno", stats: { entrou: 1182, saiu: 1140 } },
      { id: "n5", kind: "exit", x: 60, y: 620, label: "Fim" },
    ],
    edges: [
      { id: "e1", from: "n1", to: "n2" },
      { id: "e2", from: "n2", to: "n3" },
      { id: "e3", from: "n3", to: "n4" },
      { id: "e4", from: "n4", to: "n5" },
    ],
  },
  {
    id: "jor_005",
    nome: "Aniversário do lojista",
    descricao: "Mensagem personalizada com cupom no aniversário do contato principal",
    status: "rascunho",
    criadaEm: "12/04/2026",
    ultimaEdicao: "14/04/2026",
    responsavel: "Ana Marketing",
    tags: ["relacionamento"],
    totalEntraram: 0,
    ativos: 0,
    concluiram: 0,
    conversoes: 0,
    receitaAtribuida: 0,
    nodes: [
      { id: "n1", kind: "trigger", triggerType: "data_calendario", x: 60, y: 60, label: "Aniversário do contato" },
      { id: "n2", kind: "action", actionType: "enviar_whatsapp", x: 60, y: 200, label: "WhatsApp parabéns + cupom" },
      { id: "n3", kind: "exit", x: 60, y: 340, label: "Fim" },
    ],
    edges: [
      { id: "e1", from: "n1", to: "n2" },
      { id: "e2", from: "n2", to: "n3" },
    ],
  },
];

export const statusJornadaCfg: Record<StatusJornada, { label: string; color: string }> = {
  ativa: { label: "Ativa", color: "bg-emerald-500/10 text-emerald-600" },
  pausada: { label: "Pausada", color: "bg-amber-500/10 text-amber-600" },
  rascunho: { label: "Rascunho", color: "bg-muted text-muted-foreground" },
  arquivada: { label: "Arquivada", color: "bg-slate-500/10 text-slate-600" },
};
