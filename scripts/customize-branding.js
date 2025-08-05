#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Update file content
function updateFile(filePath, replacements) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    for (const [search, replace] of Object.entries(replacements)) {
      content = content.replace(new RegExp(search, 'g'), replace);
    }
    
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

// Generate color variations
function generateColorShades(hexColor) {
  // Convert hex to RGB
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Generate shades
  const shades = {};
  const factors = [0.95, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];
  
  factors.forEach((factor, index) => {
    const shade = (index + 1) * 100;
    const newR = Math.round(r + (255 - r) * (1 - factor));
    const newG = Math.round(g + (255 - g) * (1 - factor));
    const newB = Math.round(b + (255 - b) * (1 - factor));
    
    shades[shade] = `${newR} ${newG} ${newB}`;
  });
  
  return shades;
}

async function customizeBranding() {
  log('\n🎨 Branding Customization Wizard', 'bright');
  log('This will help you customize your app\'s branding\n', 'cyan');
  
  // Get branding information
  const appName = await question('App name (My SaaS App): ') || 'My SaaS App';
  const appDescription = await question('App description (One line): ') || 'Build your SaaS faster with our complete starter kit';
  const primaryColor = await question('Primary color (hex, e.g., #3b82f6): ') || '#3b82f6';
  const logo = await question('Logo text or emoji (🚀): ') || '🚀';
  
  log('\n📝 Updating branding...', 'yellow');
  
  // Update layout.tsx
  const layoutPath = path.join('src', 'app', 'layout.tsx');
  updateFile(layoutPath, {
    'Clerk & Stripe Starter': appName,
    'A modern SaaS starter kit with authentication and payments': appDescription
  });
  log('✅ Updated layout metadata', 'green');
  
  // Update components that display the app name
  const componentsToUpdate = [
    path.join('src', 'components', 'layout', 'header.tsx'),
    path.join('src', 'components', 'layout', 'footer.tsx'),
    path.join('src', 'app', 'page.tsx'),
    path.join('src', 'app', '(auth)', 'sign-in', '[[...sign-in]]', 'page.tsx'),
    path.join('src', 'app', '(auth)', 'sign-up', '[[...sign-up]]', 'page.tsx')
  ];
  
  for (const componentPath of componentsToUpdate) {
    if (updateFile(componentPath, {
      'Clerk & Stripe Starter': appName,
      'SaaS Starter': appName,
      '🚀': logo
    })) {
      log(`✅ Updated ${path.basename(componentPath)}`, 'green');
    }
  }
  
  // Create custom theme CSS
  const colorShades = generateColorShades(primaryColor);
  const themeCSS = `/* Custom theme colors */
:root {
  /* Primary color shades */
  --primary-50: ${colorShades[50]};
  --primary-100: ${colorShades[100]};
  --primary-200: ${colorShades[200]};
  --primary-300: ${colorShades[300]};
  --primary-400: ${colorShades[400]};
  --primary-500: ${colorShades[500]};
  --primary-600: ${colorShades[600]};
  --primary-700: ${colorShades[700]};
  --primary-800: ${colorShades[800]};
  --primary-900: ${colorShades[900]};
  
  /* Default primary (500) */
  --primary: ${colorShades[500]};
}

/* Update Tailwind primary colors */
.text-primary {
  color: rgb(var(--primary));
}

.bg-primary {
  background-color: rgb(var(--primary));
}

.border-primary {
  border-color: rgb(var(--primary));
}

/* Update button styles */
.btn-primary {
  background-color: rgb(var(--primary));
  color: white;
}

.btn-primary:hover {
  background-color: rgb(var(--primary-600));
}

/* Update link colors */
a {
  color: rgb(var(--primary));
}

a:hover {
  color: rgb(var(--primary-700));
}
`;
  
  // Write custom theme
  const themePath = path.join('src', 'app', 'theme.css');
  fs.writeFileSync(themePath, themeCSS);
  log('✅ Created custom theme file', 'green');
  
  // Update globals.css to import theme
  const globalsPath = path.join('src', 'app', 'globals.css');
  if (fs.existsSync(globalsPath)) {
    const globalsContent = fs.readFileSync(globalsPath, 'utf8');
    if (!globalsContent.includes('@import "./theme.css"')) {
      const updatedGlobals = `@import "./theme.css";\n${globalsContent}`;
      fs.writeFileSync(globalsPath, updatedGlobals);
      log('✅ Updated globals.css', 'green');
    }
  }
  
  // Create branding config file
  const brandingConfig = {
    name: appName,
    description: appDescription,
    logo: logo,
    primaryColor: primaryColor,
    theme: {
      colors: {
        primary: colorShades
      }
    },
    social: {
      twitter: '',
      github: '',
      discord: ''
    }
  };
  
  const configPath = path.join('src', 'lib', 'branding.ts');
  const configContent = `// Branding configuration
export const branding = ${JSON.stringify(brandingConfig, null, 2)};

export type Branding = typeof branding;
`;
  
  fs.writeFileSync(configPath, configContent);
  log('✅ Created branding configuration', 'green');
  
  // Update package.json
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  packageJson.name = appName.toLowerCase().replace(/\s+/g, '-');
  packageJson.description = appDescription;
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  log('✅ Updated package.json', 'green');
  
  // Update README.md
  const readmePath = 'README.md';
  updateFile(readmePath, {
    'Clerk & Stripe SaaS Starter Kit': appName,
    'A production-ready SaaS starter template with authentication, payments, and subscription management.': appDescription
  });
  log('✅ Updated README.md', 'green');
  
  log('\n✨ Branding customization complete!', 'bright');
  log('\nYour app has been customized with:', 'cyan');
  log(`- Name: ${appName}`, 'yellow');
  log(`- Logo: ${logo}`, 'yellow');
  log(`- Primary color: ${primaryColor}`, 'yellow');
  log('\nRestart your development server to see the changes.', 'cyan');
  
  rl.close();
}

// Run customization
customizeBranding().catch((error) => {
  log(`\n❌ Customization failed: ${error.message}`, 'red');
  process.exit(1);
});