'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Code, ExternalLink, Settings, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import toast from 'react-hot-toast';

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  environment: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const { isSignedIn } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    environment: 'development',
  });

  useEffect(() => {
    if (isSignedIn) {
      fetchProjects();
    }
  }, [isSignedIn]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const { project } = await response.json();
        setProjects([...projects, project]);
        setShowCreateDialog(false);
        setFormData({ name: '', description: '', environment: 'development' });
        toast.success('Project created successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This will also delete all associated integrations.')) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProjects(projects.filter(p => p.id !== projectId));
        toast.success('Project deleted successfully');
      } else {
        toast.error('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
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

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
              <p className="mt-2 text-gray-600">
                Manage your applications and their integrations
              </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>

          {projects.length === 0 ? (
            <Card className="p-12 text-center">
              <Code className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first project to start managing integrations
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-500">{project.slug}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      project.environment === 'production' 
                        ? 'bg-green-100 text-green-800'
                        : project.environment === 'staging'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {project.environment}
                    </span>
                  </div>

                  {project.description && (
                    <p className="text-gray-600 text-sm mb-4">
                      {project.description}
                    </p>
                  )}

                  <div className="flex justify-between items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.location.href = `/projects/${project.id}`}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Manage
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Project Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Project Name
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description (optional)
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
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
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Project
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}