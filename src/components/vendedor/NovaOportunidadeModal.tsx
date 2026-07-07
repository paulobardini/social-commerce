import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { mockClientes } from "@/data/mockVendedor";
import {
  canaisOrigem, temperaturaLabels,
  etapasCanonicas, probabilidadeAutoPorCanonica,
  type Temperatura, type CanalOrigem, type EtapaCanonica,
} from "@/data/mockCRM";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  briefingInicial?: string;   // texto pré-preenchido (ex: mensagem do WhatsApp)
  clienteIdInicial?: string;
}

const categoriasSugeridas = ["Conjuntos", "Vestidos", "Blusas", "Calças", "Fitness", "Enxoval", "Uniformes", "Praia"];
const generos = ["Infantil", "Adulto", "Baby", "Fitness", "Adulto casual"];
const estacoes = ["Alto Verão", "Verão", "Outono", "Inverno", "Primavera", "Coleção contínua"];
const marcasSugeridas = ["Brandili", "Hering", "Malwee", "Lupo", "Kyly", "Cia Marítima", "Colcci"];

export function NovaOportunidadeModal({ open, onOpenChange, briefingInicial, clienteIdInicial }: Props) {
  const navigate = useNavigate();
  const [clienteId, setClienteId] = useState(clienteIdInicial || "");
  const [categorias, setCategorias] = useState<string[]>([]);
  const [faixaMin, setFaixaMin] = useState("");
  const [faixaMax, setFaixaMax] = useState("");
  const [genero, setGenero] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [estacao, setEstacao] = useState("");
  const [marcas, setMarcas] = useState<string[]>([]);
  const [prazoCliente, setPrazoCliente] = useState("");
  const [previsao, setPrevisao] = useState("");
  const [prioridade, setPrioridade] = useState<"alta" | "media" | "baixa">("media");
  const [origem, setOrigem] = useState<CanalOrigem | "">("");
  const [temperatura, setTemperatura] = useState<Temperatura>("morno");
  const [etapaInicial, setEtapaInicial] = useState<EtapaCanonica>("novo_lead");
  const [urgente, setUrgente] = useState(false);
  const [observacoes, setObservacoes] = useState(briefingInicial || "");
  const [criarTarefa, setCriarTarefa] = useState(true);

  const toggle = <T,>(arr: T[], v: T) => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

  const cliente = mockClientes.find(c => c.id === clienteId);

  // Título gerado
  const [tituloEdit, setTituloEdit] = useState<string | null>(null);
  const tituloAuto = useMemo(() => {
    const parts: string[] = [];
    if (categorias.length) parts.push(categorias.join("/"));
    if (genero) parts.push(genero.toLowerCase());
    if (faixaMin && faixaMax) parts.push(`R$ ${faixaMin}-${faixaMax}`);
    const base = parts.join(" ") || "Nova demanda";
    return cliente ? `${base} · ${cliente.nome}` : base;
  }, [categorias, genero, faixaMin, faixaMax, cliente]);
  const titulo = tituloEdit ?? tituloAuto;

  // Valor estimado calculado
  const [valorEdit, setValorEdit] = useState<string | null>(null);
  const valorAuto = useMemo(() => {
    const min = Number(faixaMin), max = Number(faixaMax), qt = Number(quantidade);
    if (min && max && qt) return Math.round(((min + max) / 2) * qt);
    return 0;
  }, [faixaMin, faixaMax, quantidade]);
  const valor = valorEdit !== null ? valorEdit : (valorAuto ? String(valorAuto) : "");

  const probAuto = probabilidadeAutoPorCanonica[etapaInicial];

  const canSubmit = clienteId && (categorias.length > 0 || observacoes.trim());

  const handleSubmit = () => {
    onOpenChange(false);
    toast.success(`Oportunidade criada: ${titulo}`);
    if (criarTarefa) toast.info("Tarefa de próximo contato criada.");
    navigate("/vendedor/oportunidades/op1"); // mock nav
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-3 shrink-0 border-b">
          <DialogTitle className="font-heading">Nova oportunidade</DialogTitle>
          <p className="text-sm text-muted-foreground">Descreva a demanda do cliente. Os orçamentos serão as tentativas de atendê-la.</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Cliente */}
          <div>
            <Label className="text-xs font-medium">Cliente *</Label>
            <Select value={clienteId} onValueChange={setClienteId}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
              <SelectContent>
                {mockClientes.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Briefing */}
          <div className="rounded-lg border border-border p-3 space-y-4 bg-muted/20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Briefing da demanda</p>
              <p className="text-[11px] text-muted-foreground">O que o cliente quer? Isso vira o filtro do catálogo.</p>
            </div>

            <div>
              <Label className="text-xs font-medium">Categorias</Label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {categoriasSugeridas.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategorias(prev => toggle(prev, c))}
                    className={`text-[11px] px-2 py-1 rounded-full border transition-colors ${
                      categorias.includes(c) ? "bg-accent text-accent-foreground border-accent" : "border-border text-muted-foreground hover:border-accent/40"
                    }`}
                  >{c}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-medium">Preço mín (R$/pç)</Label>
                <Input type="number" placeholder="30" value={faixaMin} onChange={e => setFaixaMin(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-medium">Preço máx (R$/pç)</Label>
                <Input type="number" placeholder="50" value={faixaMax} onChange={e => setFaixaMax(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-medium">Qtde estimada</Label>
                <Input type="number" placeholder="100" value={quantidade} onChange={e => setQuantidade(e.target.value)} className="mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium">Gênero / idade</Label>
                <Select value={genero} onValueChange={setGenero}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {generos.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium">Estação / coleção</Label>
                <Select value={estacao} onValueChange={setEstacao}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {estacoes.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium">Marcas / indústrias candidatas</Label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {marcasSugeridas.map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMarcas(prev => toggle(prev, m))}
                    className={`text-[11px] px-2 py-1 rounded-full border transition-colors ${
                      marcas.includes(m) ? "bg-accent text-accent-foreground border-accent" : "border-border text-muted-foreground hover:border-accent/40"
                    }`}
                  >{m}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium">Prazo do cliente</Label>
                <Input type="date" value={prazoCliente} onChange={e => setPrazoCliente(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-medium">Previsão fechamento</Label>
                <Input type="date" value={previsao} onChange={e => setPrevisao(e.target.value)} className="mt-1" />
              </div>
            </div>
          </div>

          {/* Preview ao vivo + edição */}
          <div className="rounded-lg border-2 border-dashed border-accent/30 bg-accent/5 p-3 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-accent">Gerado ao vivo</p>
                <p className="text-sm font-semibold text-foreground mt-0.5 break-words">{tituloAuto}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Valor: <span className="font-semibold text-foreground">
                    {valorAuto > 0 ? `R$ ${valorAuto.toLocaleString("pt-BR")}` : "— preencha faixa + qtde"}
                  </span>
                  {valorAuto > 0 && faixaMin && faixaMax && quantidade && (
                    <span className="ml-1">
                      (média R$ {((Number(faixaMin) + Number(faixaMax)) / 2).toFixed(0)} × {quantidade})
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-3 pt-2 border-t border-accent/20">
              <div>
                <Label className="text-[10px] font-medium text-muted-foreground">Título (editável)</Label>
                <Input
                  value={titulo}
                  onChange={e => setTituloEdit(e.target.value)}
                  className="mt-1 h-8 text-sm"
                  placeholder={tituloAuto}
                />
                {tituloEdit !== null && tituloEdit !== tituloAuto && (
                  <button type="button" onClick={() => setTituloEdit(null)} className="text-[10px] text-accent mt-1 flex items-center gap-1 hover:underline">
                    <X className="h-2.5 w-2.5" /> restaurar automático
                  </button>
                )}
              </div>
              <div>
                <Label className="text-[10px] font-medium text-muted-foreground">Valor R$ (editável)</Label>
                <Input
                  type="number"
                  value={valor}
                  onChange={e => setValorEdit(e.target.value)}
                  className="mt-1 h-8 text-sm"
                  placeholder={valorAuto > 0 ? String(valorAuto) : "0"}
                />
                {valorEdit !== null && valorAuto > 0 && Number(valorEdit) !== valorAuto && (
                  <button type="button" onClick={() => setValorEdit(null)} className="text-[10px] text-accent mt-1 flex items-center gap-1 hover:underline">
                    <X className="h-2.5 w-2.5" /> restaurar automático
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium">Etapa inicial</Label>
              <Select value={etapaInicial} onValueChange={(v) => setEtapaInicial(v as EtapaCanonica)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {etapasCanonicas.filter(e => e.id !== "ganha" && e.id !== "perdida").map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground mt-1">Probabilidade automática: {probAuto}%</p>
            </div>
            <div>
              <Label className="text-xs font-medium">Prioridade</Label>
              <Select value={prioridade} onValueChange={(v) => setPrioridade(v as any)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium">Canal de origem</Label>
              <Select value={origem} onValueChange={(v) => setOrigem(v as CanalOrigem)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {canaisOrigem.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium">Temperatura</Label>
              <Select value={temperatura} onValueChange={(v) => setTemperatura(v as Temperatura)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(temperaturaLabels) as Temperatura[]).map(t => (
                    <SelectItem key={t} value={t}>{temperaturaLabels[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Checkbox id="urgente" checked={urgente} onCheckedChange={(v) => setUrgente(!!v)} />
              <Label htmlFor="urgente" className="text-xs font-medium cursor-pointer">Urgente</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="tarefa" checked={criarTarefa} onCheckedChange={(v) => setCriarTarefa(!!v)} />
              <Label htmlFor="tarefa" className="text-xs font-medium cursor-pointer">Criar tarefa vinculada</Label>
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium">Observações</Label>
            <Textarea placeholder="Notas iniciais" value={observacoes} onChange={e => setObservacoes(e.target.value)} className="mt-1" rows={3} />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t shrink-0 bg-background">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>Criar oportunidade</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
