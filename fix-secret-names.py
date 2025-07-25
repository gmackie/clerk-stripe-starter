#!/usr/bin/env python3
"""Fix all secret names to remove underscores"""

import re

# Read the workflow file
with open('.gitea/workflows/deploy.yml', 'r') as f:
    content = f.read()

# Define replacements
replacements = {
    'CLERK_SECRET_KEY': 'CLERKSECRETKEY',
    'CLERK_WEBHOOK_SECRET': 'CLERKWEBHOOKSECRET',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': 'NEXTPUBLICCLERKPUBLISHABLEKEY',
    'STRIPE_SECRET_KEY': 'STRIPESECRETKEY',
    'STRIPE_WEBHOOK_SECRET': 'STRIPEWEBHOOKSECRET',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': 'NEXTPUBLICSTRIPEPUBLISHABLEKEY',
    'TURSO_DATABASE_URL': 'TURSODATABASEURL',
    'TURSO_AUTH_TOKEN': 'TURSOAUTHTOKEN',
    'NEXT_PUBLIC_APP_URL': 'NEXTPUBLICAPPURL',
    'NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_MONTHLY': 'NEXTPUBLICSTRIPEPRICEIDSTARTERMONTHLY',
    'NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_YEARLY': 'NEXTPUBLICSTRIPEPRICEIDSTARTERYEARLY',
    'NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY': 'NEXTPUBLICSTRIPEPRICEIDPROMONTHLY',
    'NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY': 'NEXTPUBLICSTRIPEPRICEIDPROYEARLY',
    'NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_MONTHLY': 'NEXTPUBLICSTRIPEPRICEIDENTERPRISEMONTHLY',
    'NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_YEARLY': 'NEXTPUBLICSTRIPEPRICEIDENTERPRISEYEARLY',
    'STRIPE_PRICE_ID_STARTER_MONTHLY': 'STRIPEPRICEIDSTARTERMONTHLY',
    'STRIPE_PRICE_ID_STARTER_YEARLY': 'STRIPEPRICEIDSTARTERYEARLY',
    'STRIPE_PRICE_ID_PRO_MONTHLY': 'STRIPEPRICEIDPROMONTHLY',
    'STRIPE_PRICE_ID_PRO_YEARLY': 'STRIPEPRICEIDPROYEARLY',
    'STRIPE_PRICE_ID_ENTERPRISE_MONTHLY': 'STRIPEPRICEIDENTERPRISEMONTHLY',
    'STRIPE_PRICE_ID_ENTERPRISE_YEARLY': 'STRIPEPRICEIDENTERPRISEYEARLY',
    'UPSTASH_REDIS_REST_URL': 'UPSTASHREDISRESTURL',
    'UPSTASH_REDIS_REST_TOKEN': 'UPSTASHREDISRESTTOKEN',
}

# Replace in secrets context
for old_name, new_name in replacements.items():
    # Replace in ${{ secrets.NAME }}
    content = content.replace(f'${{{{ secrets.{old_name} }}}}', f'${{{{ secrets.{new_name} }}}}')
    # Replace in --from-literal
    content = content.replace(f'--from-literal={old_name}=', f'--from-literal={old_name}=')

# Write back
with open('.gitea/workflows/deploy.yml', 'w') as f:
    f.write(content)

print("✅ Fixed secret names in workflow file")
print("\nNow updating secrets in Gitea...")

# Update secrets in Gitea
import requests
import os
from dotenv import load_dotenv

load_dotenv('.env.local')

# Get token
with open('/Volumes/dev/gmac-io-ci/.gitea-token', 'r') as f:
    TOKEN = f.read().strip()

def add_secret(name, value):
    if not value:
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

# Add GITEATOKEN
add_secret("GITEATOKEN", TOKEN)

# Add all secrets with new names
for old_name, new_name in replacements.items():
    env_value = os.getenv(old_name)
    if env_value:
        add_secret(new_name, env_value)

print("\n✅ Done!")