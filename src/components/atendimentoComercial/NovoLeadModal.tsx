import { useState } from "react";
import { X } from "lucide-react";
import { OrigemLead, origemLabels } from "@/data/mockAtendimentoComercial";
import { useAtendimentoComercial } from "@/contexts/AtendimentoComercialContext";

export function NovoLeadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { criarLead, vendedores } = useAtendimentoComercial();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [origem, setOrigem] = useState<OrigemLead>("manual");
  const [campanha, setCampanha] = useState("");
  const [vendedorId, setVendedorId] = useState<string>("");
  if (!open) return null;
  const ok = nome.trim().length > 2 && telefone.trim().length > 6;
  const submit = () => {
    if (!ok) return;
    criarLead({ nome: nome.trim(), telefone: telefone.trim(), origem, campanha: campanha || undefined, vendedorId: vendedorId || undefined });
    onClose();
    setNome(""); setTelefone(""); setCampanha(""); setVendedorId(""); setOrigem("manual");
  };
  return (
    <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-xl border border-border w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="shrink-0 px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Novo lead</h3>
          <button onClick={onClose} className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <Field label="Nome / loja"><input value={nome} onChange={e => setNome(e.target.value)} className={inputCls} placeholder="Ex.: Boutique da Ana" /></Field>
          <Field label="Telefone"><input value={telefone} onChange={e => setTelefone(e.target.value)} className={inputCls} placeholder="+55 11 98888-0000" /></Field>
          <Field label="Origem">
            <select value={origem} onChange={e => setOrigem(e.target.value as OrigemLead)} className={inputCls}>
              {(Object.keys(origemLabels) as OrigemLead[]).map(o => <option key={o} value={o}>{origemLabels[o]}</option>)}
            </select>
          </Field>
          <Field label="Campanha (opcional)"><input value={campanha} onChange={e => setCampanha(e.target.value)} className={inputCls} placeholder="Ex.: OI26 · Prospect Multimarcas" /></Field>
          <Field label="Vendedor responsável">
            <select value={vendedorId} onChange={e => setVendedorId(e.target.value)} className={inputCls}>
              <option value="">Rodízio automático</option>
              {vendedores.map(v => <option key={v.id} value={v.id}>{v.nome}{v.pausado ? " (pausado)" : ""}</option>)}
            </select>
          </Field>
        </div>
        <div className="shrink-0 px-4 py-3 border-t border-border flex items-center justify-end gap-2">
          <button onClick={onClose} className="text-[12px] px-3 py-1.5 rounded-lg hover:bg-muted text-muted-foreground">Cancelar</button>
          <button disabled={!ok} onClick={submit} className="text-[12px] font-medium px-4 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40">Cadastrar lead</button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-card border border-border rounded-lg px-3 py-2 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-[11px] font-medium text-foreground block mb-1">{label}</label>{children}</div>;
}
