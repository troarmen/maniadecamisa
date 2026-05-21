import { useState, type FormEvent } from 'react';
import { Shirt, Loader2, Mail, Lock, TrendingUp, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Mode = 'signin' | 'signup';

interface LoginProps {
  onEnterDemo: () => void;
}

export default function Login({ onEnterDemo }: LoginProps) {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  function switchMode(next: Mode) {
    setMode(next);
    setError('');
    setInfo('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');

    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          setError('E-mail ou senha incorretos.');
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) {
          setError(error.message);
        } else if (!data.session) {
          // Confirmação de e-mail ativada no Supabase.
          setInfo(
            'Conta criada! Verifique seu e-mail para confirmar o cadastro e ' +
              'depois faça login.',
          );
          setMode('signin');
        }
        // Se data.session existir, o AuthContext já entra automaticamente.
      }
    } catch {
      setError('Não foi possível conectar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-brand-500 via-brand-400 to-brand-600 lg:flex-row">
      {/* Lado esquerdo - marca */}
      <div className="flex flex-col justify-center gap-6 px-8 py-12 text-white lg:flex-1 lg:px-16">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Shirt className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-100">Mania de Camisa</p>
            <h1 className="text-2xl font-extrabold leading-tight">
              Controle de Gastos
            </h1>
          </div>
        </div>
        <p className="max-w-md text-brand-50/90">
          Organize as entradas e saídas da loja, separe o que é gasto pessoal e
          enxergue o lucro de verdade — tudo em gráficos simples de entender.
        </p>
        <ul className="space-y-2 text-sm text-brand-50/90">
          <li className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Faturamento, custos e lucro do mês
          </li>
          <li className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Gráficos de pizza e de barras
          </li>
          <li className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Loja e pessoal sempre separados
          </li>
        </ul>
      </div>

      {/* Lado direito - formulário */}
      <div className="flex items-center justify-center px-6 py-12 lg:flex-1">
        <div className="card w-full max-w-sm p-8">
          <h2 className="text-xl font-bold text-slate-800">
            {mode === 'signin' ? 'Entrar na plataforma' : 'Criar uma conta'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {mode === 'signin'
              ? 'Acesse o painel de controle de gastos.'
              : 'Cadastre o e-mail e a senha do dono da loja.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                E-mail
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@exemplo.com"
                  className="input-field pl-9"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Senha
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  autoComplete={
                    mode === 'signin' ? 'current-password' : 'new-password'
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  className="input-field pl-9"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}
            {info && (
              <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {info}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === 'signin' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {mode === 'signin' ? (
              <>
                Ainda não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="font-semibold text-brand-600 hover:underline"
                >
                  Criar conta
                </button>
              </>
            ) : (
              <>
                Já tem conta?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="font-semibold text-brand-600 hover:underline"
                >
                  Entrar
                </button>
              </>
            )}
          </p>

          <div className="mt-5 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-100" />
            ou
            <span className="h-px flex-1 bg-slate-100" />
          </div>
          <button
            type="button"
            onClick={onEnterDemo}
            className="btn-ghost mt-3 w-full"
          >
            <Sparkles className="h-4 w-4 text-brand-500" />
            Explorar demonstração
          </button>
        </div>
      </div>
    </div>
  );
}
