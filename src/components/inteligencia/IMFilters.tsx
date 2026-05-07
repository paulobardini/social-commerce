import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const filtrosDef = [
  { key: "periodo", label: "Período", options: ["7 dias", "30 dias", "90 dias", "Este ano", "Personalizado"], default: "30 dias" },
  { key: "colecao", label: "Coleção", options: ["Todas", "Inverno 2026", "Verão 2026", "Alto Verão", "Essentials", "Fitness 2026"], default: "Todas" },
  { key: "marca", label: "Marca", options: ["Todas", "Brandili", "Kyly", "Hering", "Malwee", "Lunender", "Elian", "Colorittá"], default: "Todas" },
  { key: "categoria", label: "Categoria", options: ["Todas", "Infantil", "Adulto", "Fitness", "Alfaiataria", "Casual", "Streetwear", "Moda feminina"], default: "Todas" },
  { key: "canal", label: "Canal", options: ["Todos", "Representante", "Social Commerce", "WhatsApp", "Pedido Direto", "Marketplace B2B"], default: "Todos" },
  { key: "regiao", label: "Região", options: ["Todas", "Sul", "Sudeste", "Centro-Oeste", "Nordeste", "Norte"], default: "Todas" },
  { key: "fornecedor", label: "Fornecedor", options: ["Todos", "Têxtil Aurora", "Cotton Prime", "ActiveWear Pro", "Tricot Sul", "Floratta Confecções", "Linho Brasil"], default: "Todos" },
];

export function IMFilters() {
  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 md:px-6 py-3">
      <div className="flex flex-wrap gap-2">
        {filtrosDef.map((f) => (
          <Select key={f.key} defaultValue={f.default}>
            <SelectTrigger className="h-8 text-xs w-auto min-w-[130px] bg-card">
              <span className="text-muted-foreground mr-1">{f.label}:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {f.options.map((o) => (
                <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>
    </div>
  );
}
