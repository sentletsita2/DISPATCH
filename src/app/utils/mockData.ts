export interface Driver {
  id: string;
  fullName: string;
  rating: number;
  carModel: string;
  carPlate: string;
  distance: number;
  location: { lat: number; lng: number };
  reviews: Array<{ rating: number; comment: string; date: string }>;
}

export interface Passenger {
  id: string;
  fullName: string;
  rating: number;
  pickupLocation: string;
  dropoffLocation: string;
  tripPrice: number;
  distance: number;
  location: { lat: number; lng: number };
  reviews: Array<{ rating: number; comment: string; date: string }>;
  seats: number;
}

export interface Trip {
  id: string;
  passengerId: string;
  driverId: string;
  passengerName: string;
  driverName: string;
  pickupLocation: string;
  dropoffLocation: string;
  date: string;
  price: number;
  distance: number;
  status: 'completed' | 'cancelled' | 'in-progress';
  rating?: number;
  review?: string;
}

export const mockDrivers: Driver[] = [
  {
    id: 'd202612345',
    fullName: 'John Smith',
    rating: 4.8,
    carModel: 'Toyota Corolla',
    carPlate: 'ABC 1234',
    distance: 0.5,
    location: { lat: -17.8252, lng: 31.0335 },
    reviews: [
      { rating: 5, comment: 'Great driver, very professional', date: '2026-04-10' },
      { rating: 4, comment: 'Good service', date: '2026-04-08' },
    ],
  },
  {
    id: 'd202612346',
    fullName: 'Mary Johnson',
    rating: 4.9,
    carModel: 'Honda Civic',
    carPlate: 'XYZ 5678',
    distance: 1.2,
    location: { lat: -17.8260, lng: 31.0340 },
    reviews: [
      { rating: 5, comment: 'Excellent driver!', date: '2026-04-12' },
    ],
  },
  {
    id: 'd202612347',
    fullName: 'David Brown',
    rating: 4.6,
    carModel: 'Nissan Altima',
    carPlate: 'DEF 9012',
    distance: 2.0,
    location: { lat: -17.8270, lng: 31.0350 },
    reviews: [
      { rating: 5, comment: 'Very friendly and safe driver', date: '2026-04-11' },
      { rating: 4, comment: 'On time pickup', date: '2026-04-09' },
    ],
  },
];

export const mockPassengers: Passenger[] = [
  {
    id: 'p202612345',
    fullName: 'Sarah Wilson',
    rating: 4.7,
    pickupLocation: '123 Main Street, Harare',
    dropoffLocation: '456 Park Avenue, Harare',
    tripPrice: 12.50,
    distance: 5.2,
    location: { lat: -17.8290, lng: 31.0360 },
    reviews: [
      { rating: 5, comment: 'Polite passenger', date: '2026-04-10' },
    ],
    seats: 1,
  },
  {
    id: 'p202612346',
    fullName: 'Michael Davis',
    rating: 4.9,
    pickupLocation: '789 Oak Road, Harare',
    dropoffLocation: '321 Elm Street, Harare',
    tripPrice: 18.75,
    distance: 7.8,
    location: { lat: -17.8300, lng: 31.0370 },
    reviews: [
      { rating: 5, comment: 'Great passenger!', date: '2026-04-12' },
    ],
    seats: 2,
  },
];

export const calculateTripPrice = (
  distance: number,
  seats: number = 1,
  fuelPricePerKm: number = 0.8,
  baseRate: number = 2.0
): { total: number; breakdown: { base: number; distance: number; driverCut: number; systemCommission: number } } => {
  const distanceCost = distance * fuelPricePerKm * seats;
  const subtotal = baseRate + distanceCost;
  const systemCommission = subtotal * 0.15; // 15% commission
  const driverCut = subtotal * 0.85; // 85% goes to driver
  const total = subtotal + systemCommission;

  return {
    total: parseFloat(total.toFixed(2)),
    breakdown: {
      base: parseFloat(baseRate.toFixed(2)),
      distance: parseFloat(distanceCost.toFixed(2)),
      driverCut: parseFloat(driverCut.toFixed(2)),
      systemCommission: parseFloat(systemCommission.toFixed(2)),
    },
  };
};

export const getStoredTrips = (userId: string, userType: 'driver' | 'passenger'): Trip[] => {
  const trips = JSON.parse(localStorage.getItem('trips') || '[]');
  return trips.filter((trip: Trip) => 
    userType === 'driver' ? trip.driverId === userId : trip.passengerId === userId
  );
};

export const saveTrip = (trip: Trip) => {
  const trips = JSON.parse(localStorage.getItem('trips') || '[]');
  trips.push(trip);
  localStorage.setItem('trips', JSON.stringify(trips));
};
