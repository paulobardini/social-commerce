import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { IMHeader } from "@/components/inteligencia/IMHeader";
import { InsightCard } from "@/components/inteligencia/InsightCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { recomendacoesIM, TipoRecomendacao } from "@/data/mockInteligencia";
import { useRecomendacoes } from "@/contexts/RecomendacoesContext";

const abas: { value: string; label: string; tipo?: TipoRecomendacao | "todas" }[] = [
  { value: "todas", label: "Todas", tipo: "todas" },
  { value: "recompra", label: "Comprar novamente", tipo: "recompra" },
  { value: "liquidar", label: "Liquidar / promover", tipo: "liquidar" },
  { value: "revisar-preco", label: "Revisar preço", tipo: "revisar-preco" },
  { value: "ruptura", label: "Atenção ao estoque", tipo: "ruptura" },
  { value: "campanha", label: "Oportunidades", tipo: "campanha" },
  { value: "renegociar", label: "Renegociar fornecedor", tipo: "renegociar" },
];

export default function Recomendacoes() {
  const [params, setParams] = useSearchParams();
  const tipoUrl = params.get("tipo") ?? "todas";
  const [tab, setTab] = useState<string>(tipoUrl);
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [confianca, setConfianca] = useState<string>("todas");
  const [prioridade, setPrioridade] = useState<string>("todas");
  const { getStatus } = useRecomendacoes();

  const list = useMemo(() => {
    let l = recomendacoesIM;
    if (tab !== "todas") l = l.filter((r) => r.tipo === tab);
    if (statusFilter !== "todos") l = l.filter((r) => getStatus(r.id) === statusFilter);
    if (confianca !== "todas") l = l.filter((r) => r.confianca === confianca);
    if (prioridade !== "todas") l = l.filter((r) => r.prioridade === prioridade);
    return l;
  }, [tab, statusFilter, confianca, prioridade, getStatus]);

  const onTab = (v: string) => { setTab(v); setParams(v === "todas" ? {} : { tipo: v }); };

  return (
    <div className="bg-background min-h-full">
      <IMHeader title="Recomendações Estratégicas" subtitle="Insights automáticos para transformar dados em ações comerciais, compras mais assertivas e maior proteção de margem." />

      <div className="p-4 md:p-6 space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <Filter label="Status" value={statusFilter} setValue={setStatusFilter} options={["todos","pendente","aceita","ignorada"]} />
          <Filter label="Confiança" value={confianca} setValue={setConfianca} options={["todas","Alta","Média","Baixa"]} />
          <Filter label="Prioridade" value={prioridade} setValue={setPrioridade} options={["todas","Alta","Média","Baixa"]} />
        </div>

        <Tabs value={tab} onValueChange={onTab}>
          <TabsList className="flex-wrap h-auto bg-card border border-border">
            {abas.map((a) => (
              <TabsTrigger key={a.value} value={a.value} className="text-xs">{a.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {list.map((r) => <InsightCard key={r.id} rec={r} />)}
        </div>
        {list.length === 0 && (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-sm text-muted-foreground">
            Nenhuma recomendação encontrada para os filtros aplicados.
          </div>
        )}
      </div>
    </div>
  );
}

function Filter({ label, value, setValue, options }: { label: string; value: string; setValue: (v: string) => void; options: string[] }) {
  return (
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger className="h-8 text-xs w-auto min-w-[150px] bg-card">
        <span className="text-muted-foreground mr-1">{label}:</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => <SelectItem key={o} value={o} className="text-xs capitalize">{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
