import Link from 'next/link';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <PageWrapper>
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-gray-900">Page not found</h2>
        <p className="mt-2 text-gray-600">Sorry, we couldn&apos;t find the page you&apos;re looking for.</p>
        <Link href="/" className="mt-8">
          <Button>Go back home</Button>
        </Link>
      </div>
    </PageWrapper>
  );
}