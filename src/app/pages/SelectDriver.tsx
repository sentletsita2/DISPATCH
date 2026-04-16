import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { mockDrivers } from '../utils/mockData';
import { ArrowLeft, Star, Car, MapPin } from 'lucide-react';

export default function SelectDriver() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const tripData = JSON.parse(localStorage.getItem('pendingTrip') || '{}');

  if (!tripData.pickupLocation) {
    navigate('/passenger/trip');
    return null;
  }

  const handleRequestDriver = (driverId: string) => {
    setSelectedDriver(driverId);
    const driver = mockDrivers.find((d) => d.id === driverId);
    
    if (driver) {
      const activeTrip = {
        ...tripData,
        driverId: driver.id,
        driverName: driver.fullName,
        carModel: driver.carModel,
        carPlate: driver.carPlate,
        passengerId: user?.id,
        passengerName: user?.fullName,
        status: 'waiting-for-pickup',
        tripId: `trip-${Date.now()}`,
      };
      localStorage.setItem('activeTrip', JSON.stringify(activeTrip));
      navigate('/passenger/active-trip');
    }
  };

  const handleViewReviews = (driver: typeof mockDrivers[0]) => {
    alert(
      `Reviews for ${driver.fullName}:\n\n` +
        driver.reviews.map((r) => `⭐ ${r.rating}/5 - ${r.comment} (${r.date})`).join('\n\n')
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate('/passenger/trip')}
          className="mb-6 text-white flex items-center gap-2 hover:opacity-80"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Trip Details
        </button>

        <div className="bg-white rounded-3xl p-6 mb-4">
          <h2 className="text-xl mb-2">Select a Driver</h2>
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>
              {tripData.pickupLocation} → {tripData.dropoffLocation}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {mockDrivers.map((driver) => (
            <div key={driver.id} className="bg-white rounded-2xl p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium">{driver.fullName}</h3>
                  <button
                    onClick={() => handleViewReviews(driver)}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
                  >
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{driver.rating.toFixed(1)}</span>
                    <span className="text-xs underline ml-1">View reviews</span>
                  </button>
                </div>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                  {driver.distance.toFixed(1)} km away
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Car className="w-4 h-4" />
                <span>
                  {driver.carModel} • {driver.carPlate}
                </span>
              </div>

              <button
                onClick={() => handleRequestDriver(driver.id)}
                disabled={selectedDriver !== null}
                className={`w-full py-2 rounded-xl transition-all ${
                  selectedDriver === driver.id
                    ? 'bg-green-500 text-white'
                    : selectedDriver === null
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {selectedDriver === driver.id ? 'Requested' : 'Request Driver'}
              </button>
            </div>
          ))}
        </div>

        {mockDrivers.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center">
            <Car className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No drivers available in your area</p>
            <button
              onClick={() => navigate('/passenger/trip')}
              className="mt-4 text-blue-600 hover:underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
