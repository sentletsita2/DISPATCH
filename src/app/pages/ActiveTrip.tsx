import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { saveTrip } from '../utils/mockData';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { ArrowLeft, Navigation, Star, X } from 'lucide-react';
import '../utils/leafletIcons';
import 'leaflet/dist/leaflet.css';

export default function ActiveTrip() {
  const { userType } = useParams<{ userType: 'driver' | 'passenger' }>();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [tripStatus, setTripStatus] = useState<string>('');
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  useEffect(() => {
    const trip = JSON.parse(localStorage.getItem('activeTrip') || '{}');
    if (!trip.tripId) {
      navigate(`/${userType}/dashboard`);
      return;
    }
    setActiveTrip(trip);
    setTripStatus(trip.status);
  }, [userType, navigate]);

  const isDriver = userType === 'driver';

  const handleReadyForPickup = () => {
    setTripStatus('ready-for-pickup');
    setActiveTrip({ ...activeTrip, status: 'ready-for-pickup' });
  };

  const handleStartTrip = () => {
    setTripStatus('in-progress');
    setActiveTrip({ ...activeTrip, status: 'in-progress' });
  };

  const handleEndTrip = () => {
    // Process payment
    if (user && !isDriver) {
      updateUser({ dispatchCash: user.dispatchCash - activeTrip.price });
    }
    if (user && isDriver) {
      const driverEarnings = activeTrip.price * 0.85; // 85% goes to driver
      updateUser({ dispatchCash: user.dispatchCash + driverEarnings });
    }

    setShowRating(true);
  };

  const handleCancelTrip = () => {
    const confirmCancel = window.confirm(
      tripStatus === 'in-progress'
        ? isDriver
          ? 'Cancelling will not charge the passenger. Continue?'
          : 'You will be charged for distance covered. Continue?'
        : 'Are you sure you want to cancel this trip?'
    );

    if (confirmCancel) {
      if (tripStatus === 'in-progress' && !isDriver && user) {
        // Charge partial payment for distance covered
        const partialCharge = activeTrip.price * 0.5; // 50% charge as example
        updateUser({ dispatchCash: user.dispatchCash - partialCharge });
      }

      const cancelledTrip = {
        id: activeTrip.tripId,
        passengerId: activeTrip.passengerId,
        driverId: activeTrip.driverId,
        passengerName: activeTrip.passengerName,
        driverName: activeTrip.driverName,
        pickupLocation: activeTrip.pickupLocation,
        dropoffLocation: activeTrip.dropoffLocation,
        date: new Date().toISOString().split('T')[0],
        price: tripStatus === 'in-progress' && !isDriver ? activeTrip.price * 0.5 : 0,
        distance: activeTrip.distance,
        status: 'cancelled' as const,
      };
      saveTrip(cancelledTrip);

      localStorage.removeItem('activeTrip');
      navigate(`/${userType}/dashboard`);
    }
  };

  const handleSubmitRating = () => {
    const completedTrip = {
      id: activeTrip.tripId,
      passengerId: activeTrip.passengerId,
      driverId: activeTrip.driverId,
      passengerName: activeTrip.passengerName,
      driverName: activeTrip.driverName,
      pickupLocation: activeTrip.pickupLocation,
      dropoffLocation: activeTrip.dropoffLocation,
      date: new Date().toISOString().split('T')[0],
      price: activeTrip.price,
      distance: activeTrip.distance,
      status: 'completed' as const,
      rating: rating > 0 ? rating : undefined,
      review: review || undefined,
    };
    saveTrip(completedTrip);

    localStorage.removeItem('activeTrip');
    navigate(`/${userType}/dashboard`);
  };

  if (!activeTrip) return null;

  // Mock route coordinates
  const routeCoordinates: [number, number][] = [
    [-17.8252, 31.0335],
    [-17.8260, 31.0340],
    [-17.8270, 31.0350],
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-md mx-auto">
        {!showRating && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-white text-xl">Dispatch</h1>
              <button
                onClick={handleCancelTrip}
                className="bg-red-500 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
                Cancel Trip
              </button>
            </div>

            {/* Map */}
            <div className="bg-white rounded-3xl overflow-hidden mb-4 h-80">
              <MapContainer
                center={routeCoordinates[0]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Marker position={routeCoordinates[0]}>
                  <Popup>Pickup Location</Popup>
                </Marker>
                <Marker position={routeCoordinates[routeCoordinates.length - 1]}>
                  <Popup>Dropoff Location</Popup>
                </Marker>
                <Polyline positions={routeCoordinates} color="blue" />
              </MapContainer>
            </div>

            {/* Trip Info */}
            <div className="bg-white rounded-3xl p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">
                    {isDriver ? 'Passenger' : 'Driver'}
                  </p>
                  <p className="text-lg">
                    {isDriver ? activeTrip.passengerName : activeTrip.driverName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Trip Price</p>
                  <p className="text-lg">${activeTrip.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div>
                  <p className="text-gray-600 text-xs">Pickup</p>
                  <p>{activeTrip.pickupLocation}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs">Dropoff</p>
                  <p>{activeTrip.dropoffLocation}</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 py-3 bg-blue-100 rounded-xl">
                <Navigation className="w-5 h-5 text-blue-600" />
                <span className="text-blue-600">
                  {tripStatus === 'waiting-for-pickup' || tripStatus === 'en-route-to-pickup'
                    ? 'Driver is on the way'
                    : tripStatus === 'ready-for-pickup'
                    ? 'Driver has arrived'
                    : tripStatus === 'in-progress'
                    ? 'Trip in progress'
                    : 'Waiting...'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {isDriver && tripStatus === 'en-route-to-pickup' && (
                <button
                  onClick={handleReadyForPickup}
                  className="w-full bg-white text-gray-800 py-4 rounded-2xl hover:shadow-xl transition-all"
                >
                  Ready for Pickup
                </button>
              )}

              {((isDriver && tripStatus === 'ready-for-pickup') ||
                (!isDriver && tripStatus === 'ready-for-pickup')) && (
                <button
                  onClick={handleStartTrip}
                  className="w-full bg-green-500 text-white py-4 rounded-2xl hover:bg-green-600 transition-all"
                >
                  {isDriver ? 'Start Trip' : 'Confirm Start Trip'}
                </button>
              )}

              {tripStatus === 'in-progress' && (
                <button
                  onClick={handleEndTrip}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl hover:opacity-90 transition-all"
                >
                  End Trip
                </button>
              )}
            </div>
          </>
        )}

        {/* Rating Modal */}
        {showRating && (
          <div className="bg-white rounded-3xl p-8">
            <h2 className="text-2xl mb-6 text-center">Rate Your {isDriver ? 'Passenger' : 'Driver'}</h2>

            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transform transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-12 h-12 ${
                      star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Leave a review (optional)"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
              rows={4}
            />

            <button
              onClick={handleSubmitRating}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              {rating > 0 ? 'Submit Rating' : 'Skip'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}