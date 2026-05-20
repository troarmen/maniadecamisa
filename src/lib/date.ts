// Utilidades de data, sem dependencias externas (pt-BR).

const monthYearFmt = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
});

const monthShortFmt = new Intl.DateTimeFormat('pt-BR', { month: 'short' });

/** Chave de mes "YYYY-MM" a partir de um objeto Date. */
export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Chave de mes "YYYY-MM" a partir de uma data ISO "YYYY-MM-DD". */
export function monthKeyFromISO(iso: string): string {
  return iso.slice(0, 7);
}

/** Rotulo amigavel do mes: "Maio de 2026" (primeira letra maiuscula). */
export function monthLabel(d: Date): string {
  const s = monthYearFmt.format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Rotulo curto do mes: "mai/26" */
export function monthShortLabel(d: Date): string {
  const m = monthShortFmt.format(d).replace('.', '');
  return `${m}/${String(d.getFullYear()).slice(2)}`;
}

/** Retorna um novo Date no primeiro dia do mes deslocado em n meses. */
export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

/** Primeiro dia do mes atual. */
export function startOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/** Data de hoje em formato ISO "YYYY-MM-DD" (fuso local). */
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

/** Converte "YYYY-MM-DD" para "DD/MM/AAAA". */
export function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/**
 * Move uma data ISO para outro mes, mantendo o dia (com ajuste para
 * meses mais curtos). Usado ao repetir custos fixos.
 */
export function moveISOToMonth(iso: string, target: Date): string {
  const day = Number(iso.slice(8, 10));
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  const safeDay = Math.min(day, lastDay);
  return `${monthKey(target)}-${String(safeDay).padStart(2, '0')}`;
}
