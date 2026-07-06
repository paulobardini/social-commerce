import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useCockpit } from "../contexts/CockpitContext";
import { periodLabel, type PeriodKey } from "../lib/range";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const PERIODOS: PeriodKey[] = ["hoje", "7d", "30d", "90d", "trimestre", "semestre", "ano"];

interface Props { title?: string; showRep?: boolean; showPeriod?: boolean; }

export function CockpitTopbar({ title, showRep = false, showPeriod = true }: Props) {
  const { period, setPeriod, comparar, setComparar, customRange, setCustomRange, repId, setRepId, seed } = useCockpit();

  return (
    <div className="nx-card border-x-0 border-t-0 rounded-none sticky top-0 z-20 px-4 md:px-6 py-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {title && <h1 className="text-base font-semibold nx-text">{title}</h1>}
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {showRep && (
            <Select value={repId} onValueChange={(v) => setRepId(v as string)}>
              <SelectTrigger className="h-8 w-[180px] text-xs">
                <SelectValue placeholder="Representante" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os representantes</SelectItem>
                {seed.representantes.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {showPeriod && (
            <>
              <div className="flex items-center bg-[#F6F7F9] rounded-lg p-0.5">
                {PERIODOS.map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      "px-2.5 py-1 text-[11px] font-medium rounded-md transition",
                      period === p ? "bg-white nx-text shadow-sm" : "nx-muted hover:nx-text"
                    )}
                  >
                    {periodLabel[p]}
                  </button>
                ))}
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("h-8 text-xs gap-1.5", period === "custom" && "border-[#2D3A8C] text-[#2D3A8C]")}>
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {customRange ? `${format(customRange.from, "dd/MM")} – ${format(customRange.to, "dd/MM")}` : "Personalizado"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={customRange ? { from: customRange.from, to: customRange.to } : undefined}
                    onSelect={(r) => {
                      if (r?.from && r?.to) { setCustomRange({ from: r.from, to: r.to }); setPeriod("custom"); }
                    }}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              <div className="flex items-center gap-2 pl-2 border-l border-[#E7E9EE]">
                <Switch id="comparar" checked={comparar} onCheckedChange={setComparar} />
                <Label htmlFor="comparar" className="text-[11px] nx-muted cursor-pointer">Comparar</Label>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
