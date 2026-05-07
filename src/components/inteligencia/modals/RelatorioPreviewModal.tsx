import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function RelatorioPreviewModal({ open, onOpenChange, titulo }: { open: boolean; onOpenChange: (v: boolean) => void; titulo: string }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0"><DialogTitle>{titulo}</DialogTitle></DialogHeader>
        <div className="flex-1 overflow-y-auto py-2 space-y-4">
          <Section t="Resumo executivo">
            Coleção Inverno 2026 apresenta sell-through 11 pontos acima da média histórica. Categoria infantil concentra 38% da receita e mantém margem de 47%. Categoria adulto exige atenção: 28% do estoque parado e margem 4 pontos abaixo do alvo.
          </Section>
          <Section t="Principais indicadores">
            <ul className="grid grid-cols-2 gap-2 text-xs">
              <li>• Receita analisada: R$ 1.284.500</li>
              <li>• Margem média: 42,8%</li>
              <li>• Sell-through: 68%</li>
              <li>• Valor parado: R$ 286.900</li>
              <li>• Markup simples: 2,34x</li>
              <li>• Markup completo: 1,86x</li>
            </ul>
          </Section>
          <Section t="Insights estratégicos">
            <ol className="text-xs list-decimal pl-5 space-y-1">
              <li>Recompra urgente de Conjunto Fitness Seamless (cobertura de 1,6 dias).</li>
              <li>Liquidação de Calça Sarja Slim Adulto (126 dias em estoque).</li>
              <li>Renegociação com Cotton Prime (custo +12% vs benchmark).</li>
              <li>Ampliação de mix em Tricot Sul (margem 50,2%, sell-through 79%).</li>
            </ol>
          </Section>
          <Section t="Próximas ações">
            <ul className="text-xs space-y-1">
              <li>• Enviar pedido de recompra para Têxtil Aurora e ActiveWear Pro.</li>
              <li>• Criar campanha de liquidação de adulto com desconto progressivo.</li>
              <li>• Reunião de negociação com Cotton Prime na próxima semana.</li>
            </ul>
          </Section>
        </div>
        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button onClick={() => { toast.success("Relatório exportado"); onOpenChange(false); }}>Exportar PDF</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Section({ t, children }: { t: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <p className="text-[11px] uppercase tracking-wider text-primary font-semibold mb-2">{t}</p>
      <div className="text-sm text-foreground/85">{children}</div>
    </div>
  );
}
