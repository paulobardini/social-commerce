// Calcula temperatura do cliente a partir da data de "Último contato" (DD/MM/YYYY).
// 🔥 Quente: até 7 dias | ✨ Morno: 8-30 dias | ❄️ Frio: > 30 dias
export type TemperaturaCliente = "quente" | "morna" | "fria";

function parseBR(date: string): Date | null {
  const [d, m, y] = date.split("/").map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

export function calcularTemperatura(ultimoContato: string, hoje: Date = new Date()): TemperaturaCliente {
  const dt = parseBR(ultimoContato);
  if (!dt) return "fria";
  const diffDays = Math.floor((hoje.getTime() - dt.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) return "quente";
  if (diffDays <= 30) return "morna";
  return "fria";
}

export function maskCNPJ(doc: string): string {
  // Mascara CNPJ mantendo 3 primeiros e 2 últimos dígitos.
  // Ex: 12.345.678/0001-90 -> 12.***.***/**90-**
  // CPF (11 dígitos) também é mascarado de forma análoga.
  const digits = doc.replace(/\D/g, "");
  if (digits.length === 14) {
    return `${digits.slice(0, 2)}.***.***/**${digits.slice(-4, -2)}-**`;
  }
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.***.***-**`;
  }
  // fallback: mascarar miolo
  if (doc.length <= 5) return doc;
  return doc.slice(0, 3) + "***" + doc.slice(-2);
}
