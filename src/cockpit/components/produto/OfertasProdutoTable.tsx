// Produtos mais oferecidos — dados de envio de produtos (links/catálogos) e
// trackeamento de aberturas até a conversão em pedido.
import { useMemo, useState } from "react";
import { fmtBRLc, fmtNum, fmtPct, NX } from "../../styles/tokens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { OfertaProduto, OfertaResumo } from "../../lib/ofertas";

interface Props {
  lista: OfertaProduto[];
  resumo: OfertaResumo;
}

type Ord = "envios" | "conversao" | "aberturas" | "receita";

export function OfertasProdutoTable({ lista, resumo }: Props) {
  const [ord, setOrd] = useState<Ord>("envios");
  const [todos, setTodos] = useState(false);

  const ordenada = useMemo(() => {
    const arr = [...lista];
    if (ord === "conversao") arr.sort((a, b) => b.conversao - a.conversao);
    else if (ord === "aberturas") arr.sort((a, b) => b.taxaAbertura - a.taxaAbertura);
    else if (ord === "receita") arr.sort((a, b) => b.receita - a.receita);
    else arr.sort((a, b) => b.envios - a.envios);
    return todos ? arr : arr.slice(0, 12);
  }, [lista, ord, todos]);

  const maxEnvios = Math.max(1, ...lista.map(o => o.envios));

  const OrdBtn = ({ k, label }: { k: Ord; label: string }) => (
    <button
      type="button"
      onClick={() => setOrd(k)}
      className={`px-2 py-1 rounded text-[10px] border transition ${
        ord === k ? "bg-[#2D3A8C] text-white border-[#2D3A8C]" : "bg-white nx-muted border-[#E7E9EE] hover:border-[#2D3A8C]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-[10px] uppercase nx-muted mr-1">Ordenar por</span>
        <OrdBtn k="envios" label="Mais oferecidos" />
        <OrdBtn k="aberturas" label="Taxa de abertura" />
        <OrdBtn k="conversao" label="Conversão" />
        <OrdBtn k="receita" label="Receita" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-[10px] uppercase nx-muted border-b border-[#E7E9EE]">
            <tr>
              <th className="text-left py-2">Produto</th>
              <th className="text-left">Marca</th>
              <th className="text-right">Envios</th>
              <th className="text-right">Clientes</th>
              <th className="text-right">Abertura</th>
              <th className="text-right">Pedidos</th>
              <th className="text-right">Conversão</th>
              <th className="text-right pr-1">Receita</th>
            </tr>
          </thead>
          <tbody>
            {ordenada.map(o => {
              const acima = o.conversao >= resumo.conversaoMedia;
              return (
                <tr key={o.produtoId} className="border-b border-[#F1F3F8]">
                  <td className="py-2 nx-text font-medium whitespace-nowrap">{o.produtoNome}</td>
                  <td className="nx-muted whitespace-nowrap">{o.marcaNome}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="hidden md:block w-16 h-1.5 rounded bg-[#F1F3F8] overflow-hidden">
                        <div className="h-full rounded" style={{ width: `${(o.envios / maxEnvios) * 100}%`, background: NX.primary }} />
                      </div>
                      <span className="nx-num nx-text">{fmtNum(o.envios)}</span>
                    </div>
                  </td>
                  <td className="text-right nx-num nx-muted">{fmtNum(o.clientesAlvo)}</td>
                  <td className="text-right nx-num nx-muted">{fmtPct(o.taxaAbertura, 0)}</td>
                  <td className="text-right nx-num nx-text">{fmtNum(o.pedidos)}</td>
                  <td className="text-right">
                    <span className={`nx-num font-semibold ${acima ? "text-emerald-600" : "text-red-600"}`}>
                      {fmtPct(o.conversao, 1)}
                    </span>
                  </td>
                  <td className="text-right pr-1 nx-num nx-text">{o.receita ? fmtBRLc(o.receita) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[10px] nx-muted">
          Conversão média da base: <strong className="nx-text">{fmtPct(resumo.conversaoMedia, 1)}</strong> — verde acima, vermelho abaixo.
        </p>
        {lista.length > 12 && (
          <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => setTodos(v => !v)}>
            {todos ? "Ver top 12" : `Ver todos (${lista.length})`}
          </Button>
        )}
      </div>
    </div>
  );
}

export function OfertasDestaques({ resumo }: { resumo: OfertaResumo }) {
  const blocos = [
    { titulo: "Oferta que converte", cor: "emerald", itens: resumo.vitrine, ajuda: "Muito enviado e fecha acima da média — priorizar no catálogo." },
    { titulo: "Oferta sem retorno", cor: "red", itens: resumo.desperdicio, ajuda: "Muito enviado e converte abaixo da média — revisar preço/foto/grade." },
    { titulo: "Potencial subofertado", cor: "sky", itens: resumo.ocultos, ajuda: "Converte bem mas é pouco enviado — aumentar exposição." },
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {blocos.map(b => (
        <div key={b.titulo} className="rounded-lg border border-[#E7E9EE] p-3">
          <p className="text-xs font-semibold nx-text">{b.titulo}</p>
          <p className="text-[10px] nx-muted mt-0.5 mb-2">{b.ajuda}</p>
          <div className="space-y-1.5">
            {b.itens.length === 0 && <p className="text-[11px] nx-muted">Nenhum produto neste grupo.</p>}
            {b.itens.map(o => (
              <div key={o.produtoId} className="flex items-center justify-between gap-2">
                <span className="text-[11px] nx-text truncate">{o.produtoNome} <span className="nx-muted">· {o.marcaNome}</span></span>
                <div className="flex items-center gap-1 shrink-0">
                  <Badge variant="outline" className="text-[9px] px-1">{fmtNum(o.envios)} envios</Badge>
                  <span className={`text-[10px] nx-num font-semibold ${b.cor === "red" ? "text-red-600" : b.cor === "sky" ? "text-sky-600" : "text-emerald-600"}`}>
                    {fmtPct(o.conversao, 1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
