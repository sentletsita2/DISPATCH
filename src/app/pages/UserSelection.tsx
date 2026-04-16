import React from 'react';
import { useNavigate } from 'react-router';
import { Car, User, Info } from 'lucide-react';

export default function UserSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl mb-4 text-white">Dispatch</h1>
        <p className="text-xl text-white/90">Choose your role to continue</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-6">
        <button
          onClick={() => navigate('/login/passenger')}
          className="bg-white rounded-3xl p-8 hover:shadow-2xl transition-all transform hover:scale-105 flex flex-col items-center gap-4"
        >
          <div className="bg-blue-100 p-6 rounded-full">
            <User className="w-16 h-16 text-blue-600" />
          </div>
          <h2 className="text-3xl">Passenger</h2>
          <p className="text-gray-600">Request a ride</p>
        </button>

        <button
          onClick={() => navigate('/login/driver')}
          className="bg-white rounded-3xl p-8 hover:shadow-2xl transition-all transform hover:scale-105 flex flex-col items-center gap-4"
        >
          <div className="bg-purple-100 p-6 rounded-full">
            <Car className="w-16 h-16 text-purple-600" />
          </div>
          <h2 className="text-3xl">Driver</h2>
          <p className="text-gray-600">Earn money driving</p>
        </button>
      </div>

      {/* Demo Credentials Info */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 max-w-2xl w-full text-white">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-2">Demo Credentials Available:</p>
            <div className="space-y-1 text-xs">
              <p>Passenger - Username: <strong>passenger1</strong>, Password: <strong>password</strong></p>
              <p>Driver - Username: <strong>driver1</strong>, Password: <strong>password</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}