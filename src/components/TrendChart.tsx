import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, Activity } from 'lucide-react';
import { formatBRL, formatBRLShort } from '../lib/format';
import { addMonths, monthKey, monthShortLabel } from '../lib/date';
import type { Category, ScopeFilter, Transaction } from '../types';

interface TrendChartProps {
  transactions: Transaction[];
  catById: Record<string, Category>;
  scope: ScopeFilter;
  anchorMonth: Date;
}

type ChartType = 'bar' | 'line';

const MONTHS = 6;

export default function TrendChart({
  transactions,
  catById,
  scope,
  anchorMonth,
}: TrendChartProps) {
  const [chartType, setChartType] = useState<ChartType>('bar');

  const data = useMemo(() => {
    // Cria os baldes dos ultimos 6 meses ate o mes selecionado.
    const buckets = new Map<
      string,
      { mes: string; Entradas: number; Saidas: number }
    >();
    const order: string[] = [];
    for (let i = MONTHS - 1; i >= 0; i--) {
      const d = addMonths(anchorMonth, -i);
      const key = monthKey(d);
      order.push(key);
      buckets.set(key, { mes: monthShortLabel(d), Entradas: 0, Saidas: 0 });
    }

    for (const t of transactions) {
      const key = t.date.slice(0, 7);
      const bucket = buckets.get(key);
      if (!bucket) continue;
      const cat = catById[t.category_id];
      if (!cat) continue;
      if (scope !== 'all' && cat.scope !== scope) continue;
      if (cat.kind === 'income') bucket.Entradas += Number(t.amount);
      else bucket.Saidas += Number(t.amount);
    }

    return order.map((k) => buckets.get(k)!);
  }, [transactions, catById, scope, anchorMonth]);

  const hasData = data.some((d) => d.Entradas > 0 || d.Saidas > 0);

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-800">Evolucao dos ultimos meses</h3>
          <p className="text-xs text-slate-400">
            Entradas x saidas {scope === 'store' && '· apenas loja'}
            {scope === 'personal' && '· apenas pessoal'}
          </p>
        </div>
        <div className="flex rounded-lg bg-slate-100 p-0.5">
          <Toggle active={chartType === 'bar'} onClick={() => setChartType('bar')}>
            <BarChart3 className="h-4 w-4" />
          </Toggle>
          <Toggle
            active={chartType === 'line'}
            onClick={() => setChartType('line')}
          >
            <Activity className="h-4 w-4" />
          </Toggle>
        </div>
      </div>

      {!hasData ? (
        <p className="py-12 text-center text-sm text-slate-400">
          Ainda nao ha lancamentos suficientes para mostrar a evolucao.
        </p>
      ) : (
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={260}>
            {chartType === 'bar' ? (
              <BarChart data={data} margin={{ left: 4, right: 8 }}>
                <CartesianGrid vertical={false} stroke="#eef2f6" />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={formatBRLShort}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  width={64}
                />
                <Tooltip
                  formatter={(v: number) => formatBRL(v)}
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={tooltipStyle}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
                <Bar dataKey="Entradas" fill="#16A34A" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Saidas" fill="#EF4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={data} margin={{ left: 4, right: 8 }}>
                <CartesianGrid vertical={false} stroke="#eef2f6" />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={formatBRLShort}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  width={64}
                />
                <Tooltip
                  formatter={(v: number) => formatBRL(v)}
                  contentStyle={tooltipStyle}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="Entradas"
                  stroke="#16A34A"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="Saidas"
                  stroke="#EF4444"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
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
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
        active
          ? 'bg-white text-brand-600 shadow-sm'
          : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {children}
    </button>
  );
}
