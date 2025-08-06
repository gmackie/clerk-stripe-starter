import { Metadata } from 'next';
import { StarterKitGenerator } from '@/components/starter-kit-generator';
import { PageWrapper } from '@/components/layout/page-wrapper';

export const metadata: Metadata = {
  title: 'SaaS Starter Kit Generator',
  description: 'Generate a custom SaaS starter kit with your preferred integrations',
};

export default function GeneratorPage() {
  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">SaaS Starter Kit Generator</h1>
          <p className="text-gray-600">
            Customize your starter kit by selecting the integrations you need. 
            We'll generate a complete project structure ready for development.
          </p>
        </div>
        
        <StarterKitGenerator />
      </div>
    </PageWrapper>
  );
}