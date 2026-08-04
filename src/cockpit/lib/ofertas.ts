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
