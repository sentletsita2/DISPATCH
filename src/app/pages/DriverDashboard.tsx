import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { Wallet, Activity, BarChart3, Users, FileText, LogOut, User, Loader2 } from 'lucide-react';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { user, token, logout, refreshUser, updateLocalUser } = useAuth();
  const [clockLoading, setClockLoading] = useState(false);

  useEffect(() => { refreshUser(); }, []);

  if (!user) { navigate('/'); return null; }

  const handleLogout = () => { logout(); navigate('/'); };

  const balance    = Number(user.wallet?.balance ?? 0);
  const isClockedIn = user.driverProfile?.isClockedIn ?? false;
  const isVerified  = user.driverProfile?.isVerified  ?? false;

  const handleClockToggle = async () => {
    if (!isVerified) {
      alert('Please upload and have your documents verified before clocking in');
      return;
    }
    if (!token) return;
    setClockLoading(true);
    const { data, error } = await apiFetch('/drivers/clock', token, { method: 'POST' });
    setClockLoading(false);
    if (error) { alert(error); return; }
    updateLocalUser({
      driverProfile: { ...user.driverProfile!, isClockedIn: data.isClockedIn },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/driver/profile')}
            className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full p-2 pr-4 hover:bg-white/30 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden">
              {user.avatarUrl
                ? <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                : <User className="w-6 h-6 text-gray-600" />}
            </div>
            <div className="text-left">
              <p className="text-white text-sm">{user.fullName}</p>
              <p className="text-white/80 text-xs">⭐ {user.rating.toFixed(1)}</p>
            </div>
          </button>
          <button
            onClick={handleLogout}
            className="bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors"
          >
            <LogOut className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Clock In/Out + Balance */}
        <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white">Status</span>
            <button
              onClick={handleClockToggle}
              disabled={clockLoading || !isVerified}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-50 ${
                isClockedIn
                  ? 'bg-green-500 text-white'
                  : 'bg-white/30 text-white border border-white/40'
              }`}
            >
              {clockLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isClockedIn ? 'Clocked In ✓' : 'Clocked Out'}
            </button>
          </div>
          <div className="text-center pt-3 border-t border-white/20">
            <p className="text-white/80 text-sm mb-1">Dispatch Cash Balance</p>
            <p className="text-white text-3xl">M {balance.toFixed(2)}</p>
            <p className="text-white/60 text-xs mt-1">{user.userId}</p>
          </div>
        </div>

        {!isVerified && (
          <div className="bg-yellow-100 border border-yellow-300 rounded-2xl p-4 mb-4 text-center">
            <p className="text-yellow-800 text-sm">
              Please upload your documents to start accepting rides
            </p>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button onClick={() => navigate('/driver/wallet')}
            className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all flex flex-col items-center gap-3">
            <div className="bg-blue-100 p-4 rounded-2xl"><Wallet className="w-8 h-8 text-blue-600" /></div>
            <span className="text-gray-800 text-sm text-center">Wallet</span>
          </button>

          <button onClick={() => navigate('/driver/activity')}
            className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all flex flex-col items-center gap-3">
            <div className="bg-purple-100 p-4 rounded-2xl"><Activity className="w-8 h-8 text-purple-600" /></div>
            <span className="text-gray-800 text-sm text-center">Activity</span>
          </button>

          <button onClick={() => navigate('/driver/stats')}
            className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all flex flex-col items-center gap-3">
            <div className="bg-green-100 p-4 rounded-2xl"><BarChart3 className="w-8 h-8 text-green-600" /></div>
            <span className="text-gray-800 text-sm text-center">Stats</span>
          </button>

          <button onClick={() => navigate('/driver/documents')}
            className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all flex flex-col items-center gap-3">
            <div className="bg-orange-100 p-4 rounded-2xl"><FileText className="w-8 h-8 text-orange-600" /></div>
            <span className="text-gray-800 text-sm text-center">Documents</span>
          </button>

          {isClockedIn && (
            <button
              onClick={() => navigate('/driver/find-passengers')}
              className="col-span-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-6 hover:shadow-xl transition-all flex flex-col items-center gap-3"
            >
              <div className="bg-white/30 p-4 rounded-2xl"><Users className="w-8 h-8 text-white" /></div>
              <span className="text-white">Find Passengers</span>
            </button>
          )}
        </div>

        <div className="text-center mt-8">
          <h1 className="text-white text-3xl">Dispatch</h1>
        </div>
      </div>
    </div>
  );
}
