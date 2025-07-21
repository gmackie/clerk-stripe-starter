'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import toast from 'react-hot-toast';

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  invoicePdf: string;
}

export function BillingHistory() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<{ status: string; plan: string } | null>(null);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const [subResponse, invoicesResponse] = await Promise.all([
        fetch('/api/user/subscription'),
        fetch('/api/user/invoices'),
      ]);

      if (subResponse.ok) {
        const subData = await subResponse.json();
        setSubscription(subData.subscription);
      }

      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json();
        setInvoices(invoicesData.invoices || []);
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
      toast.error('Failed to load billing information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
      });
      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open billing portal');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
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
      <h2 className="text-lg font-semibold mb-4">Billing & Subscription</h2>
      
      {subscription ? (
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">Current Plan: {subscription.plan}</p>
              <p className="text-sm text-gray-600 mt-1">
                Status: <span className={`capitalize ${
                  subscription.status === 'active' ? 'text-green-600' : 'text-gray-600'
                }`}>{subscription.status}</span>
              </p>
            </div>
            <Button onClick={handleManageSubscription} variant="secondary" size="sm">
              Manage Subscription
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <p className="text-gray-600">No active subscription</p>
          <Button 
            onClick={() => window.location.href = '/pricing'} 
            size="sm" 
            className="mt-2"
          >
            View Plans
          </Button>
        </div>
      )}

      <div>
        <h3 className="font-medium mb-3">Invoice History</h3>
        {invoices.length === 0 ? (
          <p className="text-gray-500 text-sm">No invoices yet</p>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-md"
              >
                <div>
                  <p className="font-medium">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(invoice.created)} • {invoice.status}
                  </p>
                </div>
                {invoice.invoicePdf && (
                  <a
                    href={invoice.invoicePdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Download PDF
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-900">
          All billing is managed through Stripe. You can update payment methods,
          download invoices, and manage your subscription through the billing portal.
        </p>
      </div>
    </div>
  );
}