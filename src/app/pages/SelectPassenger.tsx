import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { mockPassengers } from '../utils/mockData';
import { ArrowLeft, Star, MapPin, DollarSign, Users } from 'lucide-react';

export default function SelectPassenger() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPassengerId, setSelectedPassengerId] = useState<string | null>(null);

  const handleAcceptPassenger = (passenger: typeof mockPassengers[0]) => {
    const activeTrip = {
      passengerId: passenger.id,
      passengerName: passenger.fullName,
      pickupLocation: passenger.pickupLocation,
      dropoffLocation: passenger.dropoffLocation,
      distance: passenger.distance,
      price: passenger.tripPrice,
      seats: passenger.seats,
      driverId: user?.id,
      driverName: user?.fullName,
      status: 'en-route-to-pickup',
      tripId: `trip-${Date.now()}`,
    };
    localStorage.setItem('activeTrip', JSON.stringify(activeTrip));
    setSelectedPassengerId(passenger.id);
    navigate('/driver/active-trip');
  };

  const handleDeclinePassenger = (passengerId: string) => {
    alert('Passenger request declined');
    // In a real app, this would notify the passenger
  };

  const handleViewReviews = (passenger: typeof mockPassengers[0]) => {
    alert(
      `Reviews for ${passenger.fullName}:\n\n` +
        passenger.reviews.map((r) => `⭐ ${r.rating}/5 - ${r.comment} (${r.date})`).join('\n\n')
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 p-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate('/driver/dashboard')}
          className="mb-6 text-white flex items-center gap-2 hover:opacity-80"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl p-6 mb-4">
          <h2 className="text-xl mb-1">Available Ride Requests</h2>
          <p className="text-sm text-gray-600">Select a passenger to pick up</p>
        </div>

        <div className="space-y-3">
          {mockPassengers.map((passenger) => (
            <div key={passenger.id} className="bg-white rounded-2xl p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium">{passenger.fullName}</h3>
                  <button
                    onClick={() => handleViewReviews(passenger)}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
                  >
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{passenger.rating.toFixed(1)}</span>
                    <span className="text-xs underline ml-1">View reviews</span>
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-lg text-green-600 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {passenger.tripPrice.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600">{passenger.distance.toFixed(1)} km</p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Pickup</p>
                    <p>{passenger.pickupLocation}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Dropoff</p>
                    <p>{passenger.dropoffLocation}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{passenger.seats} {passenger.seats === 1 ? 'seat' : 'seats'}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDeclinePassenger(passenger.id)}
                  disabled={selectedPassengerId !== null}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    selectedPassengerId === null
                      ? 'border-2 border-red-500 text-red-500 hover:bg-red-50'
                      : 'border-2 border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Decline
                </button>
                <button
                  onClick={() => handleAcceptPassenger(passenger)}
                  disabled={selectedPassengerId !== null}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    selectedPassengerId === passenger.id
                      ? 'bg-green-500 text-white'
                      : selectedPassengerId === null
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {selectedPassengerId === passenger.id ? 'Accepted' : 'Accept'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {mockPassengers.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No ride requests in your area</p>
            <button
              onClick={() => navigate('/driver/dashboard')}
              className="mt-4 text-blue-600 hover:underline"
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
