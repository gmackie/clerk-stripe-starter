import Link from 'next/link';
import { SignUpButton } from '@clerk/nextjs';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <PageWrapper>
      <div>
        <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Build Your SaaS Faster with Our Starter Kit
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              A production-ready Next.js starter with Clerk authentication, Stripe payments, 
              and Turso database. Start building your SaaS in minutes, not days.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <SignUpButton mode="modal">
                <Button size="lg">
                  Get Started for Free
                </Button>
              </SignUpButton>
              <Link href="/pricing" className="text-sm font-semibold leading-6 text-gray-900">
                View Pricing <span aria-hidden="true">→</span>
              </Link>
              <Link href="/demo" className="text-sm font-semibold leading-6 text-gray-900">
                View Demo <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Everything You Need to Launch
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Built with the best tools in the ecosystem
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                <div className="flex flex-col">
                  <dt className="text-base font-semibold leading-7 text-gray-900">
                    <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                    Authentication with Clerk
                  </dt>
                  <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">
                      Enterprise-grade authentication with social logins, magic links, and more. 
                      Secure by default with built-in user management.
                    </p>
                  </dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-base font-semibold leading-7 text-gray-900">
                    <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                      </svg>
                    </div>
                    Payments with Stripe
                  </dt>
                  <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">
                      Accept payments globally with Stripe. Subscription management, 
                      customer portal, and webhook handling included.
                    </p>
                  </dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-base font-semibold leading-7 text-gray-900">
                    <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                      </svg>
                    </div>
                    Edge Database with Turso
                  </dt>
                  <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">
                      Lightning-fast SQLite database at the edge. Type-safe queries 
                      with Drizzle ORM for the best developer experience.
                    </p>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}