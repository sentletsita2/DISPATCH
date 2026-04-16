import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Upload, CheckCircle, Clock } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  status: 'pending' | 'verified' | 'rejected' | 'not-uploaded';
  file?: string;
}

export default function DocumentsPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([
    { id: 'license', name: "Driver's License", status: 'not-uploaded' },
    { id: 'permit', name: "Driver's Permit", status: 'not-uploaded' },
    { id: 'registration', name: 'Vehicle Registration', status: 'not-uploaded' },
  ]);

  const handleFileUpload = (docId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, this would upload to server
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocuments(
          documents.map((doc) =>
            doc.id === docId
              ? { ...doc, status: 'pending' as const, file: reader.result as string }
              : doc
          )
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerify = () => {
    // Simulate admin verification
    const allUploaded = documents.every((doc) => doc.status !== 'not-uploaded');
    if (allUploaded) {
      setDocuments(documents.map((doc) => ({ ...doc, status: 'verified' as const })));
      updateUser({ documentsVerified: true });
      alert('All documents verified! You can now clock in and accept rides.');
    } else {
      alert('Please upload all required documents');
    }
  };

  const allVerified = documents.every((doc) => doc.status === 'verified');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 p-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate('/driver/dashboard')}
          className="mb-6 text-white flex items-center gap-2 hover:opacity-80"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl p-6">
          <h2 className="text-2xl mb-2">Documents</h2>
          <p className="text-sm text-gray-600 mb-6">
            Upload all required documents to start accepting rides
          </p>

          <div className="space-y-4 mb-6">
            {documents.map((doc) => (
              <div key={doc.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm">{doc.name}</h3>
                  {doc.status === 'verified' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {doc.status === 'pending' && (
                    <Clock className="w-5 h-5 text-yellow-500" />
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {doc.status === 'not-uploaded' ? (
                    <label className="flex-1 bg-blue-500 text-white text-center py-2 px-4 rounded-xl cursor-pointer hover:bg-blue-600 transition-colors">
                      <Upload className="w-4 h-4 inline mr-2" />
                      Upload
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(doc.id, e)}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="flex-1 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs ${
                          doc.status === 'verified'
                            ? 'bg-green-100 text-green-700'
                            : doc.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {doc.status === 'verified'
                          ? 'Verified'
                          : doc.status === 'pending'
                          ? 'Pending Verification'
                          : 'Rejected'}
                      </span>
                    </div>
                  )}
                </div>

                {doc.file && (
                  <div className="mt-3">
                    <img
                      src={doc.file}
                      alt={doc.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {!allVerified && documents.every((doc) => doc.status === 'pending') && (
            <button
              onClick={handleVerify}
              className="w-full bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 transition-colors"
            >
              Simulate Verification (Demo)
            </button>
          )}

          {allVerified && (
            <div className="bg-green-100 border border-green-300 rounded-xl p-4 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-green-800">All documents verified!</p>
              <p className="text-sm text-green-700 mt-1">
                You can now clock in and start accepting rides
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
