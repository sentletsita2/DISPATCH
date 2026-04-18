import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { API, authHeaders } from '../utils/api';
import { ArrowLeft, Camera, User, Loader2 } from 'lucide-react';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, token, refreshUser, updateLocalUser } = useAuth();

  const [fullName,  setFullName]  = useState(user?.fullName ?? '');
  const [phone,     setPhone]     = useState(user?.phone    ?? '');
  // Driver vehicle fields
  const [vehicleMake,  setVehicleMake]  = useState(user?.driverProfile?.vehicleMake  ?? '');
  const [vehicleModel, setVehicleModel] = useState(user?.driverProfile?.vehicleModel ?? '');
  const [vehiclePlate, setVehiclePlate] = useState(user?.driverProfile?.vehiclePlate ?? '');
  const [vehicleColor, setVehicleColor] = useState(user?.driverProfile?.vehicleColor ?? '');

  const [saving,        setSaving]        = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error,         setError]         = useState('');

  const isDriver = user?.role === 'DRIVER';
  const backPath = isDriver ? '/driver/dashboard' : '/passenger/dashboard';

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploadingAvatar(true);
    const form = new FormData();
    form.append('avatar', file);
    const res = await fetch(`${API}/users/avatar`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}` },
      body:    form,
    });
    setUploadingAvatar(false);
    if (res.ok) {
      const data = await res.json();
      updateLocalUser({ avatarUrl: data.avatarUrl });
    }
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setError('');
    const body: Record<string, string> = { fullName, phone };
    if (isDriver) { Object.assign(body, { vehicleMake, vehicleModel, vehiclePlate, vehicleColor }); }
    const res  = await fetch(`${API}/users/profile`, {
      method:  'PATCH',
      headers: authHeaders(token),
      body:    JSON.stringify(body),
    });
    setSaving(false);
    if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Failed to save'); return; }
    await refreshUser();
    navigate(backPath);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-md mx-auto">
        <button onClick={() => navigate(backPath)} className="mb-6 text-white flex items-center gap-2 hover:opacity-80">
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl p-6">
          <h2 className="text-2xl mb-6">Edit Profile</h2>

          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {user.avatarUrl
                  ? <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                  : <User className="w-12 h-12 text-gray-400" />}
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600">
                {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" disabled={uploadingAvatar} />
              </label>
            </div>
            <p className="text-sm text-gray-600 mt-2">Tap camera to change photo</p>
          </div>

          {error && <p className="text-red-600 text-sm mb-4 bg-red-50 p-2 rounded-lg">{error}</p>}

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm mb-2 text-gray-700">Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-700">Phone Number</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {isDriver && (
              <>
                <p className="text-sm font-medium text-gray-700 border-t pt-3">Vehicle Details</p>
                {[
                  { label: 'Make',   val: vehicleMake,  set: setVehicleMake  },
                  { label: 'Model',  val: vehicleModel, set: setVehicleModel },
                  { label: 'Plate',  val: vehiclePlate, set: setVehiclePlate },
                  { label: 'Colour', val: vehicleColor, set: setVehicleColor },
                ].map(({ label, val, set }) => (
                  <div key={label}>
                    <label className="block text-sm mb-2 text-gray-700">{label}</label>
                    <input type="text" value={val} onChange={e => set(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                ))}
              </>
            )}

            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between"><span className="text-sm text-gray-600">User ID</span><span className="text-sm">{user.userId}</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-600">Email</span><span className="text-sm">{user.email}</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-600">Rating</span><span className="text-sm">⭐ {user.rating.toFixed(1)}</span></div>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
