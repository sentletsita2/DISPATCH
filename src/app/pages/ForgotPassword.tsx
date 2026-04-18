import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { API } from '../utils/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step,        setStep]        = useState<'email' | 'otp'>('email');
  const [email,       setEmail]       = useState('');
  const [otp,         setOtp]         = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState('');
  const [devOtp,      setDevOtp]      = useState('');

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res  = await fetch(`${API}/auth/forgot-password`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    // devOtp shown in non-production so testers can use it
    if (data.devOtp) setDevOtp(data.devOtp);
    setStep('otp');
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirm) { setError('Passwords do not match'); return; }
    if (newPassword.length < 8)  { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    const res  = await fetch(`${API}/auth/reset-password`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, otp, newPassword }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? 'Reset failed'); return; }
    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button onClick={() => navigate('/')} className="mb-6 text-white flex items-center gap-2 hover:opacity-80">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl mb-2">Dispatch</h1>
            <p className="text-gray-600">Reset Password</p>
          </div>

          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl mb-2">Password Reset!</h3>
              <p className="text-gray-600 mb-6">Your password has been changed successfully.</p>
              <button onClick={() => navigate('/')} className="text-blue-600 hover:underline">Return to login</button>
            </div>
          ) : step === 'email' ? (
            <>
              {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm">{error}</div>}
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Send OTP
                </button>
              </form>
            </>
          ) : (
            <>
              {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm">{error}</div>}
              {devOtp && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
                  <strong>Dev OTP:</strong> {devOtp}
                </div>
              )}
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">OTP Code</label>
                  <input type="text" value={otp} onChange={e => setOtp(e.target.value)}
                    placeholder="6-digit code" maxLength={6}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Confirm Password</label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Reset Password
                </button>
                <button type="button" onClick={() => { setStep('email'); setError(''); }}
                  className="w-full text-sm text-gray-500 hover:underline">
                  ← Back
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
