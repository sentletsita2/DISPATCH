import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  status: 'pending' | 'verified' | 'rejected' | 'not-uploaded';
  file?: string;
  uploadedAt?: string;
  reviewNote?: string;
}

const REQUIRED_DOCS = [
  { id: 'license', name: "Driver's License" },
  { id: 'permit', name: "Driver's Permit" },
  { id: 'registration', name: 'Vehicle Registration' },
];

export default function DocumentsPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [documents, setDocuments] = useState<Document[]>(
    REQUIRED_DOCS.map(d => ({ ...d, status: 'not-uploaded' as const }))
  );

  useEffect(() => {
    if (!user) return;
    const allDocs: Record<string, Document[]> = JSON.parse(localStorage.getItem('driverDocuments') || '{}');
    const myDocs = allDocs[user.id];
    if (myDocs && myDocs.length > 0) setDocuments(myDocs);
  }, [user]);

  const persistDocs = (updatedDocs: Document[]) => {
    if (!user) return;
    const allDocs: Record<string, Document[]> = JSON.parse(localStorage.getItem('driverDocuments') || '{}');
    allDocs[user.id] = updatedDocs;
    localStorage.setItem('driverDocuments', JSON.stringify(allDocs));
  };

  const handleFileUpload = (docId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = documents.map(doc =>
        doc.id === docId
          ? { ...doc, status: 'pending' as const, file: reader.result as string, uploadedAt: new Date().toISOString() }
          : doc
      );
      setDocuments(updated);
      persistDocs(updated);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      const allDocs: Record<string, Document[]> = JSON.parse(localStorage.getItem('driverDocuments') || '{}');
      const myDocs = allDocs[user.id];
      if (!myDocs) return;
      setDocuments(prev => {
        const changed = prev.some((d, i) => myDocs[i] && d.status !== myDocs[i].status);
        return changed ? myDocs : prev;
      });
      const allVerified = myDocs.length >= 3 && myDocs.every((d: Document) => d.status === 'verified');
      if (allVerified && !user.documentsVerified) updateUser({ documentsVerified: true });
    }, 2000);
    return () => clearInterval(interval);
  }, [user, updateUser]);

  const allVerified = documents.every(doc => doc.status === 'verified');
  const allUploaded = documents.every(doc => doc.status !== 'not-uploaded');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 p-4">
      <div className="max-w-md mx-auto">
        <button onClick={() => navigate('/driver/dashboard')} className="mb-6 text-white flex items-center gap-2 hover:opacity-80">
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
        <div className="bg-white rounded-3xl p-6">
          <h2 className="text-2xl mb-2">Documents</h2>
          <p className="text-sm text-gray-600 mb-6">Upload all required documents. An admin will verify them before you can clock in.</p>
          <div className="space-y-4 mb-6">
            {documents.map(doc => (
              <div key={doc.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium">{doc.name}</h3>
                  {doc.status === 'verified' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {doc.status === 'pending' && <Clock className="w-5 h-5 text-yellow-500" />}
                  {doc.status === 'rejected' && <XCircle className="w-5 h-5 text-red-500" />}
                </div>
                {doc.status === 'not-uploaded' ? (
                  <label className="flex items-center justify-center gap-2 w-full bg-blue-500 text-white py-2 px-4 rounded-xl cursor-pointer hover:bg-blue-600 transition-colors text-sm">
                    <Upload className="w-4 h-4" />Upload Document
                    <input type="file" accept="image/*,.pdf" onChange={e => handleFileUpload(doc.id, e)} className="hidden" />
                  </label>
                ) : (
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs mb-2 ${
                      doc.status === 'verified' ? 'bg-green-100 text-green-700' :
                      doc.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {doc.status === 'verified' ? '✓ Verified by Admin' : doc.status === 'pending' ? '⏳ Pending Admin Review' : '✗ Rejected'}
                    </span>
                    {doc.reviewNote && doc.status === 'rejected' && (
                      <p className="text-xs text-red-600 mb-2">Note: {doc.reviewNote}</p>
                    )}
                    {doc.status === 'rejected' && (
                      <label className="flex items-center gap-2 text-xs text-blue-600 cursor-pointer hover:underline mt-1">
                        <Upload className="w-3 h-3" />Re-upload
                        <input type="file" accept="image/*,.pdf" onChange={e => handleFileUpload(doc.id, e)} className="hidden" />
                      </label>
                    )}
                  </div>
                )}
                {doc.file && doc.status !== 'not-uploaded' && (
                  <div className="mt-3"><img src={doc.file} alt={doc.name} className="w-full h-28 object-cover rounded-lg" /></div>
                )}
              </div>
            ))}
          </div>
          {allVerified ? (
            <div className="bg-green-100 border border-green-300 rounded-xl p-4 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-green-800 font-medium">All documents verified!</p>
              <p className="text-sm text-green-700 mt-1">You can now clock in and start accepting rides</p>
            </div>
          ) : allUploaded ? (
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
