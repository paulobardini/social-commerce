// Vendas de produto por cliente e por mês — matriz cliente × mês para o produto/marca escolhido.
import { useMemo, useState } from "react";
import { useCockpit } from "../../contexts/CockpitContext";
import { repIdsNoEscopo } from "../../lib/escopo";
import { fmtBRLc, fmtNum } from "../../styles/tokens";
import { SectionCard } from "../SectionCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MESES_ABR = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const mesKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const mesLabel = (d: Date) => `${MESES_ABR[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;

export function VendasProdutoCliente() {
  const { seed, escopo } = useCockpit();
  const repIds = useMemo(() => repIdsNoEscopo(seed, escopo), [seed, escopo]);

  const [marcaId, setMarcaId] = useState<string>("todas");
  const [produtoId, setProdutoId] = useState<string>("todos");
  const [metrica, setMetrica] = useState<"valor" | "itens">("valor");
  const [busca, setBusca] = useState("");

  // últimos 12 meses (do mais antigo ao mais recente)
  const meses = useMemo(() => {
    const base = new Date(seed.hoje.getFullYear(), seed.hoje.getMonth(), 1);
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(base.getFullYear(), base.getMonth() - (11 - i), 1);
      return { key: mesKey(d), label: mesLabel(d) };
    });
  }, [seed.hoje]);

  const pedidosEscopo = useMemo(() => {
    const inicio = new Date(seed.hoje.getFullYear(), seed.hoje.getMonth() - 11, 1);
    return seed.pedidos.filter(p => repIds.has(p.repId) && p.data >= inicio);
  }, [seed, repIds]);

  // produtos disponíveis conforme marca selecionada
  const produtosDisponiveis = useMemo(() => {
    const set = new Set(
      pedidosEscopo.filter(p => marcaId === "todas" || p.marcaId === marcaId).map(p => p.produtoId),
    );
    return [...set].sort();
  }, [pedidosEscopo, marcaId]);

  const filtrados = useMemo(
    () => pedidosEscopo.filter(p =>
      (marcaId === "todas" || p.marcaId === marcaId) &&
      (produtoId === "todos" || p.produtoId === produtoId),
    ),
    [pedidosEscopo, marcaId, produtoId],
  );

  const contaNome = useMemo(() => new Map(seed.contas.map(c => [c.id, c])), [seed]);

  const linhas = useMemo(() => {
    const map = new Map<string, { contaId: string; razao: string; uf: string; cells: Map<string, number>; total: number }>();
    filtrados.forEach(p => {
      const conta = contaNome.get(p.contaId);
      const cur = map.get(p.contaId) ?? {
        contaId: p.contaId,
        razao: conta?.razao ?? p.contaId,
        uf: conta?.uf ?? "—",
        cells: new Map<string, number>(),
        total: 0,
      };
      const k = mesKey(p.data);
      const v = metrica === "valor" ? p.valor : p.itens;
      cur.cells.set(k, (cur.cells.get(k) ?? 0) + v);
      cur.total += v;
      map.set(p.contaId, cur);
    });
    const arr = [...map.values()].sort((a, b) => b.total - a.total);
    const q = busca.trim().toLowerCase();
    return q ? arr.filter(l => l.razao.toLowerCase().includes(q)) : arr;
  }, [filtrados, contaNome, metrica, busca]);

  const totaisMes = useMemo(
    () => meses.map(m => linhas.reduce((s, l) => s + (l.cells.get(m.key) ?? 0), 0)),
    [linhas, meses],
  );
  const totalGeral = linhas.reduce((s, l) => s + l.total, 0);
  const maxCell = Math.max(1, ...linhas.flatMap(l => meses.map(m => l.cells.get(m.key) ?? 0)));
  const fmt = (n: number) => (metrica === "valor" ? fmtBRLc(n) : fmtNum(n));

  const visiveis = linhas.slice(0, 25);

  return (
    <SectionCard
      title="Vendas por produto e cliente"
      subtitle="Quem comprou cada produto e em quais meses — últimos 12 meses no escopo selecionado"
      action={
        <div className="flex flex-wrap items-center gap-1.5">
          <Select value={marcaId} onValueChange={(v) => { setMarcaId(v); setProdutoId("todos"); }}>
            <SelectTrigger className="h-7 w-[150px] text-[11px]"><SelectValue placeholder="Marca" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as marcas</SelectItem>
              {seed.marcas.map(m => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={produtoId} onValueChange={setProdutoId}>
            <SelectTrigger className="h-7 w-[140px] text-[11px]"><SelectValue placeholder="Produto" /></SelectTrigger>
            <SelectContent className="max-h-[280px]">
              <SelectItem value="todos">Todos os produtos</SelectItem>
              {produtosDisponiveis.map(p => <SelectItem key={p} value={p}>{p.toUpperCase()}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            {([["valor", "R$"], ["itens", "Peças"]] as const).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setMetrica(k)}
                className={`px-2 py-1 rounded text-[10px] border transition ${
                  metrica === k ? "bg-[#2D3A8C] text-white border-[#2D3A8C]" : "bg-white nx-muted border-[#E7E9EE] hover:border-[#2D3A8C]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <Input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar cliente"
            className="h-7 w-[150px] text-[11px]"
          />
        </div>
      }
    >
      {linhas.length === 0 ? (
        <p className="text-xs nx-muted py-6 text-center">Nenhuma venda encontrada para esse filtro nos últimos 12 meses.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-[#E7E9EE]">
                <th className="text-left font-medium nx-muted pb-1.5 pr-2 sticky left-0 bg-white">Cliente</th>
                {meses.map(m => (
                  <th key={m.key} className="font-medium nx-muted text-center pb-1.5 px-1 whitespace-nowrap">{m.label}</th>
                ))}
                <th className="font-medium nx-muted text-right pb-1.5 pl-2 whitespace-nowrap">Total</th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map(l => (
                <tr key={l.contaId} className="border-b border-[#F1F3F8] last:border-0">
                  <td className="py-1 pr-2 nx-text font-medium whitespace-nowrap sticky left-0 bg-white">
                    {l.razao} <span className="nx-muted font-normal">· {l.uf}</span>
                  </td>
                  {meses.map(m => {
                    const v = l.cells.get(m.key) ?? 0;
                    const intensity = v / maxCell;
                    return (
                      <td key={m.key} className="p-0.5">
                        <div
                          className="h-7 rounded text-center flex items-center justify-center nx-num"
                          style={{
                            background: v ? `rgba(45, 58, 140, ${0.08 + intensity * 0.8})` : "transparent",
                            color: intensity > 0.5 ? "#fff" : "#0F172A",
                          }}
                          title={`${l.razao} · ${m.label}: ${fmt(v)}`}
                        >
                          {v ? fmt(v) : <span className="nx-muted">—</span>}
                        </div>
                      </td>
                    );
                  })}
                  <td className="text-right pl-2 nx-num font-semibold whitespace-nowrap">{fmt(l.total)}</td>
                </tr>
              ))}
              <tr className="border-t border-[#E7E9EE]">
                <td className="py-1.5 pr-2 font-semibold nx-text sticky left-0 bg-white">Total</td>
                {totaisMes.map((t, i) => (
                  <td key={i} className="text-center nx-num font-semibold px-1 whitespace-nowrap">{t ? fmt(t) : "—"}</td>
                ))}
                <td className="text-right pl-2 nx-num font-semibold whitespace-nowrap">{fmt(totalGeral)}</td>
              </tr>
            </tbody>
          </table>
          <p className="text-[10px] nx-muted mt-2">
            {fmtNum(linhas.length)} cliente(s) com compra{linhas.length > visiveis.length ? ` · exibindo os ${visiveis.length} maiores` : ""}.
          </p>
        </div>
      )}
    </SectionCard>
  );
}
