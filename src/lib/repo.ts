// Camada de acesso a dados.
//
// Em modo normal, fala com o Supabase. Em "modo demonstracao", opera
// sobre dados ficticios em memoria — assim a plataforma pode ser
// conhecida sem nenhuma configuracao de back-end.

import { supabase } from './supabase';
import { demoCategories, demoTransactions } from './demoData';
import type {
  Category,
  CategoryInput,
  Transaction,
  TransactionInput,
} from '../types';

let demo = false;
let memCategories: Category[] = [];
let memTransactions: Transaction[] = [];
let counter = 0;

function genId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}

export function isDemoMode(): boolean {
  return demo;
}

/** Liga/desliga o modo demonstracao. Ao ligar, recarrega os dados de exemplo. */
export function setDemoMode(on: boolean): void {
  if (on === demo) return;
  demo = on;
  if (on) {
    memCategories = demoCategories.map((c) => ({ ...c }));
    memTransactions = demoTransactions.map((t) => ({ ...t }));
  } else {
    memCategories = [];
    memTransactions = [];
  }
}

// ---------------------------------------------------------------- Leitura

export async function fetchCategories(): Promise<Category[]> {
  if (demo) {
    return [...memCategories].sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR'),
    );
  }
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function fetchTransactions(): Promise<Transaction[]> {
  if (demo) {
    return [...memTransactions].sort((a, b) => (a.date < b.date ? 1 : -1));
  }
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Transaction[];
}

// ----------------------------------------------------------- Lancamentos

export async function createTransaction(
  input: TransactionInput,
  userId: string,
): Promise<void> {
  if (demo) {
    memTransactions.push({
      id: genId('demo-tx'),
      user_id: 'demo-user',
      created_at: new Date().toISOString(),
      ...input,
    });
    return;
  }
  const { error } = await supabase
    .from('transactions')
    .insert({ ...input, user_id: userId });
  if (error) throw error;
}

export async function createManyTransactions(
  inputs: TransactionInput[],
  userId: string,
): Promise<void> {
  if (demo) {
    for (const input of inputs) {
      memTransactions.push({
        id: genId('demo-tx'),
        user_id: 'demo-user',
        created_at: new Date().toISOString(),
        ...input,
      });
    }
    return;
  }
  const rows = inputs.map((i) => ({ ...i, user_id: userId }));
  const { error } = await supabase.from('transactions').insert(rows);
  if (error) throw error;
}

export async function updateTransaction(
  id: string,
  input: TransactionInput,
): Promise<void> {
  if (demo) {
    const idx = memTransactions.findIndex((t) => t.id === id);
    if (idx >= 0) memTransactions[idx] = { ...memTransactions[idx], ...input };
    return;
  }
  const { error } = await supabase
    .from('transactions')
    .update(input)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteTransaction(id: string): Promise<void> {
  if (demo) {
    memTransactions = memTransactions.filter((t) => t.id !== id);
    return;
  }
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
}

// ------------------------------------------------------------- Categorias

export async function createCategory(
  input: CategoryInput,
  userId: string,
): Promise<void> {
  if (demo) {
    memCategories.push({
      id: genId('demo-cat'),
      user_id: 'demo-user',
      created_at: new Date().toISOString(),
      ...input,
    });
    return;
  }
  const { error } = await supabase
    .from('categories')
    .insert({ ...input, user_id: userId });
  if (error) throw error;
}

export async function updateCategory(
  id: string,
  input: CategoryInput,
): Promise<void> {
  if (demo) {
    const idx = memCategories.findIndex((c) => c.id === id);
    if (idx >= 0) memCategories[idx] = { ...memCategories[idx], ...input };
    return;
  }
  const { error } = await supabase
    .from('categories')
    .update(input)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteCategory(id: string): Promise<void> {
  if (demo) {
    if (memTransactions.some((t) => t.category_id === id)) {
      throw new Error('Categoria em uso por lancamentos.');
    }
    memCategories = memCategories.filter((c) => c.id !== id);
    return;
  }
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}
