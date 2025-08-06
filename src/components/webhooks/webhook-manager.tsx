'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, 
  Trash2, 
  Copy, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertCircle,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Webhook {
  id: string;
  service: string;
  url: string;
  secret?: string;
  events: string[];
  active: boolean;
  lastTriggered?: string;
  lastStatus?: number;
  createdAt: string;
}

interface WebhookManagerProps {
  userId: string;
  initialWebhooks: Webhook[];
}

const WEBHOOK_SERVICES = {
  clerk: {
    name: 'Clerk',
    events: ['user.created', 'user.updated', 'user.deleted', 'session.created'],
    color: 'bg-purple-100 text-purple-800',
  },
  stripe: {
    name: 'Stripe',
    events: [
      'checkout.session.completed',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'invoice.payment_succeeded',
      'invoice.payment_failed',
    ],
    color: 'bg-blue-100 text-blue-800',
  },
  github: {
    name: 'GitHub',
    events: ['push', 'pull_request', 'issues', 'release', 'deployment'],
    color: 'bg-gray-100 text-gray-800',
  },
  custom: {
    name: 'Custom',
    events: [],
    color: 'bg-green-100 text-green-800',
  },
};

export function WebhookManager({ userId, initialWebhooks }: WebhookManagerProps) {
  const [webhooks, setWebhooks] = useState<Webhook[]>(initialWebhooks);
  const [isCreating, setIsCreating] = useState(false);
  const [showSecret, setShowSecret] = useState<string | null>(null);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  // Form state for new webhook
  const [newWebhook, setNewWebhook] = useState({
    service: '',
    url: '',
    events: [] as string[],
  });

  const handleCreate = async () => {
    if (!newWebhook.service || !newWebhook.url || newWebhook.events.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWebhook),
      });

      if (response.ok) {
        const webhook = await response.json();
        setWebhooks([...webhooks, webhook]);
        setNewWebhook({ service: '', url: '', events: [] });
        setIsCreating(false);
        toast.success('Webhook created successfully');
      } else {
        toast.error('Failed to create webhook');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    try {
      const response = await fetch(`/api/webhooks/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWebhooks(webhooks.filter(w => w.id !== id));
        toast.success('Webhook deleted');
      } else {
        toast.error('Failed to delete webhook');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      const response = await fetch(`/api/webhooks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      });

      if (response.ok) {
        setWebhooks(webhooks.map(w => 
          w.id === id ? { ...w, active } : w
        ));
        toast.success(`Webhook ${active ? 'enabled' : 'disabled'}`);
      } else {
        toast.error('Failed to update webhook');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleTest = async (webhook: Webhook) => {
    try {
      const response = await fetch(`/api/webhooks/${webhook.id}/test`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Test webhook sent');
      } else {
        toast.error('Failed to send test webhook');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const viewLogs = async (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    
    try {
      const response = await fetch(`/api/webhooks/${webhook.id}/logs`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create New Webhook */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Webhooks</span>
            <Button
              onClick={() => setIsCreating(!isCreating)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Webhook
            </Button>
          </CardTitle>
          <CardDescription>
            Receive real-time notifications when events happen in your integrations
          </CardDescription>
        </CardHeader>

        {isCreating && (
          <CardContent className="border-t">
            <div className="space-y-4 pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="service">Service</Label>
                  <Select
                    value={newWebhook.service}
                    onValueChange={(value) => setNewWebhook({ 
                      ...newWebhook, 
                      service: value,
                      events: [] 
                    })}
                  >
                    <SelectTrigger id="service">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(WEBHOOK_SERVICES).map(([key, service]) => (
                        <SelectItem key={key} value={key}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">Webhook URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://your-app.com/webhooks/..."
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                  />
                </div>
              </div>

              {newWebhook.service && (
                <div className="space-y-2">
                  <Label>Events</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {WEBHOOK_SERVICES[newWebhook.service as keyof typeof WEBHOOK_SERVICES].events.map((event) => (
                      <label
                        key={event}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={newWebhook.events.includes(event)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewWebhook({
                                ...newWebhook,
                                events: [...newWebhook.events, event],
                              });
                            } else {
                              setNewWebhook({
                                ...newWebhook,
                                events: newWebhook.events.filter(e => e !== event),
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{event}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleCreate}>
                  Create Webhook
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setNewWebhook({ service: '', url: '', events: [] });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Webhook List */}
      <div className="space-y-4">
        {webhooks.length === 0 && !isCreating && (
          <Card>
            <CardContent className="text-center py-8">
              <AlertCircle className="h-8 w-8 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">No webhooks configured yet</p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Your First Webhook
              </Button>
            </CardContent>
          </Card>
        )}

        {webhooks.map((webhook) => (
          <Card key={webhook.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge className={WEBHOOK_SERVICES[webhook.service as keyof typeof WEBHOOK_SERVICES]?.color}>
                      {WEBHOOK_SERVICES[webhook.service as keyof typeof WEBHOOK_SERVICES]?.name || webhook.service}
                    </Badge>
                    <Badge variant={webhook.active ? 'default' : 'secondary'}>
                      {webhook.active ? 'Active' : 'Inactive'}
                    </Badge>
                    {webhook.lastStatus && (
                      <Badge variant={webhook.lastStatus >= 200 && webhook.lastStatus < 300 ? 'outline' : 'destructive'}>
                        {webhook.lastStatus}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <p className="font-mono text-sm text-gray-600">{webhook.url}</p>
                  </div>

                  {webhook.secret && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Secret:</span>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {showSecret === webhook.id ? webhook.secret : '••••••••••••••••'}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSecret(showSecret === webhook.id ? null : webhook.id)}
                      >
                        {showSecret === webhook.id ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(webhook.secret!);
                          toast.success('Secret copied to clipboard');
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {webhook.events.map((event) => (
                      <Badge key={event} variant="secondary" className="text-xs">
                        {event}
                      </Badge>
                    ))}
                  </div>

                  {webhook.lastTriggered && (
                    <p className="text-xs text-gray-500">
                      Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTest(webhook)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => viewLogs(webhook)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggle(webhook.id, !webhook.active)}
                  >
                    {webhook.active ? (
                      <XCircle className="h-4 w-4 text-orange-600" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(webhook.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Webhook Logs Dialog */}
      <Dialog open={!!selectedWebhook} onOpenChange={() => setSelectedWebhook(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Webhook Logs</DialogTitle>
            <DialogDescription>
              Recent webhook deliveries for {selectedWebhook?.url}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {logs.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No logs available</p>
            ) : (
              logs.map((log: any) => (
                <div key={log.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={log.status >= 200 && log.status < 300 ? 'default' : 'destructive'}>
                        {log.status}
                      </Badge>
                      <span className="text-sm font-medium">{log.event}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  {log.error && (
                    <p className="text-sm text-red-600">{log.error}</p>
                  )}
                  
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-600">Payload</summary>
                    <pre className="mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </details>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}