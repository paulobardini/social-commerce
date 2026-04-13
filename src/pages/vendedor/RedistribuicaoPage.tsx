import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft, Search, Shuffle, Check, ArrowRight, AlertTriangle,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { mockClientes360, nichoLabels, statusLabels, statusColors } from "@/data/mockCRM360";
import { mockRepresentantes } from "@/data/mockRepresentantes";
import { useToast } from "@/hooks/use-toast";

export default function RedistribuicaoPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [repOrigem, setRepOrigem] = useState("Paulo Bardini");
  const [repDestino, setRepDestino] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [observacao, setObservacao] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const clientes = useMemo(() => {
    return mockClientes360.filter(c => {
      if (c.representante !== repOrigem) return false;
      if (search && !c.nomeFantasia.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [repOrigem, search]);

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selected.length === clientes.length) setSelected([]);
    else setSelected(clientes.map(c => c.id));
  };

  const handleConfirm = () => {
    setConfirmed(true);
    toast({
      title: "Redistribuição realizada",
      description: `${selected.length} clientes transferidos para ${repDestino}`,
    });
  };

  if (confirmed) {
    return (
      <>
        <div className="p-6">
          <div className="max-w-lg mx-auto text-center py-16 space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-heading font-bold">Redistribuição concluída</h2>
            <p className="text-muted-foreground">{selected.length} clientes foram transferidos de {repOrigem} para {repDestino}.</p>
            {observacao && <p className="text-sm text-muted-foreground italic">"{observacao}"</p>}
            <div className="flex gap-2 justify-center pt-4">
              <Button variant="outline" onClick={() => navigate("/vendedor/representantes")}>Representantes</Button>
              <Button onClick={() => navigate("/vendedor/clientes")}>Ver clientes</Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Redistribuir Carteira</h1>
            <p className="text-sm text-muted-foreground">Selecione clientes e transfira para outro representante</p>
          </div>
        </div>

        {/* Step 1: Select reps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Representante de origem</CardTitle></CardHeader>
            <CardContent>
              <Select value={repOrigem} onValueChange={v => { setRepOrigem(v); setSelected([]); }}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {mockRepresentantes.map(r => <SelectItem key={r.id} value={r.nome}>{r.nome} ({r.carteiraTotal})</SelectItem>)}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center">
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
          </div>

          <Card className="border border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Representante de destino</CardTitle></CardHeader>
            <CardContent>
              <Select value={repDestino} onValueChange={setRepDestino}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {mockRepresentantes.filter(r => r.nome !== repOrigem).map(r => <SelectItem key={r.id} value={r.nome}>{r.nome} ({r.carteiraTotal})</SelectItem>)}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Step 2: Select clients */}
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Selecione os clientes para transferir</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8 text-sm" />
                </div>
                <Badge variant="secondary" className="text-xs">{selected.length} selecionados</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-10">
                      <Checkbox checked={selected.length === clientes.length && clientes.length > 0} onCheckedChange={selectAll} />
                    </TableHead>
                    <TableHead className="font-semibold">Cliente</TableHead>
                    <TableHead className="font-semibold">Cidade/UF</TableHead>
                    <TableHead className="font-semibold">Nicho</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Último contato</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.map(c => (
                    <TableRow key={c.id} className={`cursor-pointer ${selected.includes(c.id) ? "bg-primary/5" : "hover:bg-muted/30"}`} onClick={() => toggleSelect(c.id)}>
                      <TableCell><Checkbox checked={selected.includes(c.id)} /></TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{c.nomeFantasia}</p>
                        <p className="text-[11px] text-muted-foreground">{c.documento}</p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.cidade}/{c.estado}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-[10px]">{nichoLabels[c.nicho]}</Badge></TableCell>
                      <TableCell><span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[c.status]}`}>{statusLabels[c.status]}</span></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.ultimoContato}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Confirm */}
        {selected.length > 0 && repDestino && (
          <Card className="border border-primary/30 bg-primary/5">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Shuffle className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Resumo da redistribuição</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selected.length} cliente{selected.length > 1 ? "s" : ""} serão transferidos de <strong>{repOrigem}</strong> para <strong>{repDestino}</strong>
                  </p>
                </div>
              </div>
              <Input
                placeholder="Observação da transferência (opcional)"
                value={observacao}
                onChange={e => setObservacao(e.target.value)}
                className="h-9"
              />
              <div className="flex items-center gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setSelected([])}>Cancelar</Button>
                <Button size="sm" onClick={handleConfirm}>
                  <Check className="h-4 w-4 mr-1" /> Confirmar redistribuição
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
