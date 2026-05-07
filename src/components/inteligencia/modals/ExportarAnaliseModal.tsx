import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Sheet, FileDown } from "lucide-react";
import { toast } from "sonner";

export function ExportarAnaliseModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const exportar = (formato: string) => { toast.success(`Análise exportada em ${formato}`); onOpenChange(false); };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0"><DialogTitle>Exportar análise</DialogTitle></DialogHeader>
        <div className="flex-1 overflow-y-auto py-2 grid grid-cols-3 gap-3">
          <button onClick={() => exportar("PDF")} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all flex flex-col items-center gap-2">
            <FileText className="h-8 w-8 text-rose-600" /><span className="text-sm font-medium">PDF</span>
          </button>
          <button onClick={() => exportar("Excel")} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all flex flex-col items-center gap-2">
            <Sheet className="h-8 w-8 text-emerald-600" /><span className="text-sm font-medium">Excel</span>
          </button>
          <button onClick={() => exportar("CSV")} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all flex flex-col items-center gap-2">
            <FileDown className="h-8 w-8 text-sky-600" /><span className="text-sm font-medium">CSV</span>
          </button>
        </div>
        <DialogFooter className="shrink-0"><Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
