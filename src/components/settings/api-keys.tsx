'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import toast from 'react-hot-toast';

interface ApiKey {
  id: string;
  name: string;
  lastUsedAt: string | null;
  createdAt: string;
}

export function ApiKeysManager() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKey, setShowNewKey] = useState<string | null>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const response = await fetch('/api/keys');
      const data = await response.json();
      setKeys(data.keys || []);
    } catch (error) {
      console.error('Error fetching keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const createKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setShowNewKey(data.key);
        setNewKeyName('');
        await fetchKeys();
        toast.success('API key created successfully');
      } else {
        toast.error(data.error || 'Failed to create API key');
      }
    } catch (error) {
      console.error('Error creating key:', error);
      toast.error('Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) {
      return;
    }

    try {
      const response = await fetch(`/api/keys?id=${keyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('API key deleted');
        await fetchKeys();
      } else {
        toast.error('Failed to delete API key');
      }
    } catch (error) {
      console.error('Error deleting key:', error);
      toast.error('Failed to delete API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">API Keys</h2>
      
      {showNewKey && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm font-medium text-green-800 mb-2">
            Your new API key (save it now, it won&apos;t be shown again):
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-white rounded text-xs break-all">
              {showNewKey}
            </code>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => copyToClipboard(showNewKey)}
            >
              Copy
            </Button>
          </div>
          <Button
            size="sm"
            className="mt-3"
            onClick={() => setShowNewKey(null)}
          >
            I&apos;ve saved it
          </Button>
        </div>
      )}

      <div className="mb-6">
        <label htmlFor="keyName" className="block text-sm font-medium text-gray-700 mb-2">
          Create New API Key
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="keyName"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g., Production, Development)"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Button onClick={createKey} disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Key'}
          </Button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Maximum 5 API keys per account
        </p>
      </div>

      <div className="space-y-3">
        {keys.length === 0 ? (
          <p className="text-gray-500 text-sm">No API keys yet</p>
        ) : (
          keys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-md"
            >
              <div>
                <p className="font-medium text-sm">{key.name}</p>
                <p className="text-xs text-gray-500">
                  Created: {new Date(key.createdAt).toLocaleDateString()}
                  {key.lastUsedAt && (
                    <> • Last used: {new Date(key.lastUsedAt).toLocaleDateString()}</>
                  )}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteKey(key.id)}
                className="text-red-600 hover:text-red-700"
              >
                Delete
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <p className="text-sm font-medium text-blue-900 mb-1">How to use your API key:</p>
        <code className="text-xs text-blue-800">
          Authorization: Bearer YOUR_API_KEY
        </code>
      </div>
    </div>
  );
}