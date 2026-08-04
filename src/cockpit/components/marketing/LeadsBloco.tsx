// Bloco de Leads no dashboard de Marketing: volume, conversão e distribuição por vendedor.
import { useMemo, useState } from "react";
import {
  leadsDetalhados, leadsPorVendedor, resumoLeads, conversaoPorOrigem,
  statusLabel, statusColor, VENDEDORES, type StatusLead,
} from "../../lib/leadsDetalhe";
import { fmtBRL, fmtBRLc, fmtNum, fmtPct } from "../../styles/tokens";
import { SectionCard } from "../SectionCard";
import { ExecTile } from "../ExecTiles";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const horas = (h: number | null) =>
  h === null ? "—" : h < 1 ? `${Math.round(h * 60)} min` : `${h.toFixed(1).replace(".", ",")} h`;

const dataCurta = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

function StatusPill({ status }: { status: StatusLead }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-medium rounded-full px-2 py-0.5"
      style={{ background: `${statusColor[status]}1A`, color: statusColor[status] }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor[status] }} />
      {statusLabel[status]}
    </span>
  );
}

export function LeadsBloco() {
  const leads = useMemo(() => leadsDetalhados(), []);
  const resumo = useMemo(() => resumoLeads(leads), [leads]);
  const porVendedor = useMemo(() => leadsPorVendedor(leads), [leads]);
  const porOrigem = useMemo(() => conversaoPorOrigem(leads), [leads]);

  const [busca, setBusca] = useState("");
  const [fStatus, setFStatus] = useState("todos");
  const [fVendedor, setFVendedor] = useState("todos");

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return leads.filter((l) => {
      if (fStatus !== "todos" && l.status !== fStatus) return false;
      if (fVendedor === "fila" && l.vendedorId !== null) return false;
      if (fVendedor !== "todos" && fVendedor !== "fila" && l.vendedorId !== fVendedor) return false;
      if (q && !`${l.cliente} ${l.campanha} ${l.origemLabel} ${l.vendedor}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [leads, busca, fStatus, fVendedor]);

  const maxRecebidos = Math.max(...porVendedor.map((v) => v.recebidos), 1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <ExecTile label="Leads no período" value={fmtNum(resumo.total)} sub="Total de leads captados por todos os canais." />
        <ExecTile
          label="Distribuídos"
          value={fmtNum(resumo.distribuidos)}
          sub={`${fmtNum(resumo.naFila)} ainda sem vendedor responsável.`}
          tone={resumo.naFila > 0 ? "risk" : "good"}
        />
        <ExecTile
          label="Sem 1ª resposta"
          value={fmtNum(resumo.semResposta)}
          invert
          tone={resumo.semResposta > resumo.total * 0.15 ? "risk" : "neutral"}
          sub="Leads que ainda não receberam nenhum contato do time comercial."
        />
        <ExecTile label="Tempo médio de resposta" value={horas(resumo.tempoRespostaMedio)} invert sub="Do recebimento do lead até o primeiro contato do vendedor." />
        <ExecTile label="Conversão em oportunidade" value={fmtPct(resumo.convOportunidade, 1)} sub="Leads que viraram oportunidade no CRM." />
        <ExecTile
          label="Conversão em pedido"
          value={fmtPct(resumo.convPedido, 1)}
          tone={resumo.convPedido >= 7 ? "good" : "neutral"}
          sub={`Gerou ${fmtBRLc(resumo.receita)} em pedidos confirmados.`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Para quem foram os leads" subtitle="Distribuição e conversão por vendedor">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] uppercase nx-muted border-b border-[#F1F3F8]">
                  <th className="text-left font-medium pb-2">Vendedor</th>
                  <th className="text-right font-medium pb-2">Recebidos</th>
                  <th className="text-right font-medium pb-2">Sem resp.</th>
                  <th className="text-right font-medium pb-2">Resp. média</th>
                  <th className="text-right font-medium pb-2">Oport.</th>
                  <th className="text-right font-medium pb-2">Pedidos</th>
                  <th className="text-right font-medium pb-2">Conv.</th>
                  <th className="text-right font-medium pb-2">Receita</th>
                </tr>
              </thead>
              <tbody>
                {porVendedor.map((v) => (
                  <tr key={v.vendedorId ?? "fila"} className="border-b border-[#F1F3F8]">
                    <td className="py-2">
                      <p className={cn("nx-text", !v.vendedorId && "text-amber-600 font-medium")}>{v.vendedor}</p>
                      <div className="h-1 rounded bg-[#F1F3F8] mt-1 w-24 overflow-hidden">
                        <div className="h-full rounded" style={{ width: `${(v.recebidos / maxRecebidos) * 100}%`, background: v.vendedorId ? "#363BB4" : "#F59E0B" }} />
                      </div>
                    </td>
                    <td className="text-right nx-num nx-text">{fmtNum(v.recebidos)}</td>
                    <td className={cn("text-right nx-num", v.semResposta > 0 ? "text-rose-600" : "nx-muted")}>{fmtNum(v.semResposta)}</td>
                    <td className="text-right nx-num nx-muted">{v.tempoRespostaMedio ? horas(v.tempoRespostaMedio) : "—"}</td>
                    <td className="text-right nx-num nx-muted">{fmtNum(v.oportunidades)}</td>
                    <td className="text-right nx-num nx-text">{fmtNum(v.ganhos)}</td>
                    <td className={cn("text-right nx-num font-medium", v.convPedido >= 7 ? "text-emerald-600" : v.convPedido < 3 ? "text-rose-600" : "nx-text")}>
                      {fmtPct(v.convPedido, 1)}
                    </td>
                    <td className="text-right nx-num nx-muted">{fmtBRLc(v.receita)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Conversão por origem" subtitle="Qualidade do lead por canal de captação">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] uppercase nx-muted border-b border-[#F1F3F8]">
                  <th className="text-left font-medium pb-2">Origem</th>
                  <th className="text-right font-medium pb-2">Leads</th>
                  <th className="text-right font-medium pb-2">Qualif.</th>
                  <th className="text-right font-medium pb-2">% qualif.</th>
                  <th className="text-right font-medium pb-2">Pedidos</th>
                  <th className="text-right font-medium pb-2">% pedido</th>
                  <th className="text-right font-medium pb-2">Receita</th>
                </tr>
              </thead>
              <tbody>
                {porOrigem.map((o) => (
                  <tr key={o.origem} className="border-b border-[#F1F3F8]">
                    <td className="py-2 nx-text">{o.origem}</td>
                    <td className="text-right nx-num nx-text">{fmtNum(o.leads)}</td>
                    <td className="text-right nx-num nx-muted">{fmtNum(o.qualificados)}</td>
                    <td className="text-right nx-num nx-muted">{fmtPct(o.convQualificacao, 0)}</td>
                    <td className="text-right nx-num nx-text">{fmtNum(o.ganhos)}</td>
                    <td className={cn("text-right nx-num font-medium", o.convPedido >= 7 ? "text-emerald-600" : o.convPedido < 3 ? "text-rose-600" : "nx-text")}>
                      {fmtPct(o.convPedido, 1)}
                    </td>
                    <td className="text-right nx-num nx-muted">{fmtBRLc(o.receita)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Leads lead a lead"
        subtitle={`${fmtNum(filtrados.length)} leads · quem recebeu, quanto demorou para responder e no que deu`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar lead, campanha..."
              className="h-8 w-44 text-xs"
            />
            <Select value={fVendedor} onValueChange={setFVendedor}>
              <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="todos">Todos os vendedores</SelectItem>
                <SelectItem value="fila">Não distribuídos</SelectItem>
                {VENDEDORES.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={fStatus} onValueChange={setFStatus}>
              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="todos">Todos os status</SelectItem>
                {(Object.keys(statusLabel) as StatusLead[]).map((s) => (
                  <SelectItem key={s} value={s}>{statusLabel[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      >
        <div className="overflow-auto max-h-[420px]">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="text-[10px] uppercase nx-muted border-b border-[#F1F3F8]">
                <th className="text-left font-medium pb-2">Lead</th>
                <th className="text-left font-medium pb-2">Origem / campanha</th>
                <th className="text-left font-medium pb-2">Recebido por</th>
                <th className="text-right font-medium pb-2">Entrada</th>
                <th className="text-right font-medium pb-2">1ª resposta</th>
                <th className="text-left font-medium pb-2 pl-3">Status</th>
                <th className="text-right font-medium pb-2">Receita</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.slice(0, 120).map((l) => (
                <tr key={l.id} className="border-b border-[#F1F3F8]">
                  <td className="py-2 nx-text truncate max-w-[170px]">{l.cliente}</td>
                  <td className="nx-muted truncate max-w-[170px]">
                    {l.origemLabel}
                    <span className="nx-muted opacity-70"> · {l.campanha}</span>
                  </td>
                  <td className={cn(!l.vendedorId ? "text-amber-600 font-medium" : "nx-text")}>
                    {l.vendedor}
                    {l.vendedorId && <span className="nx-muted"> · {l.regiao}</span>}
                  </td>
                  <td className="text-right nx-num nx-muted">{dataCurta(l.distribuidoEm)}</td>
                  <td className={cn("text-right nx-num", l.respostaHoras === null ? "text-rose-600" : l.respostaHoras > 12 ? "text-amber-600" : "nx-muted")}>
                    {l.respostaHoras === null ? "sem resposta" : horas(l.respostaHoras)}
                  </td>
                  <td className="pl-3"><StatusPill status={l.status} /></td>
                  <td className="text-right nx-num nx-muted">{l.receita ? fmtBRL(l.receita) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtrados.length > 120 && (
            <p className="text-[10px] nx-muted mt-2">Mostrando os 120 leads mais recentes de {fmtNum(filtrados.length)}.</p>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
