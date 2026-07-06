import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, Plus, Filter, Download, LayoutGrid, List, X, MapPin, MessageCircle,
  ExternalLink, ArrowUpDown, AlertTriangle, TrendingUp, Users, Activity, Info,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  mockClientes360, nichoLabels, type Cliente360, type Nicho,
} from "@/data/mockCRM360";
import { NovoClienteModal } from "@/components/vendedor/NovoClienteModal";
import {
  ESTAGIOS, type EstagioFunil, type Saude, saudeCliente, saudeLabel, saudeColor, saudeDot,
  calcularSaude, diasSemContato, valor12m, formatBRL, industriasDe, estagioAtual, saveOverride,
  loadOverrides, contagemChips, aplicarChip, calcularMetodo, type ChipFilter,
} from "@/lib/carteiraMetodo";

const CHIP_KEY = "carteira:chip";

export default function ClientesListing() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [view, setView] = useState<"table" | "funil">("table");
  const [chip, setChip] = useState<ChipFilter>(() => (localStorage.getItem(CHIP_KEY) as ChipFilter) || "todos");
  const [showFilters, setShowFilters] = useState(false);
  const [filterUf, setFilterUf] = useState("");
  const [filterNicho, setFilterNicho] = useState("");
  const [filterIndustria, setFilterIndustria] = useState("");
  const [novoOpen, setNovoOpen] = useState(false);

  // Local overrides de estágio (drag-drop) e de nicho/interesse (edição inline)
  const [overrides, setOverrides] = useState<Record<string, EstagioFunil>>(() => loadOverrides());
  const [nichoOverrides, setNichoOverrides] = useState<Record<string, Nicho>>({});
  const [interesseOverrides, setInteresseOverrides] = useState<Record<string, string>>({});

  // Popover de confirmação de drag
  const [pendingMove, setPendingMove] = useState<{ cliente: Cliente360; para: EstagioFunil } | null>(null);
  const [motivoMove, setMotivoMove] = useState("");
  const [criarTarefaMove, setCriarTarefaMove] = useState(true);

  useEffect(() => { localStorage.setItem(CHIP_KEY, chip); }, [chip]);

  // Enriquecer clientes com overrides
  const clientes = useMemo(
    () => mockClientes360.map(c => ({
      ...c,
      nicho: nichoOverrides[c.id] ?? c.nicho,
      interessePrincipal: interesseOverrides[c.id] ?? c.interessePrincipal,
    })),
    [nichoOverrides, interesseOverrides]
  );

  const industriasUniv = useMemo(() => {
    const s = new Set<string>();
    clientes.forEach(c => industriasDe(c).forEach(i => s.add(i)));
    return Array.from(s).sort();
  }, [clientes]);

  const chips = useMemo(() => contagemChips(clientes, overrides), [clientes, overrides]);

  const filteredBase = useMemo(() => aplicarChip(clientes, chip, overrides), [clientes, chip, overrides]);

  const filtered = useMemo(() => {
    return filteredBase.filter(c => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !c.nomeFantasia.toLowerCase().includes(q) &&
          !c.razaoSocial.toLowerCase().includes(q) &&
          !c.documento.includes(q) &&
          !c.cidade.toLowerCase().includes(q)
        ) return false;
      }
      if (filterUf && c.estado !== filterUf) return false;
      if (filterNicho && c.nicho !== filterNicho) return false;
      if (filterIndustria && !industriasDe(c).includes(filterIndustria)) return false;
      return true;
    });
  }, [filteredBase, search, filterUf, filterNicho, filterIndustria]);

  // Ordenação por urgência (dias sem contato DESC ponderado por valor 12m)
  const filteredSorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const urgA = diasSemContato(a.ultimoContato) * (1 + valor12m(a) / 100000);
      const urgB = diasSemContato(b.ultimoContato) * (1 + valor12m(b) / 100000);
      return urgB - urgA;
    });
  }, [filtered]);

  const metodo = useMemo(() => calcularMetodo(clientes), [clientes]);
  const activeFilters = [filterUf, filterNicho, filterIndustria].filter(Boolean).length;
  const ufs = useMemo(() => Array.from(new Set(clientes.map(c => c.estado))).sort(), [clientes]);

  function handleDrop(cliente: Cliente360, para: EstagioFunil) {
    if (estagioAtual(cliente, overrides) === para) return;
    setPendingMove({ cliente, para });
    setMotivoMove("");
    setCriarTarefaMove(true);
  }

  function confirmarMove() {
    if (!pendingMove) return;
    const { cliente, para } = pendingMove;
    saveOverride(cliente.id, para);
    setOverrides(loadOverrides());
    const def = ESTAGIOS.find(e => e.id === para)!;
    if (criarTarefaMove && def.followUpDias) {
      toast.success(`${cliente.nomeFantasia} → ${def.nome} · follow-up em ${def.followUpDias}d criado no painel`);
    } else {
      toast.success(`${cliente.nomeFantasia} movido para ${def.nome}`);
    }
    setPendingMove(null);
  }

  return (
    <>
      <div className="p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Clientes</h1>
            <p className="text-sm text-muted-foreground">
              {filteredSorted.length} de {clientes.length} clientes · {view === "table" ? "Execução" : "Estratégia"}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="hidden sm:flex"><Download className="h-4 w-4 mr-1" /> Exportar</Button>
            <Button size="sm" onClick={() => setNovoOpen(true)}><Plus className="h-4 w-4 mr-1" /> Novo cliente</Button>
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button onClick={() => setView("table")} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${view === "table" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                <List className="h-4 w-4" /> Tabela
              </button>
              <button onClick={() => setView("funil")} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${view === "funil" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                <LayoutGrid className="h-4 w-4" /> Funil
              </button>
            </div>
          </div>
        </div>

        {/* FAIXA DO MÉTODO */}
        <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-transparent p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Giro da carteira · este mês</span>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {metodo.atendidosMes}/{metodo.totalAtivos} ativos atendidos
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden mb-3">
            <div className="h-full bg-primary transition-all" style={{ width: `${Math.min(100, metodo.giroPct)}%` }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => setChip("risco")}
              className={`flex items-center justify-between rounded-lg border p-2.5 text-left hover:border-orange-300 transition-colors ${chip === "risco" ? "border-orange-400 bg-orange-50" : "border-border bg-card"}`}
            >
              <div>
                <p className="text-[11px] text-muted-foreground">Em risco a resgatar</p>
                <p className="text-lg font-bold text-orange-600">{metodo.emRiscoResgate}</p>
              </div>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </button>
            <button
              onClick={() => setChip("sem_cobertura")}
              className={`flex items-center justify-between rounded-lg border p-2.5 text-left hover:border-red-300 transition-colors ${chip === "sem_cobertura" ? "border-red-400 bg-red-50" : "border-border bg-card"}`}
            >
              <div>
                <p className="text-[11px] text-muted-foreground">Sem cobertura</p>
                <p className="text-lg font-bold text-red-600">{metodo.semCobertura}</p>
              </div>
              <Users className="h-4 w-4 text-red-500" />
            </button>
            <div className="flex items-center justify-between rounded-lg border border-border bg-card p-2.5">
              <div>
                <p className="text-[11px] text-muted-foreground">Reativações no mês</p>
                <p className="text-lg font-bold text-emerald-600">
                  {metodo.reativacoesMes} <span className="text-xs text-muted-foreground font-normal">/ meta {metodo.metaReativacoes}</span>
                </p>
              </div>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Chips rápidos */}
        <div className="flex items-center gap-2 flex-wrap">
          {chips.map(cf => (
            <button
              key={cf.id}
              onClick={() => setChip(cf.id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${chip === cf.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-foreground hover:bg-muted"}`}
            >
              {cf.label} <span className={`ml-1 font-mono ${chip === cf.id ? "opacity-80" : "text-muted-foreground"}`}>({cf.count})</span>
            </button>
          ))}
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="relative ml-auto">
            <Filter className="h-4 w-4 mr-1" /> Filtros avançados
            {activeFilters > 0 && <Badge className="absolute -top-1.5 -right-1.5 h-4 w-4 p-0 flex items-center justify-center text-[9px]">{activeFilters}</Badge>}
          </Button>
        </div>

        {/* Busca */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar cliente, documento, cidade..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>

        {showFilters && (
          <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-lg border border-border flex-wrap">
            <Select value={filterUf} onValueChange={v => setFilterUf(v === "all" ? "" : v)}>
              <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue placeholder="UF" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Todas UFs</SelectItem>{ufs.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filterNicho} onValueChange={v => setFilterNicho(v === "all" ? "" : v)}>
              <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue placeholder="Nicho" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Todos</SelectItem>{Object.entries(nichoLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filterIndustria} onValueChange={v => setFilterIndustria(v === "all" ? "" : v)}>
              <SelectTrigger className="h-8 w-[160px] text-xs"><SelectValue placeholder="Indústria" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Todas</SelectItem>{industriasUniv.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
            </Select>
            {activeFilters > 0 && (
              <Button variant="ghost" size="sm" className="text-xs ml-auto" onClick={() => { setFilterUf(""); setFilterNicho(""); setFilterIndustria(""); }}>
                <X className="h-3 w-3 mr-1" /> Limpar
              </Button>
            )}
          </div>
        )}

        {view === "table" ? (
          <TabelaView
            clientes={filteredSorted}
            overrides={overrides}
            onNichoChange={(id, n) => { setNichoOverrides(o => ({ ...o, [id]: n })); toast.success("Nicho atualizado"); }}
            onInteresseChange={(id, v) => { setInteresseOverrides(o => ({ ...o, [id]: v })); toast.success("Interesse atualizado"); }}
            onOpen={id => navigate(`/vendedor/360/${id}`)}
          />
        ) : (
          <FunilView
            clientes={filteredSorted}
            overrides={overrides}
            onDrop={handleDrop}
            onOpen={id => navigate(`/vendedor/360/${id}`)}
          />
        )}
      </div>

      <NovoClienteModal open={novoOpen} onOpenChange={setNovoOpen} industriasDisponiveis={industriasUniv} />

      {/* Popover de confirmação de movimento */}
      <Dialog open={!!pendingMove} onOpenChange={v => !v && setPendingMove(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mover para {pendingMove && ESTAGIOS.find(e => e.id === pendingMove.para)?.nome}</DialogTitle>
          </DialogHeader>
          {pendingMove && (
            <div className="space-y-3 py-1">
              <p className="text-sm">
                <span className="font-medium">{pendingMove.cliente.nomeFantasia}</span> — {ESTAGIOS.find(e => e.id === pendingMove.para)?.objetivo}
              </p>
              <div>
                <label className="text-xs text-muted-foreground">Motivo (opcional)</label>
                <Textarea value={motivoMove} onChange={e => setMotivoMove(e.target.value)} className="min-h-[60px] text-sm" placeholder="Ex.: cliente pediu para retomar em 30 dias" />
              </div>
              {ESTAGIOS.find(e => e.id === pendingMove.para)?.followUpDias && (
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={criarTarefaMove} onCheckedChange={v => setCriarTarefaMove(!!v)} />
                  Criar tarefa de follow-up em {ESTAGIOS.find(e => e.id === pendingMove.para)?.followUpDias} dias
                </label>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingMove(null)}>Cancelar</Button>
            <Button onClick={confirmarMove}>Mover</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// =========================== TABELA ===========================
function TabelaView({
  clientes, overrides, onNichoChange, onInteresseChange, onOpen,
}: {
  clientes: Cliente360[];
  overrides: Record<string, EstagioFunil>;
  onNichoChange: (id: string, n: Nicho) => void;
  onInteresseChange: (id: string, v: string) => void;
  onOpen: (id: string) => void;
}) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <TooltipProvider delayDuration={150}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Cliente</TableHead>
            <TableHead className="font-semibold">Indústrias</TableHead>
            <TableHead className="font-semibold">Nicho</TableHead>
            <TableHead className="font-semibold">Interesse</TableHead>
            <TableHead className="font-semibold">
              <Tooltip>
                <TooltipTrigger asChild><span className="inline-flex items-center gap-1 cursor-help">Saúde <Info className="h-3 w-3" /></span></TooltipTrigger>
                <TooltipContent className="text-xs max-w-[240px]">
                  Calculada por recência: <b>Ativo</b> ≤30d · <b>Em risco</b> 31–60d · <b>Inativo</b> 61–120d · <b>Perdido</b> &gt;120d.
                </TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead className="font-semibold">Estágio</TableHead>
            <TableHead className="font-semibold text-right">
              <span className="inline-flex items-center gap-1">Sem contato <ArrowUpDown className="h-3 w-3" /></span>
            </TableHead>
            <TableHead className="font-semibold text-right">Valor 12m</TableHead>
            <TableHead className="font-semibold w-24 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map(c => {
            const saude = calcularSaude(c);
            const s = saude.status;
            const est = ESTAGIOS.find(e => e.id === estagioAtual(c, overrides))!;
            const dias = diasSemContato(c.ultimoContato);
            const v = valor12m(c);
            const ind = industriasDe(c);
            return (
              <TableRow key={c.id} className="cursor-pointer hover:bg-muted/30" onClick={() => onOpen(c.id)}>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{c.nomeFantasia}</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-[11px] text-muted-foreground cursor-help">{c.cidade}/{c.estado}</p>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs font-mono">{c.documento}</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap max-w-[180px]">
                    {ind.slice(0, 3).map(i => (
                      <span key={i} className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                        <span className="h-3 w-3 rounded-full bg-primary/30 grid place-items-center text-[8px] font-bold">{i[0]}</span>
                        {i}
                      </span>
                    ))}
                    {ind.length > 3 && <span className="text-[10px] text-muted-foreground">+{ind.length - 3}</span>}
                  </div>
                </TableCell>
                <TableCell onClick={e => e.stopPropagation()}>
                  {c.nicho ? (
                    <Badge variant="secondary" className="text-[10px]">{nichoLabels[c.nicho]}</Badge>
                  ) : (
                    <Select onValueChange={v => onNichoChange(c.id, v as Nicho)}>
                      <SelectTrigger className="h-7 w-[130px] text-xs border-dashed"><SelectValue placeholder="+ definir" /></SelectTrigger>
                      <SelectContent>{Object.entries(nichoLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate" onClick={e => e.stopPropagation()}>
                  {c.interessePrincipal || (
                    <input
                      className="text-xs px-2 py-1 rounded border border-dashed border-border w-full bg-transparent focus:outline-none focus:border-primary"
                      placeholder="+ definir"
                      onBlur={e => e.target.value && onInteresseChange(c.id, e.target.value)}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full border ${saudeColor[s]}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${saudeDot[s]}`} />
                    {saudeLabel[s]}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-[11px]">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: est.cor }} />
                    {est.nome}
                  </span>
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums">
                  <span className={dias > 60 ? "text-red-600 font-medium" : dias > 30 ? "text-orange-600" : "text-muted-foreground"}>
                    {dias}d
                  </span>
                </TableCell>
                <TableCell className="text-right text-sm font-medium tabular-nums">{v ? formatBRL(v) : "—"}</TableCell>
                <TableCell onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => { window.open(`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`, "_blank"); }}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-emerald-600 hover:bg-muted transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onOpen(c.id)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                      title="Cliente 360"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {clientes.length === 0 && (
            <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground">Nenhum cliente encontrado</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
      </TooltipProvider>
    </div>
  );
}

// =========================== FUNIL ===========================
function FunilView({
  clientes, overrides, onDrop, onOpen,
}: {
  clientes: Cliente360[];
  overrides: Record<string, EstagioFunil>;
  onDrop: (c: Cliente360, para: EstagioFunil) => void;
  onOpen: (id: string) => void;
}) {
  const [dragOver, setDragOver] = useState<EstagioFunil | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<EstagioFunil, Cliente360[]>();
    ESTAGIOS.forEach(e => map.set(e.id, []));
    clientes.forEach(c => map.get(estagioAtual(c, overrides))!.push(c));
    return map;
  }, [clientes, overrides]);

  return (
    <div className="overflow-x-auto snap-x">
      <div className="flex gap-3 min-h-[500px]">
        {ESTAGIOS.map(est => {
          const items = grouped.get(est.id) ?? [];
          const soma = items.reduce((s, c) => s + valor12m(c), 0);
          const highlight = dragOver === est.id;
          return (
            <div
              key={est.id}
              className={`flex flex-col w-[280px] min-w-[280px] snap-start rounded-lg border-2 transition-colors ${highlight ? "border-primary bg-primary/5" : "border-border/80 bg-muted/50"}`}
              onDragOver={e => { e.preventDefault(); setDragOver(est.id); }}
              onDragLeave={() => setDragOver(cur => cur === est.id ? null : cur)}
              onDrop={e => {
                e.preventDefault();
                setDragOver(null);
                const id = e.dataTransfer.getData("text/plain");
                const cli = clientes.find(c => c.id === id);
                if (cli) onDrop(cli, est.id);
              }}
            >
              {/* header / playbook */}
              <div className="p-3 border-b border-border">
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: est.cor }} />
                  <span className="text-sm font-semibold uppercase tracking-wide">{est.nome}</span>
                  <Badge variant="secondary" className="ml-auto text-[10px]">{items.length}</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight">{est.objetivo}</p>
                <p className="text-[10px] text-muted-foreground mt-1 font-mono">Σ {formatBRL(soma)}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {items.map(c => {
                  const s = saudeCliente(c);
                  const dias = diasSemContato(c.ultimoContato);
                  const v = valor12m(c);
                  const ind = industriasDe(c);
                  const diverge = (est.id === "ativo" && (s === "risco" || s === "inativo" || s === "perdido"));
                  const sugestao: EstagioFunil | null =
                    diverge ? (s === "perdido" ? "perdido" : s === "inativo" ? "reativacao" : "em_risco") : null;
                  return (
                    <div
                      key={c.id}
                      draggable
                      onDragStart={e => e.dataTransfer.setData("text/plain", c.id)}
                      onClick={() => onOpen(c.id)}
                      className="bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-primary/40 hover:shadow-sm transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium truncate flex-1">{c.nomeFantasia}</p>
                        <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full border shrink-0 ${saudeColor[s]}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${saudeDot[s]}`} /> {saudeLabel[s]}
                        </span>
                      </div>

                      {ind.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {ind.slice(0, 3).map(i => (
                            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">{i}</span>
                          ))}
                          {ind.length > 3 && <span className="text-[9px] text-muted-foreground">+{ind.length - 3}</span>}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px]">
                        <span className={dias > 60 ? "text-red-600 font-medium" : dias > 30 ? "text-orange-600" : "text-muted-foreground"}>
                          <MapPin className="h-3 w-3 inline mr-0.5" /> {c.cidade} · há {dias}d
                        </span>
                        <span className="font-medium tabular-nums">{v ? formatBRL(v) : "—"}</span>
                      </div>

                      {diverge && sugestao && (
                        <button
                          onClick={e => { e.stopPropagation(); onDrop(c, sugestao); }}
                          className="w-full text-[10px] text-orange-700 bg-orange-50 border border-orange-200 rounded-md px-2 py-1 hover:bg-orange-100 transition-colors flex items-center gap-1"
                        >
                          <AlertTriangle className="h-3 w-3" /> Sem compra há {dias}d — mover para {ESTAGIOS.find(e => e.id === sugestao)?.nome}?
                        </button>
                      )}

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (est.id === "novo" || est.id === "em_risco") {
                            window.open(`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`, "_blank");
                          }
                          toast.success(`${est.acaoLabel} · atendimento registrado para ${c.nomeFantasia}`);
                        }}
                        className="w-full text-[11px] bg-primary/10 text-primary rounded-md px-2 py-1.5 hover:bg-primary/20 transition-colors font-medium"
                      >
                        {est.acaoLabel}
                      </button>
                    </div>
                  );
                })}
                {items.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-8">Arraste clientes para cá</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
