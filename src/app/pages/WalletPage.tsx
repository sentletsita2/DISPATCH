import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CreditCard, Smartphone, Plus, ArrowDownToLine } from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'ecocash' | 'mpesa';
  details: string;
}

export default function WalletPage() {
  const { userType } = useParams<{ userType: 'driver' | 'passenger' }>();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showDepositWithdraw, setShowDepositWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'card', details: '**** **** **** 1234' },
    { id: '2', type: 'ecocash', details: '+263 77 123 4567' },
  ]);

  const isDriver = userType === 'driver';

  const handleAddFunds = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0 && user) {
      updateUser({ dispatchCash: user.dispatchCash + numAmount });
      setAmount('');
      setShowDepositWithdraw(false);
      alert(`Successfully added $${numAmount.toFixed(2)} to your Dispatch Cash`);
    }
  };

  const handleWithdraw = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0 && user && user.dispatchCash >= numAmount) {
      updateUser({ dispatchCash: user.dispatchCash - numAmount });
      setAmount('');
      setShowDepositWithdraw(false);
      alert(`Successfully withdrew $${numAmount.toFixed(2)} from your Dispatch Cash`);
    } else {
      alert('Insufficient funds');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate(`/${userType}/dashboard`)}
          className="mb-6 text-white flex items-center gap-2 hover:opacity-80"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl p-6 mb-4">
          <h2 className="text-2xl mb-4">Wallet</h2>
          
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
            <p className="text-sm mb-1 opacity-90">Dispatch Cash Balance</p>
            <p className="text-4xl">${user?.dispatchCash.toFixed(2)}</p>
          </div>

          <button
            onClick={() => setShowDepositWithdraw(true)}
            className="w-full bg-blue-500 text-white rounded-xl py-3 mb-6 hover:bg-blue-600 flex items-center justify-center gap-2"
          >
            {isDriver ? (
              <>
                <ArrowDownToLine className="w-5 h-5" />
                Withdraw Money
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Deposit Money
              </>
            )}
          </button>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg">Payment Methods</h3>
              <button
                onClick={() => setShowAddPayment(true)}
                className="text-blue-600 hover:underline text-sm"
              >
                + Add New
              </button>
            </div>

            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  {method.type === 'card' ? (
                    <CreditCard className="w-6 h-6 text-gray-600" />
                  ) : (
                    <Smartphone className="w-6 h-6 text-gray-600" />
                  )}
                  <div>
                    <p className="text-sm capitalize">{method.type}</p>
                    <p className="text-xs text-gray-600">{method.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Deposit/Withdraw Modal */}
        {showDepositWithdraw && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md">
              <h3 className="text-xl mb-4">{isDriver ? 'Withdraw Money' : 'Deposit Money'}</h3>
              
              <div className="mb-4">
                <label className="block text-sm mb-2 text-gray-700">Amount ($)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm mb-2 text-gray-700">Payment Method</label>
                <select className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {paymentMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.type.toUpperCase()} - {method.details}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDepositWithdraw(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={isDriver ? handleWithdraw : handleAddFunds}
                  className="flex-1 px-4 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Payment Method Modal */}
        {showAddPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md">
              <h3 className="text-xl mb-4">Add Payment Method</h3>
              
              <div className="mb-4">
                <label className="block text-sm mb-2 text-gray-700">Type</label>
                <select className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="card">Credit/Debit Card</option>
                  <option value="ecocash">EcoCash</option>
                  <option value="mpesa">M-Pesa</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm mb-2 text-gray-700">Details</label>
                <input
                  type="text"
                  placeholder="Card number or phone number"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddPayment(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Payment method added');
                    setShowAddPayment(false);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
