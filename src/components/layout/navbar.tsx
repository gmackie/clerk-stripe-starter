'use client';

import Link from 'next/link';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { isSignedIn } = useUser();

  return (
    <nav className="border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              SaaS Starter
            </Link>
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Home
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Pricing
              </Link>
              {isSignedIn && (
                <>
                  <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    Dashboard
                  </Link>
                  <Link href="/projects" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    Projects
                  </Link>
                  <Link href="/settings" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    Settings
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm">
                    Get Started
                  </Button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}