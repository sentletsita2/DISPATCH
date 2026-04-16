import React from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Wallet, Activity, BarChart3, Car, LogOut, User } from 'lucide-react';

export default function PassengerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const canRequestRide = user.dispatchCash > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/passenger/profile')}
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

        {/* Dispatch Cash Balance */}
        <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 mb-6 text-center">
          <p className="text-white/80 text-sm mb-1">Dispatch Cash Balance</p>
          <p className="text-white text-4xl">${user.dispatchCash.toFixed(2)}</p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => navigate('/passenger/wallet')}
            className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all flex flex-col items-center gap-3"
          >
            <div className="bg-blue-100 p-4 rounded-2xl">
              <Wallet className="w-8 h-8 text-blue-600" />
            </div>
            <span className="text-gray-800">Wallet</span>
          </button>

          <button
            onClick={() => navigate('/passenger/activity')}
            className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all flex flex-col items-center gap-3"
          >
            <div className="bg-purple-100 p-4 rounded-2xl">
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
            <span className="text-gray-800">Activity</span>
          </button>

          <button
            onClick={() => navigate('/passenger/stats')}
            className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all flex flex-col items-center gap-3"
          >
            <div className="bg-green-100 p-4 rounded-2xl">
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
            <span className="text-gray-800">Stats</span>
          </button>

          <button
            onClick={() => canRequestRide ? navigate('/passenger/trip') : null}
            disabled={!canRequestRide}
            className={`rounded-2xl p-6 transition-all flex flex-col items-center gap-3 ${
              canRequestRide
                ? 'bg-gradient-to-br from-orange-400 to-red-500 hover:shadow-xl'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            <div className={`p-4 rounded-2xl ${canRequestRide ? 'bg-white/30' : 'bg-white/50'}`}>
              <Car className="w-8 h-8 text-white" />
            </div>
            <span className="text-white">Request Ride</span>
          </button>
        </div>

        {!canRequestRide && (
          <div className="bg-yellow-100 border border-yellow-300 rounded-2xl p-4 text-center">
            <p className="text-yellow-800 text-sm">
              Please add funds to your Dispatch Cash to request a ride
            </p>
          </div>
        )}

        {/* App Name Footer */}
        <div className="text-center mt-8">
          <h1 className="text-white text-3xl">Dispatch</h1>
        </div>
      </div>
    </div>
  );
}
