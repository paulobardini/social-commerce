// FLUXO DA CARTEIRA no período — quantos clientes mudaram de situação.
// Substitui o "Funil de retenção" (perder cliente não é conversão).
import type { ContaClassificada } from "../../lib/classificar";
import { fmtNum } from "../../styles/tokens";
import { ArrowRight, ArrowDown, RefreshCw } from "lucide-react";

interface Props {
  classificadas: ContaClassificada[];
  diasAtivo: number;
}

export function FluxoCarteira({ classificadas, diasAtivo }: Props) {
  const ativos = classificadas.filter(c => c.status === "ativo").length;
  const emRisco = classificadas.filter(c => c.status === "ativo" && c.recencia > diasAtivo * 0.7).length;
  const inativos = classificadas.filter(c => c.status === "inativo").length;
  const perdidos = classificadas.filter(c => c.status === "perdido").length;
  const reativados = classificadas.filter(c => c.reativadoNoPeriodo).length;

  const blocos = [
    { label: "Ativos", value: ativos, color: "#16A34A", fg: "#fff" },
    { label: "Em risco", value: emRisco, color: "#F59E0B", fg: "#fff" },
    { label: "Inativos", value: inativos, color: "#DC2626", fg: "#fff" },
    { label: "Perdidos", value: perdidos, color: "#7F1D1D", fg: "#fff" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-stretch gap-2 flex-wrap md:flex-nowrap">
        {blocos.map((b, i) => (
          <div key={b.label} className="flex items-stretch gap-2 flex-1 min-w-[110px]">
            <div className="flex-1 rounded-md p-2.5 flex flex-col items-center justify-center" style={{ background: b.color, color: b.fg }}>
              <p className="text-[10px] uppercase tracking-wide opacity-90 font-medium">{b.label}</p>
              <p className="text-2xl font-bold nx-num">{fmtNum(b.value)}</p>
            </div>
            {i < blocos.length - 1 && <ArrowRight className="h-5 w-5 nx-muted self-center shrink-0" />}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between p-2.5 rounded-md bg-emerald-50 border border-emerald-200">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center">
            <RefreshCw className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-[11px] text-emerald-900 font-medium">Recuperados no período</p>
            <p className="text-[10px] text-emerald-700">Inativos/perdidos que voltaram a comprar</p>
          </div>
        </div>
        <p className="text-2xl font-bold nx-num text-emerald-700">{fmtNum(reativados)}</p>
      </div>

      <p className="text-[10px] nx-muted">
        Leitura da esquerda para a direita: quanto mais tempo sem comprar, mais o cliente escorrega. Recuperar um cliente perdido custa muito mais do que reter um em risco.
      </p>
    </div>
  );
}
