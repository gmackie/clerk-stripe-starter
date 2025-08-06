import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import IntegrationGenerator from '../../../../integrations/generator.js';
import manifest from '../../../../integrations/manifest.json';

// Validation schema
const generateSchema = z.object({
  projectName: z.string().min(1).max(100),
  template: z.enum(['saas', 'minimal', 'ecommerce', 'blog']),
  integrations: z.record(z.string()),
  includeDocker: z.boolean().optional(),
  includeGitHub: z.boolean().optional(),
});

// GET /api/generator - Get manifest
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      categories: manifest.categories,
      templates: manifest.templates,
      version: manifest.version,
    }
  });
}

// POST /api/generator - Generate project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = generateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        errors: validationResult.error.errors.map(e => e.message)
      }, { status: 400 });
    }

    const { projectName, template, integrations, includeDocker, includeGitHub } = validationResult.data;

    // Validate integrations
    const errors: string[] = [];
    Object.entries(manifest.categories).forEach(([categoryId, category]) => {
      if (category.required && !integrations[categoryId]) {
        errors.push(`${category.name} is required`);
      }
      
      if (integrations[categoryId]) {
        const validOptions = category.options.map((opt: any) => opt.id);
        if (!validOptions.includes(integrations[categoryId])) {
          errors.push(`Invalid ${category.name} selection: ${integrations[categoryId]}`);
        }
      }
    });

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        errors
      }, { status: 400 });
    }

    // Generate project structure (in-memory for API response)
    const generator = new IntegrationGenerator({
      projectName,
      template,
      integrations,
      outputPath: null // Don't write to disk for API
    });

    // Get the configuration without generating files
    const config = {
      projectName,
      template,
      integrations,
      dependencies: {},
      envVars: [],
      setupSteps: [],
      files: []
    };

    // Collect dependencies
    Object.entries(integrations).forEach(([category, integrationId]) => {
      const categoryConfig = manifest.categories[category];
      if (categoryConfig) {
        const integration = categoryConfig.options.find((opt: any) => opt.id === integrationId);
        if (integration?.dependencies) {
          integration.dependencies.forEach((dep: string) => {
            config.dependencies[dep] = 'latest';
          });
        }
        if (integration?.envVars) {
          config.envVars.push(...integration.envVars);
        }
        if (integration?.files) {
          config.files.push(...integration.files);
        }
      }
    });

    // Generate setup steps
    config.setupSteps = generator.getSetupInstructions();

    // Generate additional files if requested
    const additionalFiles: any = {};
    
    if (includeDocker) {
      additionalFiles.dockerfile = generateDockerfile(integrations);
      additionalFiles.dockerCompose = generateDockerCompose(integrations);
    }

    if (includeGitHub) {
      additionalFiles.githubWorkflow = generateGitHubWorkflow(integrations);
    }

    return NextResponse.json({
      success: true,
      data: {
        config,
        additionalFiles,
        downloadUrl: `/api/generator/download?config=${encodeURIComponent(JSON.stringify(config))}`
      }
    });

  } catch (error) {
    console.error('Generator error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate project configuration'
    }, { status: 500 });
  }
}

// Helper functions
function generateDockerfile(integrations: Record<string, string>) {
  let dockerfile = `FROM node:18-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
`;

  // Add build args for public env vars
  if (integrations.authentication === 'clerk') {
    dockerfile += 'ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY\n';
  }
  if (integrations.payments === 'stripe') {
    dockerfile += 'ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY\n';
  }

  dockerfile += `
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]`;

  return dockerfile;
}

function generateDockerCompose(integrations: Record<string, string>) {
  let compose = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
`;

  // Add database service if needed
  if (integrations.database === 'supabase') {
    compose += `      - NEXT_PUBLIC_SUPABASE_URL=\${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=\${NEXT_PUBLIC_SUPABASE_ANON_KEY}
`;
  }

  return compose;
}

function generateGitHubWorkflow(integrations: Record<string, string>) {
  return `name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
        cache: 'npm'
    - run: npm ci
    - run: npm run lint
    - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    - name: Deploy to production
      run: |
        # Add your deployment script here
        echo "Deploying to production..."
`;
}