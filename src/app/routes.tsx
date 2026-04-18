import { createBrowserRouter } from 'react-router';
import UserSelection from './pages/UserSelection';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import PassengerDashboard from './pages/PassengerDashboard';
import DriverDashboard from './pages/DriverDashboard';
import WalletPage from './pages/WalletPage';
import ActivityPage from './pages/ActivityPage';
import PersonalStatsPage from './pages/PersonalStatsPage';
import DocumentsPage from './pages/DocumentsPage';
import EditProfile from './pages/EditProfile';
import TripPage from './pages/TripPage';
import SelectDriver from './pages/SelectDriver';
import SelectPassenger from './pages/SelectPassenger';
import ActiveTrip from './pages/ActiveTrip';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <UserSelection />,
  },
  {
    path: '/login/:userType',
    element: <Login />,
  },
  {
    path: '/register/:userType',
    element: <Register />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/passenger/dashboard',
    element: <PassengerDashboard />,
  },
  {
    path: '/passenger/wallet',
    element: <WalletPage />,
  },
  {
    path: '/passenger/activity',
    element: <ActivityPage />,
  },
  {
    path: '/passenger/stats',
    element: <PersonalStatsPage />,
  },
  {
    path: '/passenger/profile',
    element: <EditProfile />,
  },
  {
    path: '/passenger/trip',
    element: <TripPage />,
  },
  {
    path: '/passenger/select-driver',
    element: <SelectDriver />,
  },
  {
    path: '/passenger/active-trip',
    element: <ActiveTrip />,
  },
  {
    path: '/driver/dashboard',
    element: <DriverDashboard />,
  },
  {
    path: '/driver/wallet',
    element: <WalletPage />,
  },
  {
    path: '/driver/activity',
    element: <ActivityPage />,
  },
  {
    path: '/driver/stats',
    element: <PersonalStatsPage />,
  },
  {
    path: '/driver/documents',
    element: <DocumentsPage />,
  },
  {
    path: '/driver/profile',
    element: <EditProfile />,
  },
  {
    path: '/driver/find-passengers',
    element: <SelectPassenger />,
  },
  {
    path: '/driver/active-trip',
    element: <ActiveTrip />,
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin/dashboard',
    element: <AdminDashboard />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
