import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { ArrowLeft, DollarSign, MapPin, Users, Navigation, Star, Loader2 } from 'lucide-react';

interface PassengerStats { totalTrips: number; totalSpent: string | number; uniqueDrivers: number; }
interface DriverStats {
  totalTrips: number; totalEarned: string | number; totalDistanceKm: number;
  recentReviews: { score: number; review?: string; giver: { fullName: string }; createdAt: string }[];
}

export default function PersonalStatsPage() {
  const navigate    = useNavigate();
  const { user, token } = useAuth();
  const isDriver    = user?.role === 'DRIVER';
  const backPath    = isDriver ? '/driver/dashboard' : '/passenger/dashboard';

  const [stats,   setStats]   = useState<PassengerStats | DriverStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch<PassengerStats | DriverStats>('/users/stats', token).then(({ data }) => {
      if (data) setStats(data);
      setLoading(false);
    });
  }, [token]);

  if (!user) return null;

  const passengerStats = !isDriver ? (stats as PassengerStats) : null;
  const driverStats    = isDriver  ? (stats as DriverStats)    : null;

  const statCards = isDriver
    ? [
        { icon: DollarSign, label: 'Total Earned',       value: `M ${Number(driverStats?.totalEarned ?? 0).toFixed(2)}`,    color: 'bg-green-100 text-green-600' },
        { icon: MapPin,     label: 'Trips Completed',    value: (driverStats?.totalTrips ?? 0).toString(),                  color: 'bg-blue-100 text-blue-600' },
        { icon: Navigation, label: 'Distance Driven',    value: `${Number(driverStats?.totalDistanceKm ?? 0).toFixed(1)} km`, color: 'bg-orange-100 text-orange-600' },
      ]
    : [
        { icon: DollarSign, label: 'Total Spent',        value: `M ${Number(passengerStats?.totalSpent ?? 0).toFixed(2)}`,  color: 'bg-red-100 text-red-600' },
        { icon: MapPin,     label: 'Trips Taken',        value: (passengerStats?.totalTrips ?? 0).toString(),               color: 'bg-blue-100 text-blue-600' },
        { icon: Users,      label: 'Drivers Met',        value: (passengerStats?.uniqueDrivers ?? 0).toString(),            color: 'bg-purple-100 text-purple-600' },
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-md mx-auto">
        <button onClick={() => navigate(backPath)} className="mb-6 text-white flex items-center gap-2 hover:opacity-80">
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl p-6">
          <h2 className="text-2xl mb-6">Personal Statistics</h2>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {statCards.map((stat, i) => (
                  <div key={i} className="bg-gray-50 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-2xl ${stat.color}`}>
                        <stat.icon className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">{stat.label}</p>
                        <p className="text-2xl">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {isDriver && (
                <div className="mt-6 space-y-4">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
                    <h3 className="text-lg mb-2">Overall Rating</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">⭐ {user.rating.toFixed(1)}</span>
                      <span className="text-sm opacity-90">({user.reviewCount} reviews)</span>
                    </div>
                  </div>

                  {(driverStats?.recentReviews?.length ?? 0) > 0 && (
                    <div className="bg-gray-50 rounded-2xl p-5">
                      <h3 className="font-medium text-gray-700 mb-3">Recent Reviews</h3>
                      <div className="space-y-3">
                        {driverStats!.recentReviews.map((r, i) => (
                          <div key={i} className="bg-white rounded-xl p-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">{r.giver.fullName}</span>
                              <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex gap-0.5 mb-1">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className={`w-4 h-4 ${s <= r.score ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                              ))}
                            </div>
                            {r.review && <p className="text-sm text-gray-600 italic">"{r.review}"</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
