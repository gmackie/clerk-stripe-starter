import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - SaaS Starter',
  description: 'Manage your account, subscription, and access all features.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}