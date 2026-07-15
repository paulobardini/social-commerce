import { useState } from "react";
import { Pencil, Tag, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  loadPrecificacao,
  savePrecificacao,
  getRegra,
  formatRegra,
  type ModoPreco,
} from "@/lib/precificacao";
import { usePrecificacaoState } from "@/hooks/usePrecoVenda";

interface PrecoVendaBarProps {
  brandSlug: string;
  brandName: string;
}

/**
 * Barra fina e discreta acima do grid da marca — permite ajustar rapidamente
 * o markup/margem daquela marca sem sair da página.
 */
export function PrecoVendaBar({ brandSlug, brandName }: PrecoVendaBarProps) {
  const state = usePrecificacaoState();
  const { regra, origem } = getRegra(state, brandSlug);

  const [open, setOpen] = useState(false);
  const [modo, setModo] = useState<ModoPreco>(regra.modo);
  const [valor, setValor] = useState<string>(String(regra.valor).replace(".", ","));

  function commit(usarPadrao = false) {
    const s = loadPrecificacao();
    if (usarPadrao) {
      const next = { ...s.porMarca };
      delete next[brandSlug];
      savePrecificacao({ ...s, porMarca: next });
    } else {
      const num = parseFloat(valor.replace(",", "."));
      if (isNaN(num) || num <= 0) return;
      savePrecificacao({
        ...s,
        porMarca: {
          ...s.porMarca,
          [brandSlug]: { modo, valor: num, arredondamento: regra.arredondamento || "90" },
        },
      });
    }
    setOpen(false);
  }

  if (!state.mostrarNoCard) return null;

  const origemLabel =
    origem === "marca" ? "definido para esta marca" : "usando padrão global";

  return (
    <div className="px-3 md:px-6 py-1.5 bg-muted/30 border-b border-border flex items-center justify-between gap-2 text-[11px]">
      <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
        <TrendingUp className="h-3 w-3 shrink-0 text-accent" />
        <span className="truncate">
          Preço de venda p/ <span className="font-semibold text-foreground">{brandName}</span>:{" "}
          <span className="font-semibold text-foreground">{formatRegra(regra)}</span>{" "}
          <span className="hidden sm:inline text-muted-foreground/80">· {origemLabel}</span>
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button className="h-6 px-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors">
              <Pencil className="h-3 w-3" />
              <span className="hidden sm:inline">Ajustar</span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 p-3">
            <p className="text-xs font-semibold mb-2">Precificação para {brandName}</p>
            <div className="flex rounded-md border border-border p-0.5 mb-2 text-[11px]">
              <button
                type="button"
                onClick={() => setModo("markup")}
                className={`flex-1 h-7 rounded-sm font-medium transition-colors ${modo === "markup" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                Markup (x)
              </button>
              <button
                type="button"
                onClick={() => setModo("margem")}
                className={`flex-1 h-7 rounded-sm font-medium transition-colors ${modo === "margem" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                Margem (%)
              </button>
            </div>
            <Input
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder={modo === "markup" ? "Ex.: 2,5" : "Ex.: 60"}
              className="h-8 text-xs"
              autoFocus
            />
            <div className="flex gap-1.5 mt-2">
              <Button size="sm" className="flex-1 h-7 text-[11px]" onClick={() => commit(false)}>
                Salvar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-7 text-[11px]"
                onClick={() => commit(true)}
                title="Voltar ao padrão global"
              >
                Usar padrão
              </Button>
            </div>
            <Link
              to="/precificacao"
              className="mt-2 inline-flex items-center gap-1 text-[11px] text-accent hover:underline"
              onClick={() => setOpen(false)}
            >
              <Tag className="h-3 w-3" /> Configurar todas as marcas
            </Link>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
