#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const manifest = require('./manifest.json');

class IntegrationGenerator {
  constructor(options = {}) {
    this.selectedIntegrations = options.integrations || {};
    this.projectName = options.projectName || 'my-saas-app';
    this.outputPath = options.outputPath || './generated';
    this.template = options.template || 'saas';
  }

  // Generate the complete project structure
  async generate() {
    console.log('🚀 Generating project with selected integrations...');
    
    // Create output directory
    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath, { recursive: true });
    }

    // Generate base structure
    this.generateBaseStructure();
    
    // Generate package.json with selected dependencies
    this.generatePackageJson();
    
    // Generate environment variables template
    this.generateEnvTemplate();
    
    // Copy and modify files based on selected integrations
    this.copyIntegrationFiles();
    
    // Generate setup instructions
    this.generateSetupInstructions();
    
    // Generate middleware with selected integrations
    this.generateMiddleware();
    
    // Generate providers file
    this.generateProviders();
    
    console.log('✅ Project generated successfully!');
    return {
      path: this.outputPath,
      integrations: this.selectedIntegrations,
      instructions: this.getSetupInstructions()
    };
  }

  // Generate base Next.js structure
  generateBaseStructure() {
    const dirs = [
      'src/app',
      'src/app/api',
      'src/app/(dashboard)',
      'src/app/(marketing)',
      'src/components',
      'src/components/ui',
      'src/lib',
      'src/hooks',
      'src/types',
      'public'
    ];

    dirs.forEach(dir => {
      const fullPath = path.join(this.outputPath, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  // Generate package.json with only selected dependencies
  generatePackageJson() {
    const dependencies = {
      "next": "15.4.2",
      "react": "19.1.0",
      "react-dom": "19.1.0",
      "typescript": "^5",
      "@types/node": "^20",
      "@types/react": "^19",
      "@types/react-dom": "^19",
      "tailwindcss": "^4",
      "@tailwindcss/postcss": "^4",
      "clsx": "^2.1.1",
      "tailwind-merge": "^3.3.1"
    };

    // Add dependencies for selected integrations
    Object.entries(this.selectedIntegrations).forEach(([category, integrationId]) => {
      const categoryConfig = manifest.categories[category];
      if (categoryConfig) {
        const integration = categoryConfig.options.find(opt => opt.id === integrationId);
        if (integration && integration.dependencies) {
          integration.dependencies.forEach(dep => {
            // Parse dependency string (handle versions)
            const [name, version] = dep.includes('@') && !dep.startsWith('@') 
              ? dep.split('@') 
              : [dep, 'latest'];
            dependencies[name] = version === 'latest' ? '^1.0.0' : version;
          });
        }
      }
    });

    const packageJson = {
      name: this.projectName.toLowerCase().replace(/\s+/g, '-'),
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev --turbopack",
        build: "next build",
        start: "next start",
        lint: "next lint"
      },
      dependencies: this.sortObject(dependencies),
      devDependencies: {
        "eslint": "^9",
        "eslint-config-next": "15.4.2"
      }
    };

    // Add database-specific scripts
    if (this.selectedIntegrations.database === 'turso') {
      packageJson.scripts['db:push'] = 'drizzle-kit push';
      packageJson.scripts['db:studio'] = 'drizzle-kit studio';
    } else if (this.selectedIntegrations.database === 'prisma') {
      packageJson.scripts['db:push'] = 'prisma db push';
      packageJson.scripts['db:studio'] = 'prisma studio';
      packageJson.scripts['db:generate'] = 'prisma generate';
    }

    fs.writeFileSync(
      path.join(this.outputPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }

  // Generate .env.local.example with only required variables
  generateEnvTemplate() {
    let envContent = `# ${this.projectName} Environment Variables
# Generated on ${new Date().toISOString()}

# Core Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

`;

    // Add environment variables for each selected integration
    Object.entries(this.selectedIntegrations).forEach(([category, integrationId]) => {
      const categoryConfig = manifest.categories[category];
      if (categoryConfig) {
        const integration = categoryConfig.options.find(opt => opt.id === integrationId);
        if (integration && integration.envVars) {
          envContent += `# ${integration.name}\n`;
          integration.envVars.forEach(envVar => {
            const requiredText = envVar.required ? ' [REQUIRED]' : ' [OPTIONAL]';
            envContent += `# ${envVar.description}${requiredText}\n`;
            envContent += `${envVar.key}=${envVar.default || ''}\n`;
          });
          envContent += '\n';
        }
      }
    });

    fs.writeFileSync(
      path.join(this.outputPath, '.env.local.example'),
      envContent
    );
  }

  // Copy integration-specific files
  copyIntegrationFiles() {
    // This is where we'd copy files from templates based on selected integrations
    // For now, we'll generate basic structures
    
    // Generate layout.tsx
    this.generateLayout();
    
    // Generate page.tsx
    this.generateHomePage();
    
    // Generate API routes based on integrations
    this.generateApiRoutes();
  }

  // Generate layout.tsx with selected integrations
  generateLayout() {
    let imports = `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'\n`;

    let providers = [];

    // Add auth provider if needed
    if (this.selectedIntegrations.authentication === 'clerk') {
      imports += `import { ClerkProvider } from '@clerk/nextjs'\n`;
      providers.push('ClerkProvider');
    }

    // Add analytics
    if (this.selectedIntegrations.analytics === 'vercel') {
      imports += `import { Analytics } from '@vercel/analytics/react'\n`;
      imports += `import { SpeedInsights } from '@vercel/speed-insights/next'\n`;
    }

    // Add providers wrapper if needed
    if (providers.length > 0 || this.selectedIntegrations.analytics) {
      imports += `import { Providers } from './providers'\n`;
    }

    const layoutContent = `${imports}
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '${this.projectName}',
  description: 'Built with the SaaS Starter Kit',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        ${providers.length > 0 ? '<Providers>' : ''}
          {children}
        ${providers.length > 0 ? '</Providers>' : ''}
        ${this.selectedIntegrations.analytics === 'vercel' ? '<Analytics />\n        <SpeedInsights />' : ''}
      </body>
    </html>
  )
}`;

    fs.writeFileSync(
      path.join(this.outputPath, 'src/app/layout.tsx'),
      layoutContent
    );
  }

  // Generate providers.tsx for client components
  generateProviders() {
    let imports = `'use client'\n\n`;
    let providers = [];
    let providerComponents = '';

    if (this.selectedIntegrations.authentication === 'clerk') {
      imports += `import { ClerkProvider } from '@clerk/nextjs'\n`;
      providers.push('clerk');
    }

    if (this.selectedIntegrations.analytics === 'posthog') {
      imports += `import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'\n\n`;
      
      providerComponents += `if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.opt_out_capturing()
    },
  })
}\n\n`;
    }

    const providersContent = `${imports}${providerComponents}export function Providers({ children }: { children: React.ReactNode }) {
  ${this.selectedIntegrations.authentication === 'clerk' ? 
    `return (
    <ClerkProvider>
      ${this.selectedIntegrations.analytics === 'posthog' ? 
        `<PostHogProvider client={posthog}>
        {children}
      </PostHogProvider>` : '{children}'}
    </ClerkProvider>
  )` : 
    this.selectedIntegrations.analytics === 'posthog' ?
      `return (
    <PostHogProvider client={posthog}>
      {children}
    </PostHogProvider>
  )` : 'return <>{children}</>'}
}`;

    if (providers.length > 0 || this.selectedIntegrations.analytics === 'posthog') {
      fs.writeFileSync(
        path.join(this.outputPath, 'src/app/providers.tsx'),
        providersContent
      );
    }
  }

  // Generate middleware based on selected integrations
  generateMiddleware() {
    if (this.selectedIntegrations.authentication === 'clerk') {
      const middlewareContent = `import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/user(.*)',
  '/settings(.*)',
])

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect()
})

export const config = {
  matcher: ['/((?!.*\\\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}`;

      fs.writeFileSync(
        path.join(this.outputPath, 'src/middleware.ts'),
        middlewareContent
      );
    }
  }

  // Generate home page
  generateHomePage() {
    const homeContent = `import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">${this.projectName}</h1>
      <p className="text-xl mb-8">Built with the SaaS Starter Kit</p>
      <div className="flex gap-4">
        <Link 
          href="/dashboard" 
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Get Started
        </Link>
        <Link 
          href="/pricing" 
          className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
        >
          View Pricing
        </Link>
      </div>
    </main>
  )
}`;

    fs.writeFileSync(
      path.join(this.outputPath, 'src/app/page.tsx'),
      homeContent
    );
  }

  // Generate API routes based on integrations
  generateApiRoutes() {
    // Health check endpoint
    const healthRoute = `import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    integrations: ${JSON.stringify(this.selectedIntegrations, null, 2)}
  })
}`;

    fs.writeFileSync(
      path.join(this.outputPath, 'src/app/api/health/route.ts'),
      healthRoute
    );
  }

  // Generate setup instructions
  generateSetupInstructions() {
    let instructions = `# Setup Instructions for ${this.projectName}

## Selected Integrations
`;

    Object.entries(this.selectedIntegrations).forEach(([category, integrationId]) => {
      const categoryConfig = manifest.categories[category];
      if (categoryConfig) {
        const integration = categoryConfig.options.find(opt => opt.id === integrationId);
        if (integration) {
          instructions += `- **${categoryConfig.name}**: ${integration.name}\n`;
        }
      }
    });

    instructions += `
## Quick Start

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Set up environment variables:
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`
   
   Then edit \`.env.local\` with your actual values.

3. Set up your services:
`;

    // Add service-specific setup instructions
    Object.entries(this.selectedIntegrations).forEach(([category, integrationId]) => {
      const categoryConfig = manifest.categories[category];
      if (categoryConfig) {
        const integration = categoryConfig.options.find(opt => opt.id === integrationId);
        if (integration) {
          instructions += `\n### ${integration.name}\n`;
          instructions += this.getIntegrationSetupInstructions(integration, category);
        }
      }
    });

    instructions += `
4. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000)

## Next Steps

- Customize the UI components in \`src/components\`
- Add your business logic in \`src/app\`
- Configure additional settings for each integration
- Deploy to your preferred hosting platform
`;

    fs.writeFileSync(
      path.join(this.outputPath, 'SETUP.md'),
      instructions
    );
  }

  // Get setup instructions for a specific integration
  getIntegrationSetupInstructions(integration, category) {
    const instructions = {
      clerk: `1. Sign up at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your API keys to \`.env.local\`
4. Configure OAuth providers in Clerk dashboard
5. Set up webhook endpoint (optional)`,
      
      stripe: `1. Sign up at [stripe.com](https://stripe.com)
2. Get your API keys from the dashboard
3. Create products and price IDs
4. Set up webhook endpoint for production
5. Test with Stripe CLI locally`,
      
      turso: `1. Sign up at [turso.tech](https://turso.tech)
2. Create a new database
3. Copy the database URL and auth token
4. Run \`npm run db:push\` to create tables`,
      
      resend: `1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Verify your domain for production
4. Create email templates in \`src/emails\``,
      
      posthog: `1. Sign up at [posthog.com](https://posthog.com)
2. Create a project
3. Copy your project API key
4. Configure feature flags (optional)`,
      
      sentry: `1. Sign up at [sentry.io](https://sentry.io)
2. Create a Next.js project
3. Copy your DSN
4. Run \`npx @sentry/wizard@latest -i nextjs\` for full setup`,
      
      // Add more integration instructions as needed
    };

    return instructions[integration.id] || `Please refer to ${integration.name} documentation for setup instructions.`;
  }

  // Get final setup instructions
  getSetupInstructions() {
    const steps = [];
    
    steps.push({
      title: 'Install Dependencies',
      command: 'npm install',
      description: 'Install all required packages'
    });

    steps.push({
      title: 'Configure Environment',
      command: 'cp .env.local.example .env.local',
      description: 'Set up your environment variables'
    });

    // Add database-specific steps
    if (this.selectedIntegrations.database === 'turso') {
      steps.push({
        title: 'Initialize Database',
        command: 'npm run db:push',
        description: 'Create database tables'
      });
    } else if (this.selectedIntegrations.database === 'prisma') {
      steps.push({
        title: 'Generate Prisma Client',
        command: 'npm run db:generate',
        description: 'Generate Prisma client'
      });
      steps.push({
        title: 'Push Database Schema',
        command: 'npm run db:push',
        description: 'Create database tables'
      });
    }

    steps.push({
      title: 'Start Development',
      command: 'npm run dev',
      description: 'Start the development server'
    });

    return steps;
  }

  // Helper to sort object keys
  sortObject(obj) {
    return Object.keys(obj)
      .sort()
      .reduce((result, key) => {
        result[key] = obj[key];
        return result;
      }, {});
  }
}

// Export for use in other scripts
module.exports = IntegrationGenerator;

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
SaaS Starter Kit Generator

Usage: node generator.js [options]

Options:
  --name <name>          Project name (default: my-saas-app)
  --output <path>        Output directory (default: ./generated)
  --template <template>  Template to use (saas, minimal, ecommerce, blog)
  --integrations <json>  JSON string of integrations

Example:
  node generator.js --name "My App" --template saas
  node generator.js --integrations '{"authentication":"clerk","database":"turso"}'
`);
    process.exit(0);
  }

  // Parse CLI arguments
  const options = {
    projectName: args[args.indexOf('--name') + 1] || 'my-saas-app',
    outputPath: args[args.indexOf('--output') + 1] || './generated',
    template: args[args.indexOf('--template') + 1] || 'saas'
  };

  // Parse integrations if provided
  const integrationsIndex = args.indexOf('--integrations');
  if (integrationsIndex !== -1) {
    try {
      options.integrations = JSON.parse(args[integrationsIndex + 1]);
    } catch (error) {
      console.error('Invalid integrations JSON:', error.message);
      process.exit(1);
    }
  } else {
    // Use default integrations from template
    const template = manifest.templates[options.template];
    if (template) {
      options.integrations = template.defaultIntegrations;
    }
  }

  // Generate the project
  const generator = new IntegrationGenerator(options);
  generator.generate().then(result => {
    console.log('\n✨ Generation complete!');
    console.log(`📁 Project created at: ${result.path}`);
    console.log('\nNext steps:');
    result.instructions.forEach((step, index) => {
      console.log(`${index + 1}. ${step.title}`);
      console.log(`   ${step.command}`);
    });
  }).catch(error => {
    console.error('Generation failed:', error);
    process.exit(1);
  });
}