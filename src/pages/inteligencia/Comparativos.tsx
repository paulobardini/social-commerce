import { useState } from "react";
import { IMHeader } from "@/components/inteligencia/IMHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const tipos = [
  { v: "produto", l: "Produto vs produto" },
  { v: "colecao", l: "Coleção vs coleção" },
  { v: "fornecedor", l: "Fornecedor vs fornecedor" },
  { v: "categoria", l: "Categoria vs categoria" },
  { v: "periodo", l: "Período vs período" },
  { v: "canal", l: "Canal vs canal" },
];

const indicadores = [
  { label: "Receita", a: "R$ 980.000", b: "R$ 1.284.500", delta: 31.1 },
  { label: "Quantidade vendida", a: "5.420 un", b: "6.872 un", delta: 26.8 },
  { label: "Margem média", a: "39,4%", b: "42,8%", delta: 8.6 },
  { label: "Markup simples", a: "2,12x", b: "2,34x", delta: 10.4 },
  { label: "Markup completo", a: "1,68x", b: "1,86x", delta: 10.7 },
  { label: "Sell-through", a: "61%", b: "68%", delta: 11.5 },
  { label: "Dias médios em estoque", a: "52d", b: "38d", delta: -26.9 },
  { label: "Valor parado", a: "R$ 340.000", b: "R$ 286.900", delta: -15.6 },
  { label: "Produtos estrela", a: "3", b: "6", delta: 100 },
  { label: "Produtos críticos", a: "5", b: "2", delta: -60 },
  { label: "Risco de ruptura", a: "2", b: "8", delta: 300 },
  { label: "Recompra recomendada", a: "4", b: "12", delta: 200 },
];

export default function Comparativos() {
  const [tipo, setTipo] = useState("colecao");
  const [a, setA] = useState("Inverno 2025");
  const [b, setB] = useState("Inverno 2026");

  return (
    <div className="bg-background min-h-full">
      <IMHeader title="Comparativo Estratégico" subtitle="Compare produtos, coleções, fornecedores, categorias e períodos para apoiar decisões comerciais e de compra." />

      <div className="p-4 md:p-6 space-y-4">
        <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Tipo:</span>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="h-8 text-xs w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>{tipos.map(t => <SelectItem key={t.v} value={t.v}>{t.l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">A:</span>
            <Select value={a} onValueChange={setA}>
              <SelectTrigger className="h-8 text-xs w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Inverno 2025">Inverno 2025</SelectItem>
                <SelectItem value="Verão 2025">Verão 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">B:</span>
            <Select value={b} onValueChange={setB}>
              <SelectTrigger className="h-8 text-xs w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Inverno 2026">Inverno 2026</SelectItem>
                <SelectItem value="Verão 2026">Verão 2026</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 bg-secondary/50 border-b border-border">
            <div className="col-span-4 px-4 py-3 text-xs font-semibold text-muted-foreground">Indicador</div>
            <div className="col-span-3 px-4 py-3 text-xs font-semibold text-center">{a}</div>
            <div className="col-span-2 px-4 py-3 text-xs font-semibold text-center">Variação</div>
            <div className="col-span-3 px-4 py-3 text-xs font-semibold text-center">{b}</div>
          </div>
          {indicadores.map((it) => {
            const positive = it.delta > 0;
            const isInverse = it.label.includes("parado") || it.label.includes("Dias") || it.label.includes("críticos");
            const good = isInverse ? it.delta < 0 : positive;
            const Icon = it.delta === 0 ? Minus : positive ? TrendingUp : TrendingDown;
            return (
              <div key={it.label} className="grid grid-cols-12 border-b border-border last:border-0 text-sm hover:bg-secondary/20">
                <div className="col-span-4 px-4 py-2.5 text-foreground/85">{it.label}</div>
                <div className="col-span-3 px-4 py-2.5 text-center tabular-nums">{it.a}</div>
                <div className="col-span-2 px-4 py-2.5 text-center">
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold ${good ? "text-emerald-600" : "text-rose-600"}`}>
                    <Icon className="h-3 w-3" /> {it.delta > 0 ? "+" : ""}{it.delta.toFixed(1)}%
                  </span>
                </div>
                <div className="col-span-3 px-4 py-2.5 text-center tabular-nums font-semibold">{it.b}</div>
              </div>
            );
          })}
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-2">Conclusão automática</p>
          <p className="text-sm text-foreground/85 leading-relaxed">
            A coleção <strong>{b}</strong> apresenta melhor sell-through (+11,5 pts), maior margem média (+3,4 pts) e
            menor capital parado em estoque (-15,6%). A recomendação é ampliar a compra de categorias com alto giro,
            especialmente <strong>infantil</strong> e <strong>tricot feminino</strong>, mantendo controle sobre produtos
            adultos de baixa saída. Atenção ao crescimento de risco de ruptura (+300%): priorize reposição imediata
            dos itens com cobertura inferior a 7 dias.
          </p>
        </div>
      </div>
    </div>
  );
}
