import { useState } from "react";
import { useMarketing } from "../contexts/MarketingDataContext";
import { CheckCircle2, XCircle, RefreshCw, Plug, Sparkles } from "lucide-react";

const integDetails: Record<string, { color: string; gradient: string; setup: { label: string; placeholder: string }[] }> = {
  int_meta: {
    color: "#1877F2", gradient: "from-[#1877F2] to-[#42a5f5]",
    setup: [
      { label: "Business Manager ID", placeholder: "ex.: 123456789012345" },
      { label: "Conta de anúncio principal", placeholder: "act_123456789" },
      { label: "Pixel ID", placeholder: "PX-7842913" },
      { label: "Token de Conversion API", placeholder: "EAA..." },
    ],
  },
  int_wpp: {
    color: "#25D366", gradient: "from-[#25D366] to-[#128C7E]",
    setup: [
      { label: "Phone Number ID", placeholder: "123456789" },
      { label: "WhatsApp Business Account ID", placeholder: "987654321" },
      { label: "Permanent Access Token", placeholder: "EAA..." },
    ],
  },
  int_mailchimp: {
    color: "#FFE01B", gradient: "from-[#FFE01B] to-[#FFC700]",
    setup: [
      { label: "API Key", placeholder: "abc123-us21" },
      { label: "Server Prefix", placeholder: "us21" },
      { label: "Audience ID padrão", placeholder: "abc1234567" },
    ],
  },
  int_ga4: {
    color: "#F9AB00", gradient: "from-[#F9AB00] to-[#E37400]",
    setup: [
      { label: "Property ID", placeholder: "GA4-123456789" },
      { label: "Measurement ID", placeholder: "G-XXXXXXXXXX" },
      { label: "API Secret", placeholder: "ABC..." },
    ],
  },
  int_gads: {
    color: "#4285F4", gradient: "from-[#4285F4] to-[#34A853]",
    setup: [
      { label: "Customer ID", placeholder: "123-456-7890" },
      { label: "Developer Token", placeholder: "ABC..." },
    ],
  },
};

export default function IntegracoesPage() {
  const { integracoes, conectarIntegracao, desconectarIntegracao, syncIntegracao } = useMarketing();
  const [openModal, setOpenModal] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Integrações</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Conecte ferramentas externas para alimentar o módulo de marketing com dados reais.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {integracoes.map(i => {
          const det = integDetails[i.id];
          const isMeta = i.id === "int_meta";
          return (
            <div key={i.id} className={`bg-card border rounded-xl p-4 ${i.destacar ? "border-[#1877F2]/40 ring-1 ring-[#1877F2]/20" : "border-border"}`}>
              <div className="flex items-start gap-3">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${det?.gradient || "from-muted to-muted"} flex items-center justify-center shrink-0`}>
                  {isMeta ? <Sparkles className="h-6 w-6 text-white" /> : <Plug className="h-6 w-6 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-foreground">{i.nome}</h3>
                    {i.destacar && <span className="text-[10px] uppercase font-bold bg-[#1877F2]/10 text-[#1877F2] px-2 py-0.5 rounded">Núcleo</span>}
                    {i.status === "conectado" ? (
                      <span className="text-[10px] uppercase font-medium bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Conectado
                      </span>
                    ) : i.status === "erro" ? (
                      <span className="text-[10px] uppercase font-medium bg-rose-500/10 text-rose-600 px-2 py-0.5 rounded inline-flex items-center gap-1">
                        <XCircle className="h-3 w-3" /> Erro
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded">Desconectado</span>
                    )}
                  </div>
                  <p className="text-[12px] text-muted-foreground mt-1">{i.descricao}</p>
                  {i.conta && (
                    <p className="text-[11px] text-foreground mt-2 truncate">
                      <span className="text-muted-foreground">Conta:</span> {i.conta}
                    </p>
                  )}
                  {i.ultimoSync && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">Último sync: {i.ultimoSync}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    {i.status === "conectado" ? (
                      <>
                        <button onClick={() => syncIntegracao(i.id)} className="text-[11px] inline-flex items-center gap-1 bg-card border border-border rounded-lg px-2.5 py-1.5 hover:bg-muted">
                          <RefreshCw className="h-3 w-3" /> Sincronizar
                        </button>
                        <button onClick={() => setOpenModal(i.id)} className="text-[11px] inline-flex items-center gap-1 bg-card border border-border rounded-lg px-2.5 py-1.5 hover:bg-muted">
                          Configurar
                        </button>
                        <button onClick={() => desconectarIntegracao(i.id)} className="text-[11px] inline-flex items-center gap-1 text-rose-600 hover:bg-rose-500/10 rounded-lg px-2.5 py-1.5">
                          Desconectar
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setOpenModal(i.id)} className="text-[11px] font-medium inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-lg px-3 py-1.5 hover:opacity-90">
                        Conectar agora
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de conexão simulada */}
      {openModal && (() => {
        const integ = integracoes.find(i => i.id === openModal)!;
        const det = integDetails[openModal];
        return (
          <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4" onClick={() => setOpenModal(null)}>
            <div className="bg-card rounded-xl border border-border w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="px-5 py-4 border-b border-border shrink-0 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${det?.gradient || "from-muted to-muted"} flex items-center justify-center`}>
                  {openModal === "int_meta" ? <Sparkles className="h-5 w-5 text-white" /> : <Plug className="h-5 w-5 text-white" />}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Conectar {integ.nome}</h3>
                  <p className="text-[11px] text-muted-foreground">Preencha as credenciais de produção</p>
                </div>
              </div>
              <div className="px-5 py-4 overflow-y-auto space-y-3 flex-1">
                {det?.setup.map(field => (
                  <div key={field.label}>
                    <label className="text-[11px] font-medium text-foreground block mb-1">{field.label}</label>
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                ))}
                {openModal === "int_meta" && (
                  <div className="bg-[#1877F2]/5 border border-[#1877F2]/20 rounded-lg p-3 text-[11px]">
                    <p className="font-medium text-[#1877F2] mb-1">Eventos da Conversion API</p>
                    <ul className="space-y-0.5 text-muted-foreground">
                      <li>✓ Lead — formulário enviado</li>
                      <li>✓ ViewContent — lookbook aberto</li>
                      <li>✓ AddToCart — montagem de grade</li>
                      <li>✓ Purchase — orçamento ganho</li>
                    </ul>
                  </div>
                )}
              </div>
              <div className="px-5 py-3 border-t border-border shrink-0 flex items-center justify-end gap-2">
                <button onClick={() => setOpenModal(null)} className="text-[12px] px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-muted">Cancelar</button>
                <button
                  onClick={() => { conectarIntegracao(openModal, "Brandili Têxtil S/A"); setOpenModal(null); }}
                  className="text-[12px] font-medium px-4 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
                >
                  {integ.status === "conectado" ? "Salvar" : "Conectar"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
