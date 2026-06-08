// Tipos centrais da plataforma Mania de Camisa.

/** Âmbito do lançamento: loja ou pessoal. */
export type Scope = 'store' | 'personal';

/** Natureza do lançamento: entrada (income) ou saída (expense). */
export type Kind = 'income' | 'expense';

/** Aba ativa do dashboard. */
export type ScopeFilter = 'all' | Scope;

export interface Category {
  id: string;
  user_id: string;
  name: string;
  scope: Scope;
  kind: Kind;
  color: string;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  name: string;
  /** Últimos 4 dígitos do cartão (opcional — usado só para cartões). */
  last_four: string | null;
  color: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  /** Meio de pagamento (opcional). */
  payment_method_id: string | null;
  description: string;
  amount: number;
  /** Data no formato ISO: YYYY-MM-DD */
  date: string;
  is_fixed: boolean;
  note: string | null;
  created_at: string;
}

/** Dados de um lançamento ao criar/editar (sem campos gerados pelo banco). */
export interface TransactionInput {
  category_id: string;
  payment_method_id: string | null;
  description: string;
  amount: number;
  date: string;
  is_fixed: boolean;
  note: string | null;
}

/** Dados de uma categoria ao criar/editar. */
export interface CategoryInput {
  name: string;
  scope: Scope;
  kind: Kind;
  color: string;
}

/** Dados de um meio de pagamento ao criar/editar. */
export interface PaymentMethodInput {
  name: string;
  last_four: string | null;
  color: string;
}
