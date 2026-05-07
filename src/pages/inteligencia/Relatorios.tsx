import { useState } from "react";
import { IMHeader } from "@/components/inteligencia/IMHeader";
import { Button } from "@/components/ui/button";
import { RelatorioPreviewModal } from "@/components/inteligencia/modals/RelatorioPreviewModal";
import { FileText, Sparkles } from "lucide-react";

const relatorios = [
  { titulo: "Performance de Produto", desc: "Visão consolidada de todos os SKUs com KPIs comerciais.", ult: "Há 2 dias" },
  { titulo: "Recompra Recomendada", desc: "Lista priorizada de itens para reposição com cobertura.", ult: "Há 1 dia" },
  { titulo: "Estoque Parado", desc: "Capital parado por SKU, coleção e fornecedor.", ult: "Há 3 dias" },
  { titulo: "Margem e Markup", desc: "Análise de rentabilidade por categoria e canal.", ult: "Há 5 dias" },
  { titulo: "Performance de Fornecedor", desc: "Ranking comparativo com sugestões de renegociação.", ult: "Há 1 semana" },
  { titulo: "Performance de Coleção", desc: "Avaliação completa da coleção com recomendação para a próxima.", ult: "Há 4 dias" },
  { titulo: "Produtos em Risco de Ruptura", desc: "Itens com cobertura crítica e projeção de perda.", ult: "Hoje" },
  { titulo: "Executivo Mensal", desc: "Pacote consolidado para reunião de board.", ult: "Há 14 dias" },
];

export default function Relatorios() {
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState("");

  return (
    <div className="bg-background min-h-full">
      <IMHeader title="Relatórios Executivos" subtitle="Gere análises prontas para reuniões comerciais, planejamento de compra e negociação com fornecedores." />

      <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {relatorios.map(r => (
          <div key={r.titulo} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-[10px] text-muted-foreground">{r.ult}</span>
            </div>
            <div>
              <p className="text-sm font-bold">{r.titulo}</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.desc}</p>
            </div>
            <div className="flex flex-wrap gap-1 text-[10px] text-muted-foreground">
              <span className="px-1.5 py-0.5 bg-secondary rounded">PDF</span>
              <span className="px-1.5 py-0.5 bg-secondary rounded">Excel</span>
              <span className="px-1.5 py-0.5 bg-secondary rounded">CSV</span>
            </div>
            <Button size="sm" className="mt-auto" onClick={() => { setTitulo(r.titulo); setOpen(true); }}>
              <Sparkles className="h-3.5 w-3.5 mr-1" /> Gerar relatório
            </Button>
          </div>
        ))}
      </div>

      <RelatorioPreviewModal open={open} onOpenChange={setOpen} titulo={`Prévia · ${titulo}`} />
    </div>
  );
}
