import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback, useRef } from "react";
import {
  CardAC, ColunaAC, ConfigAtendimento, ConversaCentral, PerdaQualificada, CampanhaRenutricao, MarketingStatus,
  loadCardsAC, saveCardsAC, loadColunasAC, saveColunasAC,
  loadConfigAC, saveConfigAC, loadInboxAC, saveInboxAC,
  loadVendedoresAC, saveVendedoresAC, mockVendedoresAC,
  horasDesde,
} from "@/data/mockAtendimentoComercial";
import { useToast } from "@/hooks/use-toast";
import { useNotificacoes } from "./NotificacoesContext";
import { mockClientes360 } from "@/data/mockCRM360";
import { ConflitoLead, loadConflitos, saveConflitos, StatusConflito } from "@/data/mockAprovacoesConflito";

type Vendedor = typeof mockVendedoresAC[number];

export type EventoConversa =
  | { tipo: "mensagem_recebida"; conversaId: string; telefone?: string; nome?: string; texto?: string }
  | { tipo: "primeira_resposta_vendedor"; conversaId: string; texto?: string };

interface Ctx {
  cards: CardAC[];
  colunas: ColunaAC[];
  config: ConfigAtendimento;
  inbox: ConversaCentral[];
  vendedores: Vendedor[];
  conflitos: ConflitoLead[];

  // getters
  cardsPorColuna: (colunaId: string) => CardAC[];
  colunaByKey: (key: string) => ColunaAC | undefined;
  slaEstourado: (c: CardAC) => boolean;
  diasParado: (c: CardAC) => number;
  estagnado: (c: CardAC) => boolean;
  cardDaConversa: (conversaId: string) => CardAC | undefined;
  conversaDoCard: (cardId: string) => string | undefined;
  cardByTelefone: (telefone: string) => CardAC | undefined;

  // mutations
  moverCard: (cardId: string, colunaDestinoId: string, meta?: { motivo?: string; motivoTexto?: string; perda?: Omit<PerdaQualificada, "registradoEm"> }) => { ok: boolean; erro?: string };
  atualizarCadastro: (cardId: string, patch: Partial<CardAC["cadastro"]>) => void;
  atualizarQualificacao: (cardId: string, patch: Partial<CardAC["qualificacao"]>) => void;
  marcarPerda: (cardId: string, perda: Omit<PerdaQualificada, "registradoEm">) => void;
  moverParaRenutricao: (cardId: string, campanha: CampanhaRenutricao) => void;
  arquivarCard: (cardId: string) => void;
  reativarMarketing: (cardId: string) => void;
  gerarOportunidade: (cardId: string, valor: number) => void;
  reabrirCard: (cardId: string) => void;
  criarLead: (input: { nome: string; telefone: string; origem: CardAC["origem"]; campanha?: string; vendedorId?: string; tag?: CardAC["tag"]; conversaId?: string; clienteId?: string }) => CardAC;

  // colunas
  setColunas: (c: ColunaAC[]) => void;
  setConfig: (c: ConfigAtendimento) => void;

  // inbox / distribuição
  distribuirManual: (conversaId: string, vendedorId: string) => void;
  distribuirRodizio: (conversaId: string) => void;
  redistribuirCard: (cardId: string, vendedorId: string) => void;

  // vendedores
  setVendedores: (v: Vendedor[]) => void;
  togglePausaVendedor: (id: string) => void;

  // gatilhos e conflito (Fase 7)
  registrarEventoConversa: (ev: EventoConversa) => void;
  resolverConflito: (conflitoId: string, decisao: "manter_dono" | "liberar_novo") => void;

  // marketing pode enviar mensagem no whats central
  enviarMensagemMarketing: (id: string, texto: string) => void;
}

const AtendimentoComercialContext = createContext<Ctx | null>(null);

export function useAtendimentoComercial() {
  const ctx = useContext(AtendimentoComercialContext);
  if (!ctx) throw new Error("useAtendimentoComercial fora do provider");
  return ctx;
}

// vendedor logado — mock
const MEU_VENDEDOR_ID = "v-paulo";

// helpers de normalização
const digits = (s?: string) => (s || "").replace(/\D/g, "");
const normCNPJ = (s?: string) => digits(s);
const conversaIdDoCard = (card: CardAC) => card.conversaId || `ac-card-${card.id}`;

export function AtendimentoComercialProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const notif = useNotificacoes();
  const [cards, setCards] = useState<CardAC[]>(() => loadCardsAC());
  const [colunas, setColunasState] = useState<ColunaAC[]>(() => loadColunasAC());
  const [config, setConfigState] = useState<ConfigAtendimento>(() => loadConfigAC());
  const [inbox, setInbox] = useState<ConversaCentral[]>(() => loadInboxAC());
  const [vendedores, setVendedoresState] = useState<Vendedor[]>(() => loadVendedoresAC());
  const [conflitos, setConflitos] = useState<ConflitoLead[]>(() => loadConflitos());
  const [ultimoRodizio, setUltimoRodizio] = useState<number>(0);

  useEffect(() => { saveCardsAC(cards); }, [cards]);
  useEffect(() => { saveColunasAC(colunas); }, [colunas]);
  useEffect(() => { saveConfigAC(config); }, [config]);
  useEffect(() => { saveInboxAC(inbox); }, [inbox]);
  useEffect(() => { saveVendedoresAC(vendedores); }, [vendedores]);
  useEffect(() => { saveConflitos(conflitos); }, [conflitos]);

  const colunaByKey = useCallback((key: string) => colunas.find(c => c.key === key), [colunas]);
  const cardsPorColuna = useCallback((colId: string) => {
    const col = colunas.find(c => c.id === colId);
    const items = cards.filter(c => c.colunaId === colId);
    if (col?.key === "fila") {
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

  const cardDaConversa = useCallback((conversaId: string) => cards.find(c => conversaIdDoCard(c) === conversaId), [cards]);
  const conversaDoCard = useCallback((cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    return card ? conversaIdDoCard(card) : undefined;
  }, [cards]);
  const cardByTelefone = useCallback((telefone: string) => {
    const d = digits(telefone);
    if (!d) return undefined;
    return cards.find(c => {
      const cd = digits(c.telefone);
      return cd && (cd === d || cd.endsWith(d) || d.endsWith(cd));
    });
  }, [cards]);

  const ordemFluxo = ["leads", "fila", "atendimento", "cadastro", "qualificacao", "oportunidade"];

  const moverCard: Ctx["moverCard"] = (cardId, colunaDestinoId, meta) => {
    const card = cards.find(c => c.id === cardId);
    const destino = colunas.find(c => c.id === colunaDestinoId);
    if (!card || !destino) return { ok: false, erro: "Card ou coluna não encontrada" };
    if (card.status === "conflito") return { ok: false, erro: "Card em conflito, aguarde decisão do gestor" };

    if (destino.key === "perdido") {
      // Aceita perda qualificada (Fase 10) OU legado {motivo, motivoTexto}
      const perdaObj: PerdaQualificada | undefined = meta?.perda
        ? { ...meta.perda, registradoEm: new Date().toISOString() }
        : (meta?.motivo ? { motivo: meta.motivo, explicacao: meta.motivoTexto || meta.motivo, registradoEm: new Date().toISOString() } : undefined);
      if (!perdaObj) return { ok: false, erro: "Motivo de perda obrigatório" };
      setCards(prev => prev.map(c => c.id === cardId ? {
        ...c,
        colunaId: destino.id,
        status: "perdido",
        motivoPerda: perdaObj.motivo,
        motivoPerdaTexto: perdaObj.explicacao,
        perda: perdaObj,
        marketingStatus: "ativo" as MarketingStatus,
        entradaColunaEm: new Date().toISOString(),
        historico: [...c.historico, { at: new Date().toISOString(), msg: `Marcado como perdido: ${perdaObj.motivo}${perdaObj.subMotivo ? ` → ${perdaObj.subMotivo}` : ""}` }],
      } : c));
      return { ok: true };
    }

    const origem = colunas.find(c => c.id === card.colunaId);
    if (origem?.key && destino.key && ordemFluxo.includes(origem.key) && ordemFluxo.includes(destino.key)) {
      const iO = ordemFluxo.indexOf(origem.key);
      const iD = ordemFluxo.indexOf(destino.key);
      const diff = iD - iO;
      if (Math.abs(diff) > 1) {
        const carteiraPulaCad = card.tag === "carteira" && origem.key === "atendimento" && destino.key === "qualificacao";
        if (!carteiraPulaCad) return { ok: false, erro: "Só é permitido mover 1 etapa por vez" };
      }
    }

    setCards(prev => prev.map(c => c.id === cardId ? { ...c, colunaId: destino.id, status: "ativo", entradaColunaEm: new Date().toISOString(), historico: [...c.historico, { at: new Date().toISOString(), msg: `Movido para ${destino.label}` }] } : c));
    return { ok: true };
  };

  // ---- Detecção de duplicidade ----
  function detectarConflito(card: CardAC, novoCnpj?: string, novoTelefone?: string): { vendedorDonoId: string; vendedorDonoNome: string; motivo: string } | null {
    const cnpj = normCNPJ(novoCnpj || card.cadastro.cnpj);
    const tel = digits(novoTelefone || card.telefone);
    if (!cnpj && !tel) return null;

    // 1) Bater com clientes 360 (dono da conta = representante)
    if (cnpj) {
      const cli = mockClientes360.find(x => normCNPJ(x.documento) === cnpj && !!cnpj);
      if (cli && cli.representante && cli.representante !== vendedores.find(v => v.id === card.vendedorId)?.nome) {
        // achar vendedor pelo nome (aproximado)
        const dono = vendedores.find(v => cli.representante?.toLowerCase().includes(v.nome.toLowerCase().split(" ")[0]));
        if (dono && dono.id !== card.vendedorId) {
          return { vendedorDonoId: dono.id, vendedorDonoNome: dono.nome, motivo: `CNPJ já pertence a ${cli.nomeFantasia} (dono ${dono.nome})` };
        }
      }
    }

    // 2) Bater com outros cards
    const outro = cards.find(c => {
      if (c.id === card.id) return false;
      if (c.status === "perdido") return false;
      const cCnpj = normCNPJ(c.cadastro.cnpj);
      const cTel = digits(c.telefone);
      const matchCnpj = cnpj && cCnpj && cCnpj === cnpj;
      const matchTel = tel && cTel && (cTel === tel || cTel.endsWith(tel) || tel.endsWith(cTel));
      return (matchCnpj || matchTel) && c.vendedorId !== card.vendedorId;
    });
    if (outro) return { vendedorDonoId: outro.vendedorId, vendedorDonoNome: outro.vendedorNome, motivo: `${cnpj ? "CNPJ" : "Telefone"} já em atendimento por ${outro.vendedorNome}` };
    return null;
  }

  function abrirConflito(card: CardAC, detalhe: { vendedorDonoId: string; vendedorDonoNome: string; motivo: string }) {
    // já existe conflito pendente para esse card?
    if (conflitos.find(cf => cf.cardId === card.id && cf.status === "pendente")) return;
    const cf: ConflitoLead = {
      id: `cf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      cardId: card.id,
      nomeLead: card.nome,
      telefone: card.telefone,
      cnpj: card.cadastro.cnpj,
      vendedorDonoId: detalhe.vendedorDonoId,
      vendedorDonoNome: detalhe.vendedorDonoNome,
      vendedorNovoId: card.vendedorId,
      vendedorNovoNome: card.vendedorNome,
      motivo: detalhe.motivo,
      criadoEm: new Date().toISOString(),
      status: "pendente",
    };
    setConflitos(prev => [cf, ...prev]);
    notif.push({
      tipo: "conflito_novo",
      titulo: `Conflito de lead — ${card.nome}`,
      msg: detalhe.motivo,
      cardId: card.id,
      vendedorId: card.vendedorId,
    });
    setCards(prev => prev.map(c => c.id === card.id ? {
      ...c,
      status: "conflito",
      emConflitoCom: detalhe.vendedorDonoId,
      historico: [...c.historico, { at: new Date().toISOString(), msg: `⚠ Conflito: ${detalhe.motivo}` }],
    } : c));
  }

  const atualizarCadastro: Ctx["atualizarCadastro"] = (cardId, patch) => {
    setCards(prev => prev.map(c => {
      if (c.id !== cardId) return c;
      const novoCadastro = { ...c.cadastro, ...patch };
      const camposObrig: (keyof CardAC["cadastro"])[] = ["nome", "cnpj", "cidade", "email"];
      const completo = camposObrig.every(k => !!novoCadastro[k]);
      const preenchidos = Object.values(novoCadastro).filter(Boolean).length;
      let colunaId = c.colunaId;
      let entrada = c.entradaColunaEm;

      // conflito trava auto-avanço
      if (c.status === "conflito") {
        return { ...c, cadastro: novoCadastro };
      }

      const colCad = colunas.find(x => x.key === "cadastro");
      const colQual = colunas.find(x => x.key === "qualificacao");
      const colAtend = colunas.find(x => x.key === "atendimento");
      if (colCad && colAtend && c.colunaId === colAtend.id && preenchidos === 1) {
        colunaId = colCad.id; entrada = new Date().toISOString();
      }
      if (completo && colQual && c.colunaId !== colQual.id) {
        colunaId = colQual.id; entrada = new Date().toISOString();
      }
      return { ...c, cadastro: novoCadastro, colunaId, entradaColunaEm: entrada };
    }));

    // Detectar conflito ao salvar CNPJ
    if (patch.cnpj) {
      setTimeout(() => {
        const card = (loadCardsAC as any).__lastSet as CardAC[] | undefined;
        // usa o state atualizado
        const c = cardsRef.current.find(x => x.id === cardId);
        if (!c) return;
        const conflitoDet = detectarConflito(c, patch.cnpj);
        if (conflitoDet) abrirConflito(c, conflitoDet);
      }, 0);
    }
  };

  const atualizarQualificacao: Ctx["atualizarQualificacao"] = (cardId, patch) => {
    setCards(prev => prev.map(c => {
      if (c.id !== cardId) return c;
      const novaQual = { ...c.qualificacao, ...patch };
      let colunaId = c.colunaId;
      let entrada = c.entradaColunaEm;
      let hist = c.historico;

      if (c.status !== "conflito") {
        // Auto-avanço da tag `carteira`: 1ª resposta de qualquer campo tira de "Em Atendimento" → "Em Qualificação"
        const colAtend = colunas.find(x => x.key === "atendimento");
        const colQual = colunas.find(x => x.key === "qualificacao");
        const qtdAntes = Object.values(c.qualificacao).filter(Boolean).length;
        const qtdDepois = Object.values(novaQual).filter(Boolean).length;
        if (c.tag === "carteira" && colAtend && colQual && c.colunaId === colAtend.id && qtdAntes === 0 && qtdDepois >= 1) {
          colunaId = colQual.id;
          entrada = new Date().toISOString();
          hist = [...hist, { at: entrada, msg: "Carteira: 1ª qualificação respondida — movido para Em Qualificação" }];
        }
      }
      return { ...c, qualificacao: novaQual, colunaId, entradaColunaEm: entrada, historico: hist };
    }));
  };

  const marcarPerda: Ctx["marcarPerda"] = (cardId, perda) => {
    const colPerd = colunas.find(c => c.key === "perdido");
    if (!colPerd) return;
    moverCard(cardId, colPerd.id, { perda });
  };

  const moverParaRenutricao: Ctx["moverParaRenutricao"] = (cardId, campanha) => {
    setCards(prev => prev.map(c => c.id === cardId ? {
      ...c,
      marketingStatus: "renutricao" as MarketingStatus,
      campanhaRenutricao: campanha,
      historico: [...c.historico, { at: new Date().toISOString(), msg: `Movido para renutrição: ${campanha.nome}` }],
    } : c));
    toast({ title: "Card enviado para renutrição", description: campanha.nome });
  };

  const arquivarCard: Ctx["arquivarCard"] = (cardId) => {
    setCards(prev => prev.map(c => c.id === cardId ? {
      ...c,
      marketingStatus: "arquivado" as MarketingStatus,
      campanhaRenutricao: undefined,
      historico: [...c.historico, { at: new Date().toISOString(), msg: "Arquivado pelo marketing" }],
    } : c));
    toast({ title: "Card arquivado" });
  };

  const reativarMarketing: Ctx["reativarMarketing"] = (cardId) => {
    setCards(prev => prev.map(c => c.id === cardId ? {
      ...c,
      marketingStatus: "ativo" as MarketingStatus,
      campanhaRenutricao: undefined,
      historico: [...c.historico, { at: new Date().toISOString(), msg: "Reativado no marketing (removido de renutrição/arquivo)" }],
    } : c));
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
    setCards(prev => prev.map(c => {
      if (c.id !== cardId) return c;
      const eraRenutricao = c.marketingStatus === "renutricao";
      return {
        ...c,
        colunaId: colFila.id,
        status: "ativo",
        marketingStatus: "ativo" as MarketingStatus,
        campanhaRenutricao: undefined,
        entradaColunaEm: new Date().toISOString(),
        historico: [
          ...c.historico,
          { at: new Date().toISOString(), msg: `Card reaberto na Fila${c.perda ? ` (perda anterior: ${c.perda.motivo})` : c.motivoPerda ? ` (perda anterior: ${c.motivoPerda})` : ""}${eraRenutricao ? " — removido da renutrição" : ""}` },
        ],
      };
    }));
    notif.push({
      tipo: "card_reaberto",
      titulo: "Card reaberto",
      msg: `Voltou à Fila de Atendimento`,
      cardId,
    });
  };

  const criarLead: Ctx["criarLead"] = (input) => {
    const colLeads = colunas.find(c => c.key === "leads")!;
    let vendedorId = input.vendedorId;
    if (!vendedorId) {
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
      ultimaMensagem: input.tag === "carteira" ? "Cliente da carteira iniciou conversa" : "Lead cadastrado",
      ultimaInteracao: now,
      chegouEm: now,
      entradaColunaEm: now,
      naoLidas: 0,
      conversaId: input.conversaId,
      clienteId: input.clienteId,
      cadastro: { nome: input.nome },
      qualificacao: {},
      status: "ativo",
      historico: [{ at: now, msg: `Lead criado — origem: ${input.origem}` }],
    };
    setCards(prev => [novo, ...prev]);

    // Detectar conflito por telefone
    setTimeout(() => {
      const c = cardsRef.current.find(x => x.id === novo.id);
      if (c) {
        const det = detectarConflito(c);
        if (det) abrirConflito(c, det);
      }
    }, 0);

    notif.push({
      tipo: "lead_distribuido",
      titulo: `Novo lead — ${input.nome}`,
      msg: `Origem: ${input.origem} · atribuído a ${vend.nome}`,
      cardId: novo.id,
      conversaId: input.conversaId,
      vendedorId: vend.id,
    });
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

  // ---- Ref para acessar o estado mais recente dentro de setTimeouts ----
  const cardsRef = useRef<CardAC[]>(cards);
  useEffect(() => { cardsRef.current = cards; }, [cards]);

  // ---- Eventos de conversa (Fase 7.1) ----
  const registrarEventoConversa: Ctx["registrarEventoConversa"] = useCallback((ev) => {
    if (ev.tipo === "primeira_resposta_vendedor") {
      const card = cardsRef.current.find(c => conversaIdDoCard(c) === ev.conversaId);
      if (!card || card.status === "conflito") return;
      const col = colunas.find(x => x.id === card.colunaId);
      const colAtend = colunas.find(x => x.key === "atendimento");
      if ((col?.key === "leads" || col?.key === "fila") && colAtend) {
        setCards(prev => prev.map(c => c.id === card.id ? {
          ...c,
          colunaId: colAtend.id,
          entradaColunaEm: new Date().toISOString(),
          historico: [...c.historico, { at: new Date().toISOString(), msg: "Primeira resposta enviada — movido para Em Atendimento" }],
        } : c));
      }
      return;
    }

    if (ev.tipo === "mensagem_recebida") {
      const card = cardsRef.current.find(c => conversaIdDoCard(c) === ev.conversaId);
      // Card perdido → reabrir
      if (card && card.status === "perdido") {
        reabrirCard(card.id);
        return;
      }
      if (card) {
        // atualizar não lidas + última mensagem
        setCards(prev => prev.map(c => c.id === card.id ? {
          ...c,
          naoLidas: c.naoLidas + 1,
          ultimaInteracao: new Date().toISOString(),
          ultimaMensagem: ev.texto ?? c.ultimaMensagem,
        } : c));
        return;
      }
      // Sem card — decidir tag e criar
      const cli = ev.telefone ? mockClientes360.find(x => {
        const d = digits(x.whatsapp || x.telefone);
        const t = digits(ev.telefone);
        return d && t && (d === t || d.endsWith(t) || t.endsWith(d));
      }) : undefined;
      const dono = cli ? vendedores.find(v => cli.representante?.toLowerCase().includes(v.nome.toLowerCase().split(" ")[0])) : undefined;
      const tag: CardAC["tag"] = cli
        ? (cli.status === "inativo" || cli.status === "reativacao" || cli.status === "em_risco" ? "reativacao" : "carteira")
        : "lead";
      criarLead({
        nome: ev.nome || cli?.nomeFantasia || `Contato ${ev.telefone ?? "novo"}`,
        telefone: ev.telefone || "",
        origem: cli ? "whats_direto" : "whats_direto",
        vendedorId: dono?.id ?? MEU_VENDEDOR_ID,
        tag,
        conversaId: ev.conversaId,
        clienteId: cli?.id,
      });
    }
  }, [colunas, vendedores]);

  // ---- Resolver conflito (Fase 7.2) ----
  const resolverConflito: Ctx["resolverConflito"] = (conflitoId, decisao) => {
    const cf = conflitos.find(c => c.id === conflitoId);
    if (!cf) return;
    setConflitos(prev => prev.map(c => c.id === conflitoId ? { ...c, status: decisao === "manter_dono" ? "resolvido_dono" : "resolvido_novo", decidoEm: new Date().toISOString(), decidoPor: "gestor" } : c));
    setCards(prev => prev.map(c => {
      if (c.id !== cf.cardId) return c;
      const novoVendId = decisao === "manter_dono" ? cf.vendedorDonoId : cf.vendedorNovoId;
      const novoVend = vendedores.find(v => v.id === novoVendId);
      return {
        ...c,
        status: "ativo",
        emConflitoCom: undefined,
        vendedorId: novoVend?.id ?? c.vendedorId,
        vendedorNome: novoVend?.nome ?? c.vendedorNome,
        historico: [...c.historico, { at: new Date().toISOString(), msg: `Conflito resolvido: ${decisao === "manter_dono" ? "mantido com dono da conta" : "liberado para o novo vendedor"} (${novoVend?.nome ?? "?"})` }],
      };
    }));
    notif.push({
      tipo: "conflito_resolvido",
      titulo: `Conflito resolvido — ${cf.nomeLead}`,
      msg: decisao === "manter_dono" ? `Mantido com ${cf.vendedorDonoNome}` : `Liberado para ${cf.vendedorNovoNome}`,
      cardId: cf.cardId,
      vendedorId: decisao === "manter_dono" ? cf.vendedorDonoId : cf.vendedorNovoId,
    });
    toast({ title: "Conflito resolvido" });
  };

  // ---- Envio de mensagem pelo Marketing no WhatsApp Central ----
  const enviarMensagemMarketing: Ctx["enviarMensagemMarketing"] = (id, texto) => {
    const t = texto.trim();
    if (!t) return;
    const at = new Date().toISOString();
    // inbox (conversa não distribuída)
    const conv = inbox.find(c => c.id === id);
    if (conv) {
      setInbox(prev => prev.map(c => c.id === id ? {
        ...c,
        ultimaMensagem: t,
        mensagens: [...(c.mensagens || []), { at, from: "central", msg: t }],
      } : c));
      return;
    }
    // card distribuído
    setCards(prev => prev.map(c => c.id === id ? {
      ...c,
      ultimaMensagem: t,
      ultimaInteracao: at,
      mensagensCentral: [...((c as any).mensagensCentral || []), { at, from: "central", msg: t }],
      historico: [...c.historico, { at, msg: `Marketing enviou: ${t}` }],
    } as CardAC : c));
    toast({ title: "Mensagem enviada", description: "Vendedor será notificado no CRM." });
  };

  // ---- Varredura periódica de SLA / estagnação (Fase 7.3) ----
  const slaSentRef = useRef<Set<string>>(new Set());
  const estagSentRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const tick = () => {
      cardsRef.current.forEach(c => {
        if (c.status !== "ativo") return;
        if (slaEstourado(c) && !slaSentRef.current.has(c.id)) {
          slaSentRef.current.add(c.id);
          notif.push({
            tipo: "sla_estourado",
            titulo: `SLA estourado — ${c.nome}`,
            msg: `Aguardando 1ª resposta há mais de ${config.slaHoras}h`,
            cardId: c.id,
            conversaId: c.conversaId,
            vendedorId: c.vendedorId,
          });
        }
        if (estagnado(c) && !estagSentRef.current.has(c.id)) {
          estagSentRef.current.add(c.id);
          notif.push({
            tipo: "estagnacao",
            titulo: `Card parado — ${c.nome}`,
            msg: `${diasParado(c)} dias em Em Atendimento`,
            cardId: c.id,
            conversaId: c.conversaId,
            vendedorId: c.vendedorId,
          });
        }
      });
    };
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, [slaEstourado, estagnado, diasParado, config.slaHoras, notif]);

  const value: Ctx = useMemo(() => ({
    cards, colunas, config, inbox, vendedores, conflitos,
    cardsPorColuna, colunaByKey, slaEstourado, diasParado, estagnado,
    cardDaConversa, conversaDoCard, cardByTelefone,
    moverCard, atualizarCadastro, atualizarQualificacao, marcarPerda, moverParaRenutricao, arquivarCard, reativarMarketing, gerarOportunidade, reabrirCard, criarLead,
    setColunas, setConfig,
    distribuirManual, distribuirRodizio, redistribuirCard,
    setVendedores, togglePausaVendedor,
    registrarEventoConversa, resolverConflito,
  }), [cards, colunas, config, inbox, vendedores, conflitos, cardsPorColuna, colunaByKey, slaEstourado, diasParado, estagnado, cardDaConversa, conversaDoCard, cardByTelefone, registrarEventoConversa]);

  return <AtendimentoComercialContext.Provider value={value}>{children}</AtendimentoComercialContext.Provider>;
}
