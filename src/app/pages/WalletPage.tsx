import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { ArrowLeft, Plus, ArrowDownToLine, Loader2 } from 'lucide-react';

interface Transaction {
  id: string;
  type: string;
  amount: string | number;
  description?: string;
  createdAt: string;
}

export default function WalletPage() {
  const navigate    = useNavigate();
  const { user, token, refreshUser } = useAuth();
  const isDriver    = user?.role === 'DRIVER';

  const [balance,      setBalance]      = useState<number>(Number(user?.wallet?.balance ?? 0));
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading,    setTxLoading]    = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [amount,    setAmount]    = useState('');
  const [method,    setMethod]    = useState<'CARD' | 'ECOCASH' | 'MPESA'>('ECOCASH');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [token]);

  const loadData = async () => {
    if (!token) return;
    setTxLoading(true);
    const [walletRes, txRes] = await Promise.all([
      apiFetch<{ balance: string | number }>('/wallet', token),
      apiFetch<Transaction[]>('/wallet/transactions', token),
    ]);
    if (walletRes.data) setBalance(Number(walletRes.data.balance));
    if (txRes.data)     setTransactions(txRes.data);
    setTxLoading(false);
  };

  const handleSubmit = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) { setModalError('Enter a valid amount'); return; }
    if (!token) return;
    setSubmitting(true);
    setModalError('');

    const path = isDriver ? '/wallet/withdraw' : '/wallet/deposit';
    const { data, error } = await apiFetch(path, token, {
      method: 'POST',
      body: JSON.stringify({ amount: num, method }),
    });
    setSubmitting(false);

    if (error) { setModalError(error); return; }
    setBalance(Number(data.balance));
    refreshUser();
    setAmount('');
    setShowModal(false);
    await loadData();
  };

  const typeColor = (type: string) => {
    if (type === 'DEPOSIT' || type === 'TRIP_EARNING') return 'text-green-600';
    if (type === 'WITHDRAWAL' || type === 'TRIP_PAYMENT') return 'text-red-600';
    return 'text-gray-600';
  };

  const typeSign = (type: string) => {
    if (type === 'DEPOSIT' || type === 'TRIP_EARNING') return '+';
    return '-';
  };

  const backPath = isDriver ? '/driver/dashboard' : '/passenger/dashboard';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-md mx-auto">
        <button onClick={() => navigate(backPath)} className="mb-6 text-white flex items-center gap-2 hover:opacity-80">
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl p-6 mb-4">
          <h2 className="text-2xl mb-4">Wallet</h2>

          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
            <p className="text-sm mb-1 opacity-90">Dispatch Cash Balance</p>
            <p className="text-4xl">M {balance.toFixed(2)}</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-blue-500 text-white rounded-xl py-3 mb-6 hover:bg-blue-600 flex items-center justify-center gap-2"
          >
            {isDriver
              ? <><ArrowDownToLine className="w-5 h-5" /> Withdraw Money</>
              : <><Plus className="w-5 h-5" /> Deposit Money</>}
          </button>

          {/* Transaction History */}
          <div className="border-t pt-4">
            <h3 className="text-lg mb-3">Recent Transactions</h3>
            {txLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No transactions yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium">{tx.type.replace(/_/g, ' ')}</p>
                      {tx.description && <p className="text-xs text-gray-500 truncate max-w-[180px]">{tx.description}</p>}
                      <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                    <p className={`text-sm font-semibold ${typeColor(tx.type)}`}>
                      {typeSign(tx.type)}M {Number(tx.amount).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deposit/Withdraw Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <h3 className="text-xl mb-4">{isDriver ? 'Withdraw Money' : 'Deposit Money'}</h3>

            {modalError && <p className="text-red-600 text-sm mb-3 bg-red-50 p-2 rounded-lg">{modalError}</p>}

            <div className="mb-4">
              <label className="block text-sm mb-2 text-gray-700">Amount (M)</label>
              <input
                type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0.00" step="0.01" min="0"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-2 text-gray-700">Method</label>
              <select
                value={method} onChange={e => setMethod(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ECOCASH">EcoCash</option>
                <option value="MPESA">M-Pesa</option>
                <option value="CARD">Card</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setShowModal(false); setModalError(''); }}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 px-4 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center gap-2 disabled:opacity-60">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
