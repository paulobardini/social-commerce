import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, MapPin, Lock } from "lucide-react";
import { useCockpit } from "../contexts/CockpitContext";
import { regioesDisponiveis } from "../lib/escopo";
import { useVendedorPerfilCtx } from "@/hooks/useVendedorPerfil";

export function EscopoSelector() {
  const { escopo, setEscopo, seed } = useCockpit();
  const perfil = useVendedorPerfilCtx();
  const regioes = regioesDisponiveis(seed);
  const travado = perfil.perfil === "gestor_regional";

  if (travado) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#2D3A8C] bg-[#E8EAF6] rounded-md px-2 py-1 border border-[#c9cef0]">
        <Lock className="h-3 w-3" />
        <span>Região: {perfil.regiao}</span>
      </div>
    );
  }

  return (
    <Select value={escopo} onValueChange={setEscopo}>
      <SelectTrigger className="h-8 w-[170px] text-xs bg-[#E8EAF6] border-[#c9cef0] text-[#2D3A8C] font-medium">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="nacional">
          <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Nacional</span>
        </SelectItem>
        {regioes.map(r => (
          <SelectItem key={r} value={r}>
            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {r}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
