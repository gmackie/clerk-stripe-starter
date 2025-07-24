'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  invoicePdf: string;
  description?: string;
  number?: string;
}

interface Subscription {
  status: string | null;
  tier: string;
  priceId: string | null;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string;
}

export default function BillingPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }
    
    fetchBillingData();
  }, [isSignedIn, router]);

  const fetchBillingData = async () => {
    try {
      // Fetch subscription status
      const subResponse = await fetch('/api/user/subscription');
      if (subResponse.ok) {
        const subData = await subResponse.json();
        setSubscription(subData);
      }

      // Fetch invoices
      const invoicesResponse = await fetch('/api/user/invoices');
      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json();
        setInvoices(invoicesData.invoices);
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
      toast.error('Failed to load billing information');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
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

  if (!isSignedIn) {
    return null;
  }

  return (
    <PageWrapper>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Settings
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Invoices</h1>
          <p className="mt-2 text-gray-600">
            Manage your subscription and view billing history
          </p>
        </div>

        {/* Current Subscription Card */}
        <Card className="mb-8 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Current Subscription</h2>
              {subscription?.status === 'active' ? (
                <>
                  <p className="text-gray-600 mb-4">
                    You're on the <span className="font-semibold capitalize">{subscription.tier}</span> plan
                    {subscription.cancelAtPeriodEnd && (
                      <span className="text-red-600 ml-2">(Canceling at period end)</span>
                    )}
                  </p>
                  {subscription.currentPeriodEnd && (
                    <p className="text-sm text-gray-500">
                      Current period ends on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-600">
                  You're currently on the free plan. 
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/pricing')}
                    className="ml-2 text-blue-600 hover:text-blue-700 p-0"
                  >
                    Upgrade to unlock more features →
                  </Button>
                </p>
              )}
            </div>
            <div className="flex gap-3">
              {subscription?.status === 'active' && (
                <Button
                  onClick={handleManageSubscription}
                  variant="secondary"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Billing
                </Button>
              )}
              <Button
                onClick={() => router.push('/pricing')}
                variant={subscription?.status === 'active' ? 'secondary' : 'primary'}
              >
                {subscription?.status === 'active' ? 'Change Plan' : 'View Plans'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Invoices Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Billing History</h2>
          
          {isLoading ? (
            <Card className="p-8">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </Card>
          ) : invoices.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">No invoices yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Invoices will appear here after your first payment
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <Card key={invoice.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(invoice.status)}
                      <div className="flex-1">
                        <div className="flex items-baseline space-x-3">
                          <p className="font-medium text-gray-900">
                            {formatCurrency(invoice.amount, invoice.currency)}
                          </p>
                          {invoice.description && (
                            <p className="text-sm text-gray-600">{invoice.description}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-gray-500 flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(invoice.created)}
                          </p>
                          {invoice.number && (
                            <p className="text-sm text-gray-500">
                              Invoice #{invoice.number}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${getStatusColor(invoice.status)} capitalize`}>
                        {invoice.status}
                      </span>
                    </div>
                    
                    {invoice.invoicePdf && (
                      <Button
                        variant="ghost"
                        onClick={() => window.open(invoice.invoicePdf, '_blank')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Additional Information */}
        <Card className="mt-8 p-6 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-2">Need help with billing?</h3>
          <p className="text-sm text-gray-600 mb-4">
            For billing questions, refunds, or payment issues, you can manage everything through the Stripe customer portal.
          </p>
          <Button
            variant="secondary"
            onClick={handleManageSubscription}
            disabled={!subscription?.status}
          >
            Open Customer Portal
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </Card>
      </div>
    </PageWrapper>
  );
}