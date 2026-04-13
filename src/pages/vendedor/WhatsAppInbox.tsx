import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, MessageCircle, Phone, Send, Paperclip, CheckSquare, Target,
  Clock, User, ExternalLink, MapPin, ShoppingBag, FileText, Calendar, ChevronLeft,
} from "lucide-react";
import {
  mockConversas, mockMensagens, mockClientes360, type Conversa,
} from "@/data/mockCRM360";

export default function WhatsAppInbox() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string>(mockConversas[0]?.id || "");
  const [search, setSearch] = useState("");
  const [msgInput, setMsgInput] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const filtered = mockConversas.filter(c => {
    if (search && !c.clienteNome.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus === "nao_lida" && c.naoLidas === 0) return false;
    if (filterStatus === "aguardando" && c.status !== "aguardando_resposta") return false;
    return true;
  });

  const selected = mockConversas.find(c => c.id === selectedId);
  const mensagens = selected ? mockMensagens[selected.id] || [] : [];
  const cliente = selected ? mockClientes360.find(c => c.id === selected.clienteId) : null;

  const totalNaoLidas = mockConversas.reduce((s, c) => s + c.naoLidas, 0);

  return (
    <>
      <div className="flex h-[calc(100vh-56px)] overflow-hidden">
        {/* Left - Conversations list */}
        <div className={`${selectedId && selected ? "hidden md:flex" : "flex"} w-full md:w-[320px] border-r border-border flex-col bg-card shrink-0`}>
          <div className="p-3 border-b border-border space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-heading font-bold flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-green-600" /> WhatsApp
                {totalNaoLidas > 0 && <Badge className="h-5 text-[10px]">{totalNaoLidas}</Badge>}
              </h2>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Buscar conversa..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
            </div>
            <div className="flex gap-1">
              {[
                { key: "", label: "Todas" },
                { key: "nao_lida", label: "Não lidas" },
                { key: "aguardando", label: "Aguardando" },
              ].map(f => (
                <button key={f.key} onClick={() => setFilterStatus(f.key)} className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${filterStatus === f.key ? "bg-accent text-accent-foreground border-accent" : "border-border text-muted-foreground hover:border-accent/40"}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`w-full flex items-start gap-3 p-3 text-left transition-colors border-b border-border/50 ${
                  selectedId === conv.id ? "bg-accent/5 border-l-2 border-l-accent" : "hover:bg-muted/50"
                }`}
              >
                <div className="relative shrink-0">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-green-700">{conv.clienteNome[0]}</span>
                  </div>
                  {conv.online && <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${conv.naoLidas > 0 ? "font-bold" : "font-medium"}`}>{conv.clienteNome}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-1">{conv.ultimaHora}</span>
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${conv.naoLidas > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>{conv.ultimaMensagem}</p>
                </div>
                {conv.naoLidas > 0 && (
                  <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-green-500 shrink-0">{conv.naoLidas}</Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Center - Chat */}
        {selected ? (
          <div className={`${!selectedId || !selected ? "hidden md:flex" : "flex"} flex-1 flex-col min-w-0`}>
            <div className="h-14 border-b border-border flex items-center px-4 gap-3 bg-card shrink-0">
              <button onClick={() => setSelectedId("")} className="md:hidden h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="relative">
                <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-green-700">{selected.clienteNome[0]}</span>
                </div>
                {selected.online && <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-card" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{selected.clienteNome}</p>
                <p className="text-[10px] text-muted-foreground">{selected.online ? "Online" : "Offline"}{cliente ? ` · ${cliente.cidade}/${cliente.estado}` : ""}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="sm" className="text-xs"><CheckSquare className="h-3.5 w-3.5 mr-1" /> Tarefa</Button>
                <Button variant="ghost" size="sm" className="text-xs"><Target className="h-3.5 w-3.5 mr-1" /> Oportunidade</Button>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate(`/vendedor/360/${selected.clienteId}`)}>
                  <ExternalLink className="h-3.5 w-3.5 mr-1" /> Nextil 360
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[hsl(var(--background))]">
              {mensagens.length > 0 && (
                <div className="flex justify-center"><span className="text-[10px] text-muted-foreground bg-muted px-3 py-1 rounded-full">{mensagens[0]?.data}</span></div>
              )}
              {mensagens.map(m => (
                <div key={m.id} className={`flex ${m.remetente === "vendedor" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[65%] px-3 py-2 rounded-xl text-sm ${
                    m.remetente === "vendedor" ? "bg-accent text-accent-foreground rounded-br-sm" : "bg-card border border-border rounded-bl-sm"
                  }`}>
                    <p>{m.texto}</p>
                    <p className={`text-[10px] mt-1 text-right ${m.remetente === "vendedor" ? "text-accent-foreground/70" : "text-muted-foreground"}`}>{m.horario}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-14 border-t border-border flex items-center gap-2 px-3 bg-card shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8"><Paperclip className="h-4 w-4" /></Button>
              <Input placeholder="Digite uma mensagem..." value={msgInput} onChange={e => setMsgInput(e.target.value)} className="h-9 flex-1" />
              <Button size="icon" className="h-8 w-8"><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm">Selecione uma conversa</p>
            </div>
          </div>
        )}

        {/* Right - Client panel (improved) */}
        {selected && cliente && (
          <div className="w-[280px] border-l border-border bg-card overflow-y-auto shrink-0">
            <div className="p-4 text-center border-b border-border">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl font-bold text-green-700">{cliente.nomeFantasia[0]}</span>
              </div>
              <p className="text-sm font-semibold">{cliente.nomeFantasia}</p>
              <p className="text-[10px] text-muted-foreground">{cliente.documento}</p>
            </div>

            <div className="p-4 space-y-3 border-b border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><User className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{cliente.representante}</span></div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Phone className="h-3.5 w-3.5 shrink-0" /> <span>{cliente.whatsapp}</span></div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5 shrink-0" /> <span>{cliente.cidade}/{cliente.estado}</span></div>
            </div>

            <div className="p-4 space-y-2 border-b border-border">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Comercial</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold font-heading text-purple-600">{cliente.oportunidadesAbertas}</p>
                  <p className="text-[9px] text-muted-foreground">Oportunidades</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold font-heading text-green-600">{cliente.pedidosRealizados}</p>
                  <p className="text-[9px] text-muted-foreground">Pedidos</p>
                </div>
              </div>
              <div className="text-xs space-y-1.5 pt-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Nicho</span><span className="font-medium">{cliente.nicho === "infantil" ? "Infantil" : cliente.nicho === "adulto" ? "Adulto" : cliente.nicho === "fitness" ? "Fitness" : "Multimarcas"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Interesse</span><span className="font-medium truncate ml-2 max-w-[120px] text-right">{cliente.interessePrincipal}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Último contato</span><span className="font-medium">{cliente.ultimoContato}</span></div>
              </div>
            </div>

            <div className="p-4 space-y-1.5">
              <Button variant="outline" size="sm" className="w-full text-xs justify-start" onClick={() => navigate(`/vendedor/360/${cliente.id}`)}>
                <ExternalLink className="h-3.5 w-3.5 mr-2" /> Abrir Nextil 360
              </Button>
              <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                <Target className="h-3.5 w-3.5 mr-2" /> Criar oportunidade
              </Button>
              <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                <CheckSquare className="h-3.5 w-3.5 mr-2" /> Criar tarefa
              </Button>
              <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                <Calendar className="h-3.5 w-3.5 mr-2" /> Agendar compromisso
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
