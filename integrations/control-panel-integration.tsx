/**
 * This component can be copied into the control panel to integrate the starter kit generator
 * It's designed to work with the control panel's existing UI components and patterns
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Download, Loader2, CheckCircle, AlertCircle, Code, Package, Settings } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// This would be imported from your control panel's API client
// import { api } from '@/lib/api';

interface StarterKitGeneratorProps {
  onProjectCreated?: (project: any) => void;
  apiEndpoint?: string;
}

export function StarterKitGeneratorPanel({ 
  onProjectCreated, 
  apiEndpoint = 'https://starter.gmac.io/api/generator' 
}: StarterKitGeneratorProps) {
  const [config, setConfig] = useState<any>(null);
  const [projectName, setProjectName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('saas');
  const [selectedIntegrations, setSelectedIntegrations] = useState<Record<string, string>>({});
  const [includeDocker, setIncludeDocker] = useState(true);
  const [includeGitHub, setIncludeGitHub] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedConfig, setGeneratedConfig] = useState<any>(null);

  // Fetch configuration from the starter kit API
  useEffect(() => {
    fetch(apiEndpoint)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setConfig(data.data);
          // Set default integrations
          if (data.data.templates.saas) {
            setSelectedIntegrations(data.data.templates.saas.defaultIntegrations);
          }
        }
      })
      .catch(err => {
        toast({
          title: 'Error',
          description: 'Failed to load starter kit configuration',
          variant: 'destructive',
        });
      });
  }, [apiEndpoint]);

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    if (config && config.templates[template]) {
      setSelectedIntegrations(config.templates[template].defaultIntegrations);
    }
  };

  const handleIntegrationChange = (category: string, value: string) => {
    setSelectedIntegrations(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleGenerate = async () => {
    if (!projectName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a project name',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedConfig(null);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          template: selectedTemplate,
          integrations: selectedIntegrations,
          includeDocker,
          includeGitHub
        })
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedConfig(data.data);
        toast({
          title: 'Success',
          description: 'Project configuration generated successfully',
        });
        
        if (onProjectCreated) {
          onProjectCreated(data.data);
        }
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to generate project',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An error occurred while generating the project',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!config) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Create New Application
          </CardTitle>
          <CardDescription>
            Generate a custom starter kit with your preferred integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="my-awesome-app"
                pattern="[a-z0-9-]+"
              />
              <p className="text-xs text-muted-foreground">
                Lowercase letters, numbers, and hyphens only
              </p>
            </div>

            {/* Template Selection */}
            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger id="template">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(config.templates).map(([key, template]: [string, any]) => (
                    <SelectItem key={key} value={key}>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-muted-foreground">{template.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="docker">Include Docker Configuration</Label>
                <p className="text-xs text-muted-foreground">
                  Dockerfile and docker-compose.yml
                </p>
              </div>
              <Switch
                id="docker"
                checked={includeDocker}
                onCheckedChange={setIncludeDocker}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="github">Include GitHub Actions</Label>
                <p className="text-xs text-muted-foreground">
                  CI/CD workflow for automated deployment
                </p>
              </div>
              <Switch
                id="github"
                checked={includeGitHub}
                onCheckedChange={setIncludeGitHub}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Select Integrations
          </CardTitle>
          <CardDescription>
            Choose the services and tools to include in your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(config.categories).map(([categoryKey, category]: [string, any]) => (
              <div key={categoryKey} className="space-y-2">
                <Label htmlFor={`integration-${categoryKey}`}>
                  {category.name}
                  {category.required && (
                    <Badge variant="secondary" className="ml-2 text-xs">Required</Badge>
                  )}
                </Label>
                <Select 
                  value={selectedIntegrations[categoryKey] || ''} 
                  onValueChange={(value) => handleIntegrationChange(categoryKey, value)}
                >
                  <SelectTrigger id={`integration-${categoryKey}`}>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {category.options.map((option: any) => (
                      <SelectItem key={option.id} value={option.id}>
                        <div>
                          <div className="font-medium">
                            {option.name}
                            {option.default && (
                              <Badge variant="outline" className="ml-2 text-xs">Default</Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{category.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generated Configuration */}
      {generatedConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Project Generated
            </CardTitle>
            <CardDescription>
              Your custom starter kit is ready
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Configuration Summary */}
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <h4 className="font-medium text-sm">Configuration Summary</h4>
              <div className="grid gap-2 text-sm">
                {Object.entries(generatedConfig.config.integrations).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">{key}:</span>
                    <span className="font-medium">{value as string}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Setup Instructions */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Quick Start</h4>
              <div className="rounded-lg bg-muted p-4">
                <pre className="text-xs overflow-x-auto">
                  <code>{`git clone <your-repo-url>
cd ${projectName}
npm install
cp .env.local.example .env.local
# Add your API keys to .env.local
npm run dev`}</code>
                </pre>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button asChild>
                <a href={generatedConfig.downloadUrl} download>
                  <Download className="mr-2 h-4 w-4" />
                  Download Project
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={`/applications/new?template=${projectName}`}>
                  <Code className="mr-2 h-4 w-4" />
                  Deploy Now
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Button */}
      {!generatedConfig && (
        <Card>
          <CardContent className="pt-6">
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !projectName}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Project...
                </>
              ) : (
                <>
                  <Package className="mr-2 h-4 w-4" />
                  Generate Project
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}