import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Shirt,
  Tags,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  CopyPlus,
  Loader2,
  AlertTriangle,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import * as repo from '../lib/repo';
import {
  addMonths,
  monthKey,
  monthLabel,
  moveISOToMonth,
  startOfCurrentMonth,
} from '../lib/date';
import type {
  Category,
  ScopeFilter,
  Transaction,
  TransactionInput,
} from '../types';
import SummaryCards from '../components/SummaryCards';
import CategoryChart from '../components/CategoryChart';
import TrendChart from '../components/TrendChart';
import BreakevenChart from '../components/BreakevenChart';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import CategoryManager from '../components/CategoryManager';

const SCOPE_TABS: { value: ScopeFilter; label: string }[] = [
  { value: 'all', label: 'Geral' },
  { value: 'store', label: 'Loja' },
  { value: 'personal', label: 'Pessoal' },
];

interface DashboardProps {
  demo?: boolean;
  onExitDemo?: () => void;
}

export default function Dashboard({ demo = false, onExitDemo }: DashboardProps) {
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [month, setMonth] = useState<Date>(startOfCurrentMonth);
  const [scope, setScope] = useState<ScopeFilter>('all');

  const [txModalOpen, setTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [repeating, setRepeating] = useState(false);

  // ----- Carregamento de dados -----
  const loadData = useCallback(async () => {
    setLoadError('');
    try {
      const [cats, txs] = await Promise.all([
        repo.fetchCategories(),
        repo.fetchTransactions(),
      ]);
      setCategories(cats);
      setTransactions(txs);
    } catch {
      setLoadError(
        'Não foi possível carregar os dados. Verifique se o schema.sql ' +
          'foi executado no Supabase.',
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ----- Dados derivados -----
  const catById = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories],
  );

  const currentKey = monthKey(month);

  const monthTx = useMemo(
    () => transactions.filter((t) => t.date.slice(0, 7) === currentKey),
    [transactions, currentKey],
  );

  const scopedTx = useMemo(() => {
    if (scope === 'all') return monthTx;
    return monthTx.filter((t) => catById[t.category_id]?.scope === scope);
  }, [monthTx, scope, catById]);

  const { income, expense } = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of scopedTx) {
      const cat = catById[t.category_id];
      if (!cat) continue;
      if (cat.kind === 'income') income += Number(t.amount);
      else expense += Number(t.amount);
    }
    return { income, expense };
  }, [scopedTx, catById]);

  // ----- Ações -----
  function openNewTx() {
    setEditingTx(null);
    setTxModalOpen(true);
  }
  function openEditTx(t: Transaction) {
    setEditingTx(t);
    setTxModalOpen(true);
  }

  async function handleDeleteTx(t: Transaction) {
    if (!window.confirm(`Excluir o lançamento "${t.description}"?`)) return;
    try {
      await repo.deleteTransaction(t.id);
      loadData();
    } catch {
      window.alert('Não foi possível excluir o lançamento.');
    }
  }

  async function repeatFixed() {
    const prev = addMonths(month, -1);
    const prevKey = monthKey(prev);

    const inScope = (t: Transaction) =>
      scope === 'all' || catById[t.category_id]?.scope === scope;

    const candidates = transactions.filter(
      (t) => t.date.slice(0, 7) === prevKey && t.is_fixed && inScope(t),
    );

    if (candidates.length === 0) {
      window.alert(
        `Não há custos fixos em ${monthLabel(prev)} para repetir.`,
      );
      return;
    }

    const alreadyHasFixed = transactions.some(
      (t) => t.date.slice(0, 7) === currentKey && t.is_fixed && inScope(t),
    );
    if (
      alreadyHasFixed &&
      !window.confirm(
        'Já existem custos fixos neste mês. Repetir mesmo assim? ' +
          'Isso pode gerar lançamentos duplicados.',
      )
    ) {
      return;
    }

    setRepeating(true);
    const rows: TransactionInput[] = candidates.map((t) => ({
      category_id: t.category_id,
      description: t.description,
      amount: Number(t.amount),
      date: moveISOToMonth(t.date, month),
      is_fixed: true,
      note: t.note,
    }));
    try {
      await repo.createManyTransactions(rows, user?.id ?? '');
      await loadData();
      window.alert(
        `${rows.length} custo(s) fixo(s) copiado(s) para ${monthLabel(month)}.`,
      );
    } catch {
      window.alert('Não foi possível repetir os custos fixos.');
    } finally {
      setRepeating(false);
    }
  }

  async function handleSignOut() {
    if (demo) {
      onExitDemo?.();
    } else {
      await supabase.auth.signOut();
    }
  }

  const defaultFormScope = scope === 'personal' ? 'personal' : 'store';

  return (
    <div className="min-h-screen pb-12">
      {/* ---------- Cabeçalho ---------- */}
      <header className="bg-gradient-to-r from-brand-600 to-brand-400 text-white shadow-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Shirt className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold leading-tight">
                Mania de Camisa
              </h1>
              <p className="text-xs text-brand-100">Controle de Gastos</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCatModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/25"
            >
              <Tags className="h-4 w-4" />
              <span className="hidden sm:inline">Categorias</span>
            </button>
            <span className="hidden max-w-[180px] truncate text-sm text-brand-100 md:inline">
              {demo ? 'Modo demonstração' : user?.email}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              aria-label={demo ? 'Sair da demonstração' : 'Sair'}
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/25"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">
                {demo ? 'Sair da demo' : 'Sair'}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6">
        {demo && (
          <div className="flex items-start gap-2 rounded-xl bg-brand-100 px-4 py-3 text-sm text-brand-800">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <strong>Modo demonstração.</strong> Os dados são fictícios e
              servem apenas para conhecer a plataforma — nada é salvo de
              verdade.
            </span>
          </div>
        )}
        {loadError && (
          <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {loadError}
          </div>
        )}

        {/* ---------- Barra de controles ---------- */}
        <div className="card flex flex-wrap items-center justify-between gap-3 p-3">
          {/* Seletor de mês */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMonth((m) => addMonths(m, -1))}
              aria-label="Mês anterior"
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white hover:text-brand-600"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="flex min-w-[150px] items-center justify-center gap-1.5 text-sm font-bold text-slate-700">
              <CalendarDays className="h-4 w-4 text-brand-500" />
              {monthLabel(month)}
            </span>
            <button
              type="button"
              onClick={() => setMonth((m) => addMonths(m, 1))}
              aria-label="Próximo mês"
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white hover:text-brand-600"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Abas de âmbito */}
          <div className="flex rounded-xl bg-slate-100 p-1">
            {SCOPE_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setScope(tab.value)}
                className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
                  scope === tab.value
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={repeatFixed}
              disabled={repeating}
              title="Copiar os custos fixos do mês anterior para este mês"
              className="btn-ghost"
            >
              {repeating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CopyPlus className="h-4 w-4" />
              )}
              <span className="hidden lg:inline">Repetir fixos</span>
            </button>
            <button type="button" onClick={openNewTx} className="btn-primary">
              <Plus className="h-4 w-4" />
              Novo lançamento
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-sm text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando dados...
          </div>
        ) : (
          <>
            <SummaryCards income={income} expense={expense} scope={scope} />
            <CategoryChart transactions={scopedTx} catById={catById} />
            <TrendChart
              transactions={transactions}
              catById={catById}
              scope={scope}
              anchorMonth={month}
            />
            <BreakevenChart transactions={transactions} catById={catById} />
            <TransactionList
              transactions={scopedTx}
              catById={catById}
              onEdit={openEditTx}
              onDelete={handleDeleteTx}
              onAdd={openNewTx}
            />
          </>
        )}
      </main>

      {/* ---------- Modais ---------- */}
      <TransactionForm
        open={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        onSaved={loadData}
        categories={categories}
        editing={editingTx}
        userId={user?.id ?? ''}
        defaultScope={defaultFormScope}
      />
      <CategoryManager
        open={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        onChanged={loadData}
        categories={categories}
        userId={user?.id ?? ''}
      />
    </div>
  );
}
