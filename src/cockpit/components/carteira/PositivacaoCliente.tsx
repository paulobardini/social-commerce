// Positivação por cliente — quais marcas cada cliente comprou (positivou) no período.
import { useMemo, useState } from "react";
import { useCockpit } from "../../contexts/CockpitContext";
import { repIdsNoEscopo } from "../../lib/escopo";
import { fmtBRLc, fmtNum, fmtPct } from "../../styles/tokens";
import { SectionCard } from "../SectionCard";
import { Input } from "@/components/ui/input";

type Janela = "periodo" | "12m";

export function PositivacaoCliente() {
  const { seed, escopo, range } = useCockpit();
  const repIds = useMemo(() => repIdsNoEscopo(seed, escopo), [seed, escopo]);

  const [janela, setJanela] = useState<Janela>("periodo");
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<"marcas" | "receita">("marcas");

  const pedidos = useMemo(() => {
    const ini = janela === "periodo"
      ? range.from
      : new Date(seed.hoje.getFullYear(), seed.hoje.getMonth() - 11, 1);
    const fim = janela === "periodo" ? range.to : seed.hoje;
    return seed.pedidos.filter(p => repIds.has(p.repId) && p.data >= ini && p.data <= fim);
  }, [seed, repIds, range, janela]);

  const repNome = useMemo(() => new Map(seed.representantes.map(r => [r.id, r.nome])), [seed]);

  const linhas = useMemo(() => {
    const contas = seed.contas.filter(c => repIds.has(c.repId));
    const porConta = new Map<string, Map<string, number>>();
    pedidos.forEach(p => {
      if (!porConta.has(p.contaId)) porConta.set(p.contaId, new Map());
      const m = porConta.get(p.contaId)!;
      m.set(p.marcaId, (m.get(p.marcaId) ?? 0) + p.valor);
    });
    const arr = contas.map(c => {
      const m = porConta.get(c.id) ?? new Map<string, number>();
      const receita = [...m.values()].reduce((s, v) => s + v, 0);
      return {
        contaId: c.id,
        razao: c.razao,
        uf: c.uf,
        rep: repNome.get(c.repId) ?? "—",
        porMarca: m,
        marcas: m.size,
        receita,
      };
    }).filter(l => l.marcas > 0);

    arr.sort((a, b) => ordem === "marcas"
      ? b.marcas - a.marcas || b.receita - a.receita
      : b.receita - a.receita);

    const q = busca.trim().toLowerCase();
    return q ? arr.filter(l => l.razao.toLowerCase().includes(q)) : arr;
  }, [seed, repIds, pedidos, repNome, ordem, busca]);

  const totalBase = seed.contas.filter(c => repIds.has(c.repId)).length || 1;
  const mediaMarcas = linhas.length ? linhas.reduce((s, l) => s + l.marcas, 0) / linhas.length : 0;
  const porMarcaTotal = useMemo(
    () => seed.marcas.map(m => ({
      id: m.id,
      nome: m.nome,
      clientes: linhas.filter(l => l.porMarca.has(m.id)).length,
    })),
    [seed.marcas, linhas],
  );

  const visiveis = linhas.slice(0, 30);

  return (
    <SectionCard
      title="Positivação por cliente"
      subtitle="Quais marcas cada cliente positivou (comprou) — base para cross-sell"
      action={
        <div className="flex flex-wrap items-center gap-1.5">
          {([["periodo", "Período"], ["12m", "12 meses"]] as const).map(([k, label]) => (
            <button key={k} type="button" onClick={() => setJanela(k)}
              className={`px-2 py-1 rounded text-[10px] border transition ${
                janela === k ? "bg-[#2D3A8C] text-white border-[#2D3A8C]" : "bg-white nx-muted border-[#E7E9EE] hover:border-[#2D3A8C]"
              }`}>{label}</button>
          ))}
          {([["marcas", "Mais marcas"], ["receita", "Maior receita"]] as const).map(([k, label]) => (
            <button key={k} type="button" onClick={() => setOrdem(k)}
              className={`px-2 py-1 rounded text-[10px] border transition ${
                ordem === k ? "bg-[#2D3A8C] text-white border-[#2D3A8C]" : "bg-white nx-muted border-[#E7E9EE] hover:border-[#2D3A8C]"
              }`}>{label}</button>
          ))}
          <Input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar cliente" className="h-7 w-[150px] text-[11px]" />
        </div>
      }
    >
      <div className="flex flex-wrap gap-4 mb-3 text-[11px]">
        <div><span className="nx-muted">Clientes positivados: </span><span className="font-semibold nx-num">{fmtNum(linhas.length)}</span> <span className="nx-muted">de {fmtNum(totalBase)} ({fmtPct((linhas.length / totalBase) * 100, 0)})</span></div>
        <div><span className="nx-muted">Média de marcas por cliente: </span><span className="font-semibold nx-num">{mediaMarcas.toFixed(1).replace(".", ",")}</span></div>
        <div><span className="nx-muted">Clientes com 1 só marca: </span><span className="font-semibold nx-num">{fmtNum(linhas.filter(l => l.marcas === 1).length)}</span></div>
      </div>

      {linhas.length === 0 ? (
        <p className="text-xs nx-muted py-6 text-center">Nenhum cliente positivado nesse recorte.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-[#E7E9EE]">
                <th className="text-left font-medium nx-muted pb-1.5 pr-2 sticky left-0 bg-white">Cliente</th>
                {seed.marcas.map(m => (
                  <th key={m.id} className="font-medium nx-muted text-center pb-1.5 px-1 whitespace-nowrap">{m.nome}</th>
                ))}
                <th className="font-medium nx-muted text-center pb-1.5 px-1">Marcas</th>
                <th className="font-medium nx-muted text-right pb-1.5 pl-2">Receita</th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map(l => (
                <tr key={l.contaId} className="border-b border-[#F1F3F8] last:border-0">
                  <td className="py-1 pr-2 nx-text font-medium whitespace-nowrap sticky left-0 bg-white">
                    {l.razao} <span className="nx-muted font-normal">· {l.uf} · {l.rep}</span>
                  </td>
                  {seed.marcas.map(m => {
                    const v = l.porMarca.get(m.id) ?? 0;
                    return (
                      <td key={m.id} className="p-0.5">
                        <div
                          className={`h-7 rounded text-center flex items-center justify-center nx-num ${v ? "font-medium" : ""}`}
                          style={{ background: v ? "rgba(45, 58, 140, 0.85)" : "#F6F7F9", color: v ? "#fff" : "#94A3B8" }}
                          title={v ? `${l.razao} · ${m.nome}: ${fmtBRLc(v)}` : `${l.razao} não positivou ${m.nome}`}
                        >
                          {v ? fmtBRLc(v) : "—"}
                        </div>
                      </td>
                    );
                  })}
                  <td className="text-center nx-num font-semibold">{l.marcas}/{seed.marcas.length}</td>
                  <td className="text-right pl-2 nx-num font-semibold whitespace-nowrap">{fmtBRLc(l.receita)}</td>
                </tr>
              ))}
              <tr className="border-t border-[#E7E9EE]">
                <td className="py-1.5 pr-2 font-semibold nx-text sticky left-0 bg-white">Clientes por marca</td>
                {porMarcaTotal.map(m => (
                  <td key={m.id} className="text-center nx-num font-semibold px-1">{fmtNum(m.clientes)}</td>
                ))}
                <td /><td />
              </tr>
            </tbody>
          </table>
          <p className="text-[10px] nx-muted mt-2">
            Célula preenchida = marca positivada no recorte. {linhas.length > visiveis.length ? `Exibindo os ${visiveis.length} primeiros de ${fmtNum(linhas.length)} clientes.` : ""}
          </p>
        </div>
      )}
    </SectionCard>
  );
}
