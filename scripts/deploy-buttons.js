#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Generate deploy button configurations
const deployConfigs = {
  vercel: {
    name: 'Deploy to Vercel',
    url: 'https://vercel.com/new/clone',
    params: {
      repository: 'https://github.com/yourusername/saas-starter',
      'env': [
        'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
        'CLERK_SECRET_KEY',
        'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
        'STRIPE_SECRET_KEY',
        'TURSO_DATABASE_URL',
        'TURSO_AUTH_TOKEN',
        'CRON_SECRET'
      ].join(',')
    },
    color: '#000000',
    logo: 'https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png'
  },
  
  netlify: {
    name: 'Deploy to Netlify',
    url: 'https://app.netlify.com/start/deploy',
    params: {
      repository: 'https://github.com/yourusername/saas-starter'
    },
    color: '#00C7B7',
    logo: 'https://www.netlify.com/img/press/logos/logomark.svg'
  },
  
  railway: {
    name: 'Deploy on Railway',
    url: 'https://railway.app/new/template',
    params: {
      template: 'https://github.com/yourusername/saas-starter'
    },
    color: '#0B0D0E',
    logo: 'https://railway.app/brand/logo-light.svg'
  },
  
  render: {
    name: 'Deploy to Render',
    url: 'https://render.com/deploy',
    params: {
      repo: 'https://github.com/yourusername/saas-starter'
    },
    color: '#46E3B7',
    logo: 'https://render.com/images/logo.svg'
  }
};

// Generate deploy button markdown
function generateDeployButton(platform, config) {
  const queryParams = new URLSearchParams(config.params).toString();
  const deployUrl = `${config.url}?${queryParams}`;
  
  return `[![Deploy to ${config.name}](https://img.shields.io/badge/Deploy%20to-${encodeURIComponent(config.name)}-${config.color.replace('#', '')}?style=for-the-badge&logo=${encodeURIComponent(config.name.toLowerCase())}&logoColor=white)](${deployUrl})`;
}

// Generate all deploy buttons
function generateAllDeployButtons() {
  const buttons = Object.entries(deployConfigs).map(([platform, config]) => 
    generateDeployButton(platform, config)
  );
  
  return buttons.join('\n\n');
}

// Create deploy configuration files
function createDeployConfigs() {
  // Vercel configuration
  const vercelConfig = {
    "buildCommand": "npm run build",
    "outputDirectory": ".next",
    "installCommand": "npm install",
    "framework": "nextjs",
    "env": {
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": {
        "description": "Clerk publishable key for authentication"
      },
      "CLERK_SECRET_KEY": {
        "description": "Clerk secret key for server-side authentication"
      },
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY": {
        "description": "Stripe publishable key for payments"
      },
      "STRIPE_SECRET_KEY": {
        "description": "Stripe secret key for server-side payments"
      },
      "TURSO_DATABASE_URL": {
        "description": "Turso database URL"
      },
      "TURSO_AUTH_TOKEN": {
        "description": "Turso authentication token"
      },
      "CRON_SECRET": {
        "description": "Secret for cron job authentication"
      }
    }
  };
  
  fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
  
  // Netlify configuration
  const netlifyConfig = `[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NEXT_TELEMETRY_DISABLED = "1"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[template.environment]
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "Clerk publishable key"
  CLERK_SECRET_KEY = "Clerk secret key"
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "Stripe publishable key"
  STRIPE_SECRET_KEY = "Stripe secret key"
  TURSO_DATABASE_URL = "Turso database URL"
  TURSO_AUTH_TOKEN = "Turso auth token"
  CRON_SECRET = "Cron secret"`;
  
  fs.writeFileSync('netlify.toml', netlifyConfig);
  
  // Railway configuration
  const railwayConfig = {
    "$schema": "https://railway.app/railway.schema.json",
    "build": {
      "builder": "NIXPACKS"
    },
    "deploy": {
      "startCommand": "npm start",
      "restartPolicyType": "ON_FAILURE",
      "restartPolicyMaxRetries": 10
    }
  };
  
  fs.writeFileSync('railway.json', JSON.stringify(railwayConfig, null, 2));
  
  // Render configuration
  const renderConfig = {
    "services": [
      {
        "type": "web",
        "name": "saas-starter",
        "env": "node",
        "buildCommand": "npm install && npm run build",
        "startCommand": "npm start",
        "envVars": [
          {
            "key": "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
            "description": "Clerk publishable key"
          },
          {
            "key": "CLERK_SECRET_KEY",
            "description": "Clerk secret key"
          },
          {
            "key": "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
            "description": "Stripe publishable key"
          },
          {
            "key": "STRIPE_SECRET_KEY",
            "description": "Stripe secret key"
          },
          {
            "key": "TURSO_DATABASE_URL",
            "description": "Turso database URL"
          },
          {
            "key": "TURSO_AUTH_TOKEN",
            "description": "Turso auth token"
          },
          {
            "key": "CRON_SECRET",
            "description": "Cron secret"
          }
        ]
      }
    ]
  };
  
  fs.writeFileSync('render.yaml', JSON.stringify(renderConfig, null, 2));
  
  console.log('✅ Created deployment configuration files');
  console.log('- vercel.json');
  console.log('- netlify.toml');
  console.log('- railway.json');
  console.log('- render.yaml');
}

// Create deploy buttons markdown
function createDeployButtonsMarkdown() {
  const deployButtons = generateAllDeployButtons();
  
  const markdownContent = `# One-Click Deploy

Deploy your SaaS starter to your favorite platform with one click:

${deployButtons}

## Platform-Specific Instructions

### Vercel
1. Click the deploy button above
2. Connect your GitHub account
3. Add the required environment variables
4. Deploy!

### Netlify
1. Click the deploy button above
2. Connect your GitHub account
3. Configure environment variables in site settings
4. Deploy!

### Railway
1. Click the deploy button above
2. Connect your GitHub account
3. Add environment variables in the Railway dashboard
4. Deploy!

### Render
1. Click the deploy button above
2. Connect your GitHub account
3. Configure environment variables
4. Deploy!

## Required Environment Variables

All platforms require these environment variables:

- \`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY\` - Your Clerk publishable key
- \`CLERK_SECRET_KEY\` - Your Clerk secret key
- \`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY\` - Your Stripe publishable key
- \`STRIPE_SECRET_KEY\` - Your Stripe secret key
- \`TURSO_DATABASE_URL\` - Your Turso database URL
- \`TURSO_AUTH_TOKEN\` - Your Turso auth token
- \`CRON_SECRET\` - A random secret for cron jobs

## Post-Deployment Setup

After deploying:

1. Update your Clerk and Stripe webhook URLs to point to your new domain
2. Update your \`.env.local\` with production values
3. Run database migrations if needed
4. Test the payment flow with Stripe test mode

## Custom Domain

Most platforms support custom domains. Check their documentation for setup instructions:

- [Vercel Custom Domains](https://vercel.com/docs/concepts/projects/custom-domains)
- [Netlify Custom Domains](https://docs.netlify.com/domains-https/custom-domains/)
- [Railway Custom Domains](https://docs.railway.app/deploy/custom-domains)
- [Render Custom Domains](https://render.com/docs/custom-domains)
`;

  fs.writeFileSync('DEPLOY.md', markdownContent);
  console.log('✅ Created DEPLOY.md with one-click deploy buttons');
}

// Main function
function main() {
  console.log('🚀 Generating one-click deploy configurations...\n');
  
  createDeployConfigs();
  createDeployButtonsMarkdown();
  
  console.log('\n✨ One-click deploy setup complete!');
  console.log('\nNext steps:');
  console.log('1. Update repository URLs in the configuration files');
  console.log('2. Commit and push the new files');
  console.log('3. Add the deploy buttons to your README.md');
  console.log('4. Test the deploy buttons work correctly');
}

// Run the script
main();