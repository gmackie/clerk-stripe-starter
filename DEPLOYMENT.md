# Deployment Guide for starter.gmac.io

This guide explains how to deploy the Clerk-Stripe starter to starter.gmac.io using Gitea CI/CD and K3s.

## Prerequisites

1. A Gitea repository at ci.gmac.io
2. Access to the K3s cluster
3. All required environment variables configured
4. DNS configured to point starter.gmac.io to your K3s cluster

## Setup Steps

### 1. Configure Environment Variables

Ensure your `.env.local` file has all required values:

```bash
cp .env.local.example .env.local
# Edit .env.local with your actual values
```

### 2. Configure Gitea Secrets

Run the setup script to see which secrets need to be added:

```bash
./setup-gitea-secrets.sh
```

Go to your Gitea repository settings and add all the required secrets:
- `https://ci.gmac.io/[your-username]/clerk-stripe-starter/settings/actions/secrets`

### 3. Update Webhook URLs

For production deployment, update your webhook URLs in:
- **Clerk Dashboard**: Set webhook endpoint to `https://starter.gmac.io/api/webhooks/clerk`
- **Stripe Dashboard**: Set webhook endpoint to `https://starter.gmac.io/api/webhooks/stripe`

### 4. Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial deployment setup"
git remote add origin https://ci.gmac.io/[your-username]/clerk-stripe-starter.git
git push -u origin main
```

### 5. Deploy

The deployment will automatically trigger when you push to the main branch. The CI/CD pipeline will:

1. Build the Next.js application
2. Create a Docker image
3. Push to the Gitea container registry
4. Deploy to K3s cluster
5. Configure SSL with Let's Encrypt
6. Make the app available at https://starter.gmac.io

## Monitoring Deployment

Watch the deployment progress:
- Go to Actions tab in your Gitea repository
- Click on the running workflow
- Monitor the logs

## Post-Deployment

After successful deployment:

1. **Test the application**: Visit https://starter.gmac.io
2. **Run database migrations**: 
   ```bash
   npm run db:push
   ```
3. **Verify webhooks**: Test a signup and payment to ensure webhooks are working

## Troubleshooting

### Check deployment status
```bash
kubectl get pods -n production
kubectl logs -n production -l app=clerk-stripe-starter
```

### View ingress status
```bash
kubectl get ingress -n production
```

### Check SSL certificate
```bash
kubectl describe certificate clerk-stripe-starter-tls -n production
```

## Updating the Application

To deploy updates:
1. Make your changes locally
2. Commit and push to main branch
3. The CI/CD pipeline will automatically deploy the new version

## Environment-Specific Configuration

The deployment uses these environment-specific values:
- **URL**: https://starter.gmac.io
- **Replicas**: 2 (for high availability)
- **Resources**: 256Mi-512Mi memory, 200m-500m CPU
- **SSL**: Automatic via Let's Encrypt

## Security Notes

- All secrets are stored in Gitea and injected at deployment time
- The application runs as a non-root user
- SSL is enforced for all traffic
- Secrets are never exposed in logs or Docker images