#!/bin/bash

echo "📝 Adding missing environment variables to .env.local"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found. Please create it first."
    exit 1
fi

# Function to add variable if not exists
add_if_missing() {
    if ! grep -q "^$1=" .env.local; then
        echo "$1=$2" >> .env.local
        echo "✅ Added $1"
    else
        echo "⏭️  $1 already exists"
    fi
}

echo "Adding Stripe Price IDs..."
add_if_missing "NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_MONTHLY" "price_1RnlVgIOlmtpIvHKsdzYltOQ"
add_if_missing "NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_YEARLY" "price_1RnlVgIOlmtpIvHKcOgBYfJP"
add_if_missing "NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY" "price_1RnlVgIOlmtpIvHKgsxPTDuu"
add_if_missing "NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY" "price_1RnlVgIOlmtpIvHKJQYZ6mRa"
add_if_missing "NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_MONTHLY" "price_1RnlVgIOlmtpIvHKt4H7TnAd"
add_if_missing "NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_YEARLY" "price_1RnlVgIOlmtpIvHKkGK0wvUz"

echo ""
echo "Adding placeholder webhook secrets..."
add_if_missing "CLERK_WEBHOOK_SECRET" ""
add_if_missing "STRIPE_WEBHOOK_SECRET" ""

echo ""
echo "Adding optional Redis variables..."
add_if_missing "UPSTASH_REDIS_REST_URL" ""
add_if_missing "UPSTASH_REDIS_REST_TOKEN" ""

echo ""
echo "✅ Environment variables added!"
echo ""
echo "📋 Next steps:"
echo "1. For webhook secrets, see ENV_SETUP_GUIDE.md"
echo "2. For local testing, you can leave webhook secrets empty"
echo "3. Restart your dev server to pick up the new variables"
echo ""
echo "Run 'npx tsx complete-e2e-test.ts' to verify everything is set up correctly."