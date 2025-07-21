'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (sessionId) {
        try {
          const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`);
          if (response.ok) {
            setIsSuccess(true);
          }
        } catch (error) {
          console.error('Error verifying session:', error);
        } finally {
          setIsVerifying(false);
        }
      } else {
        setIsVerifying(false);
      }
    };
    
    verify();
  }, [sessionId]);


  return (
    <PageWrapper>
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
        {isVerifying ? (
          <div className="text-center">
            <LoadingSpinner className="h-8 w-8 mx-auto mb-4" />
            <p className="text-gray-600">Verifying your subscription...</p>
          </div>
        ) : isSuccess ? (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment successful!</h1>
            <p className="text-gray-600 mb-8">
              Thank you for subscribing. Your account has been upgraded.
            </p>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-8">
              We couldn&apos;t verify your payment. Please contact support if you were charged.
            </p>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}