import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { ArrowLeft, MapPin, DollarSign, Loader2 } from 'lucide-react';

interface Trip {
  id: string;
  status: string;
  pickupAddress: string;
  dropoffAddress: string;
  totalPrice?: string | number;
  distanceKm?: number;
  createdAt: string;
  passenger?: { fullName: string };
  driver?:    { fullName: string };
}

interface WalletTx {
  id: string;
  type: string;
  amount: string | number;
  description?: string;
  createdAt: string;
}

export default function ActivityPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [activeTab,    setActiveTab]    = useState<'trips' | 'payments'>('trips');
  const [trips,        setTrips]        = useState<Trip[]>([]);
  const [transactions, setTransactions] = useState<WalletTx[]>([]);
  const [loading,      setLoading]      = useState(true);

  const isDriver = user?.role === 'DRIVER';
  const backPath = isDriver ? '/driver/dashboard' : '/passenger/dashboard';

  useEffect(() => {
    if (!token) return;
    Promise.all([
      apiFetch<Trip[]>('/trips', token),
      apiFetch<WalletTx[]>('/wallet/transactions', token),
    ]).then(([tripRes, txRes]) => {
      if (tripRes.data) setTrips(tripRes.data);
      if (txRes.data)   setTransactions(txRes.data);
      setLoading(false);
    });
  }, [token]);

  const statusColor = (s: string) => {
    if (s === 'COMPLETED') return 'bg-green-100 text-green-700';
    if (s === 'CANCELLED') return 'bg-red-100 text-red-700';
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-md mx-auto">
        <button onClick={() => navigate(backPath)} className="mb-6 text-white flex items-center gap-2 hover:opacity-80">
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl p-6">
          <h2 className="text-2xl mb-6">Activity</h2>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
            {(['trips', 'payments'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors capitalize ${
                  activeTab === tab ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                }`}>
                {tab === 'trips' ? 'Trip Logs' : 'Payment Logs'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : activeTab === 'trips' ? (
            trips.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No trips yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {trips.map(trip => (
                  <div key={trip.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium">
                          {isDriver ? trip.passenger?.fullName : trip.driver?.fullName ?? 'Unassigned'}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(trip.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColor(trip.status)}`}>
                        {trip.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 flex items-center gap-1 mb-2">
                      <MapPin className="w-3 h-3" />
                      {trip.pickupAddress} → {trip.dropoffAddress}
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">{trip.distanceKm?.toFixed(1) ?? '—'} km</span>
                      <span>M {Number(trip.totalPrice ?? 0).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            transactions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No payment history</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {transactions.map(tx => {
                  const isCredit = tx.type === 'DEPOSIT' || tx.type === 'TRIP_EARNING';
                  return (
                    <div key={tx.id} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm">{new Date(tx.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-600">{tx.description ?? tx.type.replace(/_/g, ' ')}</p>
                      </div>
                      <p className={`text-lg font-semibold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                        {isCredit ? '+' : '-'}M {Number(tx.amount).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
