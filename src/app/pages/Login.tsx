import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function Login() {
  const { userType } = useParams<{ userType: 'driver' | 'passenger' | 'admin' }>();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password,   setPassword]   = useState('');
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(identifier, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? 'Invalid credentials');
      return;
    }

    // Role-based redirect — read fresh from localStorage since state may not have updated yet
    const stored = localStorage.getItem('dispatch_user');
    const user   = stored ? JSON.parse(stored) : null;
    if (!user) { setError('Login failed, please try again'); return; }

    if (user.role === 'ADMIN')     navigate('/admin/dashboard');
    else if (user.role === 'DRIVER')    navigate('/driver/dashboard');
    else                                navigate('/passenger/dashboard');
  };

  const label = userType === 'admin' ? 'Admin' : userType === 'driver' ? 'Driver' : 'Passenger';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-white flex items-center gap-2 hover:opacity-80"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl mb-2">Dispatch</h1>
            <p className="text-gray-600">{label} Login</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-2 text-gray-700">Username or Email</label>
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>

          {userType !== 'admin' && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate(`/register/${userType}`)}
                  className="text-blue-600 hover:underline"
                >
                  Register
                </button>
              </p>
            </div>
          )}

          {/* Demo credentials hint */}
          <div className="mt-6 p-3 bg-gray-50 rounded-xl text-xs text-gray-500 space-y-1">
            <p className="font-medium text-gray-600">Demo credentials</p>
            <p>Admin: admin@dispatch.app / Admin@1234</p>
            <p>Passenger: thabo@dispatch.app / Pass@1234</p>
            <p>Driver: rethabile@dispatch.app / Pass@1234</p>
          </div>
        </div>
      </div>
    </div>
  );
}
