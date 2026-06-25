// Seed determinístico para o Cockpit Comercial Nextil
// Gera ~120 contas, ~1500 pedidos, ~600 atendimentos, ~80 oportunidades, metas e marcas.

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Nicho = "Boutique" | "Multimarca" | "Atacadista" | "E-commerce" | "Rede" | "Franquia";
export type Etapa = "novo_lead" | "em_negociacao" | "proposta_enviada" | "orcamento_aprovado" | "ganha" | "perdida";
export type TipoAtendimento = "visita" | "ligacao" | "whatsapp";
export type TipoMeta = "faturamento" | "positivacao" | "cobertura" | "novos" | "reativacao";

export interface Representante { id: string; nome: string; email: string; }
export interface Marca { id: string; nome: string; categorias: string[]; }
export interface Conta { id: string; razao: string; nicho: Nicho; cidade: string; uf: string; repId: string; criadoEm: Date; }
export interface Pedido { id: string; contaId: string; repId: string; data: Date; valor: number; itens: number; marcaId: string; categoria: string; colecao: string; produtoId: string; }
export interface Atendimento { id: string; contaId: string; repId: string; data: Date; tipo: TipoAtendimento; resultado: "convertido" | "follow_up" | "sem_interesse"; leadOuCliente: "lead" | "cliente"; }
export interface Oportunidade { id: string; contaId: string; repId: string; etapa: Etapa; valor: number; abertaEm: Date; ultimaMov: Date; motivoPerda?: string; }
export interface Meta { repId: string | "consolidada"; tipo: TipoMeta; valor: number; mes: string; }

export interface Seed {
  representantes: Representante[];
  marcas: Marca[];
  contas: Conta[];
  pedidos: Pedido[];
  atendimentos: Atendimento[];
  oportunidades: Oportunidade[];
  metas: Meta[];
  hoje: Date;
}

const REPS: Representante[] = [
  { id: "r1", nome: "André Lima",      email: "andre@nextil.com.br" },
  { id: "r2", nome: "Alexandre Souza", email: "alexandre@nextil.com.br" },
  { id: "r3", nome: "Carla Mendes",    email: "carla@nextil.com.br" },
  { id: "r4", nome: "Daniel Rocha",    email: "daniel@nextil.com.br" },
  { id: "r5", nome: "Giovanna Pires",  email: "giovanna@nextil.com.br" },
  { id: "r6", nome: "Sérgio Tavares",  email: "sergio@nextil.com.br" },
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
const NICHOS: Nicho[] = ["Boutique", "Multimarca", "Atacadista", "E-commerce", "Rede", "Franquia"];
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

let _cache: Seed | null = null;

export function buildSeed(): Seed {
  if (_cache) return _cache;
  const rng = mulberry32(42);
  const hoje = new Date();
  const pick = <T,>(arr: T[]) => arr[Math.floor(rng() * arr.length)];
  const rand = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
  const daysAgo = (n: number) => { const d = new Date(hoje); d.setDate(d.getDate() - n); return d; };

  // Contas (120) — distribuição forçada por faixa de recência
  const contas: Conta[] = [];
  const NUM = 280;
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
    });
  }

  // Pedidos: forçar faixas
  // 30% ativo recente (0-30d), 20% ativo borda (31-60d), 30% inativo (61-180d), 15% perdido (181-365d), 5% lead (sem pedido)
  const pedidos: Pedido[] = [];
  let pidx = 0;
  const buckets: { count: number; min: number; max: number }[] = [
    { count: Math.floor(NUM * 0.30), min: 0,   max: 30  },
    { count: Math.floor(NUM * 0.20), min: 31,  max: 60  },
    { count: Math.floor(NUM * 0.30), min: 61,  max: 180 },
    { count: Math.floor(NUM * 0.15), min: 181, max: 365 },
  ];
  let cursor = 0;
  for (const b of buckets) {
    for (let i = 0; i < b.count; i++) {
      const conta = contas[cursor++];
      if (!conta) break;
      // Gera 1 pedido "âncora" dentro da faixa + 3-15 anteriores ao longo do ano
      const ancora = rand(b.min, b.max);
      const nPedidos = rand(4, 22);
      for (let p = 0; p < nPedidos; p++) {
        const dias = p === 0 ? ancora : ancora + rand(15, 350);
        if (dias > 730) continue;
        const marca = pick(MARCAS);
        pedidos.push({
          id: `p${++pidx}`,
          contaId: conta.id,
          repId: conta.repId,
          data: daysAgo(dias),
          valor: rand(800, 25000),
          itens: rand(5, 80),
          marcaId: marca.id,
          categoria: pick(marca.categorias),
          colecao: pick(COLECOES),
          produtoId: `prod${rand(1, 60)}`,
        });
      }
    }
  }
  // restantes 5% = leads (sem pedidos) — apenas pulamos

  // Atendimentos (~600)
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

  // Oportunidades (~80)
  const oportunidades: Oportunidade[] = [];
  const etapas: Etapa[] = ["novo_lead", "em_negociacao", "proposta_enviada", "orcamento_aprovado", "ganha", "perdida"];
  const distEtapas = [48, 42, 34, 26, 30, 24]; // total ~204
  let oid = 0;
  etapas.forEach((etapa, idx) => {
    for (let i = 0; i < distEtapas[idx]; i++) {
      const conta = contas[rand(0, NUM - 1)];
      const aberta = daysAgo(rand(2, 120));
      const mov = etapa === "ganha" || etapa === "perdida" ? daysAgo(rand(0, 20)) : daysAgo(rand(0, 40));
      oportunidades.push({
        id: `op${++oid}`,
        contaId: conta.id,
        repId: conta.repId,
        etapa,
        valor: rand(3000, 80000),
        abertaEm: aberta,
        ultimaMov: mov,
        motivoPerda: etapa === "perdida" ? pick(MOTIVOS_PERDA) : undefined,
      });
    }
  });

  // Metas — últimos 6 meses, por rep e consolidada, 5 tipos
  const metas: Meta[] = [];
  const tipos: TipoMeta[] = ["faturamento", "positivacao", "cobertura", "novos", "reativacao"];
  for (let m = 5; m >= 0; m--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - m, 1);
    const mes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    for (const r of REPS) {
      for (const t of tipos) {
        const base = t === "faturamento" ? rand(80000, 180000) : t === "positivacao" ? rand(10, 25) : t === "cobertura" ? rand(40, 80) : rand(3, 10);
        metas.push({ repId: r.id, tipo: t, valor: base, mes });
      }
    }
    for (const t of tipos) {
      const base = t === "faturamento" ? rand(600000, 1100000) : t === "positivacao" ? rand(50, 90) : t === "cobertura" ? rand(60, 90) : rand(20, 60);
      metas.push({ repId: "consolidada", tipo: t, valor: base, mes });
    }
  }

  _cache = { representantes: REPS, marcas: MARCAS, contas, pedidos, atendimentos, oportunidades, metas, hoje };
  return _cache;
}
