// Dados ficticios usados no "modo demonstracao" — permitem conhecer a
// plataforma sem precisar configurar o Supabase. Nada aqui e salvo.

import type { Category, Transaction } from '../types';

const DEMO_USER = 'demo-user';

function c(
  id: string,
  name: string,
  scope: Category['scope'],
  kind: Category['kind'],
  color: string,
): Category {
  return {
    id,
    user_id: DEMO_USER,
    name,
    scope,
    kind,
    color,
    created_at: '2026-01-01T00:00:00Z',
  };
}

export const demoCategories: Category[] = [
  c('cat-vendas', 'Vendas', 'store', 'income', '#16A34A'),
  c('cat-outras-loja', 'Outras entradas da loja', 'store', 'income', '#0EA5E9'),
  c('cat-lotes', 'Custo dos lotes / produtos', 'store', 'expense', '#EF4444'),
  c('cat-embalagem', 'Embalagem', 'store', 'expense', '#F59E0B'),
  c('cat-internet', 'Internet da loja', 'store', 'expense', '#8B5CF6'),
  c('cat-reinvest', 'Reinvestimento', 'store', 'expense', '#1AA5EC'),
  c('cat-outros-loja', 'Outros gastos da loja', 'store', 'expense', '#64748B'),
  c('cat-renda', 'Renda pessoal', 'personal', 'income', '#16A34A'),
  c('cat-aluguel', 'Aluguel', 'personal', 'expense', '#EF4444'),
  c('cat-convenio', 'Convenio / Saude', 'personal', 'expense', '#14B8A6'),
  c('cat-contas', 'Contas fixas', 'personal', 'expense', '#F59E0B'),
  c('cat-outros-pessoal', 'Outros gastos pessoais', 'personal', 'expense', '#64748B'),
];

let seq = 0;
function t(
  categoryId: string,
  description: string,
  amount: number,
  date: string,
  isFixed = false,
  note: string | null = null,
): Transaction {
  seq += 1;
  return {
    id: `demo-tx-${seq}`,
    user_id: DEMO_USER,
    category_id: categoryId,
    description,
    amount,
    date,
    is_fixed: isFixed,
    note,
    created_at: `${date}T12:00:00Z`,
  };
}

export const demoTransactions: Transaction[] = [
  // ===================== Marco / 2026 =====================
  t('cat-vendas', 'Camisa Brasil 1994', 380, '2026-03-05'),
  t('cat-vendas', 'Camisa Flamengo 1981', 450, '2026-03-12'),
  t('cat-vendas', 'Camisa Selecao 1970', 520, '2026-03-20'),
  t('cat-vendas', 'Camisa Corinthians 1990', 250, '2026-03-27'),
  t('cat-lotes', 'Lote de 12 camisas anos 80/90', 1800, '2026-03-02'),
  t('cat-embalagem', 'Embalagens e plastico bolha', 140, '2026-03-06'),
  t('cat-internet', 'Mensalidade internet da loja', 120, '2026-03-10', true),
  t('cat-reinvest', 'Anuncios no Instagram', 200, '2026-03-18'),
  t('cat-outros-loja', 'Frete dos envios', 110, '2026-03-22'),
  t('cat-aluguel', 'Aluguel da loja', 1250, '2026-03-05', true),
  t('cat-convenio', 'Plano de saude', 460, '2026-03-08', true),
  t('cat-contas', 'Luz e agua', 305, '2026-03-12', true),
  t('cat-outros-pessoal', 'Compras de mercado', 540, '2026-03-15'),

  // ===================== Abril / 2026 =====================
  t('cat-vendas', 'Camisa Argentina 1986', 600, '2026-04-04'),
  t('cat-vendas', 'Camisa Brasil 1982', 540, '2026-04-11'),
  t('cat-vendas', 'Camisa Santos retro', 240, '2026-04-18'),
  t('cat-vendas', 'Camisa Real Madrid anos 90', 360, '2026-04-26'),
  t('cat-outras-loja', 'Venda de revista antiga', 120, '2026-04-22'),
  t('cat-lotes', 'Lote de 8 camisas europeias', 1500, '2026-04-05'),
  t('cat-embalagem', 'Embalagens', 160, '2026-04-07'),
  t('cat-internet', 'Mensalidade internet da loja', 120, '2026-04-10', true),
  t('cat-reinvest', 'Impulsionamento de posts', 250, '2026-04-16'),
  t('cat-outros-loja', 'Frete dos envios', 130, '2026-04-21'),
  t('cat-aluguel', 'Aluguel da loja', 1250, '2026-04-05', true),
  t('cat-convenio', 'Plano de saude', 460, '2026-04-08', true),
  t('cat-contas', 'Luz e agua', 290, '2026-04-12', true),
  t('cat-outros-pessoal', 'Mercado e farmacia', 610, '2026-04-15'),

  // ===================== Maio / 2026 =====================
  t('cat-vendas', 'Camisa Brasil 1970 (Pele)', 720, '2026-05-03'),
  t('cat-vendas', 'Camisa Holanda 1988', 460, '2026-05-08'),
  t('cat-vendas', 'Camisa Flamengo 1983', 540, '2026-05-13'),
  t('cat-vendas', 'Camisa Cruzeiro anos 90', 250, '2026-05-16'),
  t('cat-outras-loja', 'Venda de poster antigo', 150, '2026-05-11'),
  t('cat-lotes', 'Lote de 6 camisas de selecoes', 1350, '2026-05-02'),
  t('cat-embalagem', 'Embalagens', 150, '2026-05-06'),
  t('cat-internet', 'Mensalidade internet da loja', 120, '2026-05-09', true),
  t('cat-reinvest', 'Trafego pago / anuncios', 220, '2026-05-14'),
  t('cat-outros-loja', 'Frete dos envios', 105, '2026-05-15'),
  t('cat-aluguel', 'Aluguel da loja', 1250, '2026-05-05', true),
  t('cat-convenio', 'Plano de saude', 460, '2026-05-08', true),
  t('cat-contas', 'Luz e agua', 295, '2026-05-12', true),
  t('cat-outros-pessoal', 'Compras de mercado', 470, '2026-05-15'),
];
