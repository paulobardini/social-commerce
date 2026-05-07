import { IMHeader } from "@/components/inteligencia/IMHeader";
import { KpiCard } from "@/components/inteligencia/KpiCard";
import { StatusBadge } from "@/components/inteligencia/StatusBadge";
import { colecoesIM, formatBRL, formatPct } from "@/data/mockInteligencia";
import { Trophy, Percent, Activity, PackageX, Shirt, Palette, Ruler, Star } from "lucide-react";

export default function Colecoes() {
  return (
    <div className="bg-background min-h-full">
      <IMHeader title="Performance de Coleções" subtitle="Entenda quais coleções, categorias, cores e grades entregam melhor resultado comercial." />

      <div className="p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <KpiCard label="Maior receita" value="Inverno 2026" hint="R$ 1,28M" icon={<Trophy className="h-3.5 w-3.5" />} />
          <KpiCard label="Maior margem" value="Casual" hint="53,8%" icon={<Percent className="h-3.5 w-3.5" />} accent="success" />
          <KpiCard label="Maior sell-through" value="Fitness 2026" hint="86%" icon={<Activity className="h-3.5 w-3.5" />} accent="info" />
          <KpiCard label="Mais parado" value="Essentials" hint="1.708 un" icon={<PackageX className="h-3.5 w-3.5" />} accent="warn" />
          <KpiCard label="Categoria campeã" value="Infantil" hint="38% receita" icon={<Shirt className="h-3.5 w-3.5" />} />
          <KpiCard label="Cor + saída" value="Marinho" hint="22% vol." icon={<Palette className="h-3.5 w-3.5" />} />
          <KpiCard label="Grade demanda" value="Tam 6" hint="28%" icon={<Ruler className="h-3.5 w-3.5" />} />
          <KpiCard label="Destaque" value="Conjunto Fitness" hint="Score 94" icon={<Star className="h-3.5 w-3.5" />} accent="success" />
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <p className="text-sm font-bold p-3 border-b border-border">Tabela de coleções</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-secondary/50">
                <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                  {["Coleção","Receita","Comprado","Vendido","Estoque","Sell-th","Margem","MK simples","MK completo","Dias","Estrelas","Críticos","Recomendação"].map(h=> <th key={h} className="px-3 py-2">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {colecoesIM.map(c => (
                  <tr key={c.nome} className="border-t border-border hover:bg-secondary/20">
                    <td className="px-3 py-2 font-semibold">{c.nome}</td>
                    <td className="px-3 py-2 tabular-nums">{formatBRL(c.receita)}</td>
                    <td className="px-3 py-2 tabular-nums">{c.comprado}</td>
                    <td className="px-3 py-2 tabular-nums">{c.vendido}</td>
                    <td className="px-3 py-2 tabular-nums">{c.estoque}</td>
                    <td className="px-3 py-2 tabular-nums">{formatPct(c.sellThrough)}</td>
                    <td className="px-3 py-2 tabular-nums font-semibold">{formatPct(c.margem)}</td>
                    <td className="px-3 py-2 tabular-nums">{c.markupSimples}x</td>
                    <td className="px-3 py-2 tabular-nums">{c.markupCompleto}x</td>
                    <td className="px-3 py-2 tabular-nums">{c.diasEmEstoque}d</td>
                    <td className="px-3 py-2 text-emerald-700">{c.estrelas}</td>
                    <td className="px-3 py-2 text-rose-600">{c.criticos}</td>
                    <td className="px-3 py-2"><StatusBadge status={c.recomendacao} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Box title="Cores mais vendidas" items={[["Marinho","22%"],["Vinho","18%"],["Camel","14%"],["Preto","12%"],["Off-white","9%"]]} />
          <Box title="Tamanhos com maior saída" items={[["Tam 6","28%"],["Tam 8","26%"],["Tam M","18%"],["Tam G","14%"],["Tam P","9%"]]} />
          <Box title="Categorias com melhor margem" items={[["Casual","53,8%"],["Moda feminina","51,1%"],["Fitness","49,2%"],["Alfaiataria","44,1%"],["Adulto","38,4%"]]} />
          <Box title="Produtos com maior ruptura" items={[["Conjunto Fitness Seamless","cob. 1,6d"],["Vestido Floral Midi","cob. 4d"],["Blusa Tricot Premium","cob. 6d"]]} />
          <Box title="Produtos com maior sobra" items={[["Calça Sarja Slim","492 un"],["Blazer Alfaiataria","154 un"],["Camisa Linho Resort","146 un"]]} />
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-2">Recomendação para próxima coleção</p>
            <p className="text-sm text-foreground/85">
              Ampliar mix de <strong>infantil</strong> (sell-through 82%) e <strong>tricot feminino</strong>
              (margem 50,2%). Reduzir compra de <strong>adulto Essentials</strong> em 30%. Reforçar tamanhos
              <strong> 6 e 8</strong>, que concentram 54% da saída.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Box({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-sm font-bold mb-2">{title}</p>
      <ul className="space-y-1.5">
        {items.map(([a, b]) => (
          <li key={a} className="flex justify-between text-sm py-1 border-b border-border last:border-0">
            <span className="text-foreground/85">{a}</span>
            <span className="font-semibold tabular-nums">{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
