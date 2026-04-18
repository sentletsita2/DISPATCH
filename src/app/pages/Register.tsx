import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function Register() {
  const { userType } = useParams<{ userType: 'driver' | 'passenger' }>();
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    fullName:        '',
    username:        '',
    dob:             '',
    idNumber:        '',
    email:           '',
    phone:           '',
    password:        '',
    confirmPassword: '',
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!userType) return;

    setLoading(true);
    const result = await register({
      fullName: form.fullName,
      username: form.username,
      email:    form.email,
      phone:    form.phone,
      password: form.password,
      dob:      form.dob,
      idNumber: form.idNumber,
      role:     userType.toUpperCase() as 'DRIVER' | 'PASSENGER',
    });
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? 'Registration failed');
      return;
    }

    navigate(userType === 'driver' ? '/driver/dashboard' : '/passenger/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate(`/login/${userType}`)}
          className="mb-6 text-white flex items-center gap-2 hover:opacity-80"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Login
        </button>

        <div className="bg-white rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl mb-2">Dispatch</h1>
            <p className="text-gray-600 capitalize">{userType} Registration</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name',     name: 'fullName',  type: 'text',     placeholder: 'e.g. Thabo Mokoena'    },
              { label: 'Username',      name: 'username',  type: 'text',     placeholder: 'e.g. thabo_m'          },
              { label: 'Date of Birth', name: 'dob',       type: 'date',     placeholder: ''                      },
              { label: 'ID Number',     name: 'idNumber',  type: 'text',     placeholder: 'National ID number'    },
              { label: 'Email',         name: 'email',     type: 'email',    placeholder: 'your@email.com'        },
              { label: 'Phone Number',  name: 'phone',     type: 'tel',      placeholder: '+266 5800 0001'        },
              { label: 'Password',      name: 'password',  type: 'password', placeholder: 'At least 8 characters' },
              { label: 'Confirm Password', name: 'confirmPassword', type: 'password', placeholder: 'Repeat password' },
            ].map(({ label, name, type, placeholder }) => (
              <div key={name}>
                <label className="block text-sm mb-2 text-gray-700">{label}</label>
                <input
                  type={type}
                  name={name}
                  value={(form as any)[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Registering…' : 'Register'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
