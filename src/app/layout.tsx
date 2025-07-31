import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { ToastProvider } from '@/components/providers/toast-provider';
import { SentryUserContext } from '@/components/sentry-user-context';
import { PHProvider, PostHogAuthWrapper } from '@/providers/posthog-provider';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clerk + Stripe Starter",
  description: "A Next.js starter kit with Clerk authentication and Stripe payments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <PHProvider>
            <PostHogAuthWrapper>
              <SentryUserContext>
                <ToastProvider />
                {children}
              </SentryUserContext>
            </PostHogAuthWrapper>
          </PHProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
