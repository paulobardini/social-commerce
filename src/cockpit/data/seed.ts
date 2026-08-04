// Seed determinístico para o Cockpit Comercial Nextil
// Inclui região por rep, KPIs individuais com DESVIO REALISTA (nunca idênticos)
// e orçamentos pendentes cobrindo os 3 motivos de aprovação.

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Nicho = "Infantil" | "Adulto" | "Fitness" | "Moda Praia" | "Casual" | "Multimarcas";
export type Etapa = "novo_lead" | "em_negociacao" | "proposta_enviada" | "orcamento_aprovado" | "ganha" | "perdida";
export type TipoAtendimento = "visita" | "ligacao" | "whatsapp";
export type TipoMeta = "faturamento" | "positivacao" | "cobertura" | "novos" | "reativacao";
export type MotivoAprovacao = "fora_da_politica" | "credito_cliente_novo" | "aguardando_estoque";
export type FormaPagamento = "boleto" | "cartao" | "pix" | "faturado";
export type Estacao = "Verão" | "Inverno" | "Meia-estação" | "Contínuo";
export type OrigemCliente = "inbound" | "outbound";
export type MotivoDevolucao =
  | "Defeito de fabricação" | "Grade errada" | "Produto divergente"
  | "Atraso na entrega" | "Arrependimento do lojista" | "Avaria no transporte";
export type MotivoInativacao =
  | "Preço/margem" | "Trocou de fornecedor" | "Loja fechou" | "Crédito bloqueado"
  | "Mix não atende" | "Falta de contato do rep" | "Problema de entrega";

export interface Representante {
  id: string; nome: string; email: string; regiao: string;
  // dados de desempenho (mock realista, com desvio entre reps)
  pace: number;             // % da meta projetada (100 = no ritmo)
  cobertura: number;        // % de contas atendidas no mês
  coberturaDelta: number;   // pp vs mês anterior
  ultimoAcessoDias: number; // dias desde o último acesso ao sistema
  historicoMedio12m: number;// faturamento médio mensal 12m (R$)
}
export interface Marca { id: string; nome: string; categorias: string[]; }
/** Cadastro de produto — fonte única de custo, peso e classificação comercial. */
export interface Produto {
  id: string;
  nome: string;
  marcaId: string;
  categoria: string;
  estacao: Estacao;
  precoTabela: number;   // R$ por peça
  custo: number;         // R$ por peça (custo de aquisição) — 0 = sem custo cadastrado
  pesoKg: number;        // peso por peça
}
export interface Conta {
  id: string; razao: string; nicho: Nicho; cidade: string; uf: string; repId: string; criadoEm: Date;
  origem: OrigemCliente;
  motivoEscolha: string;
  motivoInativacao?: MotivoInativacao;
}
export interface Pedido {
  id: string; contaId: string; repId: string; data: Date; valor: number; itens: number;
  marcaId: string; categoria: string; colecao: string; produtoId: string;
  custo: number;                 // custo total do pedido (peças × custo unitário)
  pesoKg: number;                // peso total do pedido
  desconto: number;              // % de desconto concedido
  formaPagamento: FormaPagamento;
  prazoDias: number;             // prazo médio de pagamento em dias
  estacao: Estacao;
}
export interface Atendimento { id: string; contaId: string; repId: string; data: Date; tipo: TipoAtendimento; resultado: "convertido" | "follow_up" | "sem_interesse"; leadOuCliente: "lead" | "cliente"; }
export interface Oportunidade {
  id: string; contaId: string; repId: string; etapa: Etapa; valor: number; abertaEm: Date; ultimaMov: Date;
  motivoPerda?: string;
  /** dias parados em cada etapa já percorrida (só etapas concluídas + a atual) */
  temposEtapa: { etapa: Etapa; dias: number }[];
}
export interface Devolucao {
  id: string; ticketId: string; contaId: string; repId: string; marcaId: string;
  data: Date; valor: number; pecas: number; motivo: MotivoDevolucao;
}
export interface Meta { repId: string | "consolidada"; tipo: TipoMeta; valor: number; mes: string; }
export interface OrcamentoPendente {
  id: string;
  contaId: string;
  repId: string;
  valor: number;
  desconto: number;       // %
  minimoAtingido: boolean;
  abertoDias: number;
  motivo: MotivoAprovacao;
  detalhe: string;        // resumo humano
}

export interface Seed {
  representantes: Representante[];
  marcas: Marca[];
  produtos: Produto[];
  contas: Conta[];
  pedidos: Pedido[];
  atendimentos: Atendimento[];
  oportunidades: Oportunidade[];
  devolucoes: Devolucao[];
  metas: Meta[];
  orcamentosPendentes: OrcamentoPendente[];
  hoje: Date;
}


const REPS: Representante[] = [
  { id: "r1", nome: "André Lima",      email: "andre@nextil.com.br",     regiao: "Sudeste",     pace: 112, cobertura: 78, coberturaDelta:  4, ultimoAcessoDias: 0, historicoMedio12m: 138000 },
  { id: "r2", nome: "Alexandre Souza", email: "alexandre@nextil.com.br", regiao: "Sul",         pace:  94, cobertura: 68, coberturaDelta: -3, ultimoAcessoDias: 1, historicoMedio12m: 112000 },
  { id: "r3", nome: "Carla Mendes",    email: "carla@nextil.com.br",     regiao: "Sudeste",     pace: 103, cobertura: 82, coberturaDelta:  6, ultimoAcessoDias: 0, historicoMedio12m: 154000 },
  { id: "r4", nome: "Daniel Rocha",    email: "daniel@nextil.com.br",     regiao: "Nordeste",    pace:  76, cobertura: 54, coberturaDelta:-11, ultimoAcessoDias: 3, historicoMedio12m:  92000 },
  { id: "r5", nome: "Giovanna Pires",  email: "giovanna@nextil.com.br",  regiao: "Sul",         pace:  58, cobertura: 41, coberturaDelta:-14, ultimoAcessoDias: 9, historicoMedio12m:  78000 },
  { id: "r6", nome: "Sérgio Tavares",  email: "sergio@nextil.com.br",    regiao: "Centro-Oeste",pace:  41, cobertura: 33, coberturaDelta:-18, ultimoAcessoDias:12, historicoMedio12m:  62000 },
];

const MARCAS: Marca[] = [
  { id: "m1", nome: "Brandili",     categorias: ["Infantil", "Bebê", "Pijama"] },
  { id: "m2", nome: "Hering",       categorias: ["Básicos", "Camiseta", "Polo"] },
  { id: "m3", nome: "Malwee",       categorias: ["Infantil", "Casual", "Inverno"] },
  { id: "m4", nome: "Lupo",         categorias: ["Lingerie", "Meias", "Esportivo"] },
  { id: "m5", nome: "Cia Marítima", categorias: ["Praia", "Beachwear", "Resort"] },
  { id: "m6", nome: "Colcci",       categorias: ["Jeans", "Casual", "Festa"] },
  { id: "m7", nome: "Rovitex",      categorias: ["Plus Size", "Feminino", "Básicos"] },
  { id: "m8", nome: "Lez a Lez",    categorias: ["Casual", "Festa", "Acessórios"] },
  { id: "m9", nome: "Animale",      categorias: ["Festa", "Premium", "Acessórios"] },
];
const COLECOES = ["Verão 25", "Inverno 25", "Resort 25", "Básicos"];
const NICHOS: Nicho[] = ["Infantil", "Adulto", "Fitness", "Moda Praia", "Casual", "Multimarcas"];
// Nicho forte por marca — enviesa a geração para dar contraste real ao heatmap Marca × Nicho.
const MARCA_NICHO_FORTE: Record<string, Nicho[]> = {
  m1: ["Infantil"],
  m2: ["Adulto", "Casual"],
  m3: ["Infantil", "Casual"],
  m4: ["Fitness"],
  m5: ["Moda Praia"],
  m6: ["Casual", "Adulto"],
  m7: ["Adulto", "Multimarcas"],
  m8: ["Casual", "Adulto"],
  m9: ["Adulto"],
};
const CIDADES = [
  ["São Paulo", "SP"], ["Rio de Janeiro", "RJ"], ["Belo Horizonte", "MG"], ["Curitiba", "PR"],
  ["Porto Alegre", "RS"], ["Florianópolis", "SC"], ["Salvador", "BA"], ["Recife", "PE"],
  ["Fortaleza", "CE"], ["Goiânia", "GO"], ["Brasília", "DF"], ["Vitória", "ES"],
  ["Campinas", "SP"], ["Joinville", "SC"], ["Blumenau", "SC"],
];
const NOMES_FANTASIA = [
  "Boutique", "Modas", "Store", "Atacado", "Multimarcas", "Fashion", "Concept", "Outlet",
  "Casa", "Espaço", "Galeria", "Loja", "Mega", "Premium", "Elite",
];
const SOBRENOMES = [
  "Bella", "Charme", "Vogue", "Élite", "Estilo", "Tropical", "Sul", "Nordeste", "Centro",
  "Atlântico", "Cristal", "Aurora", "Império", "Diamante", "Rosa", "Plus", "Kids",
  "Família", "Luxo", "Fina", "Moderna", "Clássica",
];
const MOTIVOS_PERDA = ["Preço", "Prazo de entrega", "Mix incompleto", "Concorrente", "Sem retorno"];
const ESTACOES: Estacao[] = ["Verão", "Inverno", "Meia-estação", "Contínuo"];
const MOTIVOS_ESCOLHA = [
  "Indicação de outro lojista", "Prazo de entrega", "Preço e condição de pagamento",
  "Exclusividade da marca na região", "Mix completo em um só pedido", "Relacionamento com o representante",
];
const MOTIVOS_INATIVACAO: MotivoInativacao[] = [
  "Preço/margem", "Trocou de fornecedor", "Loja fechou", "Crédito bloqueado",
  "Mix não atende", "Falta de contato do rep", "Problema de entrega",
];
const MOTIVOS_DEVOLUCAO: MotivoDevolucao[] = [
  "Defeito de fabricação", "Grade errada", "Produto divergente",
  "Atraso na entrega", "Arrependimento do lojista", "Avaria no transporte",
];
const FORMAS: FormaPagamento[] = ["boleto", "cartao", "pix", "faturado"];
// peso relativo de cada forma de pagamento no mix (soma 1)
const MIX_PAGAMENTO: [FormaPagamento, number][] = [["boleto", 0.46], ["faturado", 0.24], ["cartao", 0.21], ["pix", 0.09]];
const PRAZO_POR_FORMA: Record<FormaPagamento, [number, number]> = {
  pix: [0, 0], cartao: [28, 32], boleto: [28, 60], faturado: [45, 90],
};

let _cache: Seed | null = null;

export function buildSeed(): Seed {
  if (_cache) return _cache;
  const rng = mulberry32(42);
  const hoje = new Date();
  const pick = <T,>(arr: T[]) => arr[Math.floor(rng() * arr.length)];
  const rand = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
  const daysAgo = (n: number) => { const d = new Date(hoje); d.setDate(d.getDate() - n); return d; };

  // ---------------------------------------------------------------
  // CADASTRO DE PRODUTOS — fonte única de custo, peso e estação.
  // 3% dos itens ficam propositalmente SEM custo cadastrado (custo = 0)
  // para o dashboard mostrar cobertura de custo em vez de margem falsa.
  // ---------------------------------------------------------------
  const produtos: Produto[] = [];
  const PRODUTOS_POR_MARCA = 8;
  MARCAS.forEach((m, mi) => {
    for (let i = 0; i < PRODUTOS_POR_MARCA; i++) {
      const categoria = m.categorias[i % m.categorias.length];
      const estacao = ESTACOES[(mi + i) % ESTACOES.length];
      const precoTabela = rand(38, 320);
      const margemAlvo = 0.24 + rng() * 0.30;         // 24% a 54% de margem bruta
      const semCusto = rng() < 0.03;
      produtos.push({
        id: `prod${mi * PRODUTOS_POR_MARCA + i + 1}`,
        nome: `${m.nome} ${categoria} ${String(i + 1).padStart(2, "0")}`,
        marcaId: m.id,
        categoria,
        estacao,
        precoTabela,
        custo: semCusto ? 0 : Math.round(precoTabela * (1 - margemAlvo) * 100) / 100,
        pesoKg: Math.round((0.12 + rng() * 0.55) * 1000) / 1000,
      });
    }
  });
  const produtosPorMarca = new Map<string, Produto[]>();
  produtos.forEach(p => {
    const arr = produtosPorMarca.get(p.marcaId) ?? [];
    arr.push(p);
    produtosPorMarca.set(p.marcaId, arr);
  });

  const contas: Conta[] = [];
  const NUM = 900;
  for (let i = 0; i < NUM; i++) {
    const fantasia = pick(NOMES_FANTASIA);
    const sobre = pick(SOBRENOMES);
    const cidade = pick(CIDADES);
    contas.push({
      id: `c${i + 1}`,
      razao: `${fantasia} ${sobre} ${i + 1}`,
      nicho: pick(NICHOS),
      cidade: cidade[0], uf: cidade[1],
      repId: REPS[i % REPS.length].id,
      criadoEm: daysAgo(rand(30, 700)),
      // ~38% da base entrou por inbound (marketing/indicação), o resto por prospecção
      origem: rng() < 0.38 ? "inbound" : "outbound",
      motivoEscolha: pick(MOTIVOS_ESCOLHA),
    });
  }

  const pedidos: Pedido[] = [];
  let pidx = 0;
  const buckets: { count: number; min: number; max: number }[] = [
    { count: Math.floor(NUM * 0.30), min: 0,   max: 30  },
    { count: Math.floor(NUM * 0.20), min: 31,  max: 60  },
    { count: Math.floor(NUM * 0.30), min: 61,  max: 180 },
    { count: Math.floor(NUM * 0.15), min: 181, max: 365 },
  ];
  const sortearForma = (): FormaPagamento => {
    const r = rng();
    let acc = 0;
    for (const [f, w] of MIX_PAGAMENTO) { acc += w; if (r <= acc) return f; }
    return "boleto";
  };
  let cursor = 0;
  for (const b of buckets) {
    for (let i = 0; i < b.count; i++) {
      const conta = contas[cursor++];
      if (!conta) break;
      const ancora = rand(b.min, b.max);
      const nPedidos = rand(4, 22);
      for (let p = 0; p < nPedidos; p++) {
        const dias = p === 0 ? ancora : ancora + rand(15, 350);
        if (dias > 730) continue;
        // 70% dos pedidos vêm de uma marca cujo nicho forte bate com o nicho do cliente.
        const marcasCompativeis = MARCAS.filter(mm => (MARCA_NICHO_FORTE[mm.id] ?? []).includes(conta.nicho));
        const marca = (rng() < 0.7 && marcasCompativeis.length > 0) ? pick(marcasCompativeis) : pick(MARCAS);
        const produto = pick(produtosPorMarca.get(marca.id) ?? produtos);
        const itens = rand(5, 80);
        const desconto = rng() < 0.55 ? 0 : Math.round(rng() * 22);
        const valor = Math.max(
          400,
          Math.round(itens * produto.precoTabela * (1 - desconto / 100) * (0.85 + rng() * 0.4)),
        );
        const forma = sortearForma();
        const [pmin, pmax] = PRAZO_POR_FORMA[forma];
        pedidos.push({
          id: `p${++pidx}`,
          contaId: conta.id,
          repId: conta.repId,
          data: daysAgo(dias),
          valor,
          itens,
          marcaId: marca.id,
          categoria: produto.categoria,
          colecao: pick(COLECOES),
          produtoId: produto.id,
          custo: Math.round(itens * produto.custo),
          pesoKg: Math.round(itens * produto.pesoKg * 100) / 100,
          desconto,
          formaPagamento: forma,
          prazoDias: pmin === pmax ? pmin : rand(pmin, pmax),
          estacao: produto.estacao,
        });
      }
    }
  }

  // Motivo de inativação — só faz sentido para quem parou de comprar.
  const ultimaCompra = new Map<string, number>();
  pedidos.forEach(p => {
    const dias = Math.floor((hoje.getTime() - p.data.getTime()) / 86400000);
    const atual = ultimaCompra.get(p.contaId);
    if (atual === undefined || dias < atual) ultimaCompra.set(p.contaId, dias);
  });
  contas.forEach(c => {
    const rec = ultimaCompra.get(c.id);
    if (rec !== undefined && rec > 120) c.motivoInativacao = pick(MOTIVOS_INATIVACAO);
  });

  const atendimentos: Atendimento[] = [];
  for (let i = 0; i < 1600; i++) {
    const conta = contas[rand(0, NUM - 1)];
    const temPedido = pedidos.some(p => p.contaId === conta.id);
    atendimentos.push({
      id: `a${i + 1}`,
      contaId: conta.id,
      repId: conta.repId,
      data: daysAgo(rand(0, 180)),
      tipo: pick(["visita", "ligacao", "whatsapp"] as TipoAtendimento[]),
      resultado: pick(["convertido", "follow_up", "sem_interesse"] as const),
      leadOuCliente: temPedido ? "cliente" : "lead",
    });
  }

  const oportunidades: Oportunidade[] = [];
  const etapas: Etapa[] = ["novo_lead", "em_negociacao", "proposta_enviada", "orcamento_aprovado", "ganha", "perdida"];
  const ORDEM_FUNIL: Etapa[] = ["novo_lead", "em_negociacao", "proposta_enviada", "orcamento_aprovado"];
  // faixa de dias típica em cada etapa (mín/máx) — gera o gráfico de gargalo
  const DIAS_ETAPA: Record<string, [number, number]> = {
    novo_lead: [1, 6],
    em_negociacao: [3, 18],
    proposta_enviada: [4, 26],
    orcamento_aprovado: [1, 9],
  };
  const distEtapas = [48, 42, 34, 26, 30, 24];
  let oid = 0;
  etapas.forEach((etapa, idx) => {
    for (let i = 0; i < distEtapas[idx]; i++) {
      const conta = contas[rand(0, NUM - 1)];
      const aberta = daysAgo(rand(2, 120));
      const mov = etapa === "ganha" || etapa === "perdida" ? daysAgo(rand(0, 20)) : daysAgo(rand(0, 40));
      const fechada = etapa === "ganha" || etapa === "perdida";
      const ate = fechada ? ORDEM_FUNIL.length : ORDEM_FUNIL.indexOf(etapa) + 1;
      const temposEtapa = ORDEM_FUNIL.slice(0, Math.max(1, ate)).map(e => {
        const [a, b] = DIAS_ETAPA[e];
        return { etapa: e, dias: rand(a, b) };
      });
      oportunidades.push({
        id: `op${++oid}`,
        contaId: conta.id, repId: conta.repId,
        etapa, valor: rand(3000, 80000),
        abertaEm: aberta, ultimaMov: mov,
        motivoPerda: etapa === "perdida" ? pick(MOTIVOS_PERDA) : undefined,
        temposEtapa,
      });
    }
  });

  // ---------------------------------------------------------------
  // DEVOLUÇÕES — nascem no SAC (ticket de devolução/troca) e apontam
  // para o pedido de origem. ~1,4% dos pedidos geram devolução.
  // ---------------------------------------------------------------
  const devolucoes: Devolucao[] = [];
  let did = 0;
  pedidos.forEach(p => {
    if (rng() > 0.014) return;
    const parcial = 0.15 + rng() * 0.6;    // devolve parte do pedido
    devolucoes.push({
      id: `dev${++did}`,
      ticketId: `sac-dev-${String(did).padStart(4, "0")}`,
      contaId: p.contaId,
      repId: p.repId,
      marcaId: p.marcaId,
      data: new Date(Math.min(hoje.getTime(), p.data.getTime() + rand(4, 30) * 86400000)),
      valor: Math.round(p.valor * parcial),
      pecas: Math.max(1, Math.round(p.itens * parcial)),
      motivo: pick(MOTIVOS_DEVOLUCAO),
    });
  });


  // METAS — derivadas do realizado para gerar atingimentos PLAUSÍVEIS.
  // Espalhamento alvo por rep: alguns acima de 100 (105/110), a maioria entre
  // 75 e 100, e alguns bem abaixo (50/65). Nada de 300%.
  const metas: Meta[] = [];
  const tipos: TipoMeta[] = ["faturamento", "positivacao", "cobertura", "novos", "reativacao"];
  // fator = realizado / meta desejado (ex.: 1.10 => 110% de atingimento)
  const FATORES = [1.1, 1.05, 0.97, 0.88, 0.75, 1.02, 0.65, 0.5, 0.92, 0.8];
  const round = (v: number, step: number) => Math.max(step, Math.round(v / step) * step);

  for (let m = 5; m >= 0; m--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - m, 1);
    const mes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const fim = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const ehMesAtual = m === 0;
    // a meta é calibrada pelo realizado do próprio período (no mês corrente,
    // pelo acumulado até hoje) para que o atingimento exibido fique plausível
    const projetar = (v: number) => v;

    let totalFatMes = 0;
    let totalPosMes = 0;

    REPS.forEach((r, i) => {
      const pedidosMes = pedidos.filter(
        p => p.repId === r.id && p.data >= d && p.data <= (ehMesAtual ? hoje : fim)
      );
      const realFat = projetar(pedidosMes.reduce((s, p) => s + p.valor, 0));
      const realPos = projetar(new Set(pedidosMes.map(p => p.contaId)).size);
      const carteira = contas.filter(c => c.repId === r.id).length || 1;

      // fator distinto por rep e levemente variável por mês
      const fator = FATORES[(i + m) % FATORES.length];
      totalFatMes += realFat;
      totalPosMes += realPos;

      for (const t of tipos) {
        let valor: number;
        if (t === "faturamento") valor = round(realFat / fator, 1000);
        else if (t === "positivacao") valor = Math.max(3, Math.round(realPos / fator));
        else if (t === "cobertura") valor = Math.min(95, Math.max(25, Math.round(((realPos / carteira) * 100) / fator)));
        else valor = Math.max(2, Math.round(rand(4, 9) / fator));
        metas.push({ repId: r.id, tipo: t, valor, mes });
      }
    });

    // consolidada: atingimento ~ 96% (levemente abaixo do alvo)
    const fatorGeral = 0.96;
    for (const t of tipos) {
      const valor =
        t === "faturamento" ? round(totalFatMes / fatorGeral, 5000)
        : t === "positivacao" ? Math.max(10, Math.round(totalPosMes / fatorGeral))
        : t === "cobertura" ? rand(60, 80)
        : Math.max(6, Math.round(rand(20, 45) / fatorGeral));
      metas.push({ repId: "consolidada", tipo: t, valor, mes });
    }
  }


  // ORÇAMENTOS PENDENTES DE APROVAÇÃO — cobrindo os 3 motivos (fila realista ~50)
  const orcamentosPendentes: OrcamentoPendente[] = [
    { id: "orc-091", contaId: contas[3].id,  repId: "r1", valor: 14200, desconto: 35, minimoAtingido: false, abertoDias: 2, motivo: "fora_da_politica",     detalhe: "Desconto 35% sem mínimo atingido" },
    { id: "orc-104", contaId: contas[7].id,  repId: "r2", valor:  8900, desconto: 22, minimoAtingido: true,  abertoDias: 1, motivo: "fora_da_politica",     detalhe: "Desconto acima do teto (22%>18%)" },
    { id: "orc-118", contaId: contas[11].id, repId: "r3", valor: 32500, desconto: 15, minimoAtingido: true,  abertoDias: 4, motivo: "fora_da_politica",     detalhe: "Prazo pagamento 60/90/120 fora da política" },
    { id: "orc-122", contaId: contas[24].id, repId: "r4", valor:  6700, desconto:  8, minimoAtingido: true,  abertoDias: 2, motivo: "credito_cliente_novo", detalhe: "Cliente sem histórico — análise de crédito (janela 2d)" },
    { id: "orc-129", contaId: contas[41].id, repId: "r1", valor: 18400, desconto: 12, minimoAtingido: true,  abertoDias: 1, motivo: "credito_cliente_novo", detalhe: "Primeiro pedido — falta comprovante" },
    { id: "orc-133", contaId: contas[52].id, repId: "r3", valor: 21800, desconto:  0, minimoAtingido: true,  abertoDias: 3, motivo: "aguardando_estoque",   detalhe: "Grade 04-14 sem estoque · ETA marca 12/05" },
    { id: "orc-137", contaId: contas[68].id, repId: "r2", valor:  9250, desconto:  5, minimoAtingido: true,  abertoDias: 5, motivo: "aguardando_estoque",   detalhe: "Referência LZ-4412 sem previsão" },
  ];

  // Gera fila adicional para simular volume de análise comercial (~43 itens extras)
  const motivosPool: { motivo: OrcamentoPendente["motivo"]; detalhes: string[] }[] = [
    { motivo: "fora_da_politica", detalhes: [
      "Desconto acima do teto para categoria básicos",
      "Bonificação fora do padrão trimestral",
      "Prazo 45/75/105 sem aprovação de crédito",
      "Frete CIF fora da política para região",
      "Mix abaixo do mínimo com desconto pleno",
      "Desconto cumulativo com campanha ativa",
      "Preço fora do tabelado — cliente barganhou",
    ]},
    { motivo: "credito_cliente_novo", detalhes: [
      "Cliente sem histórico — falta CNPJ ativo há 12m",
      "Primeiro pedido — comprovante de endereço pendente",
      "Análise Serasa em andamento",
      "Cliente reativado após 24m — revisar limite",
      "Sócio com restrição — aguardando esclarecimento",
      "Loja física ainda não vistoriada",
    ]},
    { motivo: "aguardando_estoque", detalhes: [
      "Referência sem estoque — ETA 15 dias",
      "Grade incompleta (P e M zeradas)",
      "Coleção anterior — sem reposição prevista",
      "Cor específica sem previsão da fábrica",
      "Item promocional esgotado — sugerir alternativa",
    ]},
  ];
  let seqId = 138;
  for (let i = 0; i < 43; i++) {
    const bloco = pick(motivosPool);
    const conta = pick(contas);
    const rep = pick(REPS);
    const isPolitica = bloco.motivo === "fora_da_politica";
    const isEstoque = bloco.motivo === "aguardando_estoque";
    orcamentosPendentes.push({
      id: `orc-${seqId++}`,
      contaId: conta.id,
      repId: rep.id,
      valor: isPolitica ? rand(5000, 45000) : isEstoque ? rand(8000, 30000) : rand(4000, 22000),
      desconto: isPolitica ? rand(18, 38) : rand(0, 15),
      minimoAtingido: Math.random() > 0.35,
      abertoDias: rand(1, 6),
      motivo: bloco.motivo,
      detalhe: pick(bloco.detalhes),
    });
  }


  _cache = { representantes: REPS, marcas: MARCAS, produtos, contas, pedidos, atendimentos, oportunidades, devolucoes, metas, orcamentosPendentes, hoje };
  return _cache;
}
