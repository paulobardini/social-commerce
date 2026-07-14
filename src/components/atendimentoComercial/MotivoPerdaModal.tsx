import { useState } from "react";
import { motivosPerda } from "@/data/mockAtendimentoComercial";
import { X } from "lucide-react";

export function MotivoPerdaModal({
  open, onClose, onConfirm, motivos = motivosPerda,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (motivo: string, texto?: string) => void;
  motivos?: string[];
}) {
  const [motivo, setMotivo] = useState<string>("");
  const [texto, setTexto] = useState("");
  if (!open) return null;
  const outros = motivo === "Outros";
  const ok = motivo && (!outros || texto.trim().length > 2);
  return (
    <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-xl border border-border w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="shrink-0 px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Motivo da perda</h3>
          <button onClick={onClose} className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
          {motivos.map(m => (
            <button key={m} onClick={() => setMotivo(m)} className={`w-full text-left px-3 py-2 rounded-lg border text-[12px] ${motivo === m ? "border-primary bg-primary/5 text-foreground" : "border-border hover:border-primary/40 text-muted-foreground"}`}>
              {m}
            </button>
          ))}
          {outros && (
            <textarea autoFocus value={texto} onChange={e => setTexto(e.target.value)} rows={3} placeholder="Descreva o motivo (obrigatório)"
              className="w-full mt-2 bg-card border border-border rounded-lg px-3 py-2 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring" />
          )}
        </div>
        <div className="shrink-0 px-4 py-3 border-t border-border flex items-center justify-end gap-2">
          <button onClick={onClose} className="text-[12px] px-3 py-1.5 rounded-lg hover:bg-muted text-muted-foreground">Cancelar</button>
          <button disabled={!ok} onClick={() => ok && onConfirm(motivo, outros ? texto : undefined)}
            className="text-[12px] font-medium px-4 py-1.5 rounded-lg bg-rose-600 text-white hover:opacity-90 disabled:opacity-40">
            Marcar como perdido
          </button>
        </div>
      </div>
    </div>
  );
}
