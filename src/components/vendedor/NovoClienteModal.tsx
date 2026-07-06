import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  industriasDisponiveis: string[];
}

export function NovoClienteModal({ open, onOpenChange, industriasDisponiveis }: Props) {
  const [step, setStep] = useState(1);
  const [cnpj, setCnpj] = useState("");
  const [semCnpj, setSemCnpj] = useState(false);
  const [razao, setRazao] = useState("");
  const [endereco, setEndereco] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [industrias, setIndustrias] = useState<string[]>([]);

  function reset() {
    setStep(1); setCnpj(""); setSemCnpj(false); setRazao(""); setEndereco("");
    setNome(""); setTelefone(""); setIndustrias([]); setBuscando(false);
  }

  function buscarCNPJ() {
    if (!cnpj) return;
    setBuscando(true);
    setTimeout(() => {
      setRazao("Nova Loja Comercial LTDA");
      setEndereco("Rua Principal, 100 — Cidade/UF");
      setBuscando(false);
      toast.success("CNPJ encontrado");
    }, 700);
  }

  function toggleIndustria(i: string) {
    setIndustrias(cur => cur.includes(i) ? cur.filter(x => x !== i) : [...cur, i]);
  }

  function salvar() {
    if (!nome || !telefone || industrias.length === 0) {
      toast.error("Preencha nome, telefone e ao menos uma indústria");
      return;
    }
    toast.success(semCnpj ? "Lead criado — complete o cadastro depois" : "Cliente criado com sucesso");
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Novo cliente — Etapa {step} de 2</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-2 space-y-4">
          {step === 1 && (
            <>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSemCnpj(false)}
                  className={`px-3 py-1.5 rounded-full border transition-colors ${!semCnpj ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}
                >
                  Com CNPJ
                </button>
                <button
                  type="button"
                  onClick={() => setSemCnpj(true)}
                  className={`px-3 py-1.5 rounded-full border transition-colors ${semCnpj ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}
                >
                  Sem CNPJ ainda (lead)
                </button>
              </div>

              {!semCnpj ? (
                <>
                  <div>
                    <Label className="text-xs">CNPJ</Label>
                    <div className="flex gap-2 mt-1">
                      <Input value={cnpj} onChange={e => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
                      <Button type="button" variant="outline" onClick={buscarCNPJ} disabled={buscando || !cnpj}>
                        {buscando ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
                      </Button>
                    </div>
                  </div>
                  {razao && (
                    <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-1 text-xs">
                      <div><span className="text-muted-foreground">Razão social:</span> <span className="font-medium">{razao}</span></div>
                      <div><span className="text-muted-foreground">Endereço:</span> <span className="font-medium">{endereco}</span></div>
                      <div className="flex items-center gap-1 text-emerald-600 pt-1"><Check className="h-3 w-3" /> Dados preenchidos automaticamente</div>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
                  Sem CNPJ, o registro entrará como <b>lead</b>. Você poderá completar depois.
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <Label className="text-xs">Nome / Nome fantasia *</Label>
                <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex.: Boutique da Ana" />
              </div>
              <div>
                <Label className="text-xs">Telefone / WhatsApp *</Label>
                <Input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(00) 00000-0000" />
              </div>
              <div>
                <Label className="text-xs">Indústria(s) de interesse *</Label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {industriasDisponiveis.map(i => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleIndustria(i)}
                      className={`px-2.5 py-1 rounded-full border text-xs transition-colors ${industrias.includes(i) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">Nicho e interesse são opcionais — preencha depois no Cliente 360.</p>
            </>
          )}
        </div>

        <DialogFooter className="shrink-0 flex-row justify-between">
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button onClick={() => setStep(2)} disabled={!semCnpj && !razao}>
                Avançar <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Button>
              <Button onClick={salvar}>Criar cliente</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
