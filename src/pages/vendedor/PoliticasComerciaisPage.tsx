import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Plus, Copy, Pencil, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  listPoliticas, PoliticaIndustria, duplicarPolitica, defaultPoliticasPorMarca, upsertPolitica,
} from "@/lib/politicaComercial";
import { PoliticaEditorModal, PoliticaViewModal } from "@/components/vendedor/politica/PoliticaModals";
import { brands } from "@/data/mockProducts";
import { toast } from "sonner";

export default function PoliticasComerciaisPage() {
  const navigate = useNavigate();
  const [list, setList] = useState<PoliticaIndustria[]>([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewPol, setViewPol] = useState<PoliticaIndustria | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editPol, setEditPol] = useState<PoliticaIndustria | null>(null);

  function refresh() { setList(listPoliticas()); }
  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener("politicas:updated", h);
    return () => window.removeEventListener("politicas:updated", h);
  }, []);

  function nova() {
    const seed: PoliticaIndustria = {
      ...defaultPoliticasPorMarca.brandili,
      brandSlug: "",
      nomeTabela: "Nova política",
      status: "rascunho",
      ativa: false,
    };
    setEditPol(seed);
    setEditOpen(true);
  }

  function duplicar(pol: PoliticaIndustria) {
    const nova = duplicarPolitica(pol.brandSlug, `${pol.nomeTabela} (cópia)`);
    if (nova) {
      setEditPol(nova);
      setEditOpen(true);
    }
  }

  function editar(pol: PoliticaIndustria) {
    setEditPol(pol);
    setEditOpen(true);
  }

  function ver(pol: PoliticaIndustria) {
    setViewPol(pol);
    setViewOpen(true);
  }

  function ativar(pol: PoliticaIndustria) {
    upsertPolitica({ ...pol, status: "ativa", ativa: true });
    toast.success(`${pol.nomeTabela} ativada.`);
  }

  return (
    <>
      <div className="p-6 max-w-[1100px] mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2 gap-1"><ChevronLeft className="h-4 w-4" /> Voltar</Button>
            <h1 className="text-xl font-heading font-bold flex items-center gap-2">
              <FileText className="h-5 w-5" /> Políticas comerciais
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Degraus, prazos, mínimos e regras de negociação por indústria.</p>
          </div>
          <Button onClick={nova} className="gap-2"><Plus className="h-4 w-4" /> Nova política</Button>
        </div>

        <div className="grid gap-3">
          {list.map((pol) => {
            const brand = brands.find((b) => b.slug === pol.brandSlug);
            return (
              <Card key={pol.brandSlug + pol.nomeTabela} className="border border-border">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{pol.nomeTabela}</div>
                      <StatusBadge status={pol.status} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {brand?.name || pol.brandSlug}
                      {pol.vigenciaInicio && ` · vigência ${pol.vigenciaInicio}${pol.vigenciaFim ? ` a ${pol.vigenciaFim}` : ""}`}
                      {" · "}{pol.degraus.length} degraus · regra {pol.regraNegociado}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => ver(pol)}>Ver</Button>
                    <Button variant="outline" size="sm" onClick={() => duplicar(pol)} className="gap-1"><Copy className="h-3.5 w-3.5" /> Duplicar</Button>
                    <Button variant="outline" size="sm" onClick={() => editar(pol)} className="gap-1"><Pencil className="h-3.5 w-3.5" /> Editar</Button>
                    {pol.status !== "ativa" && (
                      <Button size="sm" onClick={() => ativar(pol)}>Ativar</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <PoliticaViewModal open={viewOpen} onOpenChange={setViewOpen} politica={viewPol} />
      {editPol && <PoliticaEditorModal open={editOpen} onOpenChange={setEditOpen} initial={editPol} />}
    </>
  );
}

function StatusBadge({ status }: { status: PoliticaIndustria["status"] }) {
  const map: Record<PoliticaIndustria["status"], string> = {
    ativa: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    programada: "bg-sky-500/15 text-sky-700 border-sky-500/30",
    vencida: "bg-destructive/15 text-destructive border-destructive/30",
    rascunho: "bg-muted text-muted-foreground border-border",
  };
  return <Badge variant="outline" className={`capitalize text-[10px] ${map[status]}`}>{status}</Badge>;
}
