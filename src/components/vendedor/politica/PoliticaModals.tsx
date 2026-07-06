import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, ArrowLeft, ArrowRight, Check, AlertTriangle, X } from "lucide-react";
import {
  PoliticaIndustria, DegrauPolitica, PrazoPagamento, RegraNegociado, TipoGrade,
  formatBRL, upsertPolitica,
} from "@/lib/politicaComercial";
import { brands } from "@/data/mockProducts";
import { toast } from "sonner";

const REGRA_LABEL: Record<RegraNegociado, string> = {
  media: "Média ponderada",
  porItem: "Limite por item",
  desabilitado: "Desabilitado",
};

const REGRA_DESC: Record<RegraNegociado, string> = {
  media: "Itens podem exceder o degrau máximo, desde que a média do grupo fique dentro da política.",
  porItem: "Nenhum item pode exceder o degrau máximo — o input bloqueia ao digitar.",
  desabilitado: "Preço por item não editável na cesta.",
};

// ---------- VIEW (read-only) ----------
export function PoliticaViewModal({
  open, onOpenChange, politica,
}: { open: boolean; onOpenChange: (o: boolean) => void; politica: PoliticaIndustria | null }) {
  if (!politica) return null;
  const brand = brands.find((b) => b.slug === politica.brandSlug);
  const prazosUnicos = dedupePrazos(politica.prazosPagamento);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            {politica.nomeTabela}
            <StatusBadge status={politica.status} />
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            {brand?.name || politica.brandSlug}
            {politica.vigenciaInicio && ` · vigência ${politica.vigenciaInicio}${politica.vigenciaFim ? ` a ${politica.vigenciaFim}` : ""}`}
          </p>
        </DialogHeader>
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-5 text-sm">
            <Section title="Degraus desconto ↔ comissão">
              <table className="w-full text-xs">
                <thead className="text-muted-foreground">
                  <tr className="border-b"><th className="text-left py-1">Desconto</th><th className="text-left">Comissão</th><th className="text-left">Pedido mínimo</th></tr>
                </thead>
                <tbody>
                  {politica.degraus.map((d, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-1.5">{d.desconto}%</td>
                      <td>{d.comissao}%</td>
                      <td>{d.minimoPedido ? formatBRL(d.minimoPedido) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
            <Section title="Regra de desconto negociado">
              <div className="font-medium">{REGRA_LABEL[politica.regraNegociado]}</div>
              <div className="text-xs text-muted-foreground">{REGRA_DESC[politica.regraNegociado]}</div>
            </Section>
            <Section title="Prazos de pagamento">
              <ul className="space-y-1">
                {prazosUnicos.map((p) => (
                  <li key={p.id} className="flex items-center gap-2 text-xs">
                    <span className="font-medium min-w-[130px]">{p.metodo}</span>
                    <span>{p.parcelas}</span>
                    {p.padrao && <Badge variant="secondary" className="text-[10px]">padrão</Badge>}
                  </li>
                ))}
              </ul>
              <div className="text-[11px] text-muted-foreground mt-2">
                Bônus: +{politica.bonusComissaoPor15Dias}% de comissão a cada 15 dias abaixo do prazo médio ({politica.prazoMedio}d).
              </div>
            </Section>
            <Section title="Mínimos e condições">
              <ul className="text-xs space-y-1">
                <li>Frete CIF: mínimo {formatBRL(politica.minimoFreteCIF)}</li>
                <li>Duplicata mínima: {formatBRL(politica.minimoDuplicata)}</li>
                <li>Análise de crédito: {politica.tempoAnaliseCredito} dias</li>
                <li>CNPJ aberto há no mínimo: {politica.tempoMinCNPJ} dias</li>
              </ul>
            </Section>
            <Section title="Grade de produto">
              <ul className="text-xs space-y-1">
                <li>Tipo: {politica.tipoGrade}</li>
                <li>Permite escolher tamanho: {politica.permiteEscolherTamanho ? "sim" : "não"}</li>
                <li>Permite escolher cor: {politica.permiteEscolherCor ? "sim" : "não"}</li>
              </ul>
            </Section>
          </div>
        </ScrollArea>
        <DialogFooter className="border-t p-3 shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{title}</div>
      <div className="border rounded-md p-3 bg-card">{children}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: PoliticaIndustria["status"] }) {
  const map: Record<PoliticaIndustria["status"], string> = {
    ativa: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    programada: "bg-sky-500/15 text-sky-700 border-sky-500/30",
    vencida: "bg-destructive/15 text-destructive border-destructive/30",
    rascunho: "bg-muted text-muted-foreground border-border",
  };
  return <Badge variant="outline" className={`capitalize text-[10px] ${map[status]}`}>{status}</Badge>;
}

function dedupePrazos(list: PrazoPagamento[]): PrazoPagamento[] {
  const seen = new Set<string>();
  const out: PrazoPagamento[] = [];
  for (const p of list) {
    const key = `${p.metodo}|${p.parcelas}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

// ---------- EDITOR (stepper) ----------
const STEPS = [
  "Identificação",
  "Degraus",
  "Regra negociado",
  "Prazos",
  "Mínimos",
  "Grade",
  "Revisão",
];

export function PoliticaEditorModal({
  open, onOpenChange, initial,
}: { open: boolean; onOpenChange: (o: boolean) => void; initial: PoliticaIndustria }) {
  const [step, setStep] = useState(0);
  const [pol, setPol] = useState<PoliticaIndustria>(initial);
  useEffect(() => { if (open) { setPol(initial); setStep(0); } }, [open, initial]);

  const canNext = useMemo(() => validateStep(step, pol) === null, [step, pol]);
  const error = validateStep(step, pol);

  function salvar() {
    upsertPolitica(pol);
    toast.success(`${pol.nomeTabela} salva.`, {
      description: pol.status === "ativa"
        ? "Afeta orçamentos criados a partir de agora. Orçamentos já enviados não mudam."
        : "Rascunho salvo — ative quando pronto.",
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b shrink-0">
          <DialogTitle>Editar política comercial</DialogTitle>
          <div className="flex items-center gap-1 mt-2 overflow-x-auto scrollbar-hide">
            {STEPS.map((s, i) => (
              <button
                key={s}
                onClick={() => setStep(i)}
                className={`text-[11px] px-2 py-1 rounded whitespace-nowrap ${i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
              >
                {i + 1}. {s}
              </button>
            ))}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-4">
            {step === 0 && <StepIdent pol={pol} setPol={setPol} />}
            {step === 1 && <StepDegraus pol={pol} setPol={setPol} />}
            {step === 2 && <StepRegra pol={pol} setPol={setPol} />}
            {step === 3 && <StepPrazos pol={pol} setPol={setPol} />}
            {step === 4 && <StepMinimos pol={pol} setPol={setPol} />}
            {step === 5 && <StepGrade pol={pol} setPol={setPol} />}
            {step === 6 && <StepRevisao pol={pol} />}
          </div>
        </ScrollArea>

        <DialogFooter className="border-t p-3 shrink-0 gap-2 flex-row justify-between">
          <div className="text-xs text-destructive flex items-center gap-1">
            {error && <><AlertTriangle className="h-3 w-3" /> {error}</>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={!canNext}>
                Avançar <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={salvar}>
                <Check className="h-4 w-4 mr-1" /> Salvar
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function validateStep(step: number, pol: PoliticaIndustria): string | null {
  if (step === 0) {
    if (!pol.brandSlug) return "Selecione a indústria";
    if (!pol.nomeTabela.trim()) return "Informe o nome da política";
  }
  if (step === 1) {
    if (pol.degraus.length === 0) return "Adicione ao menos um degrau";
    const ordered = [...pol.degraus].sort((a, b) => a.desconto - b.desconto);
    for (let i = 1; i < ordered.length; i++) {
      if (ordered[i].desconto === ordered[i - 1].desconto) return "Descontos duplicados";
      if (ordered[i].comissao > ordered[i - 1].comissao) return "Comissões devem ser decrescentes com descontos crescentes";
    }
  }
  if (step === 3) {
    if (pol.prazosPagamento.length === 0) return "Adicione ao menos um prazo";
  }
  return null;
}

// Steps ---------------------------------------
function StepIdent({ pol, setPol }: { pol: PoliticaIndustria; setPol: (p: PoliticaIndustria) => void }) {
  return (
    <div className="space-y-3 max-w-md">
      <div>
        <Label className="text-xs">Indústria</Label>
        <Select value={pol.brandSlug} onValueChange={(v) => setPol({ ...pol, brandSlug: v })}>
          <SelectTrigger><SelectValue placeholder="Selecione a indústria" /></SelectTrigger>
          <SelectContent>
            {brands.map((b) => <SelectItem key={b.slug} value={b.slug}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Nome da política</Label>
        <Input value={pol.nomeTabela} onChange={(e) => setPol({ ...pol, nomeTabela: e.target.value })} placeholder="Ex.: Brandili PV 26" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Vigência início</Label>
          <Input value={pol.vigenciaInicio || ""} onChange={(e) => setPol({ ...pol, vigenciaInicio: e.target.value })} placeholder="DD/MM/AAAA" />
        </div>
        <div>
          <Label className="text-xs">Vigência fim</Label>
          <Input value={pol.vigenciaFim || ""} onChange={(e) => setPol({ ...pol, vigenciaFim: e.target.value })} placeholder="DD/MM/AAAA" />
        </div>
      </div>
      <div>
        <Label className="text-xs">Status</Label>
        <Select value={pol.status} onValueChange={(v: any) => setPol({ ...pol, status: v, ativa: v === "ativa" })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="rascunho">Rascunho</SelectItem>
            <SelectItem value="programada">Programada</SelectItem>
            <SelectItem value="ativa">Ativa</SelectItem>
            <SelectItem value="vencida">Vencida</SelectItem>
          </SelectContent>
        </Select>
        {pol.status === "ativa" && (
          <p className="text-[11px] text-amber-600 mt-1">Ativar substitui a política ativa anterior desta indústria.</p>
        )}
      </div>
    </div>
  );
}

function StepDegraus({ pol, setPol }: { pol: PoliticaIndustria; setPol: (p: PoliticaIndustria) => void }) {
  function update(i: number, patch: Partial<DegrauPolitica>) {
    const next = pol.degraus.map((d, j) => j === i ? { ...d, ...patch } : d);
    next.sort((a, b) => a.desconto - b.desconto);
    setPol({ ...pol, degraus: next });
  }
  function add() {
    const last = pol.degraus[pol.degraus.length - 1];
    setPol({ ...pol, degraus: [...pol.degraus, { desconto: (last?.desconto || 10) + 2.5, comissao: Math.max(1, (last?.comissao || 5) - 1) }] });
  }
  function remove(i: number) {
    setPol({ ...pol, degraus: pol.degraus.filter((_, j) => j !== i) });
  }
  return (
    <div className="space-y-3">
      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="text-left px-2 py-1.5">Desconto %</th>
              <th className="text-left px-2 py-1.5">Comissão %</th>
              <th className="text-left px-2 py-1.5">Pedido mínimo R$</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {pol.degraus.map((d, i) => (
              <tr key={i} className="border-t">
                <td className="px-2 py-1"><Input type="number" step={0.5} className="h-8 w-24" value={d.desconto} onChange={(e) => update(i, { desconto: Number(e.target.value) })} /></td>
                <td className="px-2 py-1"><Input type="number" step={0.5} className="h-8 w-24" value={d.comissao} onChange={(e) => update(i, { comissao: Number(e.target.value) })} /></td>
                <td className="px-2 py-1"><Input type="number" className="h-8 w-32" value={d.minimoPedido || ""} placeholder="—" onChange={(e) => update(i, { minimoPedido: e.target.value ? Number(e.target.value) : undefined })} /></td>
                <td className="px-2 py-1"><button onClick={() => remove(i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button variant="outline" size="sm" onClick={add} className="gap-1"><Plus className="h-4 w-4" /> Adicionar degrau</Button>
      <div>
        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mt-4 mb-1.5">Preview do stepper</div>
        <div className="border rounded-md p-3 grid grid-cols-4 gap-1.5">
          {pol.degraus.map((d, i) => (
            <div key={i} className="text-[11px] border rounded px-2 py-1.5 text-center bg-card">
              <div className="font-semibold">{d.desconto}%</div>
              <div className="text-[10px] opacity-80">com {d.comissao}%</div>
              {d.minimoPedido && <div className="text-[9px] text-muted-foreground">min {formatBRL(d.minimoPedido)}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepRegra({ pol, setPol }: { pol: PoliticaIndustria; setPol: (p: PoliticaIndustria) => void }) {
  return (
    <div className="space-y-2">
      <RadioGroup value={pol.regraNegociado} onValueChange={(v: any) => setPol({ ...pol, regraNegociado: v })}>
        {(["media", "porItem", "desabilitado"] as RegraNegociado[]).map((r) => (
          <label key={r} className={`flex items-start gap-3 p-3 border rounded-md cursor-pointer ${pol.regraNegociado === r ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}>
            <RadioGroupItem value={r} className="mt-1" />
            <div>
              <div className="text-sm font-medium">{REGRA_LABEL[r]}</div>
              <div className="text-xs text-muted-foreground">{REGRA_DESC[r]}</div>
            </div>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}

function StepPrazos({ pol, setPol }: { pol: PoliticaIndustria; setPol: (p: PoliticaIndustria) => void }) {
  function update(i: number, patch: Partial<PrazoPagamento>) {
    setPol({ ...pol, prazosPagamento: pol.prazosPagamento.map((p, j) => j === i ? { ...p, ...patch } : p) });
  }
  function setPadrao(i: number) {
    setPol({ ...pol, prazosPagamento: pol.prazosPagamento.map((p, j) => ({ ...p, padrao: j === i })) });
  }
  function add() {
    setPol({ ...pol, prazosPagamento: [...pol.prazosPagamento, { id: `p${Date.now()}`, metodo: "Boleto", parcelas: "30/60" }] });
  }
  function remove(i: number) {
    setPol({ ...pol, prazosPagamento: pol.prazosPagamento.filter((_, j) => j !== i) });
  }
  return (
    <div className="space-y-3">
      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="text-left px-2 py-1.5">Método</th>
              <th className="text-left px-2 py-1.5">Parcelas/vencimentos</th>
              <th className="text-left px-2 py-1.5">Padrão</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {pol.prazosPagamento.map((p, i) => (
              <tr key={p.id} className="border-t">
                <td className="px-2 py-1">
                  <Select value={p.metodo} onValueChange={(v: any) => update(i, { metodo: v })}>
                    <SelectTrigger className="h-8 w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Boleto">Boleto</SelectItem>
                      <SelectItem value="Cartão de crédito">Cartão de crédito</SelectItem>
                      <SelectItem value="PIX">PIX</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-2 py-1"><Input className="h-8" value={p.parcelas} onChange={(e) => update(i, { parcelas: e.target.value })} /></td>
                <td className="px-2 py-1"><input type="radio" checked={!!p.padrao} onChange={() => setPadrao(i)} /></td>
                <td className="px-2 py-1"><button onClick={() => remove(i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button variant="outline" size="sm" onClick={add} className="gap-1"><Plus className="h-4 w-4" /> Adicionar prazo</Button>
      <div className="grid grid-cols-2 gap-3 pt-3">
        <div>
          <Label className="text-xs">Bônus comissão por antecipação (% a cada 15 dias)</Label>
          <Input type="number" step={0.1} value={pol.bonusComissaoPor15Dias} onChange={(e) => setPol({ ...pol, bonusComissaoPor15Dias: Number(e.target.value) })} />
        </div>
        <div>
          <Label className="text-xs">Prazo médio (dias)</Label>
          <Input type="number" value={pol.prazoMedio} onChange={(e) => setPol({ ...pol, prazoMedio: Number(e.target.value) })} />
        </div>
      </div>
    </div>
  );
}

function StepMinimos({ pol, setPol }: { pol: PoliticaIndustria; setPol: (p: PoliticaIndustria) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 max-w-lg">
      <div>
        <Label className="text-xs">Frete CIF mínimo (R$)</Label>
        <Input type="number" value={pol.minimoFreteCIF} onChange={(e) => setPol({ ...pol, minimoFreteCIF: Number(e.target.value) })} />
      </div>
      <div>
        <Label className="text-xs">Duplicata mínima (R$)</Label>
        <Input type="number" value={pol.minimoDuplicata} onChange={(e) => setPol({ ...pol, minimoDuplicata: Number(e.target.value) })} />
      </div>
      <div>
        <Label className="text-xs">Análise de crédito (dias)</Label>
        <Input type="number" value={pol.tempoAnaliseCredito} onChange={(e) => setPol({ ...pol, tempoAnaliseCredito: Number(e.target.value) })} />
      </div>
      <div>
        <Label className="text-xs">CNPJ aberto há no mínimo (dias)</Label>
        <Input type="number" value={pol.tempoMinCNPJ} onChange={(e) => setPol({ ...pol, tempoMinCNPJ: Number(e.target.value) })} />
      </div>
    </div>
  );
}

function StepGrade({ pol, setPol }: { pol: PoliticaIndustria; setPol: (p: PoliticaIndustria) => void }) {
  return (
    <div className="space-y-3 max-w-md">
      <div>
        <Label className="text-xs">Tipo de grade</Label>
        <Select value={pol.tipoGrade} onValueChange={(v: any) => setPol({ ...pol, tipoGrade: v as TipoGrade, gradeFechada: v === "Fechada" })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Palito">Palito</SelectItem>
            <SelectItem value="Aberta">Aberta</SelectItem>
            <SelectItem value="Fechada">Fechada</SelectItem>
            <SelectItem value="Livre">Livre</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between border rounded-md p-3">
        <Label className="text-sm cursor-pointer">Permite escolher tamanho</Label>
        <Switch checked={pol.permiteEscolherTamanho} onCheckedChange={(v) => setPol({ ...pol, permiteEscolherTamanho: v })} />
      </div>
      <div className="flex items-center justify-between border rounded-md p-3">
        <Label className="text-sm cursor-pointer">Permite escolher cor</Label>
        <Switch checked={pol.permiteEscolherCor} onCheckedChange={(v) => setPol({ ...pol, permiteEscolherCor: v })} />
      </div>
    </div>
  );
}

function StepRevisao({ pol }: { pol: PoliticaIndustria }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="border rounded-md p-3 bg-muted/40">
        <div className="font-semibold">{pol.nomeTabela}</div>
        <div className="text-xs text-muted-foreground">
          {pol.brandSlug} · status {pol.status}
          {pol.vigenciaInicio && ` · ${pol.vigenciaInicio}${pol.vigenciaFim ? ` — ${pol.vigenciaFim}` : ""}`}
        </div>
      </div>
      <div>
        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Preview do cockpit do vendedor</div>
        <div className="border rounded-md p-3 space-y-2">
          <div className="text-xs text-muted-foreground">Degraus (o vendedor vê):</div>
          <div className="grid grid-cols-4 gap-1.5">
            {pol.degraus.map((d, i) => (
              <div key={i} className="text-[11px] border rounded px-2 py-1.5 text-center bg-card">
                <div className="font-semibold">{d.desconto}%</div>
                <div className="text-[10px] opacity-80">com {d.comissao}%</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground pt-2">Prazos:</div>
          <div className="flex flex-wrap gap-1.5">
            {dedupePrazos(pol.prazosPagamento).map((p) => (
              <Badge key={p.id} variant="secondary" className="text-[10px]">{p.metodo} · {p.parcelas}{p.padrao ? " (padrão)" : ""}</Badge>
            ))}
          </div>
          <div className="text-[11px] text-muted-foreground pt-2">
            Regra de negociação: <b>{REGRA_LABEL[pol.regraNegociado]}</b> · Frete CIF ≥ {formatBRL(pol.minimoFreteCIF)} · Duplicata ≥ {formatBRL(pol.minimoDuplicata)}
          </div>
        </div>
      </div>
    </div>
  );
}
