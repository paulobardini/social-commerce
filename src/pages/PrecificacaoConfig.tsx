import { useMemo, useState } from "react";
import { ArrowLeft, RotateCcw, Tag, TrendingUp, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  loadPrecificacao,
  savePrecificacao,
  formatRegra,
  calcularVenda,
  type ModoPreco,
  type Arredondamento,
  type RegraPreco,
} from "@/lib/precificacao";
import { usePrecificacaoState } from "@/hooks/usePrecoVenda";
import { brands as allBrands } from "@/data/mockProducts";

const arredondamentos: { value: Arredondamento; label: string }[] = [
  { value: "none", label: "Sem arredondar" },
  { value: "90", label: "Terminar em ,90" },
  { value: "99", label: "Terminar em ,99" },
  { value: "inteiro", label: "Número inteiro" },
];

function RegraEditor({
  regra,
  onChange,
}: {
  regra: RegraPreco;
  onChange: (r: RegraPreco) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      <div className="flex rounded-md border border-border p-0.5 text-[11px]">
        <button
          type="button"
          onClick={() => onChange({ ...regra, modo: "markup" })}
          className={`px-3 h-7 rounded-sm font-medium transition-colors ${regra.modo === "markup" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        >
          Markup (x)
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...regra, modo: "margem" })}
          className={`px-3 h-7 rounded-sm font-medium transition-colors ${regra.modo === "margem" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        >
          Margem (%)
        </button>
      </div>
      <Input
        type="text"
        value={String(regra.valor).replace(".", ",")}
        onChange={(e) => {
          const num = parseFloat(e.target.value.replace(",", "."));
          onChange({ ...regra, valor: isNaN(num) ? 0 : num });
        }}
        className="h-8 w-24 text-xs text-center"
      />
    </div>
  );
}

export default function PrecificacaoConfig() {
  const state = usePrecificacaoState();
  const [preview, setPreview] = useState(100);

  const exemplo = useMemo(() => calcularVenda(preview, state.global), [preview, state.global]);

  const updateGlobal = (regra: RegraPreco) => {
    savePrecificacao({ ...loadPrecificacao(), global: regra });
  };
  const updateMarca = (slug: string, regra: RegraPreco | null) => {
    const s = loadPrecificacao();
    const porMarca = { ...s.porMarca };
    if (regra === null) delete porMarca[slug];
    else porMarca[slug] = regra;
    savePrecificacao({ ...s, porMarca });
  };
  const toggleMostrar = (v: boolean) => {
    savePrecificacao({ ...loadPrecificacao(), mostrarNoCard: v });
  };
  const changeArredondamentoGlobal = (a: Arredondamento) => {
    updateGlobal({ ...state.global, arredondamento: a });
  };

  return (
    <div className="flex-1 min-w-0 pb-16 md:pb-0">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              to="/perfil"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="h-3 w-3" /> Voltar ao perfil
            </Link>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Minha precificação
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Defina o markup ou margem para simular o preço de venda ao consumidor final.
            </p>
          </div>
        </div>

        {/* Exibição */}
        <section className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {state.mostrarNoCard ? (
              <Eye className="h-4 w-4 text-accent" />
            ) : (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">Mostrar preço de venda nos cards</p>
              <p className="text-xs text-muted-foreground">
                Exibe uma linha discreta com o preço sugerido em cada produto.
              </p>
            </div>
          </div>
          <Switch checked={state.mostrarNoCard} onCheckedChange={toggleMostrar} />
        </section>

        {/* Global */}
        <section className="bg-card border border-border rounded-xl p-4 md:p-5 space-y-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Padrão global</p>
            <p className="text-xs text-muted-foreground">Aplicado a todas as marcas, exceto as personalizadas abaixo.</p>
          </div>

          <RegraEditor regra={state.global} onChange={updateGlobal} />

          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Arredondamento</p>
            <div className="flex flex-wrap gap-1.5">
              {arredondamentos.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => changeArredondamentoGlobal(a.value)}
                  className={`h-7 px-3 rounded-md border text-[11px] transition-colors ${
                    (state.global.arredondamento || "none") === a.value
                      ? "border-accent bg-accent/10 text-foreground"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="border-t border-border pt-3 flex items-center gap-3 text-xs">
            <span className="text-muted-foreground">Simular custo</span>
            <Input
              type="number"
              value={preview}
              onChange={(e) => setPreview(parseFloat(e.target.value) || 0)}
              className="h-8 w-24 text-xs text-center"
            />
            <span className="text-muted-foreground">→</span>
            <span className="font-bold text-foreground">
              R$ {exemplo.toFixed(2).replace(".", ",")}
            </span>
            <span className="text-muted-foreground">venda</span>
          </div>
        </section>

        {/* Por marca */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Personalizar por marca</p>
              <p className="text-xs text-muted-foreground">Sobrescreve o padrão global para a marca escolhida.</p>
            </div>
          </div>

          <div className="space-y-2">
            {allBrands.map((b) => {
              const custom = state.porMarca[b.slug];
              const regra = custom || state.global;
              return (
                <div
                  key={b.slug}
                  className="bg-card border border-border rounded-xl px-3 md:px-4 py-2.5 flex items-center gap-3"
                >
                  <img src={b.logo} alt={b.name} className="h-8 w-8 rounded-md object-cover border border-border shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{b.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Atual: <span className="font-semibold text-foreground">{formatRegra(regra)}</span>{" "}
                      · {custom ? "personalizado" : "usando padrão global"}
                    </p>
                  </div>
                  <RegraEditor
                    regra={regra}
                    onChange={(r) => updateMarca(b.slug, r)}
                  />
                  {custom && (
                    <button
                      onClick={() => updateMarca(b.slug, null)}
                      title="Voltar ao padrão global"
                      className="h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center shrink-0"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <Tag className="h-3 w-3" /> Para ajustar um produto específico, use o botão no modal do produto.
        </p>
      </div>
    </div>
  );
}
