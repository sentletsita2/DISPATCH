import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { API, authHeaders } from '../utils/api';
import { ArrowLeft, Upload, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';

interface Doc { id: string; docType: string; status: string; fileUrl?: string; reviewNote?: string; uploadedAt?: string; }

const REQUIRED = [
  { key: 'LICENSE',      label: "Driver's License"    },
  { key: 'PERMIT',       label: "Driver's Permit"      },
  { key: 'REGISTRATION', label: 'Vehicle Registration' },
];

export default function DocumentsPage() {
  const navigate = useNavigate();
  const { user, token, refreshUser } = useAuth();

  const [docs,       setDocs]       = useState<Doc[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [uploading,  setUploading]  = useState<string | null>(null);

  useEffect(() => {
    loadDocs();
    // Poll every 5s to catch admin verification changes
    const interval = setInterval(loadDocs, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const loadDocs = async () => {
    if (!token) return;
    const res = await fetch(`${API}/drivers/documents`, { headers: authHeaders(token) });
    if (res.ok) { const data = await res.json(); setDocs(data); }
    setLoading(false);

    // Check if all verified and update user profile
    const allVerified = docs.length >= 3 && docs.every(d => d.status === 'VERIFIED');
    if (allVerified && !user?.driverProfile?.isVerified) refreshUser();
  };

  const handleUpload = async (docType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploading(docType);
    const form = new FormData();
    form.append('file', file);

    const res = await fetch(`${API}/drivers/documents/${docType}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    setUploading(null);

    if (res.ok) await loadDocs();
    else {
      const data = await res.json();
      alert(data.error ?? 'Upload failed');
    }
    e.target.value = '';
  };

  const getDoc  = (key: string) => docs.find(d => d.docType === key);
  const allDone = REQUIRED.every(r => getDoc(r.key)?.status === 'VERIFIED');
  const allUp   = REQUIRED.every(r => getDoc(r.key));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 p-4">
      <div className="max-w-md mx-auto">
        <button onClick={() => navigate('/driver/dashboard')} className="mb-6 text-white flex items-center gap-2 hover:opacity-80">
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl p-6">
          <h2 className="text-2xl mb-2">Documents</h2>
          <p className="text-sm text-gray-600 mb-6">Upload all required documents. An admin will verify them before you can clock in.</p>

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
          ) : (
            <div className="space-y-4 mb-6">
              {REQUIRED.map(({ key, label }) => {
                const doc       = getDoc(key);
                const status    = doc?.status ?? 'NOT_UPLOADED';
                const isLoading = uploading === key;
                return (
                  <div key={key} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium">{label}</h3>
                      {status === 'VERIFIED'     && <CheckCircle className="w-5 h-5 text-green-500" />}
                      {status === 'PENDING'      && <Clock className="w-5 h-5 text-yellow-500" />}
                      {status === 'REJECTED'     && <XCircle className="w-5 h-5 text-red-500" />}
                    </div>

                    {status === 'NOT_UPLOADED' ? (
                      <label className={`flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl cursor-pointer text-sm transition-colors ${isLoading ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-600'} text-white`}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {isLoading ? 'Uploading…' : 'Upload Document'}
                        <input type="file" accept="image/*,.pdf" onChange={e => handleUpload(key, e)} className="hidden" disabled={isLoading} />
                      </label>
                    ) : (
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs mb-2 ${
                          status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                          status === 'PENDING'  ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {status === 'VERIFIED' ? '✓ Verified by Admin' : status === 'PENDING' ? '⏳ Pending Admin Review' : '✗ Rejected'}
                        </span>
                        {doc?.reviewNote && status === 'REJECTED' && (
                          <p className="text-xs text-red-600 mb-2">Note: {doc.reviewNote}</p>
                        )}
                        {(status === 'REJECTED') && (
                          <label className="flex items-center gap-2 text-xs text-blue-600 cursor-pointer hover:underline mt-1">
                            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                            Re-upload
                            <input type="file" accept="image/*,.pdf" onChange={e => handleUpload(key, e)} className="hidden" />
                          </label>
                        )}
                        {doc?.fileUrl && (
                          <div className="mt-3">
                            <img src={doc.fileUrl} alt={label} className="w-full h-28 object-cover rounded-lg" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {allDone ? (
            <div className="bg-green-100 border border-green-300 rounded-xl p-4 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-green-800 font-medium">All documents verified!</p>
              <p className="text-sm text-green-700 mt-1">You can now clock in and start accepting rides</p>
            </div>
          ) : allUp ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
              <Clock className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
              <p className="text-yellow-800 font-medium">Documents submitted</p>
              <p className="text-sm text-yellow-700 mt-1">Waiting for admin verification. This page updates automatically.</p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-blue-700 text-sm">Upload all 3 documents to submit for verification.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
