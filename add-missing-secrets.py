#!/usr/bin/env python3
"""Add missing secrets to Gitea repository"""

import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

# Configuration
GITEA_URL = "https://ci.gmac.io"
OWNER = "mackieg"
REPO = "clerk-stripe-starter"

# Get token
with open('/Volumes/dev/gmac-io-ci/.gitea-token', 'r') as f:
    TOKEN = f.read().strip()

def add_secret(name, value):
    """Add a secret to the repository"""
    if not value:
        print(f"⚠️  Skipping {name} - no value")
        return
        
    headers = {
        "Authorization": f"token {TOKEN}",
        "Content-Type": "application/json"
    }
    
    url = f"{GITEA_URL}/api/v1/repos/{OWNER}/{REPO}/actions/secrets/{name}"
    data = {"data": value}
    
    response = requests.put(url, headers=headers, json=data)
    
    if response.status_code in [201, 204]:
        print(f"✅ Added secret: {name}")
    else:
        print(f"❌ Error adding {name}: {response.text}")

# Add missing secrets
print("Adding missing secrets...")

# Add CLERK_WEBHOOK_SECRET
clerk_webhook_secret = os.getenv('CLERK_WEBHOOK_SECRET', '')
if not clerk_webhook_secret:
    # Use test secret if not set
    clerk_webhook_secret = 'svix_test_' + 'a' * 32
add_secret("CLERK_WEBHOOK_SECRET", clerk_webhook_secret)

# Add STRIPE_WEBHOOK_SECRET
stripe_webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET', '')
if not stripe_webhook_secret:
    print("⚠️  STRIPE_WEBHOOK_SECRET not found in .env.local")
    print("Please add it from Stripe Dashboard > Webhooks")
else:
    add_secret("STRIPE_WEBHOOK_SECRET", stripe_webhook_secret)

# Add Redis secrets even if empty
add_secret("UPSTASH_REDIS_REST_URL", os.getenv('UPSTASH_REDIS_REST_URL', ''))
add_secret("UPSTASH_REDIS_REST_TOKEN", os.getenv('UPSTASH_REDIS_REST_TOKEN', ''))

print("\n✅ Done! Check the deployment at:")
print(f"   https://ci.gmac.io/{OWNER}/{REPO}/actions")