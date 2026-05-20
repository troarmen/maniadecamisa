import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Indica se as credenciais do Supabase foram configuradas no .env */
export const supabaseConfigured = Boolean(url && anonKey);

if (!supabaseConfigured) {
  console.warn(
    '[Mania de Camisa] Supabase nao configurado. ' +
      'Crie um arquivo ".env" com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.',
  );
}

export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
);
