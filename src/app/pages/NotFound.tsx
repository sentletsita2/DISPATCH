import React from 'react';
import { useNavigate } from 'react-router';
import { Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl text-white mb-4">404</h1>
        <h2 className="text-3xl text-white mb-6">Page Not Found</h2>
        <button
          onClick={() => navigate('/')}
          className="bg-white text-gray-800 px-6 py-3 rounded-xl hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
        >
          <Home className="w-5 h-5" />
          Go Home
        </button>
      </div>
    </div>
  );
}
