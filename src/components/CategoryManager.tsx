import { useState, type FormEvent } from 'react';
import { Loader2, Plus, Pencil, Trash2, Check, X, Tags } from 'lucide-react';
import Modal from './Modal';
import * as repo from '../lib/repo';
import type { Category, CategoryInput, Kind, Scope } from '../types';

interface CategoryManagerProps {
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
  categories: Category[];
  userId: string;
}

const PALETTE = [
  '#1AA5EC',
  '#16A34A',
  '#EF4444',
  '#F59E0B',
  '#8B5CF6',
  '#14B8A6',
  '#EC4899',
  '#0EA5E9',
  '#64748B',
  '#0E4A6A',
];

const SCOPE_LABEL: Record<Scope, string> = {
  store: 'Loja',
  personal: 'Pessoal',
};
const KIND_LABEL: Record<Kind, string> = {
  income: 'Entradas',
  expense: 'Saidas',
};

export default function CategoryManager({
  open,
  onClose,
  onChanged,
  categories,
  userId,
}: CategoryManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [scope, setScope] = useState<Scope>('store');
  const [kind, setKind] = useState<Kind>('expense');
  const [color, setColor] = useState(PALETTE[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function resetForm() {
    setEditingId(null);
    setName('');
    setScope('store');
    setKind('expense');
    setColor(PALETTE[0]);
    setError('');
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setName(cat.name);
    setScope(cat.scope);
    setKind(cat.kind);
    setColor(cat.color);
    setError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Informe o nome da categoria.');
      return;
    }

    setSaving(true);
    const payload: CategoryInput = { name: name.trim(), scope, kind, color };
    try {
      if (editingId) {
        await repo.updateCategory(editingId, payload);
      } else {
        await repo.createCategory(payload, userId);
      }
      resetForm();
      onChanged();
    } catch {
      setError('Nao foi possivel salvar a categoria.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(cat: Category) {
    if (
      !window.confirm(
        `Excluir a categoria "${cat.name}"? Isso so e possivel se nao houver ` +
          `lancamentos nela.`,
      )
    ) {
      return;
    }
    setError('');
    try {
      await repo.deleteCategory(cat.id);
      if (editingId === cat.id) resetForm();
      onChanged();
    } catch {
      setError(
        `Nao foi possivel excluir "${cat.name}": existem lancamentos usando ` +
          `esta categoria.`,
      );
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Categorias"
      subtitle="Crie e organize as categorias de entradas e saidas."
      size="lg"
    >
      {/* Formulario de criar/editar */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 p-4"
      >
        <p className="mb-3 text-sm font-semibold text-slate-700">
          {editingId ? 'Editar categoria' : 'Nova categoria'}
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Frete, Marketing, Mercado..."
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Onde se aplica
            </label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as Scope)}
              className="input-field"
            >
              <option value="store">Loja</option>
              <option value="personal">Pessoal</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Tipo
            </label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as Kind)}
              className="input-field"
            >
              <option value="expense">Saida</option>
              <option value="income">Entrada</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Cor
            </label>
            <div className="flex flex-wrap gap-1.5 pt-1.5">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Cor ${c}`}
                  style={{ backgroundColor: c }}
                  className={`h-6 w-6 rounded-full transition ${
                    color === c
                      ? 'ring-2 ring-slate-800 ring-offset-2'
                      : 'hover:scale-110'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-3 flex justify-end gap-2">
          {editingId && (
            <button type="button" onClick={resetForm} className="btn-ghost">
              <X className="h-4 w-4" /> Cancelar
            </button>
          )}
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : editingId ? (
              <Check className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {editingId ? 'Salvar' : 'Adicionar categoria'}
          </button>
        </div>
      </form>

      {/* Lista agrupada */}
      <div className="mt-5 space-y-4">
        {(['store', 'personal'] as Scope[]).map((sc) =>
          (['income', 'expense'] as Kind[]).map((kd) => {
            const list = categories.filter(
              (c) => c.scope === sc && c.kind === kd,
            );
            if (list.length === 0) return null;
            return (
              <div key={`${sc}-${kd}`}>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                  <Tags className="h-3.5 w-3.5" />
                  {SCOPE_LABEL[sc]} · {KIND_LABEL[kd]}
                </p>
                <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                  {list.map((cat) => (
                    <li
                      key={cat.id}
                      className="flex items-center gap-3 px-3 py-2.5"
                    >
                      <span
                        className="h-4 w-4 shrink-0 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="flex-1 truncate text-sm font-medium text-slate-700">
                        {cat.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEdit(cat)}
                        aria-label="Editar categoria"
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-brand-50 hover:text-brand-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat)}
                        aria-label="Excluir categoria"
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }),
        )}
      </div>
    </Modal>
  );
}
