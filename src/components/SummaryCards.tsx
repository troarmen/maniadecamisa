import {
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { formatBRL } from '../lib/format';
import type { ScopeFilter } from '../types';

interface SummaryCardsProps {
  income: number;
  expense: number;
  scope: ScopeFilter;
}

export default function SummaryCards({
  income,
  expense,
  scope,
}: SummaryCardsProps) {
  const result = income - expense;
  const positive = result >= 0;

  const resultLabel =
    scope === 'store'
      ? 'Lucro da loja'
      : scope === 'personal'
        ? 'Saldo pessoal'
        : 'Resultado do mes';

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Entradas */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500">Entradas</span>
          <ArrowUpCircle className="h-5 w-5 text-emerald-500" />
        </div>
        <p className="mt-2 text-2xl font-extrabold text-emerald-600">
          {formatBRL(income)}
        </p>
        <p className="mt-1 text-xs text-slate-400">Faturamento do periodo</p>
      </div>

      {/* Saidas */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500">Saidas</span>
          <ArrowDownCircle className="h-5 w-5 text-red-500" />
        </div>
        <p className="mt-2 text-2xl font-extrabold text-red-600">
          {formatBRL(expense)}
        </p>
        <p className="mt-1 text-xs text-slate-400">Custos e gastos do periodo</p>
      </div>

      {/* Resultado */}
      <div
        className={`card p-5 ring-1 ${
          positive ? 'ring-emerald-100' : 'ring-red-100'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500">
            {resultLabel}
          </span>
          {positive ? (
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-500" />
          )}
        </div>
        <p
          className={`mt-2 flex items-center gap-1.5 text-2xl font-extrabold ${
            positive ? 'text-emerald-600' : 'text-red-600'
          }`}
        >
          <Wallet className="h-5 w-5" />
          {formatBRL(result)}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {positive ? 'No azul — entradas maiores' : 'No vermelho — atencao aos gastos'}
        </p>
      </div>
    </div>
  );
}
