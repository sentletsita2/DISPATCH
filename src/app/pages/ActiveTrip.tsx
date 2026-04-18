import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { saveTrip } from '../utils/mockData';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ArrowLeft, Navigation, Star, X, MapPin, Car } from 'lucide-react';
import '../utils/leafletIcons';
import 'leaflet/dist/leaflet.css';

// Custom icons
const driverIcon = L.divIcon({
  className: '',
  html: `<div style="background:#6366f1;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const pickupIcon = L.divIcon({
  className: '',
  html: `<div style="background:#22c55e;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const dropoffIcon = L.divIcon({
  className: '',
  html: `<div style="background:#ef4444;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Interpolate between two coords
function lerp(a: [number, number], b: [number, number], t: number): [number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

// Component to keep map view centered on driver
function MapFollowDriver({ pos }: { pos: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.panTo(pos, { animate: true, duration: 0.5 }); }, [pos, map]);
  return null;
}

export default function ActiveTrip() {
  const { userType } = useParams<{ userType: 'driver' | 'passenger' }>();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [tripStatus, setTripStatus] = useState<string>('');
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  // Real-time location simulation
  const HARARE_BASE: [number, number] = [-17.8252, 31.0335];
  const PICKUP: [number, number] = [-17.8252, 31.0335];
  const DROPOFF: [number, number] = [-17.8320, 31.0480];
  // Driver starts ~1km away from pickup
  const DRIVER_START: [number, number] = [-17.8180, 31.0260];

  const [driverPos, setDriverPos] = useState<[number, number]>(DRIVER_START);
  const [routeTrail, setRouteTrail] = useState<[number, number][]>([DRIVER_START]);
  const animFrameRef = useRef<number>(0);
  const progressRef = useRef<number>(0);
  const phaseRef = useRef<'to-pickup' | 'to-dropoff' | 'done'>('to-pickup');

  useEffect(() => {
    const trip = JSON.parse(localStorage.getItem('activeTrip') || '{}');
    if (!trip.tripId) { navigate(`/${userType}/dashboard`); return; }
    setActiveTrip(trip);
    setTripStatus(trip.status || 'waiting-for-pickup');
  }, [userType, navigate]);

  // Animate driver position
  useEffect(() => {
    if (!activeTrip) return;
    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const SPEED_TO_PICKUP = 0.04; // progress/sec (slower = more realistic)
      const SPEED_TO_DROPOFF = 0.025;

      if (phaseRef.current === 'to-pickup' && tripStatus !== 'in-progress') {
        progressRef.current = Math.min(1, progressRef.current + dt * SPEED_TO_PICKUP);
        const newPos = lerp(DRIVER_START, PICKUP, progressRef.current);
        setDriverPos(newPos);
        setRouteTrail(prev => [...prev.slice(-40), newPos]);

        if (progressRef.current >= 1) {
          phaseRef.current = 'to-dropoff';
          progressRef.current = 0;
          // Auto-set ready-for-pickup if driver
          if (userType === 'driver' && tripStatus === 'en-route-to-pickup') {
            setTripStatus('ready-for-pickup');
          }
        }
      } else if (phaseRef.current === 'to-dropoff' && tripStatus === 'in-progress') {
        progressRef.current = Math.min(1, progressRef.current + dt * SPEED_TO_DROPOFF);
        const newPos = lerp(PICKUP, DROPOFF, progressRef.current);
        setDriverPos(newPos);
        setRouteTrail(prev => [...prev.slice(-60), newPos]);
      }

      if (phaseRef.current !== 'done') {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [activeTrip, tripStatus, userType]);

  // Share driver location via localStorage so passenger sees it
  useEffect(() => {
    if (!activeTrip) return;
    localStorage.setItem(`driverLocation_${activeTrip.tripId}`, JSON.stringify(driverPos));
  }, [driverPos, activeTrip]);

  // Passenger: read driver location from localStorage
  useEffect(() => {
    if (userType !== 'passenger' || !activeTrip) return;
    const interval = setInterval(() => {
      const raw = localStorage.getItem(`driverLocation_${activeTrip.tripId}`);
      if (raw) {
        const pos = JSON.parse(raw) as [number, number];
        setDriverPos(pos);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [userType, activeTrip]);

  const isDriver = userType === 'driver';

  const handleReadyForPickup = () => {
    setTripStatus('ready-for-pickup');
    const updated = { ...activeTrip, status: 'ready-for-pickup' };
    setActiveTrip(updated);
    localStorage.setItem('activeTrip', JSON.stringify(updated));
  };

  const handleStartTrip = () => {
    phaseRef.current = 'to-dropoff';
    progressRef.current = 0;
    setTripStatus('in-progress');
    const updated = { ...activeTrip, status: 'in-progress' };
    setActiveTrip(updated);
    localStorage.setItem('activeTrip', JSON.stringify(updated));
  };

  const handleEndTrip = () => {
    phaseRef.current = 'done';
    if (user && !isDriver) updateUser({ dispatchCash: user.dispatchCash - activeTrip.price });
    if (user && isDriver) updateUser({ dispatchCash: user.dispatchCash + activeTrip.price * 0.85 });
    setShowRating(true);
  };

  const handleCancelTrip = () => {
    const msg = tripStatus === 'in-progress'
      ? isDriver ? 'Cancelling will NOT charge the passenger. Continue?' : 'You will be charged for distance covered. Continue?'
      : 'Are you sure you want to cancel this trip?';
    if (!window.confirm(msg)) return;

    let chargedAmount = 0;
    if (tripStatus === 'in-progress' && !isDriver && user) {
      chargedAmount = activeTrip.price * 0.5;
      updateUser({ dispatchCash: user.dispatchCash - chargedAmount });
    }

    saveTrip({
      id: activeTrip.tripId,
      passengerId: activeTrip.passengerId,
      driverId: activeTrip.driverId,
      passengerName: activeTrip.passengerName,
      driverName: activeTrip.driverName,
      pickupLocation: activeTrip.pickupLocation,
      dropoffLocation: activeTrip.dropoffLocation,
      date: new Date().toISOString().split('T')[0],
      price: chargedAmount,
      distance: activeTrip.distance,
      status: 'cancelled',
    });

    localStorage.removeItem('activeTrip');
    localStorage.removeItem(`driverLocation_${activeTrip.tripId}`);
    navigate(`/${userType}/dashboard`);
  };

  const handleSubmitRating = () => {
    saveTrip({
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
      status: 'completed',
      rating: rating > 0 ? rating : undefined,
      review: review || undefined,
    });
    localStorage.removeItem('activeTrip');
    localStorage.removeItem(`driverLocation_${activeTrip.tripId}`);
    navigate(`/${userType}/dashboard`);
  };

  if (!activeTrip) return null;

  const statusLabel: Record<string, string> = {
    'waiting-for-pickup': 'Driver is on the way',
    'en-route-to-pickup': 'Driver is on the way',
    'ready-for-pickup': '🚗 Driver has arrived!',
    'in-progress': 'Trip in progress',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-md mx-auto">
        {!showRating && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-white text-xl font-semibold">Dispatch</h1>
              <button
                onClick={handleCancelTrip}
                className="bg-red-500 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-red-600 text-sm"
              >
                <X className="w-4 h-4" />
                Cancel Trip
              </button>
            </div>

            {/* Live Map */}
            <div className="bg-white rounded-3xl overflow-hidden mb-4 h-72 shadow-lg">
              <MapContainer center={driverPos} zoom={14} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                <MapFollowDriver pos={driverPos} />

                {/* Driver marker */}
                <Marker position={driverPos} icon={driverIcon}>
                  <Popup>🚗 {activeTrip.driverName || 'Driver'}</Popup>
                </Marker>

                {/* Pickup */}
                <Marker position={PICKUP} icon={pickupIcon}>
                  <Popup>📍 Pickup: {activeTrip.pickupLocation}</Popup>
                </Marker>

                {/* Dropoff */}
                <Marker position={DROPOFF} icon={dropoffIcon}>
                  <Popup>🏁 Dropoff: {activeTrip.dropoffLocation}</Popup>
                </Marker>

                {/* Route trail */}
                {routeTrail.length > 1 && (
                  <Polyline positions={routeTrail} color="#6366f1" weight={3} opacity={0.7} dashArray="6 4" />
                )}

                {/* Full route preview */}
                <Polyline positions={[PICKUP, DROPOFF]} color="#94a3b8" weight={2} opacity={0.4} dashArray="4 6" />
              </MapContainer>
            </div>

            {/* Status Banner */}
            <div className={`rounded-2xl p-4 mb-4 flex items-center gap-3 ${
              tripStatus === 'ready-for-pickup' ? 'bg-green-500' : 'bg-white/20 backdrop-blur-sm'
            }`}>
              <Navigation className={`w-5 h-5 ${tripStatus === 'ready-for-pickup' ? 'text-white' : 'text-blue-200'}`} />
              <span className={`font-medium ${tripStatus === 'ready-for-pickup' ? 'text-white' : 'text-white'}`}>
                {statusLabel[tripStatus] || 'Processing...'}
              </span>
            </div>

            {/* Trip Info Card */}
            <div className="bg-white rounded-3xl p-5 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500">{isDriver ? 'Passenger' : 'Driver'}</p>
                  <p className="font-semibold text-gray-800">{isDriver ? activeTrip.passengerName : activeTrip.driverName}</p>
                  {!isDriver && activeTrip.carModel && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Car className="w-3 h-3" /> {activeTrip.carModel} · {activeTrip.carPlate}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Trip Price</p>
                  <p className="text-xl font-bold text-gray-800">${activeTrip.price?.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Pickup</p>
                    <p className="text-gray-700">{activeTrip.pickupLocation}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Dropoff</p>
                    <p className="text-gray-700">{activeTrip.dropoffLocation}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {isDriver && tripStatus === 'en-route-to-pickup' && (
                <button onClick={handleReadyForPickup} className="w-full bg-white text-gray-800 py-4 rounded-2xl hover:shadow-xl transition-all font-medium">
                  I've Arrived – Ready for Pickup
                </button>
              )}

              {tripStatus === 'ready-for-pickup' && (
                <button onClick={handleStartTrip} className="w-full bg-green-500 text-white py-4 rounded-2xl hover:bg-green-600 transition-all font-medium">
                  {isDriver ? 'Start Trip' : 'Confirm – Start Trip'}
                </button>
              )}

              {tripStatus === 'in-progress' && (
                <button onClick={handleEndTrip} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl hover:opacity-90 transition-all font-medium">
                  End Trip & Process Payment
                </button>
              )}
            </div>
          </>
        )}

        {/* Rating Screen */}
        {showRating && (
          <div className="bg-white rounded-3xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h2 className="text-2xl font-bold">Trip Complete!</h2>
              <p className="text-gray-500 mt-1">${activeTrip.price?.toFixed(2)} {isDriver ? 'earned' : 'paid'}</p>
            </div>

            <h3 className="text-lg font-medium text-center mb-4">
              Rate Your {isDriver ? 'Passenger' : 'Driver'}
            </h3>

            <div className="flex justify-center gap-3 mb-6">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setRating(star)} className="transform transition-transform hover:scale-110">
                  <Star className={`w-10 h-10 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>

            <textarea
              value={review}
              onChange={e => setReview(e.target.value)}
              placeholder="Leave a review (optional)"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 text-sm"
              rows={3}
            />

            <button
              onClick={handleSubmitRating}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              {rating > 0 ? 'Submit Rating & Exit' : 'Skip & Exit'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
