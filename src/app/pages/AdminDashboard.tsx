import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import {
  Users, FileText, Car, DollarSign, CheckCircle, XCircle,
  Clock, LogOut, BarChart3, Shield, ChevronRight, Eye, AlertCircle
} from 'lucide-react';

interface PendingDocument {
  driverId: string;
  driverName: string;
  driverUserId: string;
  docType: string;
  fileUrl: string;
  uploadedAt: string;
  docIndex: number; // index inside that driver's docs array in localStorage
}

interface AdminStats {
  totalPassengers: number;
  totalDrivers: number;
  verifiedDrivers: number;
  pendingDocs: number;
  totalTrips: number;
  completedTrips: number;
  totalCommission: number;
}

type TabType = 'overview' | 'documents' | 'users' | 'trips';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<AdminStats>({
    totalPassengers: 0, totalDrivers: 0, verifiedDrivers: 0,
    pendingDocs: 0, totalTrips: 0, completedTrips: 0, totalCommission: 0,
  });
  const [pendingDocs, setPendingDocs] = useState<PendingDocument[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allTrips, setAllTrips] = useState<any[]>([]);
  const [previewDoc, setPreviewDoc] = useState<PendingDocument | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  const loadData = () => {
    const users: any[] = JSON.parse(localStorage.getItem('users') || '[]');
    const trips: any[] = JSON.parse(localStorage.getItem('trips') || '[]');
    const driverDocs: Record<string, any[]> = JSON.parse(localStorage.getItem('driverDocuments') || '{}');

    const passengers = users.filter(u => u.userType === 'passenger');
    const drivers = users.filter(u => u.userType === 'driver');
    const verifiedDrivers = drivers.filter(u => u.documentsVerified);

    // Flatten pending docs
    const pending: PendingDocument[] = [];
    Object.entries(driverDocs).forEach(([driverId, docs]) => {
      const driver = users.find(u => u.id === driverId);
      if (!driver) return;
      docs.forEach((doc, idx) => {
        if (doc.status === 'pending') {
          pending.push({
            driverId,
            driverName: driver.fullName,
            driverUserId: driver.id,
            docType: doc.name,
            fileUrl: doc.file || '',
            uploadedAt: doc.uploadedAt || new Date().toISOString(),
            docIndex: idx,
          });
        }
      });
    });

    const completedTrips = trips.filter((t: any) => t.status === 'completed');
    const totalCommission = completedTrips.reduce((sum: number, t: any) => sum + (t.price * 0.15), 0);

    setStats({
      totalPassengers: passengers.length,
      totalDrivers: drivers.length,
      verifiedDrivers: verifiedDrivers.length,
      pendingDocs: pending.length,
      totalTrips: trips.length,
      completedTrips: completedTrips.length,
      totalCommission,
    });
    setPendingDocs(pending);
    setAllUsers(users);
    setAllTrips(trips);
  };

  useEffect(() => {
    if (!user || user.userType !== 'admin') {
      navigate('/');
      return;
    }
    loadData();
  }, [user, navigate]);

  const handleVerifyDoc = (doc: PendingDocument, action: 'verified' | 'rejected') => {
    const driverDocs: Record<string, any[]> = JSON.parse(localStorage.getItem('driverDocuments') || '{}');
    const docs = driverDocs[doc.driverId] || [];
    docs[doc.docIndex] = { ...docs[doc.docIndex], status: action, reviewNote, reviewedAt: new Date().toISOString() };
    driverDocs[doc.driverId] = docs;
    localStorage.setItem('driverDocuments', JSON.stringify(driverDocs));

    // Check if all 3 docs are verified for this driver
    const allVerified = docs.length >= 3 && docs.every((d: any) => d.status === 'verified');
    if (allVerified) {
      const users: any[] = JSON.parse(localStorage.getItem('users') || '[]');
      const idx = users.findIndex((u: any) => u.id === doc.driverId);
      if (idx !== -1) {
        users[idx].documentsVerified = true;
        localStorage.setItem('users', JSON.stringify(users));
        // Update current user session if it's this driver
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (currentUser && currentUser.id === doc.driverId) {
          localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, documentsVerified: true }));
        }
      }
    }

    setPreviewDoc(null);
    setReviewNote('');
    loadData();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user || user.userType !== 'admin') return null;

  const docTypeLabel: Record<string, string> = {
    "Driver's License": "Driver's License",
    "Driver's Permit": "Driver's Permit",
    "Vehicle Registration": "Vehicle Registration",
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-yellow-400" />
          <div>
            <h1 className="text-xl font-semibold">Dispatch Admin</h1>
            <p className="text-xs text-gray-400">Control Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300">{user.fullName}</span>
          <button onClick={handleLogout} className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Pending docs alert */}
      {stats.pendingDocs > 0 && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <span className="text-sm text-yellow-800">
            <strong>{stats.pendingDocs}</strong> driver document{stats.pendingDocs > 1 ? 's' : ''} pending verification
          </span>
          <button
            onClick={() => setActiveTab('documents')}
            className="ml-auto text-xs text-yellow-700 underline hover:text-yellow-900"
          >
            Review now
          </button>
        </div>
      )}

      {/* Tab Nav */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-6 max-w-5xl mx-auto">
          {([
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'documents', label: `Documents${stats.pendingDocs > 0 ? ` (${stats.pendingDocs})` : ''}`, icon: FileText },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'trips', label: 'Trips', icon: Car },
          ] as { id: TabType; label: string; icon: any }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 border-b-2 transition-colors text-sm ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Platform Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Passengers', value: stats.totalPassengers, icon: Users, color: 'bg-blue-100 text-blue-600' },
                { label: 'Drivers', value: stats.totalDrivers, icon: Car, color: 'bg-purple-100 text-purple-600' },
                { label: 'Verified Drivers', value: stats.verifiedDrivers, icon: CheckCircle, color: 'bg-green-100 text-green-600' },
                { label: 'Total Trips', value: stats.totalTrips, icon: BarChart3, color: 'bg-orange-100 text-orange-600' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-medium text-gray-700 mb-4">Trip Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Trips</span>
                    <span className="font-medium">{stats.totalTrips}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="font-medium text-green-600">{stats.completedTrips}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cancelled</span>
                    <span className="font-medium text-red-500">{stats.totalTrips - stats.completedTrips}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-medium text-gray-700 mb-4">Revenue</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">System Commission (15%)</span>
                    <span className="font-medium text-green-600">${stats.totalCommission.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">From</span>
                    <span className="font-medium">{stats.completedTrips} trips</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Document Verification</h2>
            {pendingDocs.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
                <p className="text-gray-600 text-lg">All documents reviewed</p>
                <p className="text-gray-400 text-sm mt-1">No pending verifications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingDocs.map((doc, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-yellow-100 p-3 rounded-xl">
                        <FileText className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{doc.driverName}</p>
                        <p className="text-sm text-gray-500">{docTypeLabel[doc.docType] || doc.docType}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-400">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => { setPreviewDoc(doc); setReviewNote(''); }}
                      className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Review
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">All Users</h2>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">User</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">ID</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">Role</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">Rating</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allUsers.filter(u => u.userType !== 'admin').map((u, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-800">{u.fullName}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-600 font-mono text-xs">{u.id}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          u.userType === 'driver'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {u.userType}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-700">⭐ {u.rating?.toFixed(1) ?? '5.0'}</td>
                      <td className="px-5 py-3">
                        {u.userType === 'driver' ? (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            u.documentsVerified
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {u.documentsVerified ? 'Verified' : 'Unverified'}
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">Active</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {allUsers.filter(u => u.userType !== 'admin').length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-gray-400">No users registered yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TRIPS TAB */}
        {activeTab === 'trips' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">All Trips</h2>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">Trip</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">Passenger</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">Driver</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">Price</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allTrips.map((trip, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <p className="text-xs text-gray-500">{trip.pickupLocation}</p>
                        <p className="text-xs text-gray-400">→ {trip.dropoffLocation}</p>
                        <p className="text-xs text-gray-400 mt-1">{trip.date}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-700">{trip.passengerName}</td>
                      <td className="px-5 py-3 text-gray-700">{trip.driverName}</td>
                      <td className="px-5 py-3 font-medium">${trip.price?.toFixed(2)}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          trip.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : trip.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {trip.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {allTrips.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-gray-400">No trips yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Document Review Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-1">{previewDoc.docType}</h3>
            <p className="text-sm text-gray-500 mb-4">Submitted by <strong>{previewDoc.driverName}</strong></p>

            {previewDoc.fileUrl ? (
              <div className="mb-4 rounded-xl overflow-hidden border border-gray-200">
                <img
                  src={previewDoc.fileUrl}
                  alt={previewDoc.docType}
                  className="w-full object-contain max-h-64"
                />
              </div>
            ) : (
              <div className="mb-4 bg-gray-100 rounded-xl h-40 flex items-center justify-center">
                <p className="text-gray-400 text-sm">No file preview available</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm mb-2 text-gray-700">Review note (optional)</label>
              <textarea
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
                placeholder="Add a note for the driver..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setPreviewDoc(null); setReviewNote(''); }}
                className="flex-1 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerifyDoc(previewDoc, 'rejected')}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={() => handleVerifyDoc(previewDoc, 'verified')}
                className="flex-1 py-3 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
