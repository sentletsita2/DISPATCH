import React from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Wallet, Activity, BarChart3, Users, FileText, LogOut, User } from 'lucide-react';
import { Switch } from '@radix-ui/react-switch';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  if (!user) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleClockToggle = () => {
    if (!user.documentsVerified) {
      alert('Please upload and verify your documents before clocking in');
      return;
    }
    updateUser({ clockedIn: !user.clockedIn });
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
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-gray-600" />
              )}
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

        {/* Clock In/Out Toggle */}
        <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white">Status</span>
            <label className="flex items-center gap-3 cursor-pointer">
              <span className="text-white text-sm">{user.clockedIn ? 'Clocked In' : 'Clocked Out'}</span>
              <Switch
                checked={user.clockedIn || false}
                onCheckedChange={handleClockToggle}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                  user.clockedIn ? 'bg-green-500' : 'bg-gray-400'
                }`}
                disabled={!user.documentsVerified}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    user.clockedIn ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </Switch>
            </label>
          </div>
          <div className="text-center pt-3 border-t border-white/20">
            <p className="text-white/80 text-sm mb-1">Dispatch Cash Balance</p>
            <p className="text-white text-3xl">${user.dispatchCash.toFixed(2)}</p>
          </div>
        </div>

        {!user.documentsVerified && (
          <div className="bg-yellow-100 border border-yellow-300 rounded-2xl p-4 mb-4 text-center">
            <p className="text-yellow-800 text-sm">
              Please upload your documents to start accepting rides
            </p>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => navigate('/driver/wallet')}
            className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all flex flex-col items-center gap-3"
          >
            <div className="bg-blue-100 p-4 rounded-2xl">
              <Wallet className="w-8 h-8 text-blue-600" />
            </div>
            <span className="text-gray-800 text-sm text-center">Wallet</span>
          </button>

          <button
            onClick={() => navigate('/driver/activity')}
            className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all flex flex-col items-center gap-3"
          >
            <div className="bg-purple-100 p-4 rounded-2xl">
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
            <span className="text-gray-800 text-sm text-center">Activity</span>
          </button>

          <button
            onClick={() => navigate('/driver/stats')}
            className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all flex flex-col items-center gap-3"
          >
            <div className="bg-green-100 p-4 rounded-2xl">
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
            <span className="text-gray-800 text-sm text-center">Stats</span>
          </button>

          <button
            onClick={() => navigate('/driver/documents')}
            className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all flex flex-col items-center gap-3"
          >
            <div className="bg-orange-100 p-4 rounded-2xl">
              <FileText className="w-8 h-8 text-orange-600" />
            </div>
            <span className="text-gray-800 text-sm text-center">Documents</span>
          </button>

          {user.clockedIn && (
            <button
              onClick={() => navigate('/driver/find-passengers')}
              className="col-span-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-6 hover:shadow-xl transition-all flex flex-col items-center gap-3"
            >
              <div className="bg-white/30 p-4 rounded-2xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              <span className="text-white">Find Passengers</span>
            </button>
          )}
        </div>

        {/* App Name Footer */}
        <div className="text-center mt-8">
          <h1 className="text-white text-3xl">Dispatch</h1>
        </div>
      </div>
    </div>
  );
}
