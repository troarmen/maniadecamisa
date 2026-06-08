// Dados fictícios usados no "modo demonstração" — permitem conhecer a
// plataforma sem precisar configurar o Supabase. Nada aqui é salvo.
//
// A loja abriu em janeiro/2026 no vermelho; as vendas sobem mês a mês
// e os custos vão se estabilizando — histórico real o suficiente para
// o gráfico de ponto de equilíbrio projetar a tendência.

import type { Category, PaymentMethod, Transaction } from '../types';

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
  c('cat-convenio', 'Convênio / Saúde', 'personal', 'expense', '#14B8A6'),
  c('cat-contas', 'Contas fixas', 'personal', 'expense', '#F59E0B'),
  c('cat-outros-pessoal', 'Outros gastos pessoais', 'personal', 'expense', '#64748B'),
];

function pm(
  id: string,
  name: string,
  lastFour: string | null,
  color: string,
): PaymentMethod {
  return {
    id,
    user_id: DEMO_USER,
    name,
    last_four: lastFour,
    color,
    created_at: '2026-01-01T00:00:00Z',
  };
}

export const demoPaymentMethods: PaymentMethod[] = [
  pm('pm-nubank', 'Nubank Roxinho', '4521', '#8B5CF6'),
  pm('pm-itau', 'Itaú Black', '8709', '#F59E0B'),
  pm('pm-bb', 'Banco do Brasil débito', '1234', '#16A34A'),
  pm('pm-pix', 'PIX', null, '#0EA5E9'),
  pm('pm-dinheiro', 'Dinheiro', null, '#64748B'),
];

let seq = 0;
function t(
  categoryId: string,
  description: string,
  amount: number,
  date: string,
  isFixed = false,
  note: string | null = null,
  paymentMethodId: string | null = null,
): Transaction {
  seq += 1;
  return {
    id: `demo-tx-${seq}`,
    user_id: DEMO_USER,
    category_id: categoryId,
    payment_method_id: paymentMethodId,
    description,
    amount,
    date,
    is_fixed: isFixed,
    note,
    created_at: `${date}T12:00:00Z`,
  };
}

export const demoTransactions: Transaction[] = [
  // ===================== Janeiro / 2026 =====================
  // Loja: entradas R$ 1.480 · saídas R$ 3.620
  t('cat-vendas', 'Camisa Brasil 1994', 380, '2026-01-09', false, null, 'pm-pix'),
  t('cat-vendas', 'Camisa Corinthians 1990', 240, '2026-01-14', false, null, 'pm-bb'),
  t('cat-vendas', 'Camisa Palmeiras anos 90', 210, '2026-01-19', false, null, 'pm-pix'),
  t('cat-vendas', 'Camisa Vasco 1989 Centenário', 280, '2026-01-23', false, null, 'pm-pix'),
  t('cat-vendas', 'Camisa São Paulo retrô', 370, '2026-01-28', false, null, 'pm-bb'),
  t('cat-lotes', 'Lote inicial - 20 camisas anos 80/90', 2400, '2026-01-04', false, null, 'pm-pix'),
  t('cat-embalagem', 'Embalagens e plástico bolha', 180, '2026-01-06', false, null, 'pm-nubank'),
  t('cat-internet', 'Mensalidade internet da loja', 120, '2026-01-10', true, null, 'pm-nubank'),
  t('cat-reinvest', 'Criação da loja online', 520, '2026-01-12', false, null, 'pm-nubank'),
  t('cat-outros-loja', 'Etiquetas e organização do estoque', 250, '2026-01-08', false, null, 'pm-itau'),
  t('cat-outros-loja', 'Frete e correios', 150, '2026-01-16', false, null, 'pm-bb'),
  // Pessoal
  t('cat-aluguel', 'Aluguel da loja', 1250, '2026-01-05', true, null, 'pm-pix'),
  t('cat-convenio', 'Plano de saúde', 460, '2026-01-08', true, null, 'pm-nubank'),
  t('cat-contas', 'Luz e água', 300, '2026-01-12', true, null, 'pm-nubank'),
  t('cat-outros-pessoal', 'Compras de mercado', 560, '2026-01-15', false, null, 'pm-bb'),

  // ===================== Fevereiro / 2026 =====================
  // Loja: entradas R$ 1.840 · saídas R$ 3.520
  t('cat-vendas', 'Camisa Flamengo 1981', 450, '2026-02-06', false, null, 'pm-pix'),
  t('cat-vendas', 'Camisa Grêmio 1983 Mundial', 320, '2026-02-11', false, null, 'pm-bb'),
  t('cat-vendas', 'Camisa Santos retrô', 230, '2026-02-17', false, null, 'pm-pix'),
  t('cat-vendas', 'Camisa Atlético-MG anos 90', 260, '2026-02-22', false, null, 'pm-pix'),
  t('cat-vendas', 'Camisa Cruzeiro 1976', 360, '2026-02-26', false, null, 'pm-bb'),
  t('cat-outras-loja', 'Venda de pôster antigo', 220, '2026-02-14', false, null, 'pm-pix'),
  t('cat-lotes', 'Lote de 14 camisas europeias', 2200, '2026-02-03', false, null, 'pm-pix'),
  t('cat-embalagem', 'Embalagens', 160, '2026-02-07', false, null, 'pm-nubank'),
  t('cat-internet', 'Mensalidade internet da loja', 120, '2026-02-10', true, null, 'pm-nubank'),
  t('cat-reinvest', 'Anúncios no Instagram', 480, '2026-02-15', false, null, 'pm-nubank'),
  t('cat-outros-loja', 'Manutenção do site', 420, '2026-02-18', false, null, 'pm-itau'),
  t('cat-outros-loja', 'Frete dos envios', 140, '2026-02-20', false, null, 'pm-bb'),
  // Pessoal
  t('cat-aluguel', 'Aluguel da loja', 1250, '2026-02-05', true, null, 'pm-pix'),
  t('cat-convenio', 'Plano de saúde', 460, '2026-02-08', true, null, 'pm-nubank'),
  t('cat-contas', 'Luz e água', 285, '2026-02-12', true, null, 'pm-nubank'),
  t('cat-outros-pessoal', 'Mercado e farmácia', 520, '2026-02-15', false, null, 'pm-nubank'),

  // ===================== Março / 2026 =====================
  // Loja: entradas R$ 2.060 · saídas R$ 3.510
  t('cat-vendas', 'Camisa Brasil 1970 Pelé', 620, '2026-03-05', false, null, 'pm-pix'),
  t('cat-vendas', 'Camisa Internacional 1979', 290, '2026-03-10', false, null, 'pm-pix'),
  t('cat-vendas', 'Camisa Bahia 1988', 240, '2026-03-14', false, null, 'pm-bb'),
  t('cat-vendas', 'Camisa Fluminense retrô', 310, '2026-03-19', false, null, 'pm-pix'),
  t('cat-vendas', 'Camisa Botafogo anos 90', 280, '2026-03-24', false, null, 'pm-bb'),
  t('cat-vendas', 'Camisa Coritiba 1985', 200, '2026-03-28', false, null, 'pm-dinheiro'),
  t('cat-outras-loja', 'Venda de revista antiga', 120, '2026-03-16', false, null, 'pm-dinheiro'),
  t('cat-lotes', 'Lote de 16 camisas anos 90', 2300, '2026-03-02', false, null, 'pm-pix'),
  t('cat-embalagem', 'Embalagens e plástico bolha', 150, '2026-03-06', false, null, 'pm-nubank'),
  t('cat-internet', 'Mensalidade internet da loja', 120, '2026-03-10', true, null, 'pm-nubank'),
  t('cat-reinvest', 'Tráfego pago', 420, '2026-03-18', false, null, 'pm-nubank'),
  t('cat-outros-loja', 'Cabides e organização', 390, '2026-03-12', false, null, 'pm-itau'),
  t('cat-outros-loja', 'Frete dos envios', 130, '2026-03-22', false, null, 'pm-bb'),
  // Pessoal
  t('cat-aluguel', 'Aluguel da loja', 1250, '2026-03-05', true, null, 'pm-pix'),
  t('cat-convenio', 'Plano de saúde', 460, '2026-03-08', true, null, 'pm-nubank'),
  t('cat-contas', 'Luz e água', 305, '2026-03-12', true, null, 'pm-nubank'),
  t('cat-outros-pessoal', 'Compras de mercado', 540, '2026-03-15', false, null, 'pm-bb'),

  // ===================== Abril / 2026 =====================
  // Loja: entradas R$ 2.390 · saídas R$ 3.430
  t('cat-vendas', 'Camisa Argentina 1986 Maradona', 600, '2026-04-04', false, null, 'pm-pix'),
  t('cat-vendas', 'Camisa Holanda 1974 Cruyff', 480, '2026-04-10', false, null, 'pm-pix'),
  t('cat-vendas', 'Camisa Itália 1982', 420, '2026-04-16', false, null, 'pm-bb'),
  t('cat-vendas', 'Camisa Milan 1989 Van Basten', 380, '2026-04-22', false, null, 'pm-pix'),
  t('cat-vendas', 'Camisa Real Madrid anos 90', 350, '2026-04-27', false, null, 'pm-bb'),
  t('cat-outras-loja', 'Venda de chuteira antiga', 160, '2026-04-19', false, null, 'pm-dinheiro'),
  t('cat-lotes', 'Lote de 12 camisas de seleções', 2150, '2026-04-05', false, null, 'pm-pix'),
  t('cat-embalagem', 'Embalagens', 170, '2026-04-07', false, null, 'pm-nubank'),
  t('cat-internet', 'Mensalidade internet da loja', 120, '2026-04-10', true, null, 'pm-nubank'),
  t('cat-reinvest', 'Impulsionamento de posts', 460, '2026-04-16', false, null, 'pm-nubank'),
  t('cat-outros-loja', 'Fotos profissionais dos produtos', 380, '2026-04-13', false, null, 'pm-itau'),
  t('cat-outros-loja', 'Frete dos envios', 150, '2026-04-21', false, null, 'pm-bb'),
  // Pessoal
  t('cat-aluguel', 'Aluguel da loja', 1250, '2026-04-05', true, null, 'pm-pix'),
  t('cat-convenio', 'Plano de saúde', 460, '2026-04-08', true, null, 'pm-nubank'),
  t('cat-contas', 'Luz e água', 290, '2026-04-12', true, null, 'pm-nubank'),
  t('cat-outros-pessoal', 'Mercado e farmácia', 610, '2026-04-15', false, null, 'pm-nubank'),

  // ===================== Maio / 2026 =====================
  // Loja: entradas R$ 2.730 · saídas R$ 3.390
  t('cat-vendas', 'Camisa Flamengo 1995 Centenário', 720, '2026-05-03', false, null, 'pm-pix'),
  t('cat-vendas', 'Camisa Barcelona 1992 Dream Team', 540, '2026-05-08', false, null, 'pm-pix'),
  t('cat-vendas', 'Camisa Brasil 1982', 480, '2026-05-12', false, null, 'pm-bb'),
  t('cat-vendas', 'Camisa Santos 1968 Pelé', 610, '2026-05-15', false, null, 'pm-pix'),
  t('cat-vendas', 'Camisa Cruzeiro anos 90', 250, '2026-05-17', false, null, 'pm-bb'),
  t('cat-outras-loja', 'Venda de álbum de figurinhas', 130, '2026-05-11', false, null, 'pm-dinheiro'),
  t('cat-lotes', 'Lote de 10 camisas raras', 2100, '2026-05-02', false, null, 'pm-pix'),
  t('cat-embalagem', 'Embalagens', 160, '2026-05-06', false, null, 'pm-nubank'),
  t('cat-internet', 'Mensalidade internet da loja', 120, '2026-05-09', true, null, 'pm-nubank'),
  t('cat-reinvest', 'Tráfego pago / anúncios', 440, '2026-05-14', false, null, 'pm-nubank'),
  t('cat-outros-loja', 'Banner e divulgação', 450, '2026-05-10', false, null, 'pm-itau'),
  t('cat-outros-loja', 'Frete dos envios', 120, '2026-05-15', false, null, 'pm-bb'),
  // Pessoal
  t('cat-aluguel', 'Aluguel da loja', 1250, '2026-05-05', true, null, 'pm-pix'),
  t('cat-convenio', 'Plano de saúde', 460, '2026-05-08', true, null, 'pm-nubank'),
  t('cat-contas', 'Luz e água', 295, '2026-05-12', true, null, 'pm-nubank'),
  t('cat-outros-pessoal', 'Compras de mercado', 470, '2026-05-15', false, null, 'pm-bb'),
];
