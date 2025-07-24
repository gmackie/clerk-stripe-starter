#!/bin/bash
# Script to set up Gitea secrets for clerk-stripe-starter deployment

echo "Setting up Gitea secrets for clerk-stripe-starter deployment"
echo "============================================="

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found. Please copy .env.local.example and fill in your values."
    exit 1
fi

# Source the .env.local file
set -a
source .env.local
set +a

# Gitea repository info
GITEA_URL="https://ci.gmac.io"
GITEA_OWNER="your-username"  # Update this with your Gitea username
GITEA_REPO="clerk-stripe-starter"

echo ""
echo "Please update the GITEA_OWNER variable in this script with your Gitea username."
echo ""
echo "You'll need to add the following secrets to your Gitea repository:"
echo ""
echo "1. Go to: $GITEA_URL/$GITEA_OWNER/$GITEA_REPO/settings/actions/secrets"
echo ""
echo "2. Add these secrets:"
echo ""
echo "GITEA_TOKEN - Your Gitea personal access token"
echo "KUBECONFIG - The base64-encoded kubeconfig for your K3s cluster"
echo ""
echo "3. Add these application secrets from your .env.local:"
echo ""
echo "CLERK_SECRET_KEY=$CLERK_SECRET_KEY"
echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
echo ""
echo "STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY"
echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
echo "STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET"
echo ""
echo "TURSO_DATABASE_URL=$TURSO_DATABASE_URL"
echo "TURSO_AUTH_TOKEN=$TURSO_AUTH_TOKEN"
echo ""
echo "4. Add these Stripe Price IDs:"
echo ""
echo "STRIPE_PRICE_ID_STARTER_MONTHLY=$NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_MONTHLY"
echo "STRIPE_PRICE_ID_STARTER_YEARLY=$NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_YEARLY"
echo "STRIPE_PRICE_ID_PRO_MONTHLY=$NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY"
echo "STRIPE_PRICE_ID_PRO_YEARLY=$NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY"
echo "STRIPE_PRICE_ID_ENTERPRISE_MONTHLY=$NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_MONTHLY"
echo "STRIPE_PRICE_ID_ENTERPRISE_YEARLY=$NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_YEARLY"
echo ""
echo "5. Optional secrets (if using):"
echo ""
if [ ! -z "$UPSTASH_REDIS_REST_URL" ]; then
    echo "UPSTASH_REDIS_REST_URL=$UPSTASH_REDIS_REST_URL"
    echo "UPSTASH_REDIS_REST_TOKEN=$UPSTASH_REDIS_REST_TOKEN"
fi
echo ""
echo "After adding all secrets, push your code to trigger the deployment."