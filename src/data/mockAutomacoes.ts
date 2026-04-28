// Followup Automation Mocks
import type { OportunidadeEtapa } from "./mockCRM";

export type AutomacaoTipoTarefa =
  | "ligacao"
  | "whatsapp"
  | "email"
  | "visita"
  | "proposta"
  | "personalizado";

export const automacaoTipoLabels: Record<AutomacaoTipoTarefa, string> = {
  ligacao: "Ligação",
  whatsapp: "WhatsApp",
  email: "E-mail",
  visita: "Visita presencial",
  proposta: "Envio de proposta",
  personalizado: "Personalizado",
};

export interface AutomacaoTarefa {
  id: string;
  nome: string;
  tipo: AutomacaoTipoTarefa;
  intervaloDias: number; // dias desde a tarefa anterior (primeira = 0)
  responsavelPadrao?: string;
}

export interface Automacao {
  id: string;
  nome: string;
  descricao: string;
  etapasVinculadas: OportunidadeEtapa[];
  isPosVenda?: boolean;
  tarefas: AutomacaoTarefa[];
  createdAt: string;
}

export interface AutomacaoAplicada {
  id: string;
  oportunidadeId: string;
  automacaoId: string;
  automacaoNome: string;
  dataAplicacao: string; // dd/mm/yyyy hh:mm
  aplicadaPor: string;
  encerradaEm?: string;
}

export const mockAutomacoes: Automacao[] = [
  {
    id: "auto1",
    nome: "Followup Proposta Enviada",
    descricao: "Sequência de 3 contatos após envio do orçamento para garantir retorno do cliente.",
    etapasVinculadas: ["orcamento_enviado"],
    tarefas: [
      { id: "at1", nome: "Confirmar recebimento do orçamento", tipo: "whatsapp", intervaloDias: 0, responsavelPadrao: "Paulo Bardini" },
      { id: "at2", nome: "Ligar para tirar dúvidas", tipo: "ligacao", intervaloDias: 2, responsavelPadrao: "Paulo Bardini" },
      { id: "at3", nome: "Follow-up final por e-mail", tipo: "email", intervaloDias: 3, responsavelPadrao: "Paulo Bardini" },
    ],
    createdAt: "01/03/2026",
  },
  {
    id: "auto2",
    nome: "Reativação de Lead Frio",
    descricao: "Cadência para reativar leads que ficaram parados no funil.",
    etapasVinculadas: ["novo_lead", "contato_iniciado"],
    tarefas: [
      { id: "at4", nome: "Mensagem de reativação no WhatsApp", tipo: "whatsapp", intervaloDias: 0 },
      { id: "at5", nome: "Ligar para apresentar novidades", tipo: "ligacao", intervaloDias: 3 },
      { id: "at6", nome: "Enviar catálogo atualizado", tipo: "email", intervaloDias: 4 },
      { id: "at7", nome: "Última tentativa", tipo: "whatsapp", intervaloDias: 5 },
    ],
    createdAt: "05/03/2026",
  },
  {
    id: "auto3",
    nome: "Qualificação inicial",
    descricao: "Primeiros contatos para qualificar um novo lead.",
    etapasVinculadas: ["novo_lead"],
    tarefas: [
      { id: "at8", nome: "Apresentação inicial via WhatsApp", tipo: "whatsapp", intervaloDias: 0 },
      { id: "at9", nome: "Ligação de qualificação", tipo: "ligacao", intervaloDias: 1 },
      { id: "at10", nome: "Enviar material institucional", tipo: "email", intervaloDias: 2 },
    ],
    createdAt: "10/03/2026",
  },
  {
    id: "auto4",
    nome: "Pós-venda padrão",
    descricao: "Acompanhamento do cliente após o fechamento da venda.",
    etapasVinculadas: ["ganho"],
    isPosVenda: true,
    tarefas: [
      { id: "at11", nome: "Confirmar dados de entrega", tipo: "whatsapp", intervaloDias: 0 },
      { id: "at12", nome: "Acompanhar chegada do pedido", tipo: "ligacao", intervaloDias: 7 },
      { id: "at13", nome: "Pesquisa de satisfação", tipo: "email", intervaloDias: 7 },
      { id: "at14", nome: "Visita pós-venda", tipo: "visita", intervaloDias: 14 },
    ],
    createdAt: "15/03/2026",
  },
];

export const mockAutomacoesAplicadas: AutomacaoAplicada[] = [
  {
    id: "aa1",
    oportunidadeId: "op3",
    automacaoId: "auto1",
    automacaoNome: "Followup Proposta Enviada",
    dataAplicacao: "28/03/2026 17:05",
    aplicadaPor: "Paulo Bardini",
  },
];
