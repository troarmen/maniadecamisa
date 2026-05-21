-- ============================================================
--  Mania de Camisa - Controle de Gastos
--  Schema do banco de dados (Supabase / PostgreSQL)
-- ------------------------------------------------------------
--  COMO USAR:
--  1. Crie um projeto em https://supabase.com
--  2. Abra "SQL Editor" no painel do Supabase
--  3. Cole TODO o conteudo deste arquivo e clique em "Run"
-- ============================================================

-- ------------------------------------------------------------
--  Tabela: categories (categorias de entrada/saida)
--  scope = 'store'   -> Loja      | 'personal' -> Pessoal
--  kind  = 'income'  -> Entrada   | 'expense'  -> Saida
-- ------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  scope       text not null check (scope in ('store', 'personal')),
  kind        text not null check (kind in ('income', 'expense')),
  color       text not null default '#1AA5EC',
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
--  Tabela: transactions (lancamentos: itens com valor e data)
-- ------------------------------------------------------------
create table if not exists public.transactions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  category_id  uuid not null references public.categories (id) on delete restrict,
  description  text not null,
  amount       numeric(12, 2) not null check (amount >= 0),
  date         date not null,
  is_fixed     boolean not null default false,
  note         text,
  created_at   timestamptz not null default now()
);

create index if not exists idx_categories_user   on public.categories (user_id);
create index if not exists idx_transactions_user on public.transactions (user_id, date);

-- ------------------------------------------------------------
--  Seguranca: Row Level Security
--  Cada usuario so enxerga e altera os proprios dados.
-- ------------------------------------------------------------
alter table public.categories   enable row level security;
alter table public.transactions enable row level security;

drop policy if exists "categorias do proprio usuario" on public.categories;
create policy "categorias do proprio usuario" on public.categories
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "lancamentos do proprio usuario" on public.transactions;
create policy "lancamentos do proprio usuario" on public.transactions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------
--  Categorias padrao: criadas automaticamente para cada
--  novo usuario, para a plataforma ja vir "pronta para usar".
-- ------------------------------------------------------------
create or replace function public.seed_default_categories()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (user_id, name, scope, kind, color) values
    -- Loja - Entradas
    (new.id, 'Vendas',                     'store',    'income',  '#16A34A'),
    (new.id, 'Outras entradas da loja',    'store',    'income',  '#0EA5E9'),
    -- Loja - Saidas
    (new.id, 'Custo dos lotes / produtos', 'store',    'expense', '#EF4444'),
    (new.id, 'Embalagem',                  'store',    'expense', '#F59E0B'),
    (new.id, 'Internet da loja',           'store',    'expense', '#8B5CF6'),
    (new.id, 'Reinvestimento',             'store',    'expense', '#1AA5EC'),
    (new.id, 'Outros gastos da loja',      'store',    'expense', '#64748B'),
    -- Pessoal - Entradas
    (new.id, 'Renda pessoal',              'personal', 'income',  '#16A34A'),
    -- Pessoal - Saidas
    (new.id, 'Aluguel',                    'personal', 'expense', '#EF4444'),
    (new.id, 'Convênio / Saúde',           'personal', 'expense', '#14B8A6'),
    (new.id, 'Contas fixas',               'personal', 'expense', '#F59E0B'),
    (new.id, 'Outros gastos pessoais',     'personal', 'expense', '#64748B');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.seed_default_categories();
