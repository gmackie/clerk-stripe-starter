import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
            Pricing
          </Link>
          <Link href="/docs" className="text-gray-600 hover:text-gray-900">
            Documentation
          </Link>
          <Link href="/support" className="text-gray-600 hover:text-gray-900">
            Support
          </Link>
          <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
            Privacy
          </Link>
          <Link href="/terms" className="text-gray-600 hover:text-gray-900">
            Terms
          </Link>
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-xs leading-5 text-gray-500">
            &copy; {new Date().getFullYear()} Your SaaS Company. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}