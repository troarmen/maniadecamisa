import { useState, type FormEvent } from 'react';
import { Loader2, Plus, Pencil, Trash2, Check, X, CreditCard } from 'lucide-react';
import Modal from './Modal';
import * as repo from '../lib/repo';
import type { PaymentMethod, PaymentMethodInput } from '../types';

interface PaymentMethodManagerProps {
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
  paymentMethods: PaymentMethod[];
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

export default function PaymentMethodManager({
  open,
  onClose,
  onChanged,
  paymentMethods,
  userId,
}: PaymentMethodManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [lastFour, setLastFour] = useState('');
  const [color, setColor] = useState(PALETTE[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function resetForm() {
    setEditingId(null);
    setName('');
    setLastFour('');
    setColor(PALETTE[0]);
    setError('');
  }

  function startEdit(pm: PaymentMethod) {
    setEditingId(pm.id);
    setName(pm.name);
    setLastFour(pm.last_four ?? '');
    setColor(pm.color);
    setError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Informe o nome do meio de pagamento.');
      return;
    }
    if (lastFour && !/^\d{4}$/.test(lastFour)) {
      setError('Os últimos dígitos devem ter exatamente 4 números.');
      return;
    }

    setSaving(true);
    const payload: PaymentMethodInput = {
      name: name.trim(),
      last_four: lastFour ? lastFour : null,
      color,
    };
    try {
      if (editingId) {
        await repo.updatePaymentMethod(editingId, payload);
      } else {
        await repo.createPaymentMethod(payload, userId);
      }
      resetForm();
      onChanged();
    } catch {
      setError('Não foi possível salvar o meio de pagamento.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(pm: PaymentMethod) {
    if (
      !window.confirm(
        `Excluir o meio de pagamento "${pm.name}"? Os lançamentos antigos ` +
          `continuam existindo, só perdem a referência a ele.`,
      )
    ) {
      return;
    }
    setError('');
    try {
      await repo.deletePaymentMethod(pm.id);
      if (editingId === pm.id) resetForm();
      onChanged();
    } catch {
      setError(`Não foi possível excluir "${pm.name}".`);
    }
  }

  function handleLastFourChange(value: string) {
    // Aceita apenas dígitos, máximo de 4.
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    setLastFour(cleaned);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Meios de pagamento"
      subtitle="Cadastre seus cartões, PIX, dinheiro e outras formas de pagar."
      size="lg"
    >
      {/* Formulário de criar/editar */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 p-4"
      >
        <p className="mb-3 text-sm font-semibold text-slate-700">
          {editingId ? 'Editar meio de pagamento' : 'Novo meio de pagamento'}
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Nubank Roxinho, PIX, Dinheiro..."
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Últimos 4 dígitos{' '}
              <span className="text-slate-400">(opcional)</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={lastFour}
              onChange={(e) => handleLastFourChange(e.target.value)}
              placeholder="0000"
              className="input-field tracking-widest"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Se for cartão, informe os 4 últimos. Para PIX, dinheiro ou
              transferência, deixe em branco.
            </p>
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
            {editingId ? 'Salvar' : 'Adicionar meio'}
          </button>
        </div>
      </form>

      {/* Lista de meios cadastrados */}
      <div className="mt-5">
        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
          <CreditCard className="h-3.5 w-3.5" />
          Meios cadastrados
        </p>
        {paymentMethods.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">
            Nenhum meio de pagamento cadastrado ainda. Crie o primeiro no
            formulário acima.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            {paymentMethods.map((pm) => (
              <li
                key={pm.id}
                className="flex items-center gap-3 px-3 py-2.5"
              >
                <span
                  className="h-4 w-4 shrink-0 rounded-full"
                  style={{ backgroundColor: pm.color }}
                />
                <span className="flex-1 truncate text-sm font-medium text-slate-700">
                  {pm.name}
                  {pm.last_four && (
                    <span className="ml-1.5 text-xs font-normal tabular-nums text-slate-400">
                      •••• {pm.last_four}
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => startEdit(pm)}
                  aria-label="Editar meio de pagamento"
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-brand-50 hover:text-brand-600"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(pm)}
                  aria-label="Excluir meio de pagamento"
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
