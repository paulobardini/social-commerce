import { useMemo, useState } from "react";
import WhatsAppInbox from "@/pages/vendedor/WhatsAppInbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ShieldCheck, User as UserIcon } from "lucide-react";
import {
  mockAtendentes, setorLabels, setorDot, type Setor,
  getCurrentAtendente, saveCurrentUserId, visibleSetores, getConversaSetor,
} from "@/data/mockAtendimento";
import type { Conversa } from "@/data/mockCRM360";

export default function AtendimentoWhatsApp() {
  const [me, setMe] = useState(getCurrentAtendente());
  const [filtroSetor, setFiltroSetor] = useState<Setor | null>(null);

  const setoresVisiveis = useMemo(() => visibleSetores(me), [me]);

  const conversasFiltro = useMemo(() => {
    return (c: Conversa) => {
      const s = getConversaSetor(c.id);
      if (!setoresVisiveis.includes(s)) return false;
      if (filtroSetor && s !== filtroSetor) return false;
      return true;
    };
  }, [setoresVisiveis, filtroSetor]);

  const handleUserSwitch = (id: string) => {
    saveCurrentUserId(id);
    const next = getCurrentAtendente();
    setMe(next);
    setFiltroSetor(null);
  };

  const topSlot = (
    <div className="p-3 space-y-2">
      <div className="flex items-center gap-1.5">
        {me.role === "supervisor"
          ? <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
          : <UserIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
        <span className="text-[11px] font-medium text-foreground truncate">
          {me.role === "supervisor"
            ? "Supervisor — todos os setores"
            : `${me.nome} — ${me.setores.map(s => setorLabels[s]).join(", ")}`}
        </span>
      </div>

      <Select value={me.id} onValueChange={handleUserSwitch}>
        <SelectTrigger className="h-7 text-[11px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          {mockAtendentes.map(a => (
            <SelectItem key={a.id} value={a.id} className="text-xs">
              {a.nome} · {a.role === "supervisor" ? "Supervisor" : a.setores.map(s => setorLabels[s]).join("/")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {setoresVisiveis.length > 1 && (
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setFiltroSetor(null)}
            className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
              filtroSetor === null
                ? "bg-foreground text-background border-foreground"
                : "bg-card text-muted-foreground border-border hover:border-foreground/40"
            }`}
          >
            Todos
          </button>
          {setoresVisiveis.map(s => {
            const active = filtroSetor === s;
            return (
              <button
                key={s}
                onClick={() => setFiltroSetor(s)}
                className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                  active
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card text-muted-foreground border-border hover:border-foreground/40"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${setorDot[s]}`} />
                {setorLabels[s]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <WhatsAppInbox
      conversasFiltro={conversasFiltro}
      topSlot={topSlot}
      titulo="WhatsApp · Atendimento"
      mostrarSetor
      modoMetodo={false}
    />
  );
}
