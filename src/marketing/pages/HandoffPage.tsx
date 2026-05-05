import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMarketing } from "../contexts/MarketingDataContext";
import { channelColors, channelLabels, formatBRLCompact, formatNum, MktChannel } from "../styles/tokens";
import { mockClientes360 } from "@/data/mockCRM360";
import { mockOportunidades } from "@/data/mockCRM";
import { ArrowRight, UserPlus, X, Search, CheckCircle2, XCircle, Filter, Sparkles, Briefcase, Clock } from "lucide-react";

type Filtro = "pendentes" | "convertidos" | "descartados" | "todos";

export default function HandoffPage() {
  const { leads, handoff, setHandoff, converterLeadEmCliente } = useMarketing();
  const [filtro, setFiltro] = useState<Filtro>("pendentes");
  const [busca, setBusca] = useState("");
  const [canalFiltro, setCanalFiltro] = useState<MktChannel | "all">("all");
  const [convModal, setConvModal] = useState<{ open: boolean; leadId?: string }>({ open: false });
  const navigate = useNavigate();

  const handoffMap = useMemo(() => Object.fromEntries(handoff.map(h => [h.leadId, h])), [handoff]);

  // Apenas leads qualificados ou novos sem cliente vinculado
  const candidatos = useMemo(() => {
    return leads.filter(l => !l.clienteId).map(l => ({
      lead: l, h: handoffMap[l.id],
    }));
  }, [leads, handoffMap]);

  const filtrados = useMemo(() => candidatos.filter(({ lead, h }) => {
    const status = h?.status || "pendente";
    if (filtro !== "todos") {
      if (filtro === "pendentes" && status !== "pendente") return false;
      if (filtro === "convertidos" && status !== "convertido") return false;
      if (filtro === "descartados" && status !== "descartado" && status !== "ignorado") return false;
    }
    if (canalFiltro !== "all" && lead.origem !== canalFiltro) return false;
    if (busca && !lead.clienteNome.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  }), [candidatos, filtro, canalFiltro, busca]);

  // KPIs
  const totalPend = candidatos.filter(({ h }) => !h || h.status === "pendente").length;
  const totalConv = candidatos.filter(({ h }) => h?.status === "convertido").length;
  const totalDesc = candidatos.filter(({ h }) => h?.status === "descartado" || h?.status === "ignorado").length;
  const taxaConv = candidatos.length > 0 ? (totalConv / candidatos.length) * 100 : 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Handoff Marketing → CRM</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Migre leads gerados pelo Marketing para virarem clientes e oportunidades no CRM do Vendedor.</p>
      </div>

      {/* Conexão visual entre os dois mundos */}
      <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-border rounded-xl p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center"><Sparkles className="h-6 w-6 text-primary" /></div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-medium">Marketing</p>
              <p className="text-base font-bold">{formatNum(leads.length)} leads atribuídos</p>
            </div>
          </div>
          <ArrowRight className="h-6 w-6 text-muted-foreground" />
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/15 flex items-center justify-center"><Briefcase className="h-6 w-6 text-emerald-600" /></div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground font-medium">CRM Vendedor</p>
              <p className="text-base font-bold">{formatNum(mockClientes360.length)} clientes · {formatNum(mockOportunidades.length)} oportunidades</p>
            </div>
          </div>
          <div className="flex-1 min-w-[180px]" />
          <div className="text-right">
            <p className="text-[10px] uppercase text-muted-foreground">Taxa de conversão</p>
            <p className="text-2xl font-bold text-emerald-600 tabular-nums">{taxaConv.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Pendentes" value={String(totalPend)} icon={<Clock className="h-4 w-4" />} accent="warn" />
        <KPI label="Convertidos" value={String(totalConv)} icon={<CheckCircle2 className="h-4 w-4" />} accent="success" />
        <KPI label="Descartados" value={String(totalDesc)} icon={<XCircle className="h-4 w-4" />} accent="danger" />
        <KPI label="Sem ação" value={String(candidatos.length)} icon={<Filter className="h-4 w-4" />} accent="primary" />
      </div>

      {/* Filtros */}
      <div className="bg-card border border-border rounded-xl p-3 space-y-3">
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1 w-fit">
          {(["pendentes", "convertidos", "descartados", "todos"] as Filtro[]).map(f => (
            <button key={f} onClick={() => setFiltro(f)} className={`text-[12px] font-medium px-3 py-1 rounded capitalize ${filtro === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{f}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar lead..." className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <select value={canalFiltro} onChange={e => setCanalFiltro(e.target.value as never)} className="text-[12px] bg-background border border-border rounded-lg px-2.5 py-1.5">
            <option value="all">Todos canais</option>
            {Object.entries(channelLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Tabela de leads */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="bg-muted/40">
              <tr className="text-left text-[10px] uppercase text-muted-foreground">
                <th className="px-3 py-2.5">Lead</th>
                <th className="px-3 py-2.5">Origem</th>
                <th className="px-3 py-2.5">Campanha</th>
                <th className="px-3 py-2.5">Toques</th>
                <th className="px-3 py-2.5">Custo atrib.</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.slice(0, 80).map(({ lead, h }) => {
                const status = h?.status || "pendente";
                return (
                  <tr key={lead.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-3 py-2.5">
                      <p className="font-medium text-foreground">{lead.clienteNome}</p>
                      <p className="text-[10px] text-muted-foreground">UTM: {lead.utm.source}/{lead.utm.medium}</p>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ background: channelColors[lead.origem] }} />
                        {channelLabels[lead.origem]}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground truncate max-w-[180px]">{lead.utm.campaign}</td>
                    <td className="px-3 py-2.5 tabular-nums">{lead.touchpoints.length}</td>
                    <td className="px-3 py-2.5 tabular-nums">{lead.custoAtribuido > 0 ? formatBRLCompact(lead.custoAtribuido) : "—"}</td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {status === "convertido" && h?.clienteId && (
                        <Link to={`/vendedor/360/${h.clienteId}`} className="text-[11px] text-primary hover:underline inline-flex items-center gap-1">Ver no CRM <ArrowRight className="h-3 w-3" /></Link>
                      )}
                      {status === "pendente" && (
                        <div className="inline-flex items-center gap-1">
                          <button onClick={() => setConvModal({ open: true, leadId: lead.id })} className="text-[11px] bg-primary text-primary-foreground px-2 py-1 rounded hover:opacity-90 inline-flex items-center gap-1"><UserPlus className="h-3 w-3" /> Converter</button>
                          <button onClick={() => setHandoff(lead.id, { status: "descartado" })} title="Descartar" className="p-1 hover:bg-rose-50 text-rose-600 rounded"><X className="h-3.5 w-3.5" /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtrados.length === 0 && <p className="text-[12px] text-muted-foreground text-center py-10">Nenhum lead nesta visão.</p>}
        </div>
      </div>

      {convModal.open && convModal.leadId && (
        <ConverterModal leadId={convModal.leadId} onClose={() => setConvModal({ open: false })} onDone={(clienteId) => {
          setConvModal({ open: false });
          if (clienteId) navigate(`/vendedor/360/${clienteId}`);
        }} />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pendente: "bg-amber-100 text-amber-700",
    convertido: "bg-emerald-100 text-emerald-700",
    descartado: "bg-rose-100 text-rose-700",
    ignorado: "bg-slate-100 text-slate-700",
  };
  return <span className={`text-[10px] uppercase font-medium px-2 py-0.5 rounded ${map[status] || "bg-muted"}`}>{status}</span>;
}

function KPI({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent: "primary" | "success" | "warn" | "danger" }) {
  const cls = { primary: "bg-primary/10 text-primary", success: "bg-emerald-500/10 text-emerald-600", warn: "bg-amber-500/10 text-amber-600", danger: "bg-rose-500/10 text-rose-600" }[accent];
  return (
    <div className="bg-card border border-border rounded-xl p-3 md:p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">{label}</p>
        <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${cls}`}>{icon}</div>
      </div>
      <p className="text-xl md:text-2xl font-bold text-foreground tabular-nums leading-tight">{value}</p>
    </div>
  );
}

function ConverterModal({ leadId, onClose, onDone }: { leadId: string; onClose: () => void; onDone: (clienteId?: string) => void }) {
  const { leads, converterLeadEmCliente } = useMarketing();
  const lead = leads.find(l => l.id === leadId);
  const [criarOp, setCriarOp] = useState(true);
  const [representante, setRepresentante] = useState("Paulo Bardini");

  if (!lead) return null;

  const confirmar = () => {
    const { clienteId } = converterLeadEmCliente(leadId, { criarOportunidade: criarOp, representante });
    onDone(clienteId);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
          <h2 className="text-base font-semibold">Converter lead em cliente</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="bg-muted/40 rounded-lg p-3 space-y-1.5">
            <p className="text-[13px] font-semibold">{lead.clienteNome}</p>
            <p className="text-[11px] text-muted-foreground">{channelLabels[lead.origem]} · {lead.touchpoints.length} toques · UTM {lead.utm.campaign}</p>
          </div>
          <div>
            <label className="text-[11px] uppercase text-muted-foreground font-medium">Atribuir a representante</label>
            <select value={representante} onChange={e => setRepresentante(e.target.value)} className="w-full mt-1 px-3 py-2 text-[13px] bg-background border border-border rounded-lg">
              <option>Paulo Bardini</option>
              <option>Camila Souza</option>
              <option>André Lima</option>
              <option>Distribuir automaticamente</option>
            </select>
          </div>
          <label className="flex items-start gap-2 cursor-pointer p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <input type="checkbox" checked={criarOp} onChange={e => setCriarOp(e.target.checked)} className="mt-0.5 accent-primary" />
            <div>
              <p className="text-[12px] font-medium">Criar oportunidade automaticamente</p>
              <p className="text-[11px] text-muted-foreground">Inicia funil em "Novo lead" com origem do canal Marketing.</p>
            </div>
          </label>
          <div className="text-[11px] text-muted-foreground p-3 border border-dashed border-border rounded-lg">
            <strong>O que vai acontecer:</strong> Cliente novo aparece em /vendedor/clientes, oportunidade no Kanban, e o histórico de toques (campanhas, anúncios, e-mails) fica visível na ficha 360.
          </div>
        </div>
        <div className="px-5 py-3 border-t border-border flex items-center justify-end gap-2 shrink-0">
          <button onClick={onClose} className="text-[12px] px-3 py-1.5 border border-border rounded-lg hover:bg-muted">Cancelar</button>
          <button onClick={confirmar} className="text-[12px] bg-primary text-primary-foreground px-4 py-1.5 rounded-lg hover:opacity-90 font-semibold inline-flex items-center gap-1.5"><UserPlus className="h-3.5 w-3.5" /> Converter</button>
        </div>
      </div>
    </div>
  );
}
