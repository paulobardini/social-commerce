// Seed de auditoria de aprovações (histórico do gestor) — demonstração.
import type { AprovacaoLog } from "@/cockpit/lib/decisoes";

const iso = (diasAtras: number, hora: number, min = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  d.setHours(hora, min, 0, 0);
  return d.toISOString();
};

export function seedAprovacoesLog(): AprovacaoLog[] {
  return [
    { id: "apv-seed-1", orcamentoId: "orc-091", motivo: "fora_da_politica", decisao: "devolvido", gestorId: "gestor-atual", timestamp: iso(9, 9, 20), nota: "Desconto 35% sem mínimo. Refazer com 22% ou completar a grade." },
    { id: "apv-seed-2", orcamentoId: "orc-091", motivo: "fora_da_politica", decisao: "aprovado", gestorId: "gestor-atual", timestamp: iso(8, 11, 5), nota: "2ª rodada ok — mínimo atingido após ajuste do rep." },
    { id: "apv-seed-3", orcamentoId: "orc-104", motivo: "fora_da_politica", decisao: "reprovado", gestorId: "gestor-atual", timestamp: iso(7, 15, 40), nota: "Margem final abaixo do piso da categoria básicos." },
    { id: "apv-seed-4", orcamentoId: "orc-122", motivo: "credito_cliente_novo", decisao: "solicitar_docs", gestorId: "gestor-atual", timestamp: iso(6, 10, 15), nota: "Faltou contrato social e comprovante de endereço." },
    { id: "apv-seed-5", orcamentoId: "orc-122", motivo: "credito_cliente_novo", decisao: "aprovado", gestorId: "gestor-atual", timestamp: iso(4, 8, 50), nota: "Docs recebidos — limite inicial de R$ 15k liberado." },
    { id: "apv-seed-6", orcamentoId: "orc-129", motivo: "credito_cliente_novo", decisao: "reprovado", gestorId: "gestor-atual", timestamp: iso(3, 17, 10), nota: "Restrição ativa no CNPJ. Só à vista/antecipado." },
    { id: "apv-seed-7", orcamentoId: "orc-133", motivo: "aguardando_estoque", decisao: "notificar_estoque", gestorId: "gestor-atual", timestamp: iso(2, 9, 0), nota: "Reposição solicitada à marca — ETA 12/05." },
    { id: "apv-seed-8", orcamentoId: "orc-137", motivo: "aguardando_estoque", decisao: "cancelado", gestorId: "gestor-atual", timestamp: iso(1, 16, 30), nota: "Sem previsão da fábrica. Rep vai oferecer alternativa." },
    { id: "apv-seed-9", orcamentoId: "orc-118", motivo: "fora_da_politica", decisao: "aprovado", gestorId: "gestor-atual", timestamp: iso(0, 10, 45), nota: "Prazo estendido aprovado por volume (R$ 32,5k)." },
  ];
}
