import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMarketing } from "../contexts/MarketingDataContext";
import { Lookbook, LookbookPagina, statusLookbookCfg, lookbookTemplates, LookbookLayout } from "../data/mockLookbooks";
import { ArrowLeft, Save, Trash2, ExternalLink, Share2, Globe, Eye, BookOpen, ShoppingBag, LayoutGrid, Rows3, Image as ImageIconLucide, Type, Square, Columns2 } from "lucide-react";
import { formatNum, formatBRLCompact, formatPct } from "../styles/tokens";
import { LookbookPageRender } from "../components/LookbookPageRender";
import { LookbookProductPicker } from "../components/LookbookProductPicker";

export default function LookbookEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lookbooks, atualizarLookbook, setStatusLookbook } = useMarketing();
  const original = lookbooks.find(l => l.id === id);
  const [draft, setDraft] = useState<Lookbook | null>(original ? structuredClone(original) : null);
  const [tab, setTab] = useState<"editor" | "analytics">("editor");
  const [selectedPage, setSelectedPage] = useState(0);

  if (!draft) {
    return <div className="space-y-4">
      <button onClick={() => navigate("/marketing/lookbooks")} className="text-[12px] inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> Voltar</button>
      <div className="bg-card border border-dashed border-border rounded-xl p-10 text-center"><p className="text-sm text-muted-foreground">Lookbook não encontrado.</p></div>
    </div>;
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(original);
  const st = statusLookbookCfg[draft.status];
  const publicUrl = `/publico/lookbook/${draft.slug}`;
  const taxaConv = draft.views > 0 ? (draft.conversoes / draft.views) * 100 : 0;

  const updatePage = (idx: number, patch: Partial<LookbookPagina>) => {
    setDraft(d => d ? { ...d, paginas: d.paginas.map((p, i) => i === idx ? { ...p, ...patch } : p) } : d);
  };
  const addPageFromTemplate = (templateId: string) => {
    const tpl = lookbookTemplates.find(t => t.id === templateId);
    if (!tpl) return;
    const built = tpl.build();
    const novaPag: LookbookPagina = { id: `p_${Date.now()}`, ...built };
    setDraft(d => d ? { ...d, paginas: [...d.paginas, novaPag] } : d);
    setSelectedPage(draft.paginas.length);
  };
  const removePage = (idx: number) => {
    setDraft(d => d ? { ...d, paginas: d.paginas.filter((_, i) => i !== idx) } : d);
    setSelectedPage(0);
  };
  const salvar = () => atualizarLookbook(draft);
  const publicar = () => { setDraft(d => d ? { ...d, status: "publicado" } : d); setStatusLookbook(draft.id, "publicado"); atualizarLookbook({ ...draft, status: "publicado" }); };
  const copyLink = () => navigator.clipboard?.writeText(window.location.origin + publicUrl);

  const page = draft.paginas[selectedPage];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <button onClick={() => navigate("/marketing/lookbooks")} className="h-9 w-9 rounded-lg bg-card border border-border hover:bg-muted flex items-center justify-center shrink-0"><ArrowLeft className="h-4 w-4" /></button>
          <div className="min-w-0">
            <input value={draft.nome} onChange={e => setDraft(d => d ? { ...d, nome: e.target.value } : d)} className="text-lg md:text-xl font-bold text-foreground bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-ring rounded px-1 -ml-1 w-full" />
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${st.color}`}>{st.label}</span>
              <span className="text-[11px] text-muted-foreground">{draft.paginas.length} páginas · /{draft.slug}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={copyLink} className="text-[12px] inline-flex items-center gap-1 bg-card border border-border rounded-lg px-2.5 py-1.5 hover:bg-muted"><Share2 className="h-3.5 w-3.5" /> Copiar link</button>
          <a href={publicUrl} target="_blank" rel="noreferrer" className="text-[12px] inline-flex items-center gap-1 bg-card border border-border rounded-lg px-2.5 py-1.5 hover:bg-muted"><ExternalLink className="h-3.5 w-3.5" /> Pré-visualizar</a>
          {draft.status !== "publicado" && <button onClick={publicar} className="text-[12px] inline-flex items-center gap-1 bg-emerald-500 text-white rounded-lg px-3 py-1.5 hover:opacity-90"><Globe className="h-3.5 w-3.5" /> Publicar</button>}
          <button disabled={!dirty} onClick={salvar} className="text-[12px] inline-flex items-center gap-1 bg-primary text-primary-foreground rounded-lg px-3 py-1.5 hover:opacity-90 disabled:opacity-40"><Save className="h-3.5 w-3.5" /> Salvar</button>
        </div>
      </div>

      <div className="border-b border-border flex items-center gap-1">
        <button onClick={() => setTab("editor")} className={`text-[12px] font-medium px-3 py-2 border-b-2 -mb-px ${tab === "editor" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Editor</button>
        <button onClick={() => setTab("analytics")} className={`text-[12px] font-medium px-3 py-2 border-b-2 -mb-px ${tab === "analytics" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Analytics</button>
      </div>

      {tab === "editor" ? (
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_320px] gap-3">
          {/* Páginas + templates */}
          <aside className="bg-card border border-border rounded-xl p-2 space-y-1 max-h-[680px] overflow-y-auto">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold px-2 py-1">Páginas</p>
            {draft.paginas.map((p, i) => (
              <button key={p.id} onClick={() => setSelectedPage(i)} className={`w-full text-left px-2 py-1.5 rounded text-[11px] flex items-center gap-2 ${selectedPage === i ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"}`}>
                <span className="text-muted-foreground tabular-nums w-4">{i + 1}</span>
                <span className="truncate flex-1">{p.titulo || `(${p.tipo})`}</span>
                <span className="text-[8px] uppercase text-muted-foreground/70">{p.layout || p.tipo}</span>
              </button>
            ))}
            <div className="pt-2 border-t border-border space-y-1 mt-1">
              <p className="text-[9px] uppercase text-muted-foreground font-bold px-2">+ Adicionar página</p>
              <p className="text-[9px] text-muted-foreground px-2 mb-1">Modelos prontos:</p>
              {lookbookTemplates.map(tpl => {
                const Icon = tpl.icon === "capa" ? BookOpen
                  : tpl.icon === "grid-2" ? LayoutGrid
                  : tpl.icon === "grid-3" ? Square
                  : tpl.icon === "lista" ? Rows3
                  : tpl.icon === "split" ? Columns2
                  : tpl.icon === "texto" ? Type
                  : ImageIconLucide;
                return (
                  <button key={tpl.id} onClick={() => addPageFromTemplate(tpl.id)} className="w-full text-left px-2 py-1.5 hover:bg-muted rounded">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
                      <Icon className="h-3 w-3 shrink-0" /> {tpl.label}
                    </div>
                    <p className="text-[9px] text-muted-foreground pl-4.5 ml-3">{tpl.descricao}</p>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Preview */}
          <div className="bg-muted/30 border border-border rounded-xl p-4 flex items-center justify-center min-h-[600px]">
            <div className="w-full max-w-[360px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl flex flex-col font-['Poppins']" style={{ backgroundColor: draft.paleta.fundo, color: draft.paleta.texto }}>
              {page && <LookbookPageRender page={page} paletaPrimaria={draft.paleta.primaria} scale="preview" />}
            </div>
          </div>

          {/* Inspector */}
          <aside className="bg-card border border-border rounded-xl p-3 max-h-[680px] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] uppercase font-bold text-muted-foreground">Página {selectedPage + 1} · {page?.tipo}</p>
              {draft.paginas.length > 1 && <button onClick={() => removePage(selectedPage)} className="h-6 w-6 rounded text-rose-600 hover:bg-rose-500/10 flex items-center justify-center"><Trash2 className="h-3.5 w-3.5" /></button>}
            </div>
            {page && <>
              <Field label="Título"><input value={page.titulo || ""} onChange={e => updatePage(selectedPage, { titulo: e.target.value })} className="w-full bg-card border border-border rounded-lg px-2 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring" /></Field>
              {page.tipo === "capa" && <Field label="Subtítulo"><input value={page.subtitulo || ""} onChange={e => updatePage(selectedPage, { subtitulo: e.target.value })} className="w-full bg-card border border-border rounded-lg px-2 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring" /></Field>}
              {(page.tipo === "capa" || page.tipo === "imagem" || (page.tipo === "produtos" && page.layout === "split-imagem")) && <Field label="URL da imagem"><input value={page.imagemUrl || ""} onChange={e => updatePage(selectedPage, { imagemUrl: e.target.value })} className="w-full bg-card border border-border rounded-lg px-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-ring" /></Field>}
              {page.tipo === "texto" && <Field label="Conteúdo"><textarea value={page.texto || ""} onChange={e => updatePage(selectedPage, { texto: e.target.value })} rows={6} className="w-full bg-card border border-border rounded-lg px-2 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring" /></Field>}
              {page.tipo === "produtos" && <>
                <Field label="Layout">
                  <select
                    value={page.layout || "grid-2"}
                    onChange={e => updatePage(selectedPage, { layout: e.target.value as LookbookLayout })}
                    className="w-full bg-card border border-border rounded-lg px-2 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="grid-2">Grade 2x2 (4 produtos)</option>
                    <option value="grid-3">Grade 3x3 (9 produtos)</option>
                    <option value="lista">Vitrine vertical</option>
                    <option value="split-imagem">Editorial + 2 produtos</option>
                    <option value="destaque-1">Produto em destaque</option>
                  </select>
                </Field>
                <Field label={`Produtos do catálogo`}>
                  <LookbookProductPicker
                    selectedIds={page.produtoIds || []}
                    onChange={ids => updatePage(selectedPage, { produtoIds: ids })}
                    max={page.layout === "grid-3" ? 9 : page.layout === "lista" ? 12 : page.layout === "destaque-1" ? 1 : page.layout === "split-imagem" ? 2 : 4}
                  />
                </Field>
              </>}
            </>}
            <div className="mt-4 pt-3 border-t border-border space-y-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold">Paleta de cores</p>
              <ColorField label="Primária" value={draft.paleta.primaria} onChange={v => setDraft(d => d ? { ...d, paleta: { ...d.paleta, primaria: v } } : d)} />
              <ColorField label="Fundo" value={draft.paleta.fundo} onChange={v => setDraft(d => d ? { ...d, paleta: { ...d.paleta, fundo: v } } : d)} />
              <ColorField label="Texto" value={draft.paleta.texto} onChange={v => setDraft(d => d ? { ...d, paleta: { ...d.paleta, texto: v } } : d)} />
            </div>
          </aside>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
            <Kpi icon={Eye} label="Views" value={formatNum(draft.views)} />
            <Kpi icon={Eye} label="Únicos" value={formatNum(draft.visualizadoresUnicos)} />
            <Kpi icon={ShoppingBag} label="Cliques" value={formatNum(draft.cliquesProduto)} />
            <Kpi icon={Globe} label="Conversões" value={formatNum(draft.conversoes)} sub={taxaConv > 0 ? formatPct(taxaConv) : undefined} />
            <Kpi icon={Globe} label="Receita" value={formatBRLCompact(draft.receitaAtribuida)} highlight />
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border"><p className="text-sm font-bold text-foreground">Últimos acessos</p></div>
            <table className="w-full text-[12px]">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Data</th>
                  <th className="text-left px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Origem</th>
                  <th className="text-left px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Contato</th>
                  <th className="text-right px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Tempo</th>
                  <th className="text-right px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Páginas</th>
                  <th className="text-right px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Cliques</th>
                  <th className="text-right px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Converteu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {draft.logs.slice(0, 20).map(l => (
                  <tr key={l.id}>
                    <td className="px-4 py-2 text-foreground">{l.data}</td>
                    <td className="px-4 py-2"><span className="text-[10px] uppercase font-bold bg-muted px-1.5 py-0.5 rounded">{l.origem}</span></td>
                    <td className="px-4 py-2 text-muted-foreground">{l.contato || "—"}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{l.duracaoSeg}s</td>
                    <td className="px-4 py-2 text-right tabular-nums">{l.paginasVistas}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{l.cliquesProduto}</td>
                    <td className="px-4 py-2 text-right">{l.converteu ? <span className="text-emerald-600">✓</span> : "—"}</td>
                  </tr>
                ))}
                {draft.logs.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Sem acessos registrados ainda.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="mb-3"><label className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold block mb-1">{label}</label>{children}</div>;
}
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return <div className="flex items-center gap-2"><input type="color" value={value} onChange={e => onChange(e.target.value)} className="h-6 w-8 rounded border border-border cursor-pointer" /><span className="text-[11px] text-muted-foreground flex-1">{label}</span><span className="text-[10px] text-foreground tabular-nums">{value}</span></div>;
}
function Kpi({ icon: Icon, label, value, sub, highlight }: { icon: typeof BookOpen; label: string; value: string; sub?: string; highlight?: boolean }) {
  return <div className={`border rounded-xl p-3 ${highlight ? "bg-emerald-500/5 border-emerald-500/20" : "bg-card border-border"}`}><div className="flex items-center gap-1.5 mb-1.5"><Icon className={`h-3.5 w-3.5 ${highlight ? "text-emerald-600" : "text-muted-foreground"}`} /><span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">{label}</span></div><p className={`text-lg font-bold tabular-nums ${highlight ? "text-emerald-600" : "text-foreground"}`}>{value}</p>{sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}</div>;
}
