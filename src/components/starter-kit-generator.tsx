'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  default?: boolean;
  envVars: Array<{
    key: string;
    description: string;
    required: boolean;
  }>;
}

interface Category {
  name: string;
  description: string;
  required: boolean;
  options: Integration[];
}

interface Template {
  name: string;
  description: string;
  defaultIntegrations: Record<string, string>;
}

interface GeneratorConfig {
  categories: Record<string, Category>;
  templates: Record<string, Template>;
  version: string;
}

export function StarterKitGenerator() {
  const [config, setConfig] = useState<GeneratorConfig | null>(null);
  const [projectName, setProjectName] = useState('My SaaS App');
  const [selectedTemplate, setSelectedTemplate] = useState('saas');
  const [selectedIntegrations, setSelectedIntegrations] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch configuration
  useEffect(() => {
    fetch('/api/generator')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setConfig(data.data);
          // Set default integrations from template
          if (data.data.templates.saas) {
            setSelectedIntegrations(data.data.templates.saas.defaultIntegrations);
          }
        }
      })
      .catch(err => {
        setError('Failed to load configuration');
        console.error(err);
      });
  }, []);

  // Update integrations when template changes
  useEffect(() => {
    if (config && config.templates[selectedTemplate]) {
      setSelectedIntegrations(config.templates[selectedTemplate].defaultIntegrations);
    }
  }, [selectedTemplate, config]);

  const handleIntegrationChange = (category: string, value: string) => {
    setSelectedIntegrations(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setDownloadUrl(null);

    try {
      const response = await fetch('/api/generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          template: selectedTemplate,
          integrations: selectedIntegrations,
          includeDocker: true,
          includeGitHub: true
        })
      });

      const data = await response.json();

      if (data.success) {
        setDownloadUrl(data.data.downloadUrl);
      } else {
        setError(data.error || 'Failed to generate project');
      }
    } catch (err) {
      setError('An error occurred while generating the project');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Project Configuration</CardTitle>
          <CardDescription>
            Set up your new SaaS project with the integrations you need
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My Awesome SaaS"
            />
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <Label>Template</Label>
            <RadioGroup value={selectedTemplate} onValueChange={setSelectedTemplate}>
              {Object.entries(config.templates).map(([key, template]) => (
                <div key={key} className="flex items-center space-x-2">
                  <RadioGroupItem value={key} id={`template-${key}`} />
                  <Label htmlFor={`template-${key}`} className="font-normal cursor-pointer">
                    <span className="font-medium">{template.name}</span>
                    <span className="text-sm text-gray-500 ml-2">{template.description}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Integration Selection */}
      {Object.entries(config.categories).map(([categoryKey, category]) => (
        <Card key={categoryKey}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {category.name}
              {category.required && <Badge variant="secondary">Required</Badge>}
            </CardTitle>
            <CardDescription>{category.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={selectedIntegrations[categoryKey] || ''} 
              onValueChange={(value) => handleIntegrationChange(categoryKey, value)}
            >
              {category.options.map((option) => (
                <div key={option.id} className="flex items-start space-x-2 mb-4">
                  <RadioGroupItem value={option.id} id={`${categoryKey}-${option.id}`} className="mt-1" />
                  <Label htmlFor={`${categoryKey}-${option.id}`} className="font-normal cursor-pointer flex-1">
                    <div>
                      <span className="font-medium">{option.name}</span>
                      {option.default && <Badge variant="outline" className="ml-2 text-xs">Default</Badge>}
                    </div>
                    <p className="text-sm text-gray-500">{option.description}</p>
                    {option.envVars.length > 0 && (
                      <div className="mt-2 text-xs text-gray-400">
                        Requires: {option.envVars.filter(v => v.required).map(v => v.key).join(', ')}
                      </div>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      ))}

      {/* Generate Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Ready to generate?</p>
              <p className="text-sm text-gray-500">
                Your custom project will be generated with all selected integrations
              </p>
            </div>
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !projectName}
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Project
                </>
              )}
            </Button>
          </div>

          {/* Success/Error Messages */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Generation Failed</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {downloadUrl && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">Project Generated Successfully!</p>
                  <p className="text-sm text-green-700 mb-3">
                    Your custom SaaS starter is ready to download.
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <a href={downloadUrl} download>
                      <Download className="mr-2 h-4 w-4" />
                      Download Project
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}