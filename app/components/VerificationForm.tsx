'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';

interface VerificationFormProps {
  onClose: () => void;
}

export default function VerificationForm({ onClose }: VerificationFormProps) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    channelName: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ name: string } | false>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!session) {
        // Start OAuth flow if not authenticated
        await signIn('google', { callbackUrl: window.location.href });
        return;
      }

      const response = await fetch('/api/auth/youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // If not authenticated, start OAuth flow
          await signIn('google', { callbackUrl: window.location.href });
          return;
        }
        throw new Error(data.message || 'Verification failed');
      }

      setSuccess({ name: data.channel.name });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (success) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">Channel Verified!</h2>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-gray-600 mb-1">Channel Name:</p>
          <p className="text-xl font-semibold">{success.name}</p>
        </div>
        <button
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Verify Your YouTube Channel</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="channelName" className="block text-sm font-medium text-gray-700 mb-1">
            Channel Name
          </label>
          <input
            type="text"
            id="channelName"
            name="channelName"
            value={formData.channelName}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Registered Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Verifying...' : 'Verify Channel'}
        </button>
      </form>
    </div>
  );
}