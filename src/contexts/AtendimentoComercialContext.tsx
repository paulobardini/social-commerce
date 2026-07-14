import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from "react";
import {
  CardAC, ColunaAC, ConfigAtendimento, ConversaCentral,
  loadCardsAC, saveCardsAC, loadColunasAC, saveColunasAC,
  loadConfigAC, saveConfigAC, loadInboxAC, saveInboxAC,
  loadVendedoresAC, saveVendedoresAC, mockVendedoresAC,
  horasDesde,
} from "@/data/mockAtendimentoComercial";
import { useToast } from "@/hooks/use-toast";

type Vendedor = typeof mockVendedoresAC[number];

interface Ctx {
  cards: CardAC[];
  colunas: ColunaAC[];
  config: ConfigAtendimento;
  inbox: ConversaCentral[];
  vendedores: Vendedor[];

  // getters
  cardsPorColuna: (colunaId: string) => CardAC[];
  colunaByKey: (key: string) => ColunaAC | undefined;
  slaEstourado: (c: CardAC) => boolean;
  diasParado: (c: CardAC) => number;
  estagnado: (c: CardAC) => boolean;

  // mutations
  moverCard: (cardId: string, colunaDestinoId: string, meta?: { motivo?: string; motivoTexto?: string }) => { ok: boolean; erro?: string };
  atualizarCadastro: (cardId: string, patch: Partial<CardAC["cadastro"]>) => void;
  atualizarQualificacao: (cardId: string, patch: Partial<CardAC["qualificacao"]>) => void;
  marcarPerda: (cardId: string, motivo: string, texto?: string) => void;
  gerarOportunidade: (cardId: string, valor: number) => void;
  reabrirCard: (cardId: string) => void;
  criarLead: (input: { nome: string; telefone: string; origem: CardAC["origem"]; campanha?: string; vendedorId?: string; tag?: CardAC["tag"] }) => CardAC;

  // colunas
  setColunas: (c: ColunaAC[]) => void;
  // config
  setConfig: (c: ConfigAtendimento) => void;

  // inbox / distribuição
  distribuirManual: (conversaId: string, vendedorId: string) => void;
  distribuirRodizio: (conversaId: string) => void;
  redistribuirCard: (cardId: string, vendedorId: string) => void;

  // vendedores
  setVendedores: (v: Vendedor[]) => void;
  togglePausaVendedor: (id: string) => void;
}

const AtendimentoComercialContext = createContext<Ctx | null>(null);

export function useAtendimentoComercial() {
  const ctx = useContext(AtendimentoComercialContext);
  if (!ctx) throw new Error("useAtendimentoComercial fora do provider");
  return ctx;
}

export function AtendimentoComercialProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [cards, setCards] = useState<CardAC[]>(() => loadCardsAC());
  const [colunas, setColunasState] = useState<ColunaAC[]>(() => loadColunasAC());
  const [config, setConfigState] = useState<ConfigAtendimento>(() => loadConfigAC());
  const [inbox, setInbox] = useState<ConversaCentral[]>(() => loadInboxAC());
  const [vendedores, setVendedoresState] = useState<Vendedor[]>(() => loadVendedoresAC());
  const [ultimoRodizio, setUltimoRodizio] = useState<number>(0);

  useEffect(() => { saveCardsAC(cards); }, [cards]);
  useEffect(() => { saveColunasAC(colunas); }, [colunas]);
  useEffect(() => { saveConfigAC(config); }, [config]);
  useEffect(() => { saveInboxAC(inbox); }, [inbox]);
  useEffect(() => { saveVendedoresAC(vendedores); }, [vendedores]);

  const colunaByKey = useCallback((key: string) => colunas.find(c => c.key === key), [colunas]);
  const cardsPorColuna = useCallback((colId: string) => {
    const col = colunas.find(c => c.id === colId);
    const items = cards.filter(c => c.colunaId === colId);
    if (col?.key === "fila") {
      // FIFO com SLA estourado no topo
      return items.sort((a, b) => {
        const aE = horasDesde(a.chegouEm) > config.slaHoras ? 0 : 1;
        const bE = horasDesde(b.chegouEm) > config.slaHoras ? 0 : 1;
        if (aE !== bE) return aE - bE;
        return new Date(a.chegouEm).getTime() - new Date(b.chegouEm).getTime();
      });
    }
    return items;
  }, [cards, colunas, config.slaHoras]);

  const slaEstourado = useCallback((c: CardAC) => {
    const col = colunas.find(x => x.id === c.colunaId);
    return col?.key === "fila" && horasDesde(c.chegouEm) > config.slaHoras;
  }, [colunas, config.slaHoras]);

  const diasParado = useCallback((c: CardAC) => {
    const col = colunas.find(x => x.id === c.colunaId);
    if (col?.key !== "atendimento") return 0;
    return Math.floor(horasDesde(c.entradaColunaEm) / 24);
  }, [colunas]);

  const estagnado = useCallback((c: CardAC) => diasParado(c) >= config.diasEstagnado, [diasParado, config.diasEstagnado]);

  const ordemFluxo = ["leads", "fila", "atendimento", "cadastro", "qualificacao", "oportunidade"];

  const moverCard: Ctx["moverCard"] = (cardId, colunaDestinoId, meta) => {
    const card = cards.find(c => c.id === cardId);
    const destino = colunas.find(c => c.id === colunaDestinoId);
    if (!card || !destino) return { ok: false, erro: "Card ou coluna não encontrada" };
    if (card.status === "conflito") return { ok: false, erro: "Card em conflito, aguarde decisão do gestor" };

    // Perdido pode vir de qualquer coluna, mas exige motivo
    if (destino.key === "perdido") {
      if (!meta?.motivo) return { ok: false, erro: "Motivo de perda obrigatório" };
      setCards(prev => prev.map(c => c.id === cardId ? { ...c, colunaId: destino.id, status: "perdido", motivoPerda: meta.motivo, motivoPerdaTexto: meta.motivoTexto, entradaColunaEm: new Date().toISOString(), historico: [...c.historico, { at: new Date().toISOString(), msg: `Marcado como perdido: ${meta.motivo}` }] } : c));
      return { ok: true };
    }

    // Regras de sequência (manual): só uma etapa por vez, não pula cadastro (exceto carteira), não pula qualificação
    const origem = colunas.find(c => c.id === card.colunaId);
    if (origem?.key && destino.key && ordemFluxo.includes(origem.key) && ordemFluxo.includes(destino.key)) {
      const iO = ordemFluxo.indexOf(origem.key);
      const iD = ordemFluxo.indexOf(destino.key);
      const diff = iD - iO;
      if (Math.abs(diff) > 1) {
        // carteira pode pular Cadastro (Atendimento → Qualificação)
        const carteiraPulaCad = card.tag === "carteira" && origem.key === "atendimento" && destino.key === "qualificacao";
        if (!carteiraPulaCad) return { ok: false, erro: "Só é permitido mover 1 etapa por vez" };
      }
    }

    setCards(prev => prev.map(c => c.id === cardId ? { ...c, colunaId: destino.id, status: "ativo", entradaColunaEm: new Date().toISOString(), historico: [...c.historico, { at: new Date().toISOString(), msg: `Movido para ${destino.label}` }] } : c));
    return { ok: true };
  };

  const atualizarCadastro: Ctx["atualizarCadastro"] = (cardId, patch) => {
    setCards(prev => prev.map(c => {
      if (c.id !== cardId) return c;
      const novoCadastro = { ...c.cadastro, ...patch };
      const camposObrig: (keyof CardAC["cadastro"])[] = ["nome", "cnpj", "cidade", "email"];
      const completo = camposObrig.every(k => !!novoCadastro[k]);
      const preenchidos = Object.values(novoCadastro).filter(Boolean).length;
      let colunaId = c.colunaId;
      let entrada = c.entradaColunaEm;
      const colCad = colunas.find(x => x.key === "cadastro");
      const colQual = colunas.find(x => x.key === "qualificacao");
      const colAtend = colunas.find(x => x.key === "atendimento");
      // Primeiro campo → Em Cadastro (se estava em Atendimento)
      if (colCad && colAtend && c.colunaId === colAtend.id && preenchidos === 1) {
        colunaId = colCad.id; entrada = new Date().toISOString();
        toast({ title: "Card movido para Em Cadastro" });
      }
      // Cadastro completo → Em Qualificação
      if (completo && colQual && c.colunaId !== colQual.id) {
        colunaId = colQual.id; entrada = new Date().toISOString();
        toast({ title: "Cadastro completo", description: "Card movido para Em Qualificação" });
      }
      return { ...c, cadastro: novoCadastro, colunaId, entradaColunaEm: entrada };
    }));
  };

  const atualizarQualificacao: Ctx["atualizarQualificacao"] = (cardId, patch) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, qualificacao: { ...c.qualificacao, ...patch } } : c));
  };

  const marcarPerda: Ctx["marcarPerda"] = (cardId, motivo, texto) => {
    const colPerd = colunas.find(c => c.key === "perdido");
    if (!colPerd) return;
    moverCard(cardId, colPerd.id, { motivo, motivoTexto: texto });
  };

  const gerarOportunidade: Ctx["gerarOportunidade"] = (cardId, valor) => {
    const colOp = colunas.find(c => c.key === "oportunidade");
    if (!colOp) return;
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, colunaId: colOp.id, valorEstimado: valor, entradaColunaEm: new Date().toISOString(), historico: [...c.historico, { at: new Date().toISOString(), msg: `Oportunidade gerada: R$ ${valor.toLocaleString("pt-BR")}` }] } : c));
    toast({ title: "Oportunidade criada", description: `Valor estimado: R$ ${valor.toLocaleString("pt-BR")}` });
  };

  const reabrirCard: Ctx["reabrirCard"] = (cardId) => {
    const colFila = colunas.find(c => c.key === "fila");
    if (!colFila) return;
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, colunaId: colFila.id, status: "ativo", entradaColunaEm: new Date().toISOString(), historico: [...c.historico, { at: new Date().toISOString(), msg: "Card reaberto na Fila" }] } : c));
  };

  const criarLead: Ctx["criarLead"] = (input) => {
    const colLeads = colunas.find(c => c.key === "leads")!;
    let vendedorId = input.vendedorId;
    if (!vendedorId) {
      // rodízio simples
      const ativos = vendedores.filter(v => !v.pausado);
      if (ativos.length) {
        const idx = (ultimoRodizio + 1) % ativos.length;
        vendedorId = ativos[idx].id;
        setUltimoRodizio(idx);
      } else {
        vendedorId = vendedores[0].id;
      }
    }
    const vend = vendedores.find(v => v.id === vendedorId)!;
    const now = new Date().toISOString();
    const novo: CardAC = {
      id: `card-${Date.now()}`,
      colunaId: colLeads.id,
      nome: input.nome,
      telefone: input.telefone,
      avatarIniciais: input.nome.split(" ").slice(0, 2).map(n => n[0]?.toUpperCase() ?? "").join(""),
      tag: input.tag ?? "lead",
      origem: input.origem,
      campanha: input.campanha,
      vendedorId: vend.id,
      vendedorNome: vend.nome,
      ultimaMensagem: "Lead cadastrado manualmente",
      ultimaInteracao: now,
      chegouEm: now,
      entradaColunaEm: now,
      naoLidas: 0,
      cadastro: { nome: input.nome },
      qualificacao: {},
      status: "ativo",
      historico: [{ at: now, msg: `Lead criado — origem: ${input.origem}` }],
    };
    setCards(prev => [novo, ...prev]);
    toast({ title: "Lead cadastrado", description: `Atribuído a ${vend.nome}` });
    return novo;
  };

  const setColunas: Ctx["setColunas"] = (c) => setColunasState([...c].sort((a, b) => a.ordem - b.ordem));
  const setConfig: Ctx["setConfig"] = (c) => setConfigState(c);
  const setVendedores: Ctx["setVendedores"] = (v) => setVendedoresState(v);
  const togglePausaVendedor: Ctx["togglePausaVendedor"] = (id) => setVendedoresState(prev => prev.map(v => v.id === id ? { ...v, pausado: !v.pausado } : v));

  const distribuirManual: Ctx["distribuirManual"] = (conversaId, vendedorId) => {
    const conv = inbox.find(c => c.id === conversaId);
    if (!conv) return;
    const novo = criarLead({ nome: conv.nome, telefone: conv.telefone, origem: conv.origem, campanha: conv.campanha, vendedorId });
    // move para Fila
    const colFila = colunas.find(c => c.key === "fila")!;
    setCards(prev => prev.map(c => c.id === novo.id ? { ...c, colunaId: colFila.id, ultimaMensagem: conv.ultimaMensagem, historico: [...c.historico, { at: new Date().toISOString(), msg: "Distribuído do whats central — histórico importado" }] } : c));
    setInbox(prev => prev.filter(c => c.id !== conversaId));
  };
  const distribuirRodizio: Ctx["distribuirRodizio"] = (conversaId) => distribuirManual(conversaId, "");
  const redistribuirCard: Ctx["redistribuirCard"] = (cardId, vendedorId) => {
    const vend = vendedores.find(v => v.id === vendedorId);
    if (!vend) return;
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, vendedorId: vend.id, vendedorNome: vend.nome, historico: [...c.historico, { at: new Date().toISOString(), msg: `Redistribuído para ${vend.nome}` }] } : c));
    toast({ title: "Card redistribuído", description: `Novo responsável: ${vend.nome}` });
  };

  const value: Ctx = useMemo(() => ({
    cards, colunas, config, inbox, vendedores,
    cardsPorColuna, colunaByKey, slaEstourado, diasParado, estagnado,
    moverCard, atualizarCadastro, atualizarQualificacao, marcarPerda, gerarOportunidade, reabrirCard, criarLead,
    setColunas, setConfig,
    distribuirManual, distribuirRodizio, redistribuirCard,
    setVendedores, togglePausaVendedor,
  }), [cards, colunas, config, inbox, vendedores, cardsPorColuna, colunaByKey, slaEstourado, diasParado, estagnado]);

  return <AtendimentoComercialContext.Provider value={value}>{children}</AtendimentoComercialContext.Provider>;
}
