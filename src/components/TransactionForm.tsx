import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Loader2,
  Store,
  User,
  ArrowUp,
  ArrowDown,
  Info,
  CreditCard,
} from 'lucide-react';
import Modal from './Modal';
import * as repo from '../lib/repo';
import { parseAmount } from '../lib/format';
import { todayISO } from '../lib/date';
import type {
  Category,
  Kind,
  PaymentMethod,
  Scope,
  Transaction,
  TransactionInput,
} from '../types';

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  categories: Category[];
  paymentMethods: PaymentMethod[];
  editing: Transaction | null;
  userId: string;
  defaultScope: Scope;
}

export default function TransactionForm({
  open,
  onClose,
  onSaved,
  categories,
  paymentMethods,
  editing,
  userId,
  defaultScope,
}: TransactionFormProps) {
  const [scope, setScope] = useState<Scope>('store');
  const [kind, setKind] = useState<Kind>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [description, setDescription] = useState('');
  const [amountText, setAmountText] = useState('');
  const [date, setDate] = useState(todayISO());
  const [isFixed, setIsFixed] = useState(false);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Inicializa o formulário sempre que ele é aberto.
  useEffect(() => {
    if (!open) return;
    setError('');
    if (editing) {
      const cat = categories.find((c) => c.id === editing.category_id);
      setScope(cat?.scope ?? defaultScope);
      setKind(cat?.kind ?? 'expense');
      setCategoryId(editing.category_id);
      setPaymentMethodId(editing.payment_method_id ?? '');
      setDescription(editing.description);
      setAmountText(String(editing.amount).replace('.', ','));
      setDate(editing.date);
      setIsFixed(editing.is_fixed);
      setNote(editing.note ?? '');
    } else {
      setScope(defaultScope);
      setKind('expense');
      setCategoryId('');
      setPaymentMethodId('');
      setDescription('');
      setAmountText('');
      setDate(todayISO());
      setIsFixed(false);
      setNote('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.scope === scope && c.kind === kind),
    [categories, scope, kind],
  );

  function changeScope(next: Scope) {
    setScope(next);
    setCategoryId('');
  }
  function changeKind(next: Kind) {
    setKind(next);
    setCategoryId('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const amount = parseAmount(amountText);
    if (!categoryId) {
      setError('Escolha uma categoria.');
      return;
    }
    if (!description.trim()) {
      setError('Descreva o item (ex.: "Camisetas anos 80").');
      return;
    }
    if (amount <= 0) {
      setError('Informe um valor maior que zero.');
      return;
    }
    if (!date) {
      setError('Escolha a data.');
      return;
    }

    const payload: TransactionInput = {
      category_id: categoryId,
      payment_method_id: paymentMethodId || null,
      description: description.trim(),
      amount,
      date,
      is_fixed: isFixed,
      note: note.trim() || null,
    };

    setSaving(true);
    try {
      if (editing) {
        await repo.updateTransaction(editing.id, payload);
      } else {
        await repo.createTransaction(payload, userId);
      }
      onSaved();
      onClose();
    } catch {
      setError('Não foi possível salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Editar lançamento' : 'Novo lançamento'}
      subtitle="Registre uma entrada (venda) ou uma saída (gasto)."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Âmbito: Loja x Pessoal */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Onde se aplica?
          </label>
          <div className="grid grid-cols-2 gap-2">
            <ChoiceButton
              active={scope === 'store'}
              onClick={() => changeScope('store')}
              activeClass="border-brand-500 bg-brand-50 text-brand-700"
            >
              <Store className="h-4 w-4" /> Loja
            </ChoiceButton>
            <ChoiceButton
              active={scope === 'personal'}
              onClick={() => changeScope('personal')}
              activeClass="border-violet-500 bg-violet-50 text-violet-700"
            >
              <User className="h-4 w-4" /> Pessoal
            </ChoiceButton>
          </div>
        </div>

        {/* Tipo: Entrada x Saída */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Tipo
          </label>
          <div className="grid grid-cols-2 gap-2">
            <ChoiceButton
              active={kind === 'income'}
              onClick={() => changeKind('income')}
              activeClass="border-emerald-500 bg-emerald-50 text-emerald-700"
            >
              <ArrowUp className="h-4 w-4" /> Entrada
            </ChoiceButton>
            <ChoiceButton
              active={kind === 'expense'}
              onClick={() => changeKind('expense')}
              activeClass="border-red-500 bg-red-50 text-red-700"
            >
              <ArrowDown className="h-4 w-4" /> Saída
            </ChoiceButton>
          </div>
        </div>

        {/* Categoria */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Categoria
          </label>
          {filteredCategories.length === 0 ? (
            <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-700">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              Nenhuma categoria de{' '}
              {kind === 'income' ? 'entrada' : 'saída'} para{' '}
              {scope === 'store' ? 'a loja' : 'o pessoal'}. Crie uma no botão
              "Categorias" do painel.
            </p>
          ) : (
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input-field"
            >
              <option value="">Selecione...</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Descrição / Item */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Item / descrição
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex.: Camisetas anos 80"
            className="input-field"
          />
        </div>

        {/* Meio de pagamento */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <CreditCard className="h-4 w-4 text-slate-400" />
            Meio de pagamento{' '}
            <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          {paymentMethods.length === 0 ? (
            <p className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Nenhum meio cadastrado. Cadastre seus cartões e formas de
              pagamento no botão "Meios" do painel.
            </p>
          ) : (
            <select
              value={paymentMethodId}
              onChange={(e) => setPaymentMethodId(e.target.value)}
              className="input-field"
            >
              <option value="">Sem meio definido</option>
              {paymentMethods.map((pm) => (
                <option key={pm.id} value={pm.id}>
                  {pm.name}
                  {pm.last_four ? ` (•••• ${pm.last_four})` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Valor e Data */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Valor
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                R$
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={amountText}
                onChange={(e) => setAmountText(e.target.value)}
                placeholder="0,00"
                className="input-field pl-9"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Data
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        {/* Observação */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Observação <span className="text-slate-400">(opcional)</span>
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Alguma anotação sobre este lançamento"
            className="input-field"
          />
        </div>

        {/* Custo fixo */}
        <label className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-slate-50 p-3">
          <input
            type="checkbox"
            checked={isFixed}
            onChange={(e) => setIsFixed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-300"
          />
          <span className="text-sm">
            <span className="font-medium text-slate-700">
              Este é um custo fixo
            </span>
            <span className="block text-xs text-slate-400">
              Aluguel, internet, convênio... Permite repetir rapidamente todo
              mês.
            </span>
          </span>
        </label>

        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {editing ? 'Salvar alterações' : 'Adicionar lançamento'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ChoiceButton({
  active,
  onClick,
  activeClass,
  children,
}: {
  active: boolean;
  onClick: () => void;
  activeClass: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition ${
        active
          ? activeClass
          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
      }`}
    >
      {children}
    </button>
  );
}
