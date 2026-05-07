import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, Trash2, Plus, FileText, Link as LinkIcon, Receipt, Ban, Check } from "lucide-react";
import { mockClientes360, type PedidoItem, type PedidoStatus, type PedidoOrigem } from "@/data/mockCRM360";
import { usePedidos } from "@/contexts/PedidosContext";
import { STATUS_LABEL, STATUS_COLOR, ORIGEM_LABEL, ORIGEM_COLOR, PAG_COLOR } from "@/pages/vendedor/PedidosHub";

interface Props {
  pedidoId: string;
  onClose: () => void;
}

export function PedidoDetalheModal({ pedidoId, onClose }: Props) {
  const { getById, avancarStatus, cancelar, updateItens, updatePagamento, gerarBoleto, gerarLinkPagamento, anexarNF } = usePedidos();
  const pedido = getById(pedidoId);

  const cliente = pedido ? mockClientes360.find((c) => c.id === pedido.clienteId) : null;
  const [itens, setItens] = useState<PedidoItem[]>(pedido?.itens ?? []);
  const [nfDraft, setNfDraft] = useState("");

  if (!pedido) return null;

  const ot = (pedido.origemTipo ?? "manual") as PedidoOrigem;
  const status = pedido.status as PedidoStatus;
  const finalStatuses: PedidoStatus[] = ["entregue", "cancelado"];
  const itensLocked = ["faturado", "em_transporte", "entregue", "cancelado"].includes(status);
  const total = itens.reduce((s, i) => s + i.qtd * i.precoUnit, 0);
  const pecas = itens.reduce((s, i) => s + i.qtd, 0);

  const updItem = (idx: number, patch: Partial<PedidoItem>) =>
    setItens((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const addItem = () =>
    setItens((prev) => [...prev, { produtoId: `prd-novo-${prev.length}`, nome: "Novo item", sku: "SKU-NEW", cor: "—", tamanho: "M", qtd: 1, precoUnit: 0 }]);

  const removeItem = (i: number) => setItens((prev) => prev.filter((_, j) => j !== i));

  const salvarItens = () => updateItens(pedido.id, itens);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 z-[200] gap-0">
        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-border">
          <div className="flex items-center text-xs text-muted-foreground gap-1.5 mb-2">
            <span>Pedido</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-mono text-foreground">{pedido.numero}</span>
          </div>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold">{cliente?.nomeFantasia ?? "—"}</h2>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge variant="outline" className={`${ORIGEM_COLOR[ot]} text-[10px]`}>{ORIGEM_LABEL[ot]}</Badge>
                <Badge variant="outline" className={`${STATUS_COLOR[status]} text-[10px]`}>{STATUS_LABEL[status]}</Badge>
                {pedido.marca && <span className="text-xs text-muted-foreground">· {pedido.marca}</span>}
                <span className="text-xs text-muted-foreground">· {pedido.data}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {!finalStatuses.includes(status) && (
                <Button size="sm" onClick={() => avancarStatus(pedido.id)} className="bg-[hsl(191,100%,50%)] text-black hover:bg-[hsl(191,100%,45%)]">
                  Avançar status →
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="resumo" className="w-full">
            <div className="px-5 pt-3 border-b border-border bg-muted/30">
              <TabsList>
                <TabsTrigger value="resumo">Resumo</TabsTrigger>
                <TabsTrigger value="grade">Grade / Itens</TabsTrigger>
                <TabsTrigger value="pagamento">Pagamento</TabsTrigger>
                <TabsTrigger value="historico">Histórico</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="resumo" className="p-5 space-y-4 mt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Info label="Cliente" value={cliente?.nomeFantasia ?? "—"} />
                <Info label="CNPJ" value={cliente?.documento ?? "—"} />
                <Info label="Cidade/UF" value={cliente ? `${cliente.cidade}/${cliente.estado}` : "—"} />
                <Info label="Marca" value={pedido.marca ?? "—"} />
                <Info label="Origem" value={pedido.origem} />
                <Info label="Previsão entrega" value={pedido.previsaoEntrega ?? "—"} />
                <Info label="Peças" value={String(pedido.pecas ?? pecas)} />
                <Info label="Valor total" value={`R$ ${pedido.valor.toLocaleString("pt-BR")}`} highlight />
                <Info label="Pagamento" value={pedido.pagamento?.status ?? "pendente"} />
              </div>
              {pedido.observacoes && (
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground tracking-wide mb-1">Observações</p>
                  <p className="text-sm bg-muted/50 rounded p-3">{pedido.observacoes}</p>
                </div>
              )}
              {pedido.orcamentoId && (
                <div className="text-xs text-muted-foreground">
                  Vinculado ao orçamento <span className="font-mono text-foreground">{pedido.orcamentoId}</span>
                </div>
              )}
            </TabsContent>

            <TabsContent value="grade" className="p-5 space-y-3 mt-0">
              {itensLocked && <p className="text-xs text-amber-600 bg-amber-500/10 px-3 py-2 rounded">Pedido já faturado — edição da grade desabilitada.</p>}
              <div className="overflow-x-auto border border-border rounded">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs">
                    <tr>
                      <th className="text-left px-2 py-2">Produto</th>
                      <th className="text-left px-2 py-2">SKU</th>
                      <th className="text-left px-2 py-2">Cor</th>
                      <th className="text-left px-2 py-2">Tam.</th>
                      <th className="text-right px-2 py-2">Qtd</th>
                      <th className="text-right px-2 py-2">Unit.</th>
                      <th className="text-right px-2 py-2">Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {itens.map((it, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="px-2 py-1.5">
                          <Input disabled={itensLocked} value={it.nome} onChange={(e) => updItem(i, { nome: e.target.value })} className="h-7 text-xs" />
                        </td>
                        <td className="px-2 py-1.5 text-xs font-mono text-muted-foreground">{it.sku}</td>
                        <td className="px-2 py-1.5 text-xs">{it.cor}</td>
                        <td className="px-2 py-1.5 text-xs">{it.tamanho}</td>
                        <td className="px-2 py-1.5">
                          <Input disabled={itensLocked} type="number" value={it.qtd} onChange={(e) => updItem(i, { qtd: Number(e.target.value) })} className="h-7 text-xs w-20 text-right" />
                        </td>
                        <td className="px-2 py-1.5">
                          <Input disabled={itensLocked} type="number" step="0.01" value={it.precoUnit} onChange={(e) => updItem(i, { precoUnit: Number(e.target.value) })} className="h-7 text-xs w-24 text-right" />
                        </td>
                        <td className="px-2 py-1.5 text-right tabular-nums font-medium">R$ {(it.qtd * it.precoUnit).toLocaleString("pt-BR")}</td>
                        <td className="px-2 py-1.5">
                          {!itensLocked && (
                            <button onClick={() => removeItem(i)} className="text-muted-foreground hover:text-red-600">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between">
                {!itensLocked ? (
                  <Button size="sm" variant="outline" onClick={addItem}><Plus className="h-3.5 w-3.5 mr-1" /> Adicionar item</Button>
                ) : <span />}
                <div className="text-sm">
                  <span className="text-muted-foreground">{pecas} peças · </span>
                  <span className="font-semibold">R$ {total.toLocaleString("pt-BR")}</span>
                </div>
              </div>
              {!itensLocked && (
                <div className="flex justify-end">
                  <Button size="sm" onClick={salvarItens}>Salvar grade</Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="pagamento" className="p-5 space-y-4 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground tracking-wide mb-1.5">Status</p>
                  <Select value={pedido.pagamento?.status ?? "pendente"} onValueChange={(v) => updatePagamento(pedido.id, { status: v as any })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="parcial">Parcial</SelectItem>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="atrasado">Atrasado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground tracking-wide mb-1.5">Método</p>
                  <Input value={pedido.pagamento?.metodo ?? ""} placeholder="Ex: Boleto 30/60/90"
                    onChange={(e) => updatePagamento(pedido.id, { metodo: e.target.value })} className="h-9" />
                </div>
              </div>

              <div className="border border-border rounded p-3 space-y-2">
                <p className="text-xs font-semibold">Ações financeiras</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => gerarBoleto(pedido.id)}><Receipt className="h-3.5 w-3.5 mr-1" /> Gerar boleto</Button>
                  <Button size="sm" variant="outline" onClick={() => gerarLinkPagamento(pedido.id)}><LinkIcon className="h-3.5 w-3.5 mr-1" /> Link de pagamento</Button>
                </div>
                {pedido.pagamento?.linkBoleto && <p className="text-xs text-muted-foreground break-all">Boleto: {pedido.pagamento.linkBoleto}</p>}
                {pedido.pagamento?.linkPagamento && <p className="text-xs text-muted-foreground break-all">Link: {pedido.pagamento.linkPagamento}</p>}
              </div>

              <div className="border border-border rounded p-3 space-y-2">
                <p className="text-xs font-semibold flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Nota fiscal</p>
                {pedido.pagamento?.notaFiscal ? (
                  <p className="text-sm font-mono">{pedido.pagamento.notaFiscal}</p>
                ) : (
                  <div className="flex gap-2">
                    <Input placeholder="NF-2026-0000" value={nfDraft} onChange={(e) => setNfDraft(e.target.value)} className="h-9" />
                    <Button size="sm" onClick={() => { if (nfDraft) { anexarNF(pedido.id, nfDraft); setNfDraft(""); } }}>Anexar</Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="historico" className="p-5 mt-0">
              <ol className="relative border-l border-border ml-2 space-y-4">
                {(pedido.historico ?? []).map((h, i) => (
                  <li key={i} className="ml-4">
                    <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-[hsl(191,100%,50%)] border-2 border-background" />
                    <p className="text-sm font-medium">{STATUS_LABEL[h.status]}</p>
                    <p className="text-xs text-muted-foreground">{h.data} · {h.autor}</p>
                  </li>
                ))}
                {(!pedido.historico || pedido.historico.length === 0) && <p className="text-xs text-muted-foreground">Sem histórico.</p>}
              </ol>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-3 border-t border-border flex items-center justify-between bg-muted/30">
          {!finalStatuses.includes(status) ? (
            <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-500/10 hover:text-red-700" onClick={() => { cancelar(pedido.id); onClose(); }}>
              <Ban className="h-3.5 w-3.5 mr-1" /> Cancelar pedido
            </Button>
          ) : <span />}
          <Button size="sm" variant="outline" onClick={onClose}>
            <Check className="h-3.5 w-3.5 mr-1" /> Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase text-muted-foreground tracking-wide">{label}</p>
      <p className={`text-sm mt-0.5 ${highlight ? "font-semibold text-[hsl(191,100%,50%)]" : ""}`}>{value}</p>
    </div>
  );
}
