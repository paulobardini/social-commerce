import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAtendimentoComercial } from "@/contexts/AtendimentoComercialContext";
import { CardAtendimento } from "@/components/atendimentoComercial/CardAtendimento";
import { CardDrawer } from "@/components/atendimentoComercial/CardDrawer";
import { NovoLeadModal } from "@/components/atendimentoComercial/NovoLeadModal";
import { ColunasConfigModal } from "@/components/atendimentoComercial/ColunasConfigModal";
import { MotivoPerdaModal } from "@/components/atendimentoComercial/MotivoPerdaModal";
import { CardAC, TagCard, tagLabels, OrigemLead, origemLabels, horasDesde } from "@/data/mockAtendimentoComercial";
import { useVendedorPerfil } from "@/hooks/useVendedorPerfil";
import { Search, Plus, Settings, Users, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AtendimentoComercial() {
  const { cards, colunas, cardsPorColuna, moverCard, vendedores } = useAtendimentoComercial();
  const perfil = useVendedorPerfil();
  const isGestor = perfil === "gestor" || perfil === "admin" || perfil === "gestor_regional";
  const { toast } = useToast();
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [filtroTag, setFiltroTag] = useState<TagCard | "todas">("todas");
  const [filtroOrigem, setFiltroOrigem] = useState<OrigemLead | "todas">("todas");
  const [filtroVendedor, setFiltroVendedor] = useState<string>("todos");
  const [selected, setSelected] = useState<CardAC | null>(null);
  const [novoOpen, setNovoOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropToPerdido, setDropToPerdido] = useState<string | null>(null);

  // vendedor logado (mock: primeiro da lista)
  const meuVendedorId = "v-paulo";

  const cardsFiltrados = useMemo(() => {
    return cards.filter(c => {
      if (!isGestor && c.vendedorId !== meuVendedorId) return false;
      if (busca && !c.nome.toLowerCase().includes(busca.toLowerCase()) && !c.telefone.includes(busca)) return false;
      if (filtroTag !== "todas" && c.tag !== filtroTag) return false;
      if (filtroOrigem !== "todas" && c.origem !== filtroOrigem) return false;
      if (isGestor && filtroVendedor !== "todos" && c.vendedorId !== filtroVendedor) return false;
      return true;
    });
  }, [cards, busca, filtroTag, filtroOrigem, filtroVendedor, isGestor]);

  const cardsPorColunaF = (colId: string) => cardsPorColuna(colId).filter(c => cardsFiltrados.includes(c));

  const totalValor = (colId: string) => cardsPorColunaF(colId).reduce((s, c) => s + (c.valorEstimado ?? 0), 0);
  const tempoMedio = (colId: string) => {
    const items = cardsPorColunaF(colId);
    if (!items.length) return 0;
    const media = items.reduce((s, c) => s + horasDesde(c.entradaColunaEm), 0) / items.length;
    return media;
  };

  const onDrop = (colId: string) => {
    if (!dragId) return;
    const destino = colunas.find(c => c.id === colId);
    if (destino?.key === "perdido") { setDropToPerdido(dragId); setDragId(null); return; }
    const r = moverCard(dragId, colId);
    if (!r.ok) toast({ title: "Movimentação bloqueada", description: r.erro, variant: "destructive" });
    setDragId(null);
  };

  const sortedCols = [...colunas].sort((a, b) => a.ordem - b.ordem);

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-heading font-bold text-foreground">Atendimento</h1>
          <p className="text-xs text-muted-foreground">Fluxo de leads e reativações do WhatsApp — da fila até a oportunidade.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setNovoOpen(true)} className="text-[12px] font-medium inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90">
            <Plus className="h-3.5 w-3.5" /> Lead
          </button>
          {isGestor && (
            <button onClick={() => setConfigOpen(true)} className="text-[12px] inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border hover:bg-muted">
              <Settings className="h-3.5 w-3.5" /> Colunas
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap bg-card border border-border rounded-lg p-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome ou telefone…"
            className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <select value={filtroTag} onChange={e => setFiltroTag(e.target.value as any)} className="text-[12px] bg-background border border-border rounded-lg px-2 py-1.5">
          <option value="todas">Todas as tags</option>
          {(["lead", "reativacao", "carteira"] as TagCard[]).map(t => <option key={t} value={t}>{tagLabels[t]}</option>)}
        </select>
        <select value={filtroOrigem} onChange={e => setFiltroOrigem(e.target.value as any)} className="text-[12px] bg-background border border-border rounded-lg px-2 py-1.5">
          <option value="todas">Todas as origens</option>
          {(Object.keys(origemLabels) as OrigemLead[]).map(o => <option key={o} value={o}>{origemLabels[o]}</option>)}
        </select>
        {isGestor && (
          <select value={filtroVendedor} onChange={e => setFiltroVendedor(e.target.value)} className="text-[12px] bg-background border border-border rounded-lg px-2 py-1.5">
            <option value="todos">Todos vendedores</option>
            {vendedores.map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
          </select>
        )}
      </div>

      {/* Board */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {sortedCols.map(col => {
          const allItems = cardsPorColunaF(col.id);
          // Fase 10: coluna Perdido mostra só últimos 7 dias no Kanban do vendedor
          const items = col.key === "perdido"
            ? allItems.filter(c => horasDesde(c.entradaColunaEm) <= 7 * 24)
            : allItems;
          const totalHist = allItems.length;
          const valor = items.reduce((s, c) => s + (c.valorEstimado ?? 0), 0);
          const tm = items.length ? items.reduce((s, c) => s + horasDesde(c.entradaColunaEm), 0) / items.length : 0;
          return (
            <div key={col.id}
              onDragOver={e => e.preventDefault()}
              onDrop={() => onDrop(col.id)}
              className="w-[300px] shrink-0 bg-secondary/70 rounded-xl p-2.5 flex flex-col gap-2">
              <div className="flex items-center justify-between px-1 pb-1 border-b border-border/60">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`h-2 w-2 rounded-full ${col.cor}`} />
                  <span className="text-xs font-semibold text-foreground truncate">{col.label}</span>
                </div>
                <span className="text-[10px] text-muted-foreground bg-background px-1.5 py-0.5 rounded-full">{items.length}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
                {valor > 0 && <span>R$ {(valor / 1000).toFixed(0)}k pot.</span>}
                {tm > 0 && <span>{tm >= 24 ? `${(tm / 24).toFixed(1)}d médio` : `${tm.toFixed(0)}h médio`}</span>}
              </div>
              {col.key === "perdido" && (
                <p className="text-[9.5px] text-muted-foreground italic bg-background/50 border border-border rounded px-1.5 py-1 leading-tight">
                  Últimos 7 dias · histórico completo ({totalHist}) gerenciado pelo <a href="/marketing/leads-atendimento" className="underline hover:text-foreground">marketing</a>
                </p>
              )}
              <div className="flex flex-col gap-2 min-h-[60px]">
                {items.map(c => (
                  <CardAtendimento key={c.id} card={c}
                    onClick={() => navigate(`/vendedor/whatsapp?telefone=${encodeURIComponent(c.telefone)}&cardId=${c.id}`)}
                    onDragStart={() => setDragId(c.id)} />
                ))}
                {items.length === 0 && <p className="text-[10px] text-muted-foreground text-center py-6">Vazio</p>}
              </div>
            </div>
          );
        })}
      </div>

      {selected && <CardDrawer card={cards.find(c => c.id === selected.id)!} onClose={() => setSelected(null)} />}
      <NovoLeadModal open={novoOpen} onClose={() => setNovoOpen(false)} />
      <ColunasConfigModal open={configOpen} onClose={() => setConfigOpen(false)} />
      <MotivoPerdaModal open={!!dropToPerdido} onClose={() => setDropToPerdido(null)} onConfirm={(perda) => {
        if (dropToPerdido) {
          const colPerd = colunas.find(c => c.key === "perdido")!;
          const r = moverCard(dropToPerdido, colPerd.id, { perda });
          if (!r.ok) toast({ title: "Erro", description: r.erro, variant: "destructive" });
        }
        setDropToPerdido(null);
      }} />
    </div>
  );
}
