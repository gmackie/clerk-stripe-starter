# Documentation Site with Nextra

This project includes a comprehensive documentation site built with [Nextra](https://nextra.site), a full-featured documentation framework based on Next.js.

## Features

- **📚 MDX Support**: Write docs in Markdown with React components
- **🔍 Full-text Search**: Built-in search functionality
- **🌓 Dark Mode**: Automatic dark mode support
- **📱 Responsive**: Mobile-friendly documentation
- **🚀 Fast**: Static site generation for optimal performance
- **🎨 Customizable**: Tailored theme and styling

## Structure

```
docs/
├── pages/
│   ├── _meta.json          # Navigation structure
│   ├── index.mdx           # Home page
│   ├── getting-started/    # Getting started guides
│   ├── features/           # Feature documentation
│   ├── api/                # API reference
│   ├── guides/             # How-to guides
│   ├── deployment/         # Deployment guides
│   └── 404.mdx            # Custom 404 page
├── public/
│   └── style.css          # Custom styles
├── theme.config.tsx       # Theme configuration
├── next.config.mjs        # Next.js configuration
└── package.json           # Dependencies
```

## Running the Documentation

### Development

```bash
cd docs
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the documentation.

### Build

```bash
cd docs
npm run build
```

### Production

```bash
cd docs
npm run start
```

## Adding Documentation

### Create a New Page

1. Add an MDX file in the appropriate directory:

```mdx
# Page Title

Your content here...

## Section

More content...
```

2. Update `_meta.json` to include the page in navigation:

```json
{
  "index": "Home",
  "new-page": "New Page Title"
}
```

### Using React Components

You can use React components in MDX files:

```mdx
import { Callout } from 'nextra/components'

# My Page

<Callout type="info">
  This is an info callout
</Callout>
```

### Code Blocks

Use triple backticks with syntax highlighting:

````mdx
```typescript
const greeting = "Hello, World!";
console.log(greeting);
```
````

### Tables

Create tables using Markdown syntax:

```mdx
| Feature | Description |
|---------|-------------|
| Auth    | Clerk integration |
| Payments| Stripe subscriptions |
```

## Customization

### Theme Configuration

Edit `docs/theme.config.tsx` to customize:

- Logo and title
- Navigation behavior
- Footer content
- Search settings
- Social links

### Custom Styles

Add custom CSS in `docs/public/style.css`:

```css
/* Custom styles */
.my-custom-class {
  color: #3b82f6;
}
```

### Components

Create custom components in `docs/components/`:

```tsx
export function FeatureCard({ title, description }) {
  return (
    <div className="p-4 border rounded-lg">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
```

## Deployment

### Deploy to Vercel

1. Push docs to your repository
2. Import to Vercel
3. Set build command: `cd docs && npm run build`
4. Set output directory: `docs/.next`

### Deploy Separately

You can also deploy the docs as a separate site:

```bash
cd docs
vercel
```

### Custom Domain

Configure a subdomain for your docs:
- `docs.yourdomain.com`
- `help.yourdomain.com`

## Best Practices

### Writing Documentation

1. **Clear Structure**: Organize content logically
2. **Code Examples**: Provide practical examples
3. **Visual Aids**: Use diagrams and screenshots
4. **Search Optimization**: Use descriptive headings
5. **Cross-linking**: Link between related pages

### Navigation

Organize pages hierarchically:

```
Getting Started
  ├── Installation
  ├── Configuration
  └── First Steps
Features
  ├── Authentication
  ├── Payments
  └── Database
```

### Versioning

For API versioning:

1. Create version directories: `pages/api/v1/`, `pages/api/v2/`
2. Use redirects for latest version
3. Mark deprecated features clearly

## Advanced Features

### Search Configuration

Customize search in `theme.config.tsx`:

```tsx
search: {
  placeholder: 'Search documentation...',
}
```

### Internationalization

Add language support:

```
pages/
  en/
  es/
  fr/
```

### Analytics

Add analytics to track usage:

```tsx
// theme.config.tsx
head: (
  <>
    <script src="analytics.js" />
  </>
)
```

## Troubleshooting

### Build Errors

```bash
# Clear cache
rm -rf docs/.next
# Reinstall dependencies
rm -rf docs/node_modules
cd docs && npm install
```

### Search Not Working

- Ensure all pages are properly indexed
- Check for build errors
- Verify search configuration

### Styling Issues

- Check custom CSS specificity
- Verify Tailwind configuration
- Use browser dev tools

## Contributing

To contribute to the documentation:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

### Style Guide

- Use present tense
- Be concise and clear
- Include code examples
- Test all examples
- Check for broken links

## Resources

- [Nextra Documentation](https://nextra.site)
- [MDX Documentation](https://mdxjs.com)
- [Next.js Documentation](https://nextjs.org/docs)