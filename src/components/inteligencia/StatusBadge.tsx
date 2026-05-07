import { StatusInteligente } from "@/data/mockInteligencia";

const map: Record<string, string> = {
  "Produto estrela": "bg-primary/10 text-primary border-primary/20",
  "Alto giro": "bg-sky-500/10 text-sky-700 border-sky-500/20",
  "Recompra sugerida": "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
  "Risco de ruptura": "bg-rose-500/10 text-rose-700 border-rose-500/30",
  "Estoque parado": "bg-amber-500/10 text-amber-700 border-amber-500/30",
  "Margem em atenção": "bg-orange-500/10 text-orange-700 border-orange-500/30",
  "Boa margem": "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  "Performance neutra": "bg-slate-500/10 text-slate-600 border-slate-500/20",
  Liquidar: "bg-rose-500/10 text-rose-700 border-rose-500/30",
  "Revisar preço": "bg-violet-500/10 text-violet-700 border-violet-500/20",
  "Criar campanha": "bg-accent/10 text-accent border-accent/20",
  "Renegociar fornecedor": "bg-amber-500/10 text-amber-700 border-amber-500/30",
  Recomprar: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
  "Recomprar urgente": "bg-rose-500/10 text-rose-700 border-rose-500/30",
  "Reduzir desconto": "bg-orange-500/10 text-orange-700 border-orange-500/30",
  Monitorar: "bg-slate-500/10 text-slate-600 border-slate-500/20",
};

export function StatusBadge({ status }: { status: StatusInteligente | string }) {
  const cls = map[status] ?? "bg-secondary text-secondary-foreground border-border";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${cls}`}>
      {status}
    </span>
  );
}
