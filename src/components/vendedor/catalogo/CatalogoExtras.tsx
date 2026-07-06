import { useState } from "react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreVertical, Package, BookOpen, FileText, MessageSquare, QrCode, Camera, Plus } from "lucide-react";
import { materiaisApoio, listPoliticas, PoliticaIndustria } from "@/lib/politicaComercial";
import { brands } from "@/data/mockProducts";
import { PoliticaViewModal } from "@/components/vendedor/politica/PoliticaModals";
import { toast } from "sonner";

export function CatalogSecondaryMenu({
  activeBrandSlugs, onAddGeneric,
}: {
  activeBrandSlugs: string[];
  onAddGeneric: (item: GenericItem) => void;
}) {
  const [genOpen, setGenOpen] = useState(false);
  const [matOpen, setMatOpen] = useState(false);
  const [polOpen, setPolOpen] = useState(false);
  const [polPick, setPolPick] = useState<PoliticaIndustria | null>(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0" aria-label="Mais opções">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-[11px] text-muted-foreground">Ações do catálogo</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setGenOpen(true)} className="gap-2">
            <Package className="h-4 w-4" /> Produto genérico
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setMatOpen(true)} className="gap-2">
            <BookOpen className="h-4 w-4" /> Material de apoio
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-[11px] text-muted-foreground">Política comercial</DropdownMenuLabel>
          {activeBrandSlugs.length === 0 && (
            <DropdownMenuItem disabled>Sem indústria ativa</DropdownMenuItem>
          )}
          {activeBrandSlugs.map((slug) => {
            const pol = listPoliticas().find((p) => p.brandSlug === slug);
            if (!pol) return null;
            return (
              <DropdownMenuItem key={slug} onClick={() => { setPolPick(pol); setPolOpen(true); }} className="gap-2 capitalize">
                <FileText className="h-4 w-4" /> {slug}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <ProdutoGenericoModal open={genOpen} onOpenChange={setGenOpen} onAdd={onAddGeneric} />
      <MaterialApoioDrawer open={matOpen} onOpenChange={setMatOpen} activeBrandSlugs={activeBrandSlugs} />
      <PoliticaViewModal open={polOpen} onOpenChange={setPolOpen} politica={polPick} />
    </>
  );
}

// ---------- Produto Genérico ----------
export interface GenericItem { name: string; ref: string; brandSlug: string; price: number; }

function ProdutoGenericoModal({ open, onOpenChange, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; onAdd: (i: GenericItem) => void }) {
  const [name, setName] = useState("");
  const [ref, setRef] = useState("");
  const [brandSlug, setBrandSlug] = useState("brandili");
  const [price, setPrice] = useState<number>(0);

  function submit() {
    if (!name || !price) { toast.error("Preencha nome e preço."); return; }
    onAdd({ name, ref: ref || `GEN-${Date.now().toString().slice(-5)}`, brandSlug, price });
    toast.success(`${name} adicionado à cesta.`);
    setName(""); setRef(""); setPrice(0);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Produto fora do catálogo</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <div><Label className="text-xs">Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Camiseta especial" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">Referência</Label><Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Livre" /></div>
            <div><Label className="text-xs">Preço tabela (R$)</Label><Input type="number" step={0.01} value={price || ""} onChange={(e) => setPrice(Number(e.target.value))} /></div>
          </div>
          <div>
            <Label className="text-xs">Indústria</Label>
            <Select value={brandSlug} onValueChange={setBrandSlug}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {brands.map((b) => <SelectItem key={b.slug} value={b.slug}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit}>Adicionar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Material de Apoio ----------
function MaterialApoioDrawer({ open, onOpenChange, activeBrandSlugs }: { open: boolean; onOpenChange: (o: boolean) => void; activeBrandSlugs: string[] }) {
  const relevantes = activeBrandSlugs.length ? materiaisApoio.filter((m) => activeBrandSlugs.includes(m.brandSlug)) : materiaisApoio;
  const byBrand = relevantes.reduce<Record<string, typeof materiaisApoio>>((acc, m) => {
    (acc[m.brandSlug] ||= []).push(m);
    return acc;
  }, {});
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-4 border-b shrink-0">
          <SheetTitle>Materiais de apoio</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {Object.entries(byBrand).map(([slug, list]) => {
            const brand = brands.find((b) => b.slug === slug);
            return (
              <div key={slug}>
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">{brand?.name || slug}</div>
                <div className="space-y-2">
                  {list.map((m) => (
                    <div key={m.id} className="border rounded-md p-3 flex items-start gap-3">
                      <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{m.titulo}</div>
                        <div className="text-[11px] text-muted-foreground">{m.tipo} · {m.colecao}</div>
                      </div>
                      <Button size="sm" variant="outline" className="gap-1 shrink-0" onClick={() => toast.success(`"${m.titulo}" enviado no WhatsApp.`)}>
                        <MessageSquare className="h-3.5 w-3.5" /> Whats
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {Object.keys(byBrand).length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-10">Nenhum material para as indústrias ativas.</div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ---------- QR Scanner (mock) ----------
export function QRScannerModal({
  open, onOpenChange, onScan, availableRefs,
}: { open: boolean; onOpenChange: (o: boolean) => void; onScan: (ref: string) => void; availableRefs: string[] }) {
  const [manual, setManual] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><QrCode className="h-4 w-4" /> Escanear etiqueta</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <div className="aspect-square bg-black/90 rounded-md flex items-center justify-center relative overflow-hidden">
            <Camera className="h-10 w-10 text-white/60" />
            <div className="absolute inset-8 border-2 border-white/70 rounded-md" />
            <div className="absolute bottom-3 text-[11px] text-white/70">Aponte para a etiqueta do produto</div>
          </div>
          <div>
            <Label className="text-xs">Ou digite a referência</Label>
            <div className="flex gap-2 mt-1">
              <Input value={manual} onChange={(e) => setManual(e.target.value.toUpperCase())} placeholder="Ex.: BR-1023" />
              <Button onClick={() => {
                if (!manual) return;
                if (availableRefs.includes(manual)) { onScan(manual); setManual(""); onOpenChange(false); }
                else toast.error(`Referência ${manual} não encontrada.`);
              }}>Adicionar</Button>
            </div>
            <div className="text-[10px] text-muted-foreground mt-2">
              Dica: no showroom, ative a câmera do dispositivo (o app pede permissão) para escanear diretamente.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
