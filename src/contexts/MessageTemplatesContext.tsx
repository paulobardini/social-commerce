import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface MessageTemplate {
  id: string;
  nome: string;
  conteudo: string; // suporta {{nome}}, {{produto}}, {{valor}}
  categoria?: string;
  criadoEm: string;
}

interface Ctx {
  templates: MessageTemplate[];
  addTemplate: (t: Omit<MessageTemplate, "id" | "criadoEm">) => void;
  updateTemplate: (id: string, patch: Partial<MessageTemplate>) => void;
  removeTemplate: (id: string) => void;
}

const MessageTemplatesContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "nextil_msg_templates_v1";

// MOCK: templates iniciais (em produção viria da API)
const DEFAULTS: MessageTemplate[] = [
  { id: "tpl_boas_vindas", nome: "Boas-vindas", categoria: "Abertura", conteudo: "Olá {{nome}}! Tudo bem? Aqui é o Paulo da NEXTIL. Como posso te ajudar hoje?", criadoEm: "01/04/2026" },
  { id: "tpl_followup", nome: "Follow-up orçamento", categoria: "Follow-up", conteudo: "Oi {{nome}}, passando para saber se conseguiu analisar o orçamento {{produto}} no valor de {{valor}}. Qualquer dúvida estou à disposição!", criadoEm: "02/04/2026" },
  { id: "tpl_pos_venda", nome: "Pós-venda", categoria: "Pós-venda", conteudo: "Olá {{nome}}! Tudo certo com a entrega do pedido {{produto}}? Conta pra mim como foi a experiência. 😊", criadoEm: "03/04/2026" },
  { id: "tpl_lembrete", nome: "Lembrete de retorno", categoria: "Follow-up", conteudo: "{{nome}}, conforme combinamos, retomo o contato sobre {{produto}}. Quando seria um bom momento para conversarmos?", criadoEm: "04/04/2026" },
];

export function MessageTemplatesProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<MessageTemplate[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return DEFAULTS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  }, [templates]);

  const addTemplate: Ctx["addTemplate"] = (t) => {
    setTemplates(prev => [
      { ...t, id: `tpl_${Date.now()}`, criadoEm: new Date().toLocaleDateString("pt-BR") },
      ...prev,
    ]);
  };

  const updateTemplate: Ctx["updateTemplate"] = (id, patch) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  };

  const removeTemplate: Ctx["removeTemplate"] = (id) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  return (
    <MessageTemplatesContext.Provider value={{ templates, addTemplate, updateTemplate, removeTemplate }}>
      {children}
    </MessageTemplatesContext.Provider>
  );
}

export function useMessageTemplates() {
  const ctx = useContext(MessageTemplatesContext);
  if (!ctx) throw new Error("useMessageTemplates must be used within MessageTemplatesProvider");
  return ctx;
}

// Substitui variáveis {{xxx}} no template a partir de um dicionário de valores.
export function fillTemplate(content: string, vars: Record<string, string | number | undefined | null>): string {
  return content.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    const v = vars[key];
    if (v === undefined || v === null || v === "") return `{{${key}}}`;
    return String(v);
  });
}
