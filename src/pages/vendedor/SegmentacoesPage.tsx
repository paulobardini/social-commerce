import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus, Search, Tag, Filter, Users, Play, Edit3, Trash2, Bookmark,
} from "lucide-react";
import { mockSegmentacoes } from "@/data/mockRepresentantes";
import { useToast } from "@/hooks/use-toast";

export default function SegmentacoesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const filtered = mockSegmentacoes.filter(s =>
    !search || s.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Segmentações e Tags</h1>
            <p className="text-sm text-muted-foreground">{mockSegmentacoes.length} segmentações salvas</p>
          </div>
          <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova segmentação</Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar segmentação..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(seg => (
            <Card key={seg.id} className="border border-border hover:border-primary/40 hover:shadow-sm transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Bookmark className="h-4 w-4 text-primary" />
                    {seg.nome}
                  </CardTitle>
                  <div className="flex gap-1">
                    <button className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-muted transition-colors">
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-muted transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Filters */}
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(seg.filtros).map(([k, v]) => (
                    <Badge key={k} variant="secondary" className="text-[10px]">
                      <Filter className="h-2.5 w-2.5 mr-1" /> {k}: {v}
                    </Badge>
                  ))}
                </div>

                {/* Info */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {seg.totalClientes} clientes
                  </span>
                  <span>por {seg.criadoPor}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{seg.dataCriacao}</p>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs flex-1" onClick={() => {
                    toast({ title: "Segmentação aplicada", description: `Filtro "${seg.nome}" aplicado na lista de clientes` });
                    navigate("/vendedor/clientes");
                  }}>
                    <Play className="h-3 w-3 mr-1" /> Aplicar na lista
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs flex-1" onClick={() => {
                    toast({ title: "Segmentação aplicada", description: `Filtro "${seg.nome}" aplicado no Kanban` });
                    navigate("/vendedor/clientes/kanban");
                  }}>
                    <Tag className="h-3 w-3 mr-1" /> Aplicar no Kanban
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Bookmark className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm">Nenhuma segmentação encontrada</p>
          </div>
        )}

        {/* Tags section */}
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" /> Tags disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {["estratégico", "alto potencial", "recorrente", "sem contato", "reativação", "infantil", "adulto", "fitness", "multimarcas", "urgente", "novo cliente", "quente"].map(tag => (
                <Badge key={tag} variant="outline" className="text-xs cursor-pointer hover:bg-primary/10 transition-colors">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
