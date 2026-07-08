// DuplicarMesModal · copia estrutura de metas de um mês para múltiplos meses
// destino, aplicando ajuste percentual linear. Regras de sobrescrita explícitas.
import { useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useCockpit } from "@/cockpit/contexts/CockpitContext";
import { periodosPlanejamento, mesLabelCurto, mesLabel } from "@/cockpit/data/metasV2";

interface Props {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  origem: string;              // periodo origem (mesKey)
}

export function DuplicarMesModal({ open, onOpenChange, origem }: Props) {
  const { seed, escopo, metasV2, duplicarMes } = useCockpit();
  const meses = periodosPlanejamento(seed.hoje).filter(p => p > origem);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [ajuste, setAjuste] = useState<string>("0");
  const [confirmando, setConfirmando] = useState<{
    rascunhos: string[]; publicadas: string[];
  } | null>(null);

  const metasOrigem = metasV2.filter(m => m.periodo === origem && m.escopo === escopo);
  const totalOrigem = metasOrigem
    .filter(m => m.dimensao === "geral")
    .reduce((s, m) => s + m.valorAgregado, 0);

  const conflitos = useMemo(() => {
    const rascunhos: string[] = [];
    const publicadas: string[] = [];
    for (const p of selecionados) {
      const doMes = metasV2.filter(m => m.periodo === p && m.escopo === escopo);
      if (doMes.some(m => m.status === "publicada")) publicadas.push(p);
      else if (doMes.length > 0) rascunhos.push(p);
    }
    return { rascunhos, publicadas };
  }, [selecionados, metasV2, escopo]);

  const toggle = (p: string) => {
    const nova = new Set(selecionados);
    if (nova.has(p)) nova.delete(p); else nova.add(p);
    setSelecionados(nova);
  };

  const iniciar = () => {
    if (!selecionados.size) { toast.error("Selecione ao menos um mês destino"); return; }
    if (conflitos.rascunhos.length || conflitos.publicadas.length) {
      setConfirmando(conflitos);
      return;
    }
    executar();
  };

  const executar = () => {
    const ajustePct = Number(ajuste) || 0;
    const destinos = Array.from(selecionados).sort();
    duplicarMes({ origem, destinos, ajustePct, sobrescreverPublicadas: true });
    toast.success(`${destinos.length} mês(es) recebeu(ram) rascunho copiado de ${mesLabelCurto(origem)}`);
    setConfirmando(null);
    setSelecionados(new Set());
    setAjuste("0");
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-3 shrink-0 border-b">
            <DialogTitle>Duplicar estrutura de {mesLabel(origem)}</DialogTitle>
            <DialogDescription>
              Copia meta geral + metas dimensionais deste mês para os meses selecionados.
              Ajuste é linear e vale para TODAS as metas copiadas.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div className="text-[11px] nx-muted bg-[#F6F7F9] rounded p-2">
              <span className="nx-text font-medium">{metasOrigem.length}</span> meta(s) em {mesLabel(origem)} — geral agregada: <span className="nx-num nx-text font-medium">R$ {totalOrigem.toLocaleString("pt-BR")}</span>
            </div>

            <div>
              <label className="text-xs font-medium nx-text mb-2 block">Meses destino</label>
              {meses.length === 0 ? (
                <p className="text-[11px] nx-muted">Não há meses futuros disponíveis para duplicação.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {meses.map(p => {
                    const doMes = metasV2.filter(m => m.periodo === p && m.escopo === escopo);
                    const publicada = doMes.some(m => m.status === "publicada");
                    const rascunho = !publicada && doMes.length > 0;
                    return (
                      <label key={p} className="flex items-start gap-2 p-2 rounded border border-[#E7E9EE] cursor-pointer hover:border-[#2D3A8C]">
                        <Checkbox checked={selecionados.has(p)} onCheckedChange={() => toggle(p)} className="mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium nx-text">{mesLabelCurto(p)}</p>
                          {publicada && <Badge variant="outline" className="text-[9px] mt-0.5 bg-emerald-50 text-emerald-700 border-emerald-300">publicada</Badge>}
                          {rascunho && <Badge variant="outline" className="text-[9px] mt-0.5 bg-amber-50 text-amber-700 border-amber-300">rascunho</Badge>}
                          {!publicada && !rascunho && <span className="text-[9px] nx-muted">vazio</span>}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-medium nx-text mb-1 block">Ajuste percentual linear</label>
              <div className="flex items-center gap-2">
                <Input type="number" value={ajuste} onChange={e => setAjuste(e.target.value)} className="max-w-[100px] text-right" />
                <span className="text-xs nx-muted">%</span>
                <span className="text-[11px] nx-muted">ex: +5 para "junho +5%", -10 para redução linear</span>
              </div>
              <p className="text-[10px] nx-muted mt-1">Aplica ao valor agregado E ao rateio de cada meta copiada. Ajustes finos são feitos abrindo o mês destino.</p>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t shrink-0 bg-background">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={iniciar}>Duplicar como rascunho ({selecionados.size})</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmando} onOpenChange={(b) => !b && setConfirmando(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" /> Sobrescrever metas existentes?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-xs">
                {!!confirmando?.rascunhos.length && (
                  <p><strong>Rascunhos</strong> serão substituídos em: {confirmando.rascunhos.map(mesLabelCurto).join(", ")}.</p>
                )}
                {!!confirmando?.publicadas.length && (
                  <p className="text-rose-700"><strong>Metas PUBLICADAS</strong> em {confirmando.publicadas.map(mesLabelCurto).join(", ")} serão substituídas. A ação fica registrada no log como <em>“substituída via duplicação de {mesLabelCurto(origem)}”</em>.</p>
                )}
                <p className="nx-muted">Confirme para prosseguir.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={executar}>Substituir e duplicar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
