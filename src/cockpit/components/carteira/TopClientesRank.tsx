// CLIENTES QUE SUSTENTAM A RECEITA — top 20 por valor 12m com barra proporcional.
import type { ContaClassificada } from "../../lib/classificar";
import { fmtBRLc, fmtPct, STATUS_COLORS } from "../../styles/tokens";
import { useNavigate } from "react-router-dom";

interface Props {
  classificadas: ContaClassificada[];
  representantes: { id: string; nome: string }[];
}

export function TopClientesRank({ classificadas, representantes }: Props) {
  const navigate = useNavigate();
  const comValor = classificadas.filter(c => c.valor12m > 0).sort((a, b) => b.valor12m - a.valor12m);
  const total = comValor.reduce((s, c) => s + c.valor12m, 0) || 1;
  const top20 = comValor.slice(0, 20);
  const somaTop20 = top20.reduce((s, c) => s + c.valor12m, 0);
  const pctTop20 = (somaTop20 / total) * 100;
  const pctBase = comValor.length > 0 ? (20 / comValor.length) * 100 : 0;
  const max = top20[0]?.valor12m ?? 1;

  const statusLabel: Record<string, string> = { ativo: "Ativo", inativo: "Inativo", perdido: "Perdido", lead: "Lead" };

  return (
    <div className="space-y-3">
      <div className="p-2.5 rounded-md bg-[#E8EAF6] border border-[#C7CBE6] text-[12px] text-[#1E2660]">
        <span className="font-semibold">{fmtPct(pctBase, 0)} dos clientes geram {fmtPct(pctTop20, 0)} da receita</span> — os 20 abaixo respondem por {fmtBRLc(somaTop20)} nos últimos 12 meses.
      </div>

      <div className="space-y-1">
        {top20.map((c, i) => {
          const w = (c.valor12m / max) * 100;
          const rep = representantes.find(r => r.id === c.conta.repId)?.nome ?? "—";
          const statusColor = STATUS_COLORS[c.status] ?? "#94A3B8";
          return (
            <button
              key={c.conta.id}
              type="button"
              onClick={() => navigate(`/vendedor/cliente/${c.conta.id}`)}
              className="w-full text-left group"
            >
              <div className="flex items-center gap-2 py-1">
                <span className="w-5 text-[10px] nx-muted nx-num text-right shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: statusColor }} title={statusLabel[c.status]} />
                      <span className="text-xs nx-text truncate group-hover:text-[#2D3A8C] group-hover:underline">{c.conta.razao}</span>
                    </div>
                    <span className="text-xs font-semibold nx-num nx-text shrink-0">{fmtBRLc(c.valor12m)}</span>
                  </div>
                  <div className="relative h-1.5 bg-[#F1F3F8] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.max(w, 2)}%`, background: statusColor }} />
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px] nx-muted truncate">{rep} · {c.conta.nicho}</span>
                    <span className="text-[10px] nx-muted nx-num">{c.recencia === Infinity ? "sem pedido" : `${c.recencia}d sem comprar`}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
