import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { getStoredTrips } from '../utils/mockData';
import { ArrowLeft, DollarSign, MapPin, Users, Navigation, Star } from 'lucide-react';

export default function PersonalStatsPage() {
  const { userType } = useParams<{ userType: 'driver' | 'passenger' }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  const trips = getStoredTrips(user.id, userType || 'passenger');
  const completedTrips = trips.filter((t) => t.status === 'completed');

  const totalSpentOrEarned = completedTrips.reduce((sum, trip) => sum + trip.price, 0);
  const totalDistance = completedTrips.reduce((sum, trip) => sum + trip.distance, 0);
  const uniqueDriversOrPassengers = new Set(
    completedTrips.map((trip) => (userType === 'driver' ? trip.passengerId : trip.driverId))
  ).size;

  const stats = userType === 'driver'
    ? [
        { icon: DollarSign, label: 'Total Earned', value: `$${totalSpentOrEarned.toFixed(2)}`, color: 'bg-green-100 text-green-600' },
        { icon: MapPin, label: 'Trips Completed', value: completedTrips.length.toString(), color: 'bg-blue-100 text-blue-600' },
        { icon: Users, label: 'Passengers Served', value: uniqueDriversOrPassengers.toString(), color: 'bg-purple-100 text-purple-600' },
        { icon: Navigation, label: 'Distance Driven', value: `${totalDistance.toFixed(1)} km`, color: 'bg-orange-100 text-orange-600' },
      ]
    : [
        { icon: DollarSign, label: 'Total Spent', value: `$${totalSpentOrEarned.toFixed(2)}`, color: 'bg-red-100 text-red-600' },
        { icon: MapPin, label: 'Trips Taken', value: completedTrips.length.toString(), color: 'bg-blue-100 text-blue-600' },
        { icon: Users, label: 'Drivers Met', value: uniqueDriversOrPassengers.toString(), color: 'bg-purple-100 text-purple-600' },
        { icon: Navigation, label: 'Distance Traveled', value: `${totalDistance.toFixed(1)} km`, color: 'bg-orange-100 text-orange-600' },
      ];

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

        <div className="bg-white rounded-3xl p-6">
          <h2 className="text-2xl mb-6">Personal Statistics</h2>

          <div className="grid grid-cols-1 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6">
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

          {userType === 'driver' && (
            <div className="mt-6 space-y-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
                <h3 className="text-lg mb-2">Overall Rating</h3>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">⭐ {user.rating.toFixed(1)}</span>
                  <span className="text-sm opacity-90">Average Rating</span>
                </div>
              </div>

              {/* Full reviews list */}
              <div className="bg-gray-50 rounded-2xl p-5">
                <h3 className="font-medium text-gray-700 mb-3">Reviews from Passengers</h3>
                {(() => {
                  const allTrips = getStoredTrips(user.id, 'driver');
                  const reviewed = allTrips.filter(t => t.rating && t.review);
                  if (reviewed.length === 0) {
                    return <p className="text-sm text-gray-400 text-center py-4">No reviews yet</p>;
                  }
                  return (
                    <div className="space-y-3">
                      {reviewed.map((t, i) => (
                        <div key={i} className="bg-white rounded-xl p-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{t.passengerName}</span>
                            <span className="text-xs text-gray-400">{t.date}</span>
                          </div>
                          <div className="flex gap-0.5 mb-1">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`w-4 h-4 ${s <= (t.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                            ))}
                          </div>
                          {t.review && <p className="text-sm text-gray-600 italic">"{t.review}"</p>}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
