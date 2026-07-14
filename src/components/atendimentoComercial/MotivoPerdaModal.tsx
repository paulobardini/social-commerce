import { X } from "lucide-react";
import { MotivoPerdaNode, PerdaQualificada, defaultMotivosPerdaTree } from "@/data/mockAtendimentoComercial";
import { PerdaQualificadaForm } from "./PerdaQualificadaForm";

export function MotivoPerdaModal({
  open, onClose, onConfirm, tree = defaultMotivosPerdaTree,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (perda: Omit<PerdaQualificada, "registradoEm">) => void;
  tree?: MotivoPerdaNode[];
  /** @deprecated compat — se passado, é convertido em tree */
  motivos?: string[];
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-xl border border-border w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="shrink-0 px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Perda qualificada</h3>
          <button onClick={onClose} className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <PerdaQualificadaForm
            tree={tree}
            onCancel={onClose}
            onConfirm={(perda) => { onConfirm(perda); onClose(); }}
          />
        </div>
      </div>
    </div>
  );
}
