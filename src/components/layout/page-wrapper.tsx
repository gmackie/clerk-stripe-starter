import { ReactNode } from 'react';
import { Navbar } from './navbar';
import { Footer } from './footer';

interface PageWrapperProps {
  children: ReactNode;
  showFooter?: boolean;
}

export function PageWrapper({ children, showFooter = true }: PageWrapperProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}