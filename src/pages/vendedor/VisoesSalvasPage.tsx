import { VendedorLayout } from "@/components/vendedor/VendedorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Star, Eye, Edit, Copy, Trash2, MoreHorizontal, Filter, BarChart3, LayoutDashboard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { visoesSalvas } from "@/data/mockAnalytics";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export default function VisoesSalvasPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <VendedorLayout>
      <div className="p-6 space-y-5 max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/vendedor/relatorios")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-heading font-bold text-foreground">Visões Salvas</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Recortes salvos da operação para acesso rápido</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {visoesSalvas.map(v => (
            <button
              key={v.id}
              onClick={() => v.tipo === "dashboard" ? navigate("/vendedor/dashboard-gerencial") : navigate("/vendedor/relatorios")}
              className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 hover:border-accent/30 transition-all text-left"
            >
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${v.tipo === "dashboard" ? "bg-blue-50" : "bg-purple-50"}`}>
                {v.tipo === "dashboard" ? <LayoutDashboard className="h-5 w-5 text-blue-500" /> : <BarChart3 className="h-5 w-5 text-purple-500" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{v.nome}</p>
                  {v.favorito && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{v.tipo === "dashboard" ? "Dashboard" : "Relatório"}</Badge>
                  {Object.entries(v.filtros).map(([k, val]) => (
                    <span key={k} className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                      <Filter className="h-2 w-2" /> {k}: {val}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-muted-foreground">{v.autor}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{v.dataAtualizacao}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"><MoreHorizontal className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem><Eye className="h-3.5 w-3.5 mr-2" /> Aplicar</DropdownMenuItem>
                  <DropdownMenuItem><Edit className="h-3.5 w-3.5 mr-2" /> Editar</DropdownMenuItem>
                  <DropdownMenuItem><Copy className="h-3.5 w-3.5 mr-2" /> Duplicar</DropdownMenuItem>
                  <DropdownMenuItem><Star className="h-3.5 w-3.5 mr-2" /> Favoritar</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600"><Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </button>
          ))}
        </div>
      </div>
    </VendedorLayout>
  );
}
