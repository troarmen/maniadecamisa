import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
  ReferenceDot,
  ResponsiveContainer,
} from 'recharts';
import { Flag } from 'lucide-react';
import { formatBRL, formatBRLShort } from '../lib/format';
import { addMonths, monthShortLabel } from '../lib/date';
import type { Category, Transaction } from '../types';

/* ------------------------------------------------------------------
 *  Previsão de Breakeven (ponto de equilíbrio)
 *  Usa o histórico real de entradas e saídas da LOJA, ajusta uma reta
 *  de tendência (regressão linear) e projeta os próximos 3 meses,
 *  destacando o mês em que as entradas passam as saídas.
 * ------------------------------------------------------------------ */

const COR_ENTRADAS = '#16A34A';
const COR_SAIDAS = '#EF4444';
const MESES_PROJECAO = 3;

interface Regressao {
  slope: number;
  intercept: number;
}

/** Regressão linear simples (mínimos quadrados) sobre uma série de valores. */
function regressaoLinear(valores: number[]): Regressao {
  const n = valores.length;
  const mediaX = (n - 1) / 2;
  const mediaY = valores.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  valores.forEach((y, x) => {
    num += (x - mediaX) * (y - mediaY);
    den += (x - mediaX) ** 2;
  });
  const slope = den === 0 ? 0 : num / den;
  return { slope, intercept: mediaY - slope * mediaX };
}

const prever = (r: Regressao, x: number) => r.intercept + r.slope * x;

/** Rótulo "Mai/26" a partir de um Date. */
function rotuloData(d: Date): string {
  const s = monthShortLabel(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Rótulo "Mai/26" a partir da chave "2026-05". */
function rotuloMes(chave: string): string {
  const [ano, mes] = chave.split('-').map(Number);
  return rotuloData(new Date(ano, mes - 1, 1));
}

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  boxShadow: '0 8px 24px rgba(14, 74, 106, 0.12)',
};

function BreakevenTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  const entradas = d.entradasReal ?? d.entradasProj;
  const saidas = d.saidasReal ?? d.saidasProj;
  if (entradas == null || saidas == null) return null;
  const projetado = d.entradasReal == null;
  const resultado = entradas - saidas;
  return (
    <div style={tooltipStyle} className="bg-white px-3 py-2 text-xs">
      <p className="text-sm font-bold text-slate-800">
        {d.mes}
        {projetado && (
          <span className="ml-1 font-medium text-slate-400">(projeção)</span>
        )}
      </p>
      <div className="mt-1.5 space-y-0.5">
        <p className="text-emerald-600">
          Entradas: <strong>{formatBRL(entradas)}</strong>
        </p>
        <p className="text-red-600">
          Saídas: <strong>{formatBRL(saidas)}</strong>
        </p>
        <p className={resultado >= 0 ? 'text-emerald-700' : 'text-red-700'}>
          Resultado: <strong>{formatBRL(resultado)}</strong>
        </p>
      </div>
    </div>
  );
}

interface Ponto {
  x: number;
  mes: string;
  entradasReal: number | null;
  saidasReal: number | null;
  entradasProj: number | null;
  saidasProj: number | null;
}

interface BreakevenChartProps {
  transactions: Transaction[];
  catById: Record<string, Category>;
}

export default function BreakevenChart({
  transactions,
  catById,
}: BreakevenChartProps) {
  const { data, labels, breakeven, nReal, suficiente } = useMemo(() => {
    // Agrega entradas e saídas da LOJA por mês.
    // Meses no futuro (em relação à data real de hoje) são ignorados:
    // se contivessem apenas custos fixos auto-inseridos, distorceriam
    // a regressão da tendência.
    const hoje = new Date();
    const chaveHoje = `${hoje.getFullYear()}-${String(
      hoje.getMonth() + 1,
    ).padStart(2, '0')}`;
    const porMes = new Map<string, { entradas: number; saidas: number }>();
    for (const tx of transactions) {
      const cat = catById[tx.category_id];
      if (!cat || cat.scope !== 'store') continue;
      const chave = tx.date.slice(0, 7);
      if (chave > chaveHoje) continue;
      const reg = porMes.get(chave) ?? { entradas: 0, saidas: 0 };
      if (cat.kind === 'income') reg.entradas += Number(tx.amount);
      else reg.saidas += Number(tx.amount);
      porMes.set(chave, reg);
    }

    const meses = [...porMes.keys()].sort();
    const data: Ponto[] = [];
    const labels: string[] = [];
    let breakeven: { x: number; y: number; mes: string; futuro: boolean } | null =
      null;
    let nReal = 0;

    if (meses.length >= 2) {
      const historico = meses.map((chave) => ({
        chave,
        ...porMes.get(chave)!,
      }));
      nReal = historico.length;

      const regE = regressaoLinear(historico.map((m) => m.entradas));
      const regS = regressaoLinear(historico.map((m) => m.saidas));

      historico.forEach((m) => labels.push(rotuloMes(m.chave)));
      const [ano, mes] = meses[meses.length - 1].split('-').map(Number);
      const base = new Date(ano, mes - 1, 1);
      for (let i = 1; i <= MESES_PROJECAO; i++) {
        labels.push(rotuloData(addMonths(base, i)));
      }
      const total = labels.length;

      for (let x = 0; x < total; x++) {
        const real = x < nReal;
        const ultimoReal = x === nReal - 1;
        data.push({
          x,
          mes: labels[x],
          entradasReal: real ? historico[x].entradas : null,
          saidasReal: real ? historico[x].saidas : null,
          // A projeção parte do último mês real para a linha tracejada conectar.
          entradasProj: ultimoReal
            ? historico[x].entradas
            : real
              ? null
              : Math.round(prever(regE, x)),
          saidasProj: ultimoReal
            ? historico[x].saidas
            : real
              ? null
              : Math.round(prever(regS, x)),
        });
      }

      // Ponto de equilíbrio: onde as duas retas de tendência se cruzam.
      const denom = regE.slope - regS.slope;
      if (Math.abs(denom) > 1e-6) {
        const xCross = (regS.intercept - regE.intercept) / denom;
        if (xCross >= 0 && xCross <= total - 1) {
          breakeven = {
            x: xCross,
            y: prever(regE, xCross),
            mes: labels[Math.min(Math.round(xCross), total - 1)],
            futuro: xCross >= nReal - 1,
          };
        }
      }
    }

    return { data, labels, breakeven, nReal, suficiente: meses.length >= 2 };
  }, [transactions, catById]);

  const Cabecalho = (
    <div>
      <h3 className="flex flex-wrap items-center gap-2 font-bold text-slate-800">
        <Flag className="h-4 w-4 text-brand-500" />
        Previsão de ponto de equilíbrio
      </h3>
      <p className="text-xs text-slate-400">
        Entradas e saídas da loja: histórico real até o mês atual (linha
        cheia) e projeção dos próximos meses (linha tracejada).
      </p>
    </div>
  );

  if (!suficiente) {
    return (
      <div className="card p-5">
        {Cabecalho}
        <p className="py-12 text-center text-sm text-slate-400">
          Ainda não há meses suficientes da loja para calcular a tendência.
          Registre lançamentos de pelo menos dois meses.
        </p>
      </div>
    );
  }

  const inicioProjecao = nReal - 1;
  const fim = labels.length - 1;

  return (
    <div className="card p-5">
      {Cabecalho}

      <div className="mt-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 24, right: 20, bottom: 4, left: 8 }}
          >
            <CartesianGrid vertical={false} stroke="#eef2f6" />

            {/* Zona de projeção */}
            <ReferenceArea
              x1={inicioProjecao}
              x2={fim}
              fill="#1AA5EC"
              fillOpacity={0.05}
              stroke="none"
              label={{
                value: 'Projeção',
                position: 'insideTop',
                fill: '#94a3b8',
                fontSize: 11,
                fontWeight: 600,
              }}
            />

            <XAxis
              type="number"
              dataKey="x"
              domain={[0, fim]}
              ticks={data.map((d) => d.x)}
              tickFormatter={(v) => labels[v] ?? ''}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={['dataMin - 500', 'dataMax + 500']}
              tickFormatter={formatBRLShort}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              width={76}
            />
            <Tooltip content={<BreakevenTooltip />} />
            <Legend
              iconType="plainline"
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            />

            {/* Entradas: histórico real (sólida) + projeção (tracejada) */}
            <Line
              name="Entradas"
              dataKey="entradasReal"
              stroke={COR_ENTRADAS}
              strokeWidth={3}
              dot={{ r: 4 }}
              connectNulls={false}
            />
            <Line
              name="Entradas (projeção)"
              dataKey="entradasProj"
              stroke={COR_ENTRADAS}
              strokeWidth={3}
              strokeDasharray="7 5"
              dot={{ r: 3 }}
              connectNulls={false}
              legendType="none"
            />

            {/* Saídas: histórico real (sólida) + projeção (tracejada) */}
            <Line
              name="Saídas"
              dataKey="saidasReal"
              stroke={COR_SAIDAS}
              strokeWidth={3}
              dot={{ r: 4 }}
              connectNulls={false}
            />
            <Line
              name="Saídas (projeção)"
              dataKey="saidasProj"
              stroke={COR_SAIDAS}
              strokeWidth={3}
              strokeDasharray="7 5"
              dot={{ r: 3 }}
              connectNulls={false}
              legendType="none"
            />

            {/* Marcador do ponto de equilíbrio */}
            {breakeven && (
              <ReferenceDot
                x={breakeven.x}
                y={breakeven.y}
                r={8}
                fill="#ffffff"
                stroke={COR_ENTRADAS}
                strokeWidth={3}
                ifOverflow="extendDomain"
                label={{
                  value: '🏁 Breakeven',
                  position: 'top',
                  fill: '#15803D',
                  fontSize: 12,
                  fontWeight: 800,
                  offset: 12,
                }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Resumo da previsão */}
      {breakeven ? (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <Flag className="mt-0.5 h-4 w-4 shrink-0" />
          {breakeven.futuro ? (
            <span>
              <strong>
                Ponto de equilíbrio previsto para {breakeven.mes}.
              </strong>{' '}
              Mantendo a tendência atual, é nesse mês que as entradas da loja
              passam as saídas e a operação tende a ficar no azul.
            </span>
          ) : (
            <span>
              <strong>
                A loja cruzou o ponto de equilíbrio em {breakeven.mes}.
              </strong>{' '}
              Pela tendência atual, as entradas seguem acima das saídas nos
              próximos meses.
            </span>
          )}
        </div>
      ) : (
        <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Com a tendência atual não há cruzamento previsto dentro do período
          projetado.
        </div>
      )}
    </div>
  );
}
