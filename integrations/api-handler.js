const IntegrationGenerator = require('./generator');
const manifest = require('./manifest.json');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');

class StarterKitAPI {
  constructor() {
    this.tempDir = path.join(process.cwd(), '.temp');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  // Get available integrations and templates
  async getManifest() {
    return {
      success: true,
      data: {
        categories: manifest.categories,
        templates: manifest.templates,
        version: manifest.version
      }
    };
  }

  // Validate integration selection
  validateIntegrations(integrations) {
    const errors = [];
    
    // Check if required categories have selections
    Object.entries(manifest.categories).forEach(([categoryId, category]) => {
      if (category.required && !integrations[categoryId]) {
        errors.push(`${category.name} is required`);
      }
      
      // Validate selected integration exists
      if (integrations[categoryId]) {
        const validOptions = category.options.map(opt => opt.id);
        if (!validOptions.includes(integrations[categoryId])) {
          errors.push(`Invalid ${category.name} selection: ${integrations[categoryId]}`);
        }
      }
    });

    return errors;
  }

  // Generate a project and return download info
  async generateProject(options) {
    const projectId = uuidv4();
    const outputPath = path.join(this.tempDir, projectId);
    
    try {
      // Validate integrations
      const errors = this.validateIntegrations(options.integrations);
      if (errors.length > 0) {
        return {
          success: false,
          errors
        };
      }

      // Generate the project
      const generator = new IntegrationGenerator({
        ...options,
        outputPath
      });
      
      const result = await generator.generate();
      
      // Create a zip file
      const zipPath = `${outputPath}.zip`;
      await this.createZip(outputPath, zipPath);
      
      // Clean up the directory
      this.cleanup(outputPath);
      
      return {
        success: true,
        data: {
          projectId,
          downloadUrl: `/api/starter/download/${projectId}`,
          integrations: result.integrations,
          instructions: result.instructions,
          expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour
        }
      };
    } catch (error) {
      // Clean up on error
      if (fs.existsSync(outputPath)) {
        this.cleanup(outputPath);
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create a zip archive of the generated project
  async createZip(sourcePath, outputPath) {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      output.on('close', resolve);
      archive.on('error', reject);

      archive.pipe(output);
      archive.directory(sourcePath, false);
      archive.finalize();
    });
  }

  // Download a generated project
  async downloadProject(projectId) {
    const zipPath = path.join(this.tempDir, `${projectId}.zip`);
    
    if (!fs.existsSync(zipPath)) {
      return {
        success: false,
        error: 'Project not found or expired'
      };
    }

    return {
      success: true,
      path: zipPath,
      cleanup: () => fs.unlinkSync(zipPath)
    };
  }

  // Get setup script for a specific configuration
  async getSetupScript(options) {
    const steps = [];
    const { integrations } = options;

    // Base setup
    steps.push('#!/bin/bash');
    steps.push('set -e');
    steps.push('');
    steps.push('echo "🚀 Setting up your SaaS application..."');
    steps.push('');

    // Install dependencies
    steps.push('echo "📦 Installing dependencies..."');
    steps.push('npm install');
    steps.push('');

    // Copy env file
    steps.push('echo "🔧 Setting up environment..."');
    steps.push('cp .env.local.example .env.local');
    steps.push('');

    // Database setup
    if (integrations.database === 'turso') {
      steps.push('echo "🗄️ Setting up Turso database..."');
      steps.push('# Create database: turso db create my-app-db');
      steps.push('# Get credentials: turso db show my-app-db --url');
      steps.push('# After adding credentials to .env.local:');
      steps.push('# npm run db:push');
      steps.push('');
    } else if (integrations.database === 'prisma') {
      steps.push('echo "🗄️ Setting up Prisma..."');
      steps.push('npx prisma generate');
      steps.push('# After adding DATABASE_URL to .env.local:');
      steps.push('# npm run db:push');
      steps.push('');
    }

    // Stripe setup
    if (integrations.payments === 'stripe') {
      steps.push('echo "💳 Setting up Stripe..."');
      steps.push('# Install Stripe CLI: https://stripe.com/docs/stripe-cli');
      steps.push('# stripe login');
      steps.push('# Create products or run: npm run setup:stripe');
      steps.push('');
    }

    // Final instructions
    steps.push('echo "✅ Setup complete!"');
    steps.push('echo ""');
    steps.push('echo "Next steps:"');
    steps.push('echo "1. Add your API keys to .env.local"');
    steps.push('echo "2. Set up your database"');
    steps.push('echo "3. Run: npm run dev"');
    steps.push('echo ""');
    steps.push('echo "Visit http://localhost:3000 to see your app!"');

    return {
      success: true,
      script: steps.join('\n')
    };
  }

  // Get Docker configuration for the project
  async getDockerConfig(options) {
    const { integrations } = options;
    
    let dockerfile = `FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment variables
`;

    // Add build args for selected integrations
    if (integrations.authentication === 'clerk') {
      dockerfile += `ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY\n`;
    }
    if (integrations.payments === 'stripe') {
      dockerfile += `ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY\n`;
    }
    // Add more as needed

    dockerfile += `
# Build the application
RUN npm run build

# Production image
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

CMD ["node", "server.js"]
`;

    const dockerCompose = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
`;

    // Add service-specific configurations
    if (integrations.database === 'supabase') {
      dockerCompose += `      - NEXT_PUBLIC_SUPABASE_URL=\${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=\${NEXT_PUBLIC_SUPABASE_ANON_KEY}
`;
    }

    return {
      success: true,
      dockerfile,
      dockerCompose
    };
  }

  // Clean up temporary files
  cleanup(dirPath) {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  }

  // Clean up old temporary files (run periodically)
  cleanupOldFiles() {
    const files = fs.readdirSync(this.tempDir);
    const now = Date.now();
    const maxAge = 3600000; // 1 hour

    files.forEach(file => {
      const filePath = path.join(this.tempDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtimeMs > maxAge) {
        if (file.endsWith('.zip')) {
          fs.unlinkSync(filePath);
        } else if (stats.isDirectory()) {
          this.cleanup(filePath);
        }
      }
    });
  }
}

module.exports = StarterKitAPI;