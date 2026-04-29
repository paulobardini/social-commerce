import { Breadcrumbs } from "@/components/vendedor/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download, Printer, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Link2,
} from "lucide-react";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockOrcamentos } from "@/data/mockVendedor";

const mockPages = Array.from({ length: 7 }, (_, i) => i + 1);

export default function OrcamentoViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orc = mockOrcamentos.find((o) => o.id === id) || mockOrcamentos[0];
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Top bar */}
        <div className="bg-primary text-primary-foreground px-6 py-2.5 flex items-center justify-between shrink-0 gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">{orc.nomeBase || orc.nome}</span>
                {orc.versao && (
                  <Badge variant="secondary" className="text-[10px] bg-primary-foreground/20 text-primary-foreground border-0">
                    v{orc.versao}
                  </Badge>
                )}
              </div>
              {orc.oportunidadeId && orc.oportunidadeNome && (
                <button
                  onClick={() => navigate(`/vendedor/oportunidades/${orc.oportunidadeId}`)}
                  className="mt-0.5 inline-flex items-center gap-1 text-[11px] bg-primary-foreground/15 hover:bg-primary-foreground/25 transition-colors rounded-full px-2 py-0.5 self-start"
                  title="Abrir oportunidade vinculada"
                >
                  <Link2 className="h-3 w-3" />
                  <span className="truncate max-w-[280px]">{orc.oportunidadeNome}</span>
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {currentPage} / {mockPages.length}
            </span>
            <button
              onClick={() => setZoom(Math.max(50, zoom - 25))}
              className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-primary-foreground/10 transition-colors"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-sm w-12 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 25))}
              className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-primary-foreground/10 transition-colors"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-primary-foreground/10 transition-colors">
              <Download className="h-4 w-4" />
            </button>
            <button className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-primary-foreground/10 transition-colors">
              <Printer className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex flex-1 overflow-hidden bg-muted">
          {/* Thumbnails sidebar */}
          <aside className="w-[160px] border-r border-border overflow-y-auto bg-card py-4 px-3 space-y-3 shrink-0">
            {mockPages.map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-full rounded-lg overflow-hidden border-2 transition-colors ${
                  currentPage === page ? "border-accent" : "border-border hover:border-accent/50"
                }`}
              >
                <div className="aspect-[3/4] bg-card flex items-center justify-center">
                  <div className="w-full h-full p-2">
                    {page === 1 ? (
                      <div className="w-full h-full flex flex-col">
                        <div className="bg-primary rounded-t-md h-8 flex items-center justify-between px-2">
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded bg-accent" />
                            <span className="text-[6px] text-primary-foreground font-bold">nextil</span>
                          </div>
                          <span className="text-[5px] text-primary-foreground/70">Orçamento</span>
                        </div>
                        <div className="flex-1 bg-card border-x border-b border-border p-1.5 space-y-1">
                          <div className="h-1 w-16 bg-muted rounded" />
                          <div className="h-1 w-12 bg-muted rounded" />
                          <div className="h-1 w-20 bg-muted rounded" />
                          <div className="h-1 w-10 bg-muted rounded" />
                          <div className="h-1 w-14 bg-muted rounded" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-card border border-border rounded flex flex-col p-1.5 space-y-1">
                        <div className="h-1 w-10 bg-muted rounded" />
                        <div className="h-1 w-16 bg-muted rounded" />
                        <div className="h-1 w-12 bg-muted rounded" />
                        <div className="h-1 w-20 bg-muted rounded" />
                        <div className="h-1 w-8 bg-muted rounded" />
                        <div className="h-1 w-14 bg-muted rounded" />
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground text-center py-1">{page}</p>
              </button>
            ))}
          </aside>

          {/* Main page viewer */}
          <div className="flex-1 overflow-auto flex items-start justify-center p-8">
            <div
              className="bg-card shadow-xl rounded-lg overflow-hidden"
              style={{
                width: `${(595 * zoom) / 100}px`,
                minHeight: `${(842 * zoom) / 100}px`,
              }}
            >
              {currentPage === 1 ? (
                <div className="p-8">
                  {/* Header */}
                  <div className="bg-primary rounded-xl p-6 flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                        <span className="text-accent-foreground font-bold text-sm">N</span>
                      </div>
                      <span className="text-primary-foreground font-heading font-bold text-xl">nextil</span>
                    </div>
                    <div className="text-right">
                      <p className="text-primary-foreground font-bold text-sm">Orçamento 13/04/2026 09:43</p>
                      <p className="text-primary-foreground/70 text-xs">13/04/2026, 09:45</p>
                    </div>
                  </div>

                  {/* Detalhamento */}
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-4">
                    Detalhamento Completo
                  </h3>

                  <h4 className="text-xs font-bold text-foreground uppercase mb-2">Por tipo de produto</h4>
                  <table className="w-full text-xs mb-6">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-1 text-muted-foreground font-semibold">Tipo</th>
                        <th className="text-right py-1 text-muted-foreground font-semibold">Qtd</th>
                        <th className="text-right py-1 text-muted-foreground font-semibold">Peças</th>
                        <th className="text-right py-1 text-muted-foreground font-semibold">%</th>
                        <th className="text-right py-1 text-muted-foreground font-semibold">Preço Médio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { tipo: "CONJUNTO", qtd: 291, pecas: 989, pct: "40.9%", pm: "R$ 126,18" },
                        { tipo: "CAMISETA", qtd: 75, pecas: 280, pct: "11.58%", pm: "R$ 64,01" },
                        { tipo: "CALÇA", qtd: 63, pecas: 235, pct: "9.72%", pm: "R$ 71,66" },
                        { tipo: "BLUSA", qtd: 60, pecas: 224, pct: "9.26%", pm: "R$ 54,88" },
                        { tipo: "VESTIDO", qtd: 50, pecas: 171, pct: "7.07%", pm: "R$ 80,10" },
                        { tipo: "JAQUETA", qtd: 43, pecas: 161, pct: "6.66%", pm: "R$ 140,60" },
                      ].map((r) => (
                        <tr key={r.tipo} className="border-b border-border/50">
                          <td className="py-1 font-medium text-foreground">{r.tipo}</td>
                          <td className="py-1 text-right text-muted-foreground">{r.qtd}</td>
                          <td className="py-1 text-right text-muted-foreground">{r.pecas}</td>
                          <td className="py-1 text-right text-muted-foreground">{r.pct}</td>
                          <td className="py-1 text-right font-semibold text-foreground">{r.pm}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Brand section */}
                  <div className="mt-8 border-t-2 border-accent pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-foreground">BRANDILI</h3>
                      <p className="text-xs text-muted-foreground">1920 peças · 533 itens</p>
                    </div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-1.5 text-muted-foreground font-semibold w-8">#</th>
                          <th className="text-left py-1.5 text-muted-foreground font-semibold">Produto</th>
                          <th className="text-center py-1.5 text-muted-foreground font-semibold">Qtd.</th>
                          <th className="text-right py-1.5 text-muted-foreground font-semibold">Unit.</th>
                          <th className="text-right py-1.5 text-muted-foreground font-semibold">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border/50">
                          <td className="py-2 text-foreground">1</td>
                          <td className="py-2">
                            <p className="font-medium text-foreground">Vestido meia malha P/M/G</p>
                            <p className="text-muted-foreground text-[10px]">Ref: 42023 · Tam: P (1), M (1), G (1) · Grade Fechada</p>
                          </td>
                          <td className="py-2 text-center text-foreground">3</td>
                          <td className="py-2 text-right text-foreground">R$ 37,38</td>
                          <td className="py-2 text-right font-semibold text-foreground">R$ 112,13</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-8">
                  <p className="text-sm text-muted-foreground text-center py-20">
                    Página {currentPage} — Conteúdo do orçamento continua...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
