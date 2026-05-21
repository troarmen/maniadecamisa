import { useMemo } from 'react';
import { Pencil, Trash2, Plus, Pin, Receipt } from 'lucide-react';
import { formatBRL } from '../lib/format';
import { formatDateBR } from '../lib/date';
import type { Category, Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  catById: Record<string, Category>;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
  onAdd: () => void;
}

export default function TransactionList({
  transactions,
  catById,
  onEdit,
  onDelete,
  onAdd,
}: TransactionListProps) {
  const sorted = useMemo(
    () =>
      [...transactions].sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1;
        return a.created_at < b.created_at ? 1 : -1;
      }),
    [transactions],
  );

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="font-bold text-slate-800">Lançamentos do mês</h3>
          <p className="text-xs text-slate-400">
            {sorted.length} {sorted.length === 1 ? 'registro' : 'registros'}
          </p>
        </div>
        <button type="button" onClick={onAdd} className="btn-primary">
          <Plus className="h-4 w-4" />
          Novo lançamento
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50">
            <Receipt className="h-6 w-6 text-brand-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-700">
              Nenhum lançamento neste mês
            </p>
            <p className="text-sm text-slate-400">
              Comece registrando uma venda ou um gasto.
            </p>
          </div>
          <button type="button" onClick={onAdd} className="btn-primary">
            <Plus className="h-4 w-4" />
            Adicionar o primeiro
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {sorted.map((t) => {
            const cat = catById[t.category_id];
            const isIncome = cat?.kind === 'income';
            return (
              <li
                key={t.id}
                className="flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50"
              >
                {/* Marca da categoria */}
                <span
                  className="h-9 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: cat?.color ?? '#cbd5e1' }}
                />

                {/* Descrição e categoria */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-slate-800">
                      {t.description}
                    </p>
                    {t.is_fixed && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
                        <Pin className="h-2.5 w-2.5" /> Fixo
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-slate-400">
                    {cat?.name ?? 'Sem categoria'} ·{' '}
                    {cat?.scope === 'personal' ? 'Pessoal' : 'Loja'}
                    {t.note ? ` · ${t.note}` : ''}
                  </p>
                </div>

                {/* Data */}
                <span className="hidden shrink-0 text-xs text-slate-400 sm:block">
                  {formatDateBR(t.date)}
                </span>

                {/* Valor */}
                <span
                  className={`shrink-0 text-right text-sm font-bold tabular-nums ${
                    isIncome ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {isIncome ? '+' : '-'} {formatBRL(Number(t.amount))}
                </span>

                {/* Ações */}
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(t)}
                    aria-label="Editar"
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-brand-50 hover:text-brand-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(t)}
                    aria-label="Excluir"
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
