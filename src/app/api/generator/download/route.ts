import { NextRequest, NextResponse } from 'next/server';
import archiver from 'archiver';
import { Readable } from 'stream';
import IntegrationGenerator from '../../../../../integrations/generator.js';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const configString = searchParams.get('config');
    
    if (!configString) {
      return NextResponse.json({
        success: false,
        error: 'Configuration required'
      }, { status: 400 });
    }

    const config = JSON.parse(decodeURIComponent(configString));
    
    // Create a temporary in-memory project structure
    const projectFiles = await generateProjectFiles(config);
    
    // Create a zip stream
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    // Add files to the archive
    Object.entries(projectFiles).forEach(([filePath, content]) => {
      archive.append(content as string, { name: filePath });
    });
    
    archive.finalize();
    
    // Convert archive to readable stream
    const stream = Readable.from(archive);
    
    // Return the zip file
    return new NextResponse(stream as any, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${config.projectName.toLowerCase().replace(/\s+/g, '-')}.zip"`
      }
    });
    
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate download'
    }, { status: 500 });
  }
}

async function generateProjectFiles(config: any) {
  const files: Record<string, string> = {};
  
  // Package.json
  files['package.json'] = JSON.stringify({
    name: config.projectName.toLowerCase().replace(/\s+/g, '-'),
    version: '0.1.0',
    private: true,
    scripts: {
      dev: 'next dev --turbopack',
      build: 'next build',
      start: 'next start',
      lint: 'next lint',
      ...(config.integrations.database === 'turso' ? {
        'db:push': 'drizzle-kit push',
        'db:studio': 'drizzle-kit studio'
      } : {}),
      ...(config.integrations.database === 'prisma' ? {
        'db:push': 'prisma db push',
        'db:studio': 'prisma studio',
        'db:generate': 'prisma generate'
      } : {})
    },
    dependencies: {
      next: '15.4.2',
      react: '19.1.0',
      'react-dom': '19.1.0',
      ...config.dependencies
    },
    devDependencies: {
      '@types/node': '^20',
      '@types/react': '^19',
      '@types/react-dom': '^19',
      typescript: '^5',
      eslint: '^9',
      'eslint-config-next': '15.4.2'
    }
  }, null, 2);
  
  // .env.local.example
  let envContent = `# ${config.projectName} Environment Variables

NEXT_PUBLIC_APP_URL=http://localhost:3000

`;
  
  config.envVars.forEach((envVar: any) => {
    envContent += `# ${envVar.description}${envVar.required ? ' [REQUIRED]' : ' [OPTIONAL]'}\n`;
    envContent += `${envVar.key}=\n\n`;
  });
  
  files['.env.local.example'] = envContent;
  
  // README.md
  files['README.md'] = `# ${config.projectName}

Built with the SaaS Starter Kit

## Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Copy environment variables:
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

3. Configure your services and add API keys to \`.env.local\`

4. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Integrations

${Object.entries(config.integrations).map(([category, integration]) => 
  `- **${category}**: ${integration}`
).join('\n')}

## Deployment

This project can be deployed to any platform that supports Next.js:
- Vercel
- Netlify
- Railway
- Render
- Self-hosted

## License

MIT
`;

  // Basic Next.js structure
  files['next.config.mjs'] = `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
}

export default nextConfig
`;

  files['tailwind.config.ts'] = `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
`;

  files['tsconfig.json'] = `{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`;

  // App structure
  files['src/app/globals.css'] = `@tailwind base;
@tailwind components;
@tailwind utilities;
`;

  files['src/app/layout.tsx'] = generateLayoutFile(config);
  files['src/app/page.tsx'] = generateHomePageFile(config);
  
  // Add middleware if using Clerk
  if (config.integrations.authentication === 'clerk') {
    files['src/middleware.ts'] = generateMiddlewareFile();
  }
  
  // Add .gitignore
  files['.gitignore'] = `# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
`;

  return files;
}

function generateLayoutFile(config: any) {
  let imports = `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'\n`;

  if (config.integrations.authentication === 'clerk') {
    imports += `import { ClerkProvider } from '@clerk/nextjs'\n`;
  }

  return `${imports}
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '${config.projectName}',
  description: 'Built with the SaaS Starter Kit',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    ${config.integrations.authentication === 'clerk' ? '<ClerkProvider>' : ''}
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
    ${config.integrations.authentication === 'clerk' ? '</ClerkProvider>' : ''}
  )
}`;
}

function generateHomePageFile(config: any) {
  return `import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">${config.projectName}</h1>
      <p className="text-xl mb-8">Built with the SaaS Starter Kit</p>
      <div className="flex gap-4">
        <Link 
          href="/dashboard" 
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Get Started
        </Link>
      </div>
    </main>
  )
}`;
}

function generateMiddlewareFile() {
  return `import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/user(.*)',
  '/settings(.*)',
])

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect()
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}`;
}