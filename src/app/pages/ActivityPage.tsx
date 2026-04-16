import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { getStoredTrips } from '../utils/mockData';
import { ArrowLeft, MapPin, DollarSign } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs';

export default function ActivityPage() {
  const { userType } = useParams<{ userType: 'driver' | 'passenger' }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('trips');

  if (!user) return null;

  const trips = getStoredTrips(user.id, userType || 'passenger');

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
          <h2 className="text-2xl mb-6">Activity</h2>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger
                value="trips"
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  activeTab === 'trips' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                }`}
              >
                Trip Logs
              </TabsTrigger>
              <TabsTrigger
                value="payments"
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  activeTab === 'payments' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                }`}
              >
                Payment Logs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trips">
              {trips.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No trips yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  {trips.map((trip) => (
                    <div key={trip.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm">
                            {userType === 'driver' ? trip.passengerName : trip.driverName}
                          </p>
                          <p className="text-xs text-gray-600">{trip.date}</p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            trip.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : trip.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {trip.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        <p className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {trip.pickupLocation} → {trip.dropoffLocation}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{trip.distance} km</span>
                        <span className="text-sm">${trip.price.toFixed(2)}</span>
                      </div>
                      {trip.rating && (
                        <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600">
                          Rating: {'⭐'.repeat(trip.rating)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="payments">
              {trips.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No payment history</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  {trips
                    .filter((trip) => trip.status === 'completed')
                    .map((trip) => (
                      <div key={trip.id} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm">{trip.date}</p>
                            <p className="text-xs text-gray-600">
                              {userType === 'driver' ? 'Earned from' : 'Paid to'}{' '}
                              {userType === 'driver' ? trip.passengerName : trip.driverName}
                            </p>
                          </div>
                          <p className={`text-lg ${userType === 'driver' ? 'text-green-600' : 'text-red-600'}`}>
                            {userType === 'driver' ? '+' : '-'}${trip.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
