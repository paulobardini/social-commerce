import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search, Filter, Eye, Users, AlertTriangle, TrendingUp,
  ChevronLeft, ChevronRight, Shuffle,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { mockRepresentantes, type Representante } from "@/data/mockRepresentantes";
import { Progress } from "@/components/ui/progress";
import { useVendedorPerfil, podeRedistribuir } from "@/hooks/useVendedorPerfil";

const statusColors: Record<string, string> = {
  ativo: "bg-green-100 text-green-700 border-green-200",
  inativo: "bg-slate-100 text-slate-500 border-slate-200",
  ferias: "bg-yellow-100 text-yellow-700 border-yellow-200",
};
const statusLabels: Record<string, string> = {
  ativo: "Ativo", inativo: "Inativo", ferias: "Férias",
};

export default function RepresentantesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterRegiao, setFilterRegiao] = useState("");
  const showRedistribuir = podeRedistribuir(useVendedorPerfil());

  const filtered = useMemo(() => {
    return mockRepresentantes.filter(r => {
      if (search && !r.nome.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterRegiao && r.regiao !== filterRegiao) return false;
      return true;
    });
  }, [search, filterRegiao]);

  const totalCarteira = mockRepresentantes.reduce((s, r) => s + r.carteiraTotal, 0);
  const totalAtivos = mockRepresentantes.reduce((s, r) => s + r.clientesAtivos, 0);
  const totalRisco = mockRepresentantes.reduce((s, r) => s + r.clientesEmRisco, 0);

  return (
    <>
      <div className="p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Representantes</h1>
            <p className="text-sm text-muted-foreground">{mockRepresentantes.length} representantes • {totalCarteira} clientes na base</p>
          </div>
          {showRedistribuir && (
            <Button variant="outline" size="sm" onClick={() => navigate("/vendedor/clientes/redistribuir")}>
              <Shuffle className="h-4 w-4 mr-1" /> Redistribuir carteira
            </Button>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border border-border">
            <CardContent className="p-3 flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div><p className="text-lg font-bold">{totalCarteira}</p><p className="text-[11px] text-muted-foreground">Total na carteira</p></div>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="p-3 flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div><p className="text-lg font-bold">{totalAtivos}</p><p className="text-[11px] text-muted-foreground">Clientes ativos</p></div>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="p-3 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div><p className="text-lg font-bold">{totalRisco}</p><p className="text-[11px] text-muted-foreground">Clientes em risco</p></div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar representante..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <Select value={filterRegiao} onValueChange={v => setFilterRegiao(v === "all" ? "" : v)}>
            <SelectTrigger className="h-9 w-[150px] text-sm"><SelectValue placeholder="Região" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="Sul">Sul</SelectItem>
              <SelectItem value="Sudeste">Sudeste</SelectItem>
              <SelectItem value="Centro-Oeste">Centro-Oeste</SelectItem>
              <SelectItem value="Nordeste">Nordeste</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Representante</TableHead>
                <TableHead className="font-semibold">Região</TableHead>
                <TableHead className="font-semibold text-center">Carteira</TableHead>
                <TableHead className="font-semibold text-center">Ativos</TableHead>
                <TableHead className="font-semibold text-center">Risco</TableHead>
                <TableHead className="font-semibold text-center">Oport.</TableHead>
                <TableHead className="font-semibold text-center">Conversão</TableHead>
                <TableHead className="font-semibold">Meta mensal</TableHead>
                <TableHead className="font-semibold text-center">Tarefas</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold w-16">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(rep => {
                const pctMeta = Math.round((rep.faturamentoMes / rep.metaMensal) * 100);
                return (
                  <TableRow key={rep.id} className="cursor-pointer hover:bg-muted/30" onClick={() => navigate(`/vendedor/representantes/${rep.id}`)}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{rep.nome}</p>
                        <p className="text-[11px] text-muted-foreground">{rep.email}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="text-[10px]">{rep.regiao}/{rep.estado}</Badge></TableCell>
                    <TableCell className="text-center text-sm font-medium">{rep.carteiraTotal}</TableCell>
                    <TableCell className="text-center text-sm">{rep.clientesAtivos}</TableCell>
                    <TableCell className="text-center">
                      <span className={`text-sm font-medium ${rep.clientesEmRisco > 2 ? "text-red-600" : ""}`}>{rep.clientesEmRisco}</span>
                    </TableCell>
                    <TableCell className="text-center text-sm">{rep.oportunidadesAbertas}</TableCell>
                    <TableCell className="text-center text-sm font-medium">{rep.taxaConversao}%</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <Progress value={pctMeta} className="h-2 flex-1" />
                        <span className="text-[11px] font-medium">{pctMeta}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm">{rep.tarefasPendentes}</TableCell>
                    <TableCell>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[rep.status]}`}>{statusLabels[rep.status]}</span>
                    </TableCell>
                    <TableCell>
                      <button onClick={e => { e.stopPropagation(); navigate(`/vendedor/representantes/${rep.id}`); }} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
