// Helpers unificados para a entidade "Ação" (fonte única: TarefaExt no TarefasContext).
// Status é DERIVADO do vencimento (nunca stored manualmente como "em_andamento" ou "atrasada").

import { User, Sparkles, MessageCircle, Target as TargetIcon, type LucideIcon } from "lucide-react";
import type { TarefaExt } from "@/contexts/TarefasContext";

export type OrigemAcao = "vendedor" | "sistema" | "atendimento" | "funil";
export type StatusDerivado = "pendente" | "atrasada" | "concluida" | "cancelada";

// ---- data helpers ("DD/MM/YYYY") ----
export function parseBR(d: string): Date | null {
  const m = d?.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
}
export function formatBR(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
export function addDaysBR(base: string, days: number): string {
  const d = parseBR(base);
  if (!d) return base;
  d.setDate(d.getDate() + days);
  return formatBR(d);
}
// Âncora "hoje" para demonstração (alinhada com o Painel)
export const HOJE_ANCHOR_BR = "14/04/2026";
export const HOJE_ANCHOR = parseBR(HOJE_ANCHOR_BR)!;

export function statusDerivado(t: Pick<TarefaExt, "status" | "vencimento">): StatusDerivado {
  if (t.status === "concluida") return "concluida";
  if (t.status === "cancelada") return "cancelada";
  if (!t.vencimento) return "pendente";
  const d = parseBR(t.vencimento);
  if (!d) return "pendente";
  // compromisso não realizado até o fim do dia -> atrasado a partir do dia seguinte
  if (d.getTime() < HOJE_ANCHOR.getTime()) return "atrasada";
  return "pendente";
}

// ---- Agrupamento temporal para a lente TAREFAS ----
export type GrupoTempo = "atrasadas" | "hoje" | "amanha" | "esta_semana" | "depois" | "sem_data";
export const grupoTempoLabels: Record<GrupoTempo, string> = {
  atrasadas: "Atrasadas",
  hoje: "Hoje",
  amanha: "Amanhã",
  esta_semana: "Esta semana",
  depois: "Depois",
  sem_data: "Sem data",
};
export const grupoTempoOrdem: GrupoTempo[] = ["atrasadas", "hoje", "amanha", "esta_semana", "depois", "sem_data"];

export function grupoDe(t: TarefaExt): GrupoTempo {
  const st = statusDerivado(t);
  if (st === "concluida" || st === "cancelada") return "depois"; // filtrado à parte quando irrelevante
  if (!t.vencimento) return "sem_data";
  const d = parseBR(t.vencimento);
  if (!d) return "sem_data";
  if (st === "atrasada") return "atrasadas";
  const diff = Math.round((d.getTime() - HOJE_ANCHOR.getTime()) / 86400000);
  if (diff === 0) return "hoje";
  if (diff === 1) return "amanha";
  if (diff > 1 && diff <= 7) return "esta_semana";
  return "depois";
}

export function agruparPorTempo(list: TarefaExt[]): Record<GrupoTempo, TarefaExt[]> {
  const base: Record<GrupoTempo, TarefaExt[]> = {
    atrasadas: [], hoje: [], amanha: [], esta_semana: [], depois: [], sem_data: [],
  };
  for (const t of list) base[grupoDe(t)].push(t);
  // dentro de cada grupo: por hora asc e vencimento asc
  for (const k of Object.keys(base) as GrupoTempo[]) {
    base[k].sort((a, b) => {
      const da = parseBR(a.vencimento)?.getTime() ?? Infinity;
      const db = parseBR(b.vencimento)?.getTime() ?? Infinity;
      if (da !== db) return da - db;
      return (a.hora ?? "99").localeCompare(b.hora ?? "99");
    });
  }
  return base;
}

// ---- Origem: metadados visuais ----
export interface OrigemMeta {
  Icon: LucideIcon;
  cls: string;
  tooltip: string;
}
export function origemMeta(origem?: OrigemAcao): OrigemMeta {
  switch (origem) {
    case "sistema":
      return { Icon: Sparkles, cls: "text-purple-500", tooltip: "sugerida pelo sistema" };
    case "atendimento":
      return { Icon: MessageCircle, cls: "text-emerald-500", tooltip: "criada no registro de atendimento" };
    case "funil":
      return { Icon: TargetIcon, cls: "text-orange-500", tooltip: "gerada pelo funil" };
    case "vendedor":
    default:
      return { Icon: User, cls: "text-muted-foreground", tooltip: "criada por você" };
  }
}

// ---- Parse de linguagem natural (quick add) ----
// Retorna campos parcialmente preenchidos a partir de uma frase PT-BR.
export interface ParseNL {
  titulo: string;
  vencimento?: string;
  hora?: string;
  tipo?: string;
  clienteNome?: string;
  clienteId?: string;
  // Quando >1 cliente casa com pontuação equivalente, retorna todos para desambiguação.
  candidatos?: Array<{ id: string; nome: string }>;
}

const diasSemanaMap: Record<string, number> = {
  domingo: 0, dom: 0,
  segunda: 1, seg: 1,
  terca: 2, "terça": 2, ter: 2,
  quarta: 3, qua: 3,
  quinta: 4, qui: 4,
  sexta: 5, sex: 5,
  sabado: 6, "sábado": 6, sab: 6, "sáb": 6,
};

const verboTipoMap: Array<[RegExp, string]> = [
  [/\b(ligar|liga(r)?|telefonar|telefone)\b/i, "ligacao"],
  [/\b(visitar|visita|passar em|ir na)\b/i, "visita"],
  [/\b(enviar|mandar|envio)\b/i, "follow_up"],
  [/\b(cobrar|cobranca|cobrança|retorno)\b/i, "retorno_orcamento"],
  [/\b(reuniao|reunião|reunir|call|meet)\b/i, "reuniao"],
  [/\b(follow[- ]?up|follow)\b/i, "follow_up"],
  [/\b(apresentar|apresentacao|apresentação)\b/i, "apresentacao"],
];

function proximoDiaSemana(alvo: number): string {
  const hoje = new Date(HOJE_ANCHOR.getTime());
  const cur = hoje.getDay();
  let diff = alvo - cur;
  if (diff <= 0) diff += 7;
  hoje.setDate(hoje.getDate() + diff);
  return formatBR(hoje);
}

export function parseAcaoNL(
  input: string,
  clientes: Array<{ id: string; nomeFantasia: string }>,
): ParseNL {
  let text = " " + input.trim() + " ";
  const lower = text.toLowerCase();

  // hora
  let hora: string | undefined;
  const hMatch = lower.match(/\b(?:as?\s+)?(\d{1,2})(?::|h)(\d{0,2})?\b/);
  if (hMatch) {
    const hh = String(Math.min(23, Number(hMatch[1]))).padStart(2, "0");
    const mm = String(Math.min(59, Number(hMatch[2] || "0"))).padStart(2, "0");
    hora = `${hh}:${mm}`;
    text = text.replace(hMatch[0], " ");
  }

  // data
  let vencimento: string | undefined;
  if (/\bhoje\b/i.test(text)) { vencimento = HOJE_ANCHOR_BR; text = text.replace(/\bhoje\b/i, ""); }
  else if (/\b(amanh[aã]|amn)\b/i.test(text)) { vencimento = addDaysBR(HOJE_ANCHOR_BR, 1); text = text.replace(/\b(amanh[aã]|amn)\b/i, ""); }
  else {
    const dm = text.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
    if (dm) {
      const dd = String(Number(dm[1])).padStart(2, "0");
      const mm = String(Number(dm[2])).padStart(2, "0");
      const yyRaw = dm[3];
      const yyyy = yyRaw ? (yyRaw.length === 2 ? `20${yyRaw}` : yyRaw) : String(HOJE_ANCHOR.getFullYear());
      vencimento = `${dd}/${mm}/${yyyy}`;
      text = text.replace(dm[0], " ");
    } else {
      for (const k of Object.keys(diasSemanaMap)) {
        const re = new RegExp(`\\b${k}\\b`, "i");
        if (re.test(text)) {
          vencimento = proximoDiaSemana(diasSemanaMap[k]);
          text = text.replace(re, "");
          break;
        }
      }
    }
  }

  // tipo por verbo
  let tipo: string | undefined;
  for (const [re, t] of verboTipoMap) {
    if (re.test(text)) { tipo = t; break; }
  }

  // cliente — coleta TODOS os candidatos com score > 0
  const cleaned = text.toLowerCase();
  const scored: Array<{ id: string; nome: string; score: number }> = [];
  for (const c of clientes) {
    const nm = c.nomeFantasia.toLowerCase();
    const tokens = nm.split(/\s+/).filter(w => w.length >= 3);
    let score = 0;
    for (const w of tokens) if (cleaned.includes(w)) score += w.length;
    if (cleaned.includes(nm)) score += nm.length * 2;
    if (score > 0) scored.push({ id: c.id, nome: c.nomeFantasia, score });
  }
  scored.sort((a, b) => b.score - a.score);

  let clienteId: string | undefined;
  let clienteNome: string | undefined;
  let candidatos: ParseNL["candidatos"];
  if (scored.length === 1) {
    clienteId = scored[0].id; clienteNome = scored[0].nome;
  } else if (scored.length > 1) {
    // Se houver diferença clara de score (>= 40% acima do 2º), escolhe o topo; caso contrário desambigua.
    const [a, b] = scored;
    if (a.score >= Math.round(b.score * 1.4)) {
      clienteId = a.id; clienteNome = a.nome;
    } else {
      candidatos = scored.slice(0, 5).map(s => ({ id: s.id, nome: s.nome }));
    }
  }

  const titulo = input.trim();
  return { titulo, vencimento, hora, tipo, clienteNome, clienteId, candidatos };
}
