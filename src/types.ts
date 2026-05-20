// Tipos centrais da plataforma Mania de Camisa.

/** Ambito do lancamento: loja ou pessoal. */
export type Scope = 'store' | 'personal';

/** Natureza do lancamento: entrada (income) ou saida (expense). */
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

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  description: string;
  amount: number;
  /** Data no formato ISO: YYYY-MM-DD */
  date: string;
  is_fixed: boolean;
  note: string | null;
  created_at: string;
}

/** Dados de um lancamento ao criar/editar (sem campos gerados pelo banco). */
export interface TransactionInput {
  category_id: string;
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
