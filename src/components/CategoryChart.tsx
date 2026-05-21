import { useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PieChart as PieIcon, BarChart3, Inbox } from 'lucide-react';
import { formatBRL, formatBRLShort } from '../lib/format';
import type { Category, Kind, Transaction } from '../types';

interface CategoryChartProps {
  transactions: Transaction[];
  catById: Record<string, Category>;
}

type ChartType = 'pie' | 'bar';

interface Slice {
  name: string;
  value: number;
  color: string;
}

export default function CategoryChart({
  transactions,
  catById,
}: CategoryChartProps) {
  const [kind, setKind] = useState<Kind>('expense');
  const [chartType, setChartType] = useState<ChartType>('pie');

  const data = useMemo<Slice[]>(() => {
    const totals = new Map<string, Slice>();
    for (const t of transactions) {
      const cat = catById[t.category_id];
      if (!cat || cat.kind !== kind) continue;
      const current = totals.get(cat.id);
      if (current) {
        current.value += Number(t.amount);
      } else {
        totals.set(cat.id, {
          name: cat.name,
          value: Number(t.amount),
          color: cat.color,
        });
      }
    }
    return [...totals.values()].sort((a, b) => b.value - a.value);
  }, [transactions, catById, kind]);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="card flex flex-col p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-800">Por categoria</h3>
          <p className="text-xs text-slate-400">
            {kind === 'expense' ? 'Saídas' : 'Entradas'} do mês ·{' '}
            {formatBRL(total)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Entradas x Saídas */}
          <div className="flex rounded-lg bg-slate-100 p-0.5">
            <Toggle active={kind === 'expense'} onClick={() => setKind('expense')}>
              Saídas
            </Toggle>
            <Toggle active={kind === 'income'} onClick={() => setKind('income')}>
              Entradas
            </Toggle>
          </div>
          {/* Pizza x Barras */}
          <div className="flex rounded-lg bg-slate-100 p-0.5">
            <Toggle
              active={chartType === 'pie'}
              onClick={() => setChartType('pie')}
              title="Gráfico de pizza"
            >
              <PieIcon className="h-4 w-4" />
            </Toggle>
            <Toggle
              active={chartType === 'bar'}
              onClick={() => setChartType('bar')}
              title="Gráfico de barras"
            >
              <BarChart3 className="h-4 w-4" />
            </Toggle>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <EmptyChart kind={kind} />
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ResponsiveContainer width="100%" height={260}>
              {chartType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {data.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => formatBRL(v)}
                    contentStyle={tooltipStyle}
                  />
                </PieChart>
              ) : (
                <BarChart
                  data={data}
                  layout="vertical"
                  margin={{ left: 8, right: 16 }}
                >
                  <XAxis
                    type="number"
                    tickFormatter={formatBRLShort}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tick={{ fontSize: 11, fill: '#475569' }}
                  />
                  <Tooltip
                    formatter={(v: number) => formatBRL(v)}
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={tooltipStyle}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                    {data.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Legenda com valores e percentuais */}
          <ul className="space-y-2 lg:col-span-2">
            {data.map((d) => (
              <li
                key={d.name}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="truncate text-slate-600">{d.name}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="font-semibold text-slate-800">
                    {formatBRL(d.value)}
                  </span>
                  <span className="ml-1 text-xs text-slate-400">
                    {total > 0 ? Math.round((d.value / total) * 100) : 0}%
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  fontSize: 13,
  boxShadow: '0 8px 24px rgba(14, 74, 106, 0.12)',
};

function Toggle({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
        active
          ? 'bg-white text-brand-600 shadow-sm'
          : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {children}
    </button>
  );
}

function EmptyChart({ kind }: { kind: Kind }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12 text-center">
      <Inbox className="h-8 w-8 text-slate-300" />
      <p className="text-sm text-slate-400">
        Nenhuma {kind === 'expense' ? 'saída' : 'entrada'} neste mês.
      </p>
    </div>
  );
}
