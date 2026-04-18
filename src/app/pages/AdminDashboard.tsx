import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Users, FileText, Car, CheckCircle, XCircle,
  Clock, LogOut, BarChart3, Shield, Eye, AlertCircle,
  Download, RefreshCw,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function authHeaders() {
  const token = localStorage.getItem('accessToken');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

interface Doc {
  id: string;
  docType: string;
  fileUrl: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  uploadedAt: string;
  reviewNote?: string;
  driverProfile: {
    user: { fullName: string; userId: string; email: string };
  };
}

interface Stats {
  passengers: number;
  drivers: number;
  totalTrips: number;
  completedTrips: number;
  totalCommission: number;
}

type TabType = 'overview' | 'documents' | 'users' | 'trips' | 'reports';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingDocs, setPendingDocs] = useState<Doc[]>([]);
  const [allDocs, setAllDocs] = useState<Doc[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allTrips, setAllTrips] = useState<any[]>([]);
  const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [reports, setReports] = useState<Record<string, any>>({});

  const token = localStorage.getItem('accessToken');

  const fetchAll = useCallback(async () => {
    if (!token) { navigate('/admin/login'); return; }
    setLoading(true);
    try {
      const [statsRes, docsRes, allDocsRes, usersRes, tripsRes] = await Promise.all([
        fetch(`${API}/admin/stats`,             { headers: authHeaders() }),
        fetch(`${API}/admin/documents/pending`, { headers: authHeaders() }),
        fetch(`${API}/admin/documents/all`,     { headers: authHeaders() }),
        fetch(`${API}/admin/users`,             { headers: authHeaders() }),
        fetch(`${API}/admin/trips`,             { headers: authHeaders() }),
      ]);

      if (statsRes.status === 401 || statsRes.status === 403) {
        navigate('/admin/login'); return;
      }

      setStats(await statsRes.json());
      setPendingDocs(await docsRes.json());
      setAllDocs(await allDocsRes.json());
      const userData = await usersRes.json();
      setAllUsers(userData.users ?? []);
      setAllTrips(await tripsRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleVerify = async (doc: Doc, status: 'VERIFIED' | 'REJECTED') => {
    setActionLoading(true);
    try {
      await fetch(`${API}/admin/documents/${doc.id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status, reviewNote }),
      });
      setPreviewDoc(null);
      setReviewNote('');
      await fetchAll();
    } finally {
      setActionLoading(false);
    }
  };

  const fetchReport = async (key: string) => {
    const res = await fetch(`${API}/admin/reports/${key}`, { headers: authHeaders() });
    const data = await res.json();
    setReports(prev => ({ ...prev, [key]: data }));
  };

  const downloadReport = (key: string) => {
    const data = reports[key];
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dispatch-${key}-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/');
  };

  const isPdf = (url: string) => url.startsWith('data:application/pdf');

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      VERIFIED: 'bg-green-100 text-green-700',
      PENDING:  'bg-yellow-100 text-yellow-700',
      REJECTED: 'bg-red-100 text-red-700',
      COMPLETED:'bg-green-100 text-green-700',
      CANCELLED:'bg-red-100 text-red-700',
      REQUESTED:'bg-blue-100 text-blue-700',
      IN_PROGRESS:'bg-blue-100 text-blue-700',
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${map[s] ?? 'bg-gray-100 text-gray-600'}`;
  };

  const REPORTS = [
    { key: 'trip-summary',        label: 'Trip Summary',           desc: 'All trips with passenger, driver & price breakdown' },
    { key: 'driver-earnings',     label: 'Driver Earnings',        desc: 'Per-driver earnings, trips completed, wallet balance' },
    { key: 'passenger-activity',  label: 'Passenger Activity',     desc: 'Spend, trip count, drivers used per passenger' },
    { key: 'revenue',             label: 'Revenue & Commission',   desc: 'Daily revenue, system commission, top earning drivers' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-7 h-7 text-yellow-400" />
          <div>
            <h1 className="text-lg font-semibold">Dispatch Admin</h1>
            <p className="text-xs text-gray-400">Control Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchAll} className="text-gray-400 hover:text-white">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1 text-gray-400 hover:text-white text-sm">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {/* Pending docs alert */}
      {pendingDocs.length > 0 && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <span className="text-sm text-yellow-800">
            <strong>{pendingDocs.length}</strong> document{pendingDocs.length > 1 ? 's' : ''} pending verification
          </span>
          <button onClick={() => setActiveTab('documents')} className="ml-auto text-xs text-yellow-700 underline">
            Review now
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-1 max-w-5xl mx-auto overflow-x-auto">
          {([
            { id: 'overview', label: 'Overview',    icon: BarChart3 },
            { id: 'documents',label: `Documents${pendingDocs.length > 0 ? ` (${pendingDocs.length})` : ''}`, icon: FileText },
            { id: 'users',    label: 'Users',        icon: Users },
            { id: 'trips',    label: 'Trips',        icon: Car },
            { id: 'reports',  label: 'Reports',      icon: Download },
          ] as { id: TabType; label: string; icon: any }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-3 border-b-2 whitespace-nowrap text-sm transition-colors ${
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

        {/* OVERVIEW */}
        {activeTab === 'overview' && stats && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Platform Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Passengers',   value: stats.passengers,    color: 'bg-blue-100 text-blue-600',   icon: Users },
                { label: 'Drivers',      value: stats.drivers,       color: 'bg-purple-100 text-purple-600', icon: Car },
                { label: 'Total Trips',  value: stats.totalTrips,    color: 'bg-orange-100 text-orange-600', icon: BarChart3 },
                { label: 'Completed',    value: stats.completedTrips,color: 'bg-green-100 text-green-600', icon: CheckCircle },
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
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-medium text-gray-700 mb-3">System Commission (20% of all completed trips)</h3>
              <p className="text-3xl font-bold text-green-600">
                LSL {Number(stats.totalCommission).toFixed(2)}
              </p>
              <p className="text-sm text-gray-400 mt-1">from {stats.completedTrips} completed trips</p>
            </div>
          </div>
        )}

        {/* DOCUMENTS */}
        {activeTab === 'documents' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Document Verification</h2>

            {/* Pending */}
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Pending Review</h3>
            {pendingDocs.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center shadow-sm mb-6">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                <p className="text-gray-500">No pending documents</p>
              </div>
            ) : (
              <div className="space-y-3 mb-8">
                {pendingDocs.map(doc => (
                  <div key={doc.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
                    <div className="bg-yellow-100 p-3 rounded-xl flex-shrink-0">
                      <FileText className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800">{doc.driverProfile.user.fullName}</p>
                      <p className="text-sm text-gray-500">{doc.docType.replace(/_/g,' ')}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-400">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setPreviewDoc(doc); setReviewNote(''); }}
                      className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-100 text-sm flex-shrink-0"
                    >
                      <Eye className="w-4 h-4" /> Review
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* All docs history */}
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">All Documents</h3>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Driver</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Document</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Uploaded</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allDocs.map(doc => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{doc.driverProfile.user.fullName}</p>
                        <p className="text-xs text-gray-400">{doc.driverProfile.user.userId}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{doc.docType}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3"><span className={statusBadge(doc.status)}>{doc.status}</span></td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => { setPreviewDoc(doc); setReviewNote(doc.reviewNote ?? ''); }}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USERS */}
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
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">Wallet (LSL)</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allUsers.map((u, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-800">{u.fullName}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-500 font-mono text-xs">{u.userId}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.role === 'DRIVER' ? 'bg-purple-100 text-purple-700' :
                          u.role === 'ADMIN'  ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>{u.role}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-700">⭐ {Number(u.rating).toFixed(1)}</td>
                      <td className="px-5 py-3 text-gray-700">{Number(u.wallet?.balance ?? 0).toFixed(2)}</td>
                      <td className="px-5 py-3">
                        {u.role === 'DRIVER' ? (
                          <span className={statusBadge(u.driverProfile?.isVerified ? 'VERIFIED' : 'PENDING')}>
                            {u.driverProfile?.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">Active</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {allUsers.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">No users yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TRIPS */}
        {activeTab === 'trips' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">All Trips</h2>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">Route</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">Passenger</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">Driver</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">Price (LSL)</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">Commission</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allTrips.map((t: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <p className="text-xs text-gray-700">{t.pickupAddress}</p>
                        <p className="text-xs text-gray-400">→ {t.dropoffAddress}</p>
                        <p className="text-xs text-gray-300 mt-0.5">{t.distanceKm ? `${t.distanceKm} km` : '—'}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-700">{t.passenger?.fullName}</td>
                      <td className="px-5 py-3 text-gray-700">{t.driver?.fullName ?? '—'}</td>
                      <td className="px-5 py-3 font-medium text-gray-800">{t.totalPrice ? Number(t.totalPrice).toFixed(2) : '—'}</td>
                      <td className="px-5 py-3 text-green-600">{t.systemCommission ? Number(t.systemCommission).toFixed(2) : '—'}</td>
                      <td className="px-5 py-3"><span className={statusBadge(t.status)}>{t.status}</span></td>
                    </tr>
                  ))}
                  {allTrips.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">No trips yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORTS */}
        {activeTab === 'reports' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Reports</h2>
            <p className="text-sm text-gray-500 mb-6">Generate and download system reports. All reports draw from multiple database tables.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {REPORTS.map(r => (
                <div key={r.key} className="bg-white rounded-2xl p-5 shadow-sm">
                  <h3 className="font-medium text-gray-800 mb-1">{r.label}</h3>
                  <p className="text-xs text-gray-500 mb-4">{r.desc}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchReport(r.key)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-xl hover:bg-blue-100 text-sm"
                    >
                      <BarChart3 className="w-4 h-4" /> Generate
                    </button>
                    {reports[r.key] && (
                      <button
                        onClick={() => downloadReport(r.key)}
                        className="flex items-center gap-2 bg-green-50 text-green-600 px-3 py-2 rounded-xl hover:bg-green-100 text-sm"
                      >
                        <Download className="w-4 h-4" /> Download
                      </button>
                    )}
                  </div>
                  {reports[r.key] && (
                    <div className="mt-3 bg-gray-50 rounded-xl p-3 text-xs text-gray-600">
                      <p className="font-medium mb-1">Generated {new Date(reports[r.key].generatedAt).toLocaleTimeString()}</p>
                      {reports[r.key].totalRecords !== undefined && <p>Records: {reports[r.key].totalRecords}</p>}
                      {reports[r.key].totalDrivers !== undefined && <p>Drivers: {reports[r.key].totalDrivers}</p>}
                      {reports[r.key].totalPassengers !== undefined && <p>Passengers: {reports[r.key].totalPassengers}</p>}
                      {reports[r.key].totals && (
                        <>
                          <p>Trips: {reports[r.key].totals.tripCount}</p>
                          <p>Gross revenue: LSL {reports[r.key].totals.grossRevenueLSL}</p>
                          <p>Commission (20%): LSL {reports[r.key].totals.commissionLSL}</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Document Review Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-1">{previewDoc.docType.replace(/_/g,' ')}</h3>
            <p className="text-sm text-gray-500 mb-4">
              Submitted by <strong>{previewDoc.driverProfile.user.fullName}</strong>
              <span className="ml-2 font-mono text-xs text-gray-400">{previewDoc.driverProfile.user.userId}</span>
            </p>

            {/* Document preview — works because fileUrl IS the base64 data URL */}
            {previewDoc.fileUrl ? (
              isPdf(previewDoc.fileUrl) ? (
                <div className="mb-4 bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
                  <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">PDF document</p>
                  <a
                    href={previewDoc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 text-sm underline"
                  >
                    Open PDF in new tab
                  </a>
                </div>
              ) : (
                <div className="mb-4 rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src={previewDoc.fileUrl}
                    alt={previewDoc.docType}
                    className="w-full object-contain max-h-64"
                  />
                </div>
              )
            ) : (
              <div className="mb-4 bg-gray-100 rounded-xl h-32 flex items-center justify-center">
                <p className="text-gray-400 text-sm">No file attached</p>
              </div>
            )}

            <div className="mb-4">
              <span className={`${statusBadge(previewDoc.status)} mb-3 inline-block`}>{previewDoc.status}</span>
              <label className="block text-sm mb-2 text-gray-700">Review note (shown to driver if rejected)</label>
              <textarea
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
                placeholder="e.g. Document is blurry, please re-upload..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setPreviewDoc(null); setReviewNote(''); }}
                className="flex-1 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerify(previewDoc, 'REJECTED')}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
              <button
                onClick={() => handleVerify(previewDoc, 'VERIFIED')}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-xl bg-green-500 text-white hover:bg-green-600 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" /> Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
