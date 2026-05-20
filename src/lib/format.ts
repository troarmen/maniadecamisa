// Utilidades de formatacao monetaria (Real brasileiro).

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/** Formata um numero como moeda: 1300.5 -> "R$ 1.300,50" */
export function formatBRL(value: number): string {
  return brl.format(Number.isFinite(value) ? value : 0);
}

/** Versao compacta para eixos de grafico: 1300 -> "R$ 1,3 mil" */
export function formatBRLShort(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1000) {
    return `R$ ${(value / 1000).toLocaleString('pt-BR', {
      maximumFractionDigits: 1,
    })} mil`;
  }
  return formatBRL(value);
}

/**
 * Converte o texto digitado pelo usuario em numero.
 * Aceita "300", "300,50", "1.300,50" e tambem "1300.50".
 */
export function parseAmount(input: string): number {
  if (!input) return 0;
  let s = String(input).trim().replace(/[R$\s]/g, '');
  if (s.includes(',')) {
    // Formato brasileiro: ponto e separador de milhar, virgula e decimal.
    s = s.replace(/\./g, '').replace(',', '.');
  }
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}
