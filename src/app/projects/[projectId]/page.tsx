'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Shield, Plus, Eye, EyeOff, Copy, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import toast from 'react-hot-toast';

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  environment: string;
  isActive: boolean;
}

interface SentryIntegration {
  id: string;
  projectId: string;
  dsn: string;
  org: string;
  project: string;
  hasAuthToken: boolean;
  environment: string;
  isActive: boolean;
  createdAt: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { isSignedIn } = useUser();
  const [project, setProject] = useState<Project | null>(null);
  const [integrations, setIntegrations] = useState<SentryIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDsn, setShowDsn] = useState<{ [key: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    dsn: '',
    org: '',
    project: '',
    authToken: '',
    environment: 'development',
  });

  useEffect(() => {
    if (isSignedIn) {
      fetchProject();
      fetchIntegrations();
    }
  }, [isSignedIn, projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project');
    }
  };

  const fetchIntegrations = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/sentry`);
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.integrations);
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIntegration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/projects/${projectId}/sentry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const { integration } = await response.json();
        setIntegrations([...integrations, integration]);
        setShowAddDialog(false);
        setFormData({
          dsn: '',
          org: '',
          project: '',
          authToken: '',
          environment: 'development',
        });
        toast.success('Sentry integration added successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add integration');
      }
    } catch (error) {
      console.error('Error adding integration:', error);
      toast.error('Failed to add integration');
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </PageWrapper>
    );
  }

  if (!project) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <p className="text-gray-500">Project not found</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/projects'}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="mt-2 text-gray-600">{project.description || 'No description'}</p>
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
              <span>Slug: {project.slug}</span>
              <span className={`px-2 py-1 rounded-full ${
                project.environment === 'production' 
                  ? 'bg-green-100 text-green-800'
                  : project.environment === 'staging'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {project.environment}
              </span>
            </div>
          </div>

          <Card className="mb-8 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-semibold">Sentry Integrations</h2>
              </div>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Integration
              </Button>
            </div>

            {integrations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No Sentry integrations configured</p>
                <Button variant="secondary" onClick={() => setShowAddDialog(true)}>
                  Add your first integration
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div key={integration.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-medium">
                          {integration.org}/{integration.project}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Environment: {integration.environment}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        integration.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {integration.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">DSN:</span>
                        <div className="flex-1 flex items-center gap-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 overflow-hidden">
                            {showDsn[integration.id] 
                              ? integration.dsn 
                              : '••••••••••••••••••••••••••••••••'}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDsn({ 
                              ...showDsn, 
                              [integration.id]: !showDsn[integration.id] 
                            })}
                          >
                            {showDsn[integration.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(integration.dsn, integration.id)}
                          >
                            {copiedId === integration.id ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      {integration.hasAuthToken && (
                        <p className="text-xs text-gray-500">
                          ✓ Auth token configured for source map uploads
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Integration Guide</h3>
            <div className="prose prose-sm max-w-none">
              <p>To use this Sentry configuration in your application:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Install the Sentry SDK for your platform</li>
                <li>Copy the DSN from the integration above</li>
                <li>Initialize Sentry with the DSN in your application</li>
                <li>Deploy your application and verify errors are being captured</li>
              </ol>
              <div className="mt-4 bg-gray-100 p-4 rounded">
                <p className="font-medium mb-2">Example (Next.js):</p>
                <pre className="text-xs">
{`import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: '${project.environment}',
});`}
                </pre>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Integration Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Sentry Integration</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddIntegration} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sentry DSN
              </label>
              <input
                type="text"
                required
                placeholder="https://xxxxx@xxx.ingest.sentry.io/xxxxx"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.dsn}
                onChange={(e) => setFormData({ ...formData, dsn: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Organization Slug
              </label>
              <input
                type="text"
                required
                placeholder="my-org"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.org}
                onChange={(e) => setFormData({ ...formData, org: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Project Slug
              </label>
              <input
                type="text"
                required
                placeholder="my-project"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Auth Token (optional)
              </label>
              <input
                type="password"
                placeholder="For source map uploads"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.authToken}
                onChange={(e) => setFormData({ ...formData, authToken: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">
                Required for source map uploads and advanced features
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Environment
              </label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.environment}
                onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
              >
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Add Integration
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}