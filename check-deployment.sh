#!/bin/bash
# Check deployment status

echo "🔍 Checking deployment status..."
echo ""
echo "📍 Repository: https://ci.gmac.io/mackieg/clerk-stripe-starter"
echo "🚀 Actions: https://ci.gmac.io/mackieg/clerk-stripe-starter/actions"
echo "🌐 Live site: https://starter.gmac.io"
echo ""
echo "To monitor the deployment:"
echo "1. Go to the Actions URL above"
echo "2. Click on the running workflow"
echo "3. Watch the deployment progress"
echo ""
echo "Once deployed, don't forget to:"
echo "1. Update Clerk webhook URL to: https://starter.gmac.io/api/webhooks/clerk"
echo "2. Update Stripe webhook URL to: https://starter.gmac.io/api/webhooks/stripe"
echo "3. Add STRIPE_WEBHOOK_SECRET from Stripe dashboard as a Gitea secret"