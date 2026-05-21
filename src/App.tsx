import { useState } from 'react';
import { Loader2, Shirt, AlertTriangle, Sparkles } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { supabaseConfigured } from './lib/supabase';
import * as repo from './lib/repo';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const DEMO_KEY = 'mdc-demo';

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 p-6">
      {children}
    </div>
  );
}

export default function App() {
  const { session, loading } = useAuth();

  // Modo demonstração: roda com dados fictícios, sem precisar do Supabase.
  const [demo, setDemo] = useState<boolean>(() => {
    const on = sessionStorage.getItem(DEMO_KEY) === '1';
    if (on) repo.setDemoMode(true);
    return on;
  });

  function enterDemo() {
    repo.setDemoMode(true);
    sessionStorage.setItem(DEMO_KEY, '1');
    setDemo(true);
  }

  function exitDemo() {
    repo.setDemoMode(false);
    sessionStorage.removeItem(DEMO_KEY);
    setDemo(false);
  }

  if (demo) {
    return <Dashboard demo onExitDemo={exitDemo} />;
  }

  // Aviso caso o .env ainda não tenha sido preenchido.
  if (!supabaseConfigured) {
    return (
      <FullScreen>
        <div className="card max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
            <AlertTriangle className="h-7 w-7 text-amber-600" />
          </div>
          <h1 className="text-lg font-bold text-slate-800">
            Configuração pendente
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Crie um arquivo <code className="rounded bg-slate-100 px-1">.env</code>{' '}
            na raiz do projeto com as chaves{' '}
            <code className="rounded bg-slate-100 px-1">VITE_SUPABASE_URL</code> e{' '}
            <code className="rounded bg-slate-100 px-1">
              VITE_SUPABASE_ANON_KEY
            </code>
            . Veja o arquivo <strong>README.md</strong> para o passo a passo.
          </p>
          <button
            type="button"
            onClick={enterDemo}
            className="btn-primary mt-6 w-full"
          >
            <Sparkles className="h-4 w-4" />
            Ver demonstração
          </button>
          <p className="mt-2 text-xs text-slate-400">
            A demonstração usa dados fictícios e não precisa do Supabase.
          </p>
        </div>
      </FullScreen>
    );
  }

  if (loading) {
    return (
      <FullScreen>
        <div className="flex flex-col items-center gap-3 text-brand-600">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-card">
            <Shirt className="h-7 w-7" />
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando...
          </div>
        </div>
      </FullScreen>
    );
  }

  return session ? <Dashboard /> : <Login onEnterDemo={enterDemo} />;
}
