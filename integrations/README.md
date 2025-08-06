# SaaS Starter Kit Integration System

This modular integration system allows the SaaS Starter Kit to be customized with different service providers and configurations. It can be used standalone or integrated into a control panel UI.

## Architecture

### 1. **Manifest System** (`manifest.json`)
Defines all available integrations organized by category:
- Authentication (Clerk, NextAuth)
- Payments (Stripe, Lemon Squeezy)
- Database (Turso, Supabase, Prisma)
- Email (Resend, SendGrid, Postmark)
- Storage (Cloudinary, UploadThing, S3)
- Analytics (PostHog, Vercel, Plausible)
- Monitoring (Sentry)
- Background Jobs (Inngest, Trigger.dev)
- Rate Limiting (Upstash)
- CMS (Sanity, Contentful)

### 2. **Generator** (`generator.js`)
Creates custom project structures based on selected integrations:
- Generates only required dependencies
- Creates environment variable templates
- Produces integration-specific code files
- Provides setup instructions

### 3. **API Handler** (`api-handler.js`)
Server-side handler for generating projects:
- Validates integration selections
- Creates zip archives
- Manages temporary files
- Provides download endpoints

### 4. **UI Components**
- `starter-kit-generator.tsx` - Standalone component
- `control-panel-integration.tsx` - Control panel ready component

## Usage

### Standalone CLI
```bash
node integrations/generator.js --name "My App" --template saas
```

### API Endpoint
```bash
POST /api/generator
{
  "projectName": "my-app",
  "template": "saas",
  "integrations": {
    "authentication": "clerk",
    "payments": "stripe",
    "database": "turso"
  }
}
```

### Control Panel Integration

1. Copy `control-panel-integration.tsx` to your control panel
2. Import and use the component:

```tsx
import { StarterKitGeneratorPanel } from '@/components/starter-kit-generator';

function CreateApplicationPage() {
  return (
    <StarterKitGeneratorPanel 
      apiEndpoint="https://starter.gmac.io/api/generator"
      onProjectCreated={(project) => {
        // Handle project creation
        console.log('Project created:', project);
      }}
    />
  );
}
```

## Adding New Integrations

### 1. Update Manifest
Add your integration to the appropriate category in `manifest.json`:

```json
{
  "id": "my-service",
  "name": "My Service",
  "description": "Description of the service",
  "dependencies": ["my-service-sdk"],
  "envVars": [
    {
      "key": "MY_SERVICE_API_KEY",
      "description": "API key for My Service",
      "required": true
    }
  ],
  "files": [
    "src/lib/my-service.ts",
    "src/app/api/my-service"
  ]
}
```

### 2. Create Templates
Add template files for your integration:
- Configuration files
- API route handlers
- Client libraries
- UI components

### 3. Update Generator
Add any special handling in the generator:
- Custom setup instructions
- Service-specific configurations
- Build process modifications

## Templates

### SaaS Template
Full-featured SaaS application with:
- User authentication
- Subscription billing
- Email notifications
- File storage
- Analytics
- Error monitoring

### Minimal Template
Basic setup with:
- Authentication
- Database
- Core UI components

### E-commerce Template
Online store with:
- Product catalog
- Shopping cart
- Payment processing
- Order management
- Inventory tracking

### Blog Template
Content site with:
- CMS integration
- SEO optimization
- Comments system
- Newsletter signup

## Integration with CI/CD

The generated projects include:
- Docker configuration
- GitHub Actions workflows
- Deployment scripts
- Environment variable management

## Security Considerations

- API keys are never stored in generated code
- Environment variables are clearly documented
- Webhook secrets are properly validated
- Rate limiting is available for all APIs

## Best Practices

1. **Minimal Dependencies**: Only include what's selected
2. **Clear Documentation**: Every integration is documented
3. **Type Safety**: TypeScript throughout
4. **Error Handling**: Graceful failures with clear messages
5. **Flexibility**: Easy to extend and customize

## Future Enhancements

- [ ] Visual configuration builder
- [ ] Integration marketplace
- [ ] Custom integration plugins
- [ ] Automated testing for each configuration
- [ ] One-click deployment to cloud providers
- [ ] Integration health monitoring
- [ ] Cost calculator for selected services

## Contributing

To add a new integration:
1. Fork the repository
2. Add your integration to manifest.json
3. Create necessary template files
4. Add setup instructions
5. Submit a pull request

## License

MIT