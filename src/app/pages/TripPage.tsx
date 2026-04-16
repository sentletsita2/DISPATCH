import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { calculateTripPrice } from '../utils/mockData';
import { ArrowLeft, MapPin, Users } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import '../utils/leafletIcons';
import 'leaflet/dist/leaflet.css';

export default function TripPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [seats, setSeats] = useState(1);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);

  // Mock distance calculation
  const distance = pickupLocation && dropoffLocation ? 5.5 : 0;
  const priceData = distance > 0 ? calculateTripPrice(distance, seats) : null;

  const handleBookRide = () => {
    if (!pickupLocation || !dropoffLocation) {
      alert('Please enter both pickup and dropoff locations');
      return;
    }

    if (!priceData) return;

    if (user && user.dispatchCash < priceData.total) {
      alert('Insufficient Dispatch Cash balance. Please add funds to your wallet.');
      return;
    }

    // Save trip data to pass to select driver page
    const tripData = {
      pickupLocation,
      dropoffLocation,
      seats,
      distance,
      price: priceData.total,
      breakdown: priceData.breakdown,
    };
    localStorage.setItem('pendingTrip', JSON.stringify(tripData));
    navigate('/passenger/select-driver');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/passenger/dashboard')}
            className="text-white flex items-center gap-2 hover:opacity-80"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-white text-xl">Dispatch</h1>
          <button
            onClick={() => navigate('/passenger/profile')}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
          >
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <MapPin className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Map */}
        <div className="bg-white rounded-3xl overflow-hidden mb-4 h-64">
          <MapContainer
            center={[-17.8252, 31.0335]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[-17.8252, 31.0335]}>
              <Popup>Your location</Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* Trip Details */}
        <div className="bg-white rounded-3xl p-6">
          <h2 className="text-xl mb-4">Request a Ride</h2>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm mb-2 text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                Pickup Location
              </label>
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="Enter pickup location"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                Dropoff Location
              </label>
              <input
                type="text"
                value={dropoffLocation}
                onChange={(e) => setDropoffLocation(e.target.value)}
                placeholder="Enter dropoff location"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" />
                Number of Seats
              </label>
              <select
                value={seats}
                onChange={(e) => setSeats(parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'seat' : 'seats'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {priceData && (
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm opacity-90">Estimated Trip Price</span>
                <button
                  onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                  className="text-xs underline opacity-90 hover:opacity-100"
                >
                  {showPriceBreakdown ? 'Hide' : 'Show'} breakdown
                </button>
              </div>
              <p className="text-3xl mb-1">${priceData.total.toFixed(2)}</p>
              <p className="text-xs opacity-80">{distance.toFixed(1)} km</p>

              {showPriceBreakdown && (
                <div className="mt-4 pt-4 border-t border-white/20 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Base Rate:</span>
                    <span>${priceData.breakdown.base.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Distance Cost:</span>
                    <span>${priceData.breakdown.distance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Driver's Cut:</span>
                    <span>${priceData.breakdown.driverCut.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>System Commission:</span>
                    <span>${priceData.breakdown.systemCommission.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleBookRide}
            disabled={!pickupLocation || !dropoffLocation}
            className={`w-full py-3 rounded-xl transition-all ${
              pickupLocation && dropoffLocation
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Book a Ride
          </button>
        </div>
      </div>
    </div>
  );
}