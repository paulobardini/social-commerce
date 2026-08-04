// Oferta & tracking de links — deriva "produtos mais oferecidos" a partir do
// envio de catálogos/links pelos representantes (mock determinístico por produtoId).
// Métricas: envios (links gerados) → aberturas (link clicado) → pedidos (converteu).
import type { Seed, Pedido } from "../data/seed";

export interface OfertaProduto {
  produtoId: string;
  produtoNome: string;
  marcaId: string;
  marcaNome: string;
  envios: number;      // quantas vezes o produto foi enviado em links/catálogos
  clientesAlvo: number; // clientes distintos que receberam
  aberturas: number;    // links abertos
  pedidos: number;      // pedidos gerados a partir da oferta
  receita: number;
  taxaAbertura: number; // %
  conversao: number;    // % pedidos / envios
}

// hash determinístico simples (mesmo produto = mesmos números entre renders)
function seedNum(str: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
const rnd = (str: string, salt: number, min: number, max: number) =>
  min + (seedNum(str, salt) % (max - min + 1));

export function ofertasPorProduto(seed: Seed, pedidos: Pedido[]): OfertaProduto[] {
  const marcaDoProduto = new Map<string, string>();
  const receitaPorProduto = new Map<string, number>();
  const pedidosPorProduto = new Map<string, number>();
  const clientesPorProduto = new Map<string, Set<string>>();

  pedidos.forEach(p => {
    marcaDoProduto.set(p.produtoId, p.marcaId);
    receitaPorProduto.set(p.produtoId, (receitaPorProduto.get(p.produtoId) ?? 0) + p.valor);
    pedidosPorProduto.set(p.produtoId, (pedidosPorProduto.get(p.produtoId) ?? 0) + 1);
    if (!clientesPorProduto.has(p.produtoId)) clientesPorProduto.set(p.produtoId, new Set());
    clientesPorProduto.get(p.produtoId)!.add(p.contaId);
  });

  // universo ofertado: produtos vendidos + produtos apenas oferecidos (sem pedido)
  const universo = new Set<string>(marcaDoProduto.keys());
  for (let i = 1; i <= 60; i++) universo.add(`prod${i}`);

  const marcas = seed.marcas;

  return [...universo].map(produtoId => {
    const marcaId = marcaDoProduto.get(produtoId) ?? marcas[seedNum(produtoId, 7) % marcas.length].id;
    const marcaNome = marcas.find(m => m.id === marcaId)?.nome ?? marcaId;
    const pedidosQtd = pedidosPorProduto.get(produtoId) ?? 0;
    const receita = receitaPorProduto.get(produtoId) ?? 0;

    // envios sempre >= pedidos: cada venda veio de uma oferta + ofertas sem retorno
    const extra = rnd(produtoId, 11, 4, 34);
    const envios = pedidosQtd + extra;
    const clientesAlvo = Math.max(
      clientesPorProduto.get(produtoId)?.size ?? 0,
      Math.round(envios * (0.55 + (rnd(produtoId, 23, 0, 30) / 100))),
    );
    const aberturas = Math.min(envios, Math.round(envios * (0.35 + rnd(produtoId, 31, 0, 50) / 100)));

    return {
      produtoId,
      produtoNome: produtoId.toUpperCase(),
      marcaId,
      marcaNome,
      envios,
      clientesAlvo,
      aberturas,
      pedidos: pedidosQtd,
      receita,
      taxaAbertura: envios ? (aberturas / envios) * 100 : 0,
      conversao: envios ? (pedidosQtd / envios) * 100 : 0,
    };
  }).sort((a, b) => b.envios - a.envios);
}

export interface OfertaResumo {
  totalEnvios: number;
  totalAberturas: number;
  totalPedidos: number;
  taxaAbertura: number;
  conversaoMedia: number;
  produtosOfertados: number;
  vitrine: OfertaProduto[];   // muito oferecido e converte bem
  desperdicio: OfertaProduto[]; // muito oferecido e não converte
  ocultos: OfertaProduto[];   // converte bem mas é pouco oferecido
}

export function resumoOfertas(lista: OfertaProduto[]): OfertaResumo {
  const totalEnvios = lista.reduce((s, o) => s + o.envios, 0);
  const totalAberturas = lista.reduce((s, o) => s + o.aberturas, 0);
  const totalPedidos = lista.reduce((s, o) => s + o.pedidos, 0);
  const conversaoMedia = totalEnvios ? (totalPedidos / totalEnvios) * 100 : 0;
  const enviosMedio = lista.length ? totalEnvios / lista.length : 0;

  const vitrine = lista
    .filter(o => o.envios >= enviosMedio && o.conversao >= conversaoMedia)
    .sort((a, b) => b.conversao - a.conversao).slice(0, 5);
  const desperdicio = lista
    .filter(o => o.envios >= enviosMedio && o.conversao < conversaoMedia)
    .sort((a, b) => b.envios - a.envios).slice(0, 5);
  const ocultos = lista
    .filter(o => o.envios < enviosMedio && o.conversao > conversaoMedia)
    .sort((a, b) => b.conversao - a.conversao).slice(0, 5);

  return {
    totalEnvios, totalAberturas, totalPedidos,
    taxaAbertura: totalEnvios ? (totalAberturas / totalEnvios) * 100 : 0,
    conversaoMedia,
    produtosOfertados: lista.length,
    vitrine, desperdicio, ocultos,
  };
}

// ---- Trackeamento de envio → recebimento → abertura → resposta → pedido ----
export interface EtapaTracking { etapa: string; valor: number; pctTotal: number; pctAnterior: number; }

export interface TrackingOfertas {
  etapas: EtapaTracking[];
  entregues: number;
  abertos: number;
  respondidos: number;
  tempoMedioAberturaH: number;   // horas entre envio e 1ª abertura
  semAbertura: number;           // enviados nunca abertos
  porCanal: { canal: string; envios: number; aberturas: number; taxa: number }[];
}

export function trackingOfertas(lista: OfertaProduto[]): TrackingOfertas {
  const enviados = lista.reduce((s, o) => s + o.envios, 0);
  const abertos = lista.reduce((s, o) => s + o.aberturas, 0);
  const pedidos = lista.reduce((s, o) => s + o.pedidos, 0);
  const entregues = Math.round(enviados * 0.968);
  const respondidos = Math.max(pedidos, Math.round(abertos * 0.42));

  const seq = [
    { etapa: "Enviados", valor: enviados },
    { etapa: "Entregues", valor: entregues },
    { etapa: "Abertos", valor: abertos },
    { etapa: "Respondidos", valor: respondidos },
    { etapa: "Viraram pedido", valor: pedidos },
  ];
  const etapas: EtapaTracking[] = seq.map((e, i) => ({
    ...e,
    pctTotal: enviados ? (e.valor / enviados) * 100 : 0,
    pctAnterior: i === 0 ? 100 : seq[i - 1].valor ? (e.valor / seq[i - 1].valor) * 100 : 0,
  }));

  const canais = [
    { canal: "WhatsApp (link de catálogo)", peso: 0.62, taxa: 0.71 },
    { canal: "WhatsApp (produto avulso)", peso: 0.21, taxa: 0.64 },
    { canal: "E-mail / orçamento", peso: 0.12, taxa: 0.38 },
    { canal: "Vitrine compartilhada", peso: 0.05, taxa: 0.49 },
  ];
  const porCanal = canais.map(c => {
    const envios = Math.round(enviados * c.peso);
    const aberturas = Math.round(envios * c.taxa);
    return { canal: c.canal, envios, aberturas, taxa: envios ? (aberturas / envios) * 100 : 0 };
  });

  return {
    etapas,
    entregues,
    abertos,
    respondidos,
    tempoMedioAberturaH: 3.4,
    semAbertura: Math.max(0, entregues - abertos),
    porCanal,
  };
}

// ---- Agregação por marca: quais marcas são mais oferecidas ----
export interface OfertaMarca {
  marcaId: string;
  marcaNome: string;
  produtos: number;
  envios: number;
  aberturas: number;
  pedidos: number;
  receita: number;
  taxaAbertura: number;
  conversao: number;
  shareEnvios: number; // % dos envios totais
}

export function ofertasPorMarca(lista: OfertaProduto[]): OfertaMarca[] {
  const map = new Map<string, OfertaMarca>();
  lista.forEach(o => {
    const cur = map.get(o.marcaId) ?? {
      marcaId: o.marcaId, marcaNome: o.marcaNome,
      produtos: 0, envios: 0, aberturas: 0, pedidos: 0, receita: 0,
      taxaAbertura: 0, conversao: 0, shareEnvios: 0,
    };
    cur.produtos += 1;
    cur.envios += o.envios;
    cur.aberturas += o.aberturas;
    cur.pedidos += o.pedidos;
    cur.receita += o.receita;
    map.set(o.marcaId, cur);
  });
  const total = lista.reduce((s, o) => s + o.envios, 0);
  return [...map.values()].map(m => ({
    ...m,
    taxaAbertura: m.envios ? (m.aberturas / m.envios) * 100 : 0,
    conversao: m.envios ? (m.pedidos / m.envios) * 100 : 0,
    shareEnvios: total ? (m.envios / total) * 100 : 0,
  })).sort((a, b) => b.envios - a.envios);
}
