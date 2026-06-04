import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { addMonths, monthLabel } from '../lib/date';

const MONTHS_SHORT = [
  'Jan', 'Fev', 'Mar', 'Abr',
  'Mai', 'Jun', 'Jul', 'Ago',
  'Set', 'Out', 'Nov', 'Dez',
];

interface MonthPickerProps {
  value: Date;
  onChange: (d: Date) => void;
}

/**
 * Seletor de mês com painel expansível:
 * - Setas ‹ › avançam/retrocedem um mês.
 * - Clicar no nome do mês abre um painel com navegação de ano e grade
 *   dos 12 meses para escolher direto.
 */
export default function MonthPicker({ value, onChange }: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const [yearView, setYearView] = useState(value.getFullYear());
  const ref = useRef<HTMLDivElement>(null);

  // Mantém o ano exibido no painel em sincronia com o mês selecionado.
  useEffect(() => {
    setYearView(value.getFullYear());
  }, [value]);

  // Fecha ao clicar fora ou pressionar ESC.
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  function selectMonth(monthIndex: number) {
    onChange(new Date(yearView, monthIndex, 1));
    setOpen(false);
  }

  function goToCurrentMonth() {
    const now = new Date();
    onChange(new Date(now.getFullYear(), now.getMonth(), 1));
    setOpen(false);
  }

  const realToday = new Date();

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => onChange(addMonths(value, -1))}
          aria-label="Mês anterior"
          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white hover:text-brand-600"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Escolher mês e ano"
          className="flex min-w-[150px] items-center justify-center gap-1.5 rounded-lg px-2 py-1 text-sm font-bold text-slate-700 transition hover:bg-white hover:text-brand-600"
        >
          <CalendarDays className="h-4 w-4 text-brand-500" />
          {monthLabel(value)}
        </button>
        <button
          type="button"
          onClick={() => onChange(addMonths(value, 1))}
          aria-label="Próximo mês"
          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white hover:text-brand-600"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-72 rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-200">
          {/* Navegação de ano */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setYearView((y) => y - 1)}
              aria-label="Ano anterior"
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-brand-600"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-base font-bold text-slate-800">
              {yearView}
            </span>
            <button
              type="button"
              onClick={() => setYearView((y) => y + 1)}
              aria-label="Próximo ano"
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-brand-600"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Grade de meses */}
          <div className="mt-3 grid grid-cols-4 gap-2">
            {MONTHS_SHORT.map((label, i) => {
              const selecionado =
                value.getFullYear() === yearView && value.getMonth() === i;
              const ehHoje =
                realToday.getFullYear() === yearView &&
                realToday.getMonth() === i;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => selectMonth(i)}
                  className={`rounded-lg px-2 py-2 text-sm font-semibold transition ${
                    selecionado
                      ? 'bg-brand-500 text-white shadow-sm'
                      : ehHoje
                        ? 'text-brand-700 ring-1 ring-inset ring-brand-300 hover:bg-brand-50'
                        : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={goToCurrentMonth}
            className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Voltar para o mês atual
          </button>
        </div>
      )}
    </div>
  );
}
