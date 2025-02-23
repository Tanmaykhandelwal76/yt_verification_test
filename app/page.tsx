'use client';

import { useState } from 'react';
import VerificationForm from './components/VerificationForm';

export default function Home() {
  const [showForm, setShowForm] = useState(false);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">YouTube Channel Verification</h1>
        
        {!showForm ? (
          <div className="text-center">
            <button
              onClick={() => setShowForm(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Verify YouTube Account
            </button>
          </div>
        ) : (
          <VerificationForm onClose={() => setShowForm(false)} />
        )}
      </div>
    </main>
  );
} 