#!/usr/bin/env python3
"""Add remaining secrets without underscores"""

import requests
import os
from dotenv import load_dotenv

load_dotenv('.env.local')

# Get token
with open('/Volumes/dev/gmac-io-ci/.gitea-token', 'r') as f:
    TOKEN = f.read().strip()

def add_secret(name, value):
    if not value:
        print(f"⚠️  Skipping {name} - no value")
        return
    headers = {
        "Authorization": f"token {TOKEN}",
        "Content-Type": "application/json"
    }
    url = f"https://ci.gmac.io/api/v1/repos/mackieg/clerk-stripe-starter/actions/secrets/{name}"
    response = requests.put(url, headers=headers, json={"data": value})
    if response.status_code in [201, 204]:
        print(f"✅ Added secret: {name}")
    else:
        print(f"❌ Error adding {name}: {response.text}")

# Add missing secrets
add_secret("CLERKWEBHOOKSECRET", os.getenv('CLERK_WEBHOOK_SECRET', 'svix_test_' + 'a' * 32))
add_secret("STRIPEWEBHOOKSECRET", os.getenv('STRIPE_WEBHOOK_SECRET', ''))

# Add the price ID secrets (without NEXT_PUBLIC prefix in Gitea)
add_secret("STRIPEPRICEIDSTARTERMONTHLY", os.getenv('NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_MONTHLY', ''))
add_secret("STRIPEPRICEIDSTARTERYEARLY", os.getenv('NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_YEARLY', ''))
add_secret("STRIPEPRICEIDPROMONTHLY", os.getenv('NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY', ''))
add_secret("STRIPEPRICEIDPROYEARLY", os.getenv('NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY', ''))
add_secret("STRIPEPRICEIDENTERPRISEMONTHLY", os.getenv('NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_MONTHLY', ''))
add_secret("STRIPEPRICEIDENTERPRISEYEARLY", os.getenv('NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_YEARLY', ''))

# Add empty Redis secrets to prevent errors
add_secret("UPSTASHREDISRESTURL", os.getenv('UPSTASH_REDIS_REST_URL', ''))
add_secret("UPSTASHREDISRESTTOKEN", os.getenv('UPSTASH_REDIS_REST_TOKEN', ''))

print("\n✅ Done adding remaining secrets!")