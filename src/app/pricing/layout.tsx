import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - SaaS Starter',
  description: 'Choose the perfect plan for your needs. Start free, upgrade anytime.',
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}