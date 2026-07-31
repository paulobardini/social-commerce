// Seed de demonstração para Planos de Recuperação (gestor ↔ representante).
import type { PlanoRecuperacao } from "@/lib/planos";
import { addBusinessHours } from "@/lib/planos";

const iso = (diasAtras: number, hora = 9) => {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  d.setHours(hora, 0, 0, 0);
  return d.toISOString();
};

const br = (dias: number) => {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

export function seedPlanos(): PlanoRecuperacao[] {
  return [
    // 1) Ativo, com compromissos em andamento
    {
      id: "plano-seed-1",
      repId: "rep1",
      repNome: "Paulo Bardini",
      tipo: "cliente_risco",
      contexto: { clienteId: "cli1", clienteNome: "Rei das Crianças", valor: 184000 },
      notaGestor: "Cliente top 5 sem pedido há 68 dias. Preciso do seu plano de resgate até amanhã.",
      gestorId: "gestor-atual",
      solicitadoEm: iso(6),
      prazoResposta: addBusinessHours(iso(6), 24),
      respondidoEm: iso(5, 14),
      diagnostico: "Perdemos a compradora principal; retomar via nova compradora (Juliana).",
      status: "ativo",
      compromissos: [
        { id: "plano-seed-1-c0", tipo: "resgatar_cliente", descricao: "Resgatar Rei das Crianças — atendimento imediato", clienteId: "cli1", clienteNome: "Rei das Crianças", prazo: br(-1), concluido: true },
        { id: "plano-seed-1-c1", tipo: "visita", descricao: "Visita presencial com mostruário Alto Verão", clienteId: "cli1", clienteNome: "Rei das Crianças", prazo: br(3), concluido: false },
      ],
      log: [
        { ts: iso(6), autor: "gestor", texto: "Plano solicitado: cliente top 5 sem pedido há 68 dias." },
        { ts: iso(5, 14), autor: "rep", texto: "Plano respondido: perdemos a compradora principal." },
        { ts: iso(1, 10), autor: "sistema", texto: "Compromisso concluído: atendimento realizado." },
      ],
    },

    // 2) Aguardando resposta (dentro do prazo)
    {
      id: "plano-seed-2",
      repId: "rep3",
      repNome: "Ricardo Alves",
      tipo: "ritmo",
      contexto: { pace: 62, coberturaDelta: -14 },
      notaGestor: "Pace em 62% do mês e cobertura caiu 14pp. Me manda o plano de recuperação de ritmo.",
      gestorId: "gestor-atual",
      solicitadoEm: iso(0, 8),
      prazoResposta: addBusinessHours(iso(0, 8), 24),
      status: "aguardando_resposta",
      compromissos: [],
      log: [{ ts: iso(0, 8), autor: "gestor", texto: "Plano solicitado: recuperação de ritmo." }],
    },

    // 3) Escalado (SLA estourado, sem resposta)
    {
      id: "plano-seed-3",
      repId: "rep7",
      repNome: "João Pedro Oliveira",
      tipo: "ritmo",
      contexto: { pace: 48, coberturaDelta: -22 },
      notaGestor: "Carteira parada: 3 clientes em risco e cobertura em queda. Preciso do plano hoje.",
      gestorId: "gestor-atual",
      solicitadoEm: iso(4),
      prazoResposta: addBusinessHours(iso(4), 24),
      status: "escalado",
      compromissos: [],
      log: [
        { ts: iso(4), autor: "gestor", texto: "Plano solicitado: carteira parada." },
        { ts: iso(3), autor: "sistema", texto: "Sem resposta do rep no prazo (24h úteis) — escalado." },
      ],
    },

    // 4) Concluído
    {
      id: "plano-seed-4",
      repId: "rep2",
      repNome: "Mariana Costa",
      tipo: "cliente_risco",
      contexto: { clienteId: "cli4", clienteNome: "Super Baby Store", valor: 96000 },
      notaGestor: "Queda de 40% no volume vs. semestre anterior. Plano de retomada, por favor.",
      gestorId: "gestor-atual",
      solicitadoEm: iso(21),
      prazoResposta: addBusinessHours(iso(21), 24),
      respondidoEm: iso(20, 11),
      diagnostico: "Queda por ruptura de grade; realinhar mix e antecipar pré-venda.",
      status: "concluido",
      compromissos: [
        { id: "plano-seed-4-c0", tipo: "enviar_proposta", descricao: "Enviar proposta de pré-venda Inverno", clienteId: "cli4", clienteNome: "Super Baby Store", prazo: br(-12), concluido: true },
        { id: "plano-seed-4-c1", tipo: "visita", descricao: "Visita de alinhamento de mix", clienteId: "cli4", clienteNome: "Super Baby Store", prazo: br(-6), concluido: true },
      ],
      encerradoEm: iso(5, 16),
      notaEncerramento: "Cliente voltou a comprar — pedido de R$ 38k faturado.",
      encerradoAuto: false,
      log: [
        { ts: iso(21), autor: "gestor", texto: "Plano solicitado: queda de 40% no volume." },
        { ts: iso(20, 11), autor: "rep", texto: "Plano respondido: ruptura de grade." },
        { ts: iso(5, 16), autor: "gestor", texto: "Encerrado (manual): cliente voltou a comprar." },
      ],
    },
  ];
}
