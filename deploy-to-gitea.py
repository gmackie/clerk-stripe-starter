#!/usr/bin/env python3
"""
Automated deployment setup for clerk-stripe-starter to Gitea
Creates repository and adds all required secrets
"""

import os
import sys
import json
import base64
import requests
from urllib.parse import urljoin
import subprocess
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

# Gitea configuration
GITEA_URL = "https://ci.gmac.io"
GITEA_API_URL = urljoin(GITEA_URL, "/api/v1/")

def get_gitea_token():
    """Get Gitea token from gmac-io-ci directory or environment"""
    # First try to get from gmac-io-ci directory
    token_locations = [
        "/Volumes/dev/gmac-io-ci/.gitea-token",
        "/Volumes/dev/gmac-io-ci/gitea-token.txt",
        os.path.expanduser("~/.gitea-token"),
    ]
    
    for token_file in token_locations:
        if os.path.exists(token_file):
            with open(token_file, 'r') as f:
                token = f.read().strip()
                if token:
                    print(f"✅ Found Gitea token in {token_file}")
                    return token
    
    # Try environment variable
    token = os.environ.get('GITEA_TOKEN')
    if token:
        print("✅ Using GITEA_TOKEN from environment")
        return token
    
    # Check for token in .env files
    env_files = [
        "/Volumes/dev/gmac-io-ci/.env",
        ".env",
        ".env.local"
    ]
    
    for env_file in env_files:
        if os.path.exists(env_file):
            with open(env_file, 'r') as f:
                for line in f:
                    if line.startswith('GITEA_TOKEN='):
                        token = line.split('=', 1)[1].strip().strip('"').strip("'")
                        if token:
                            print(f"✅ Found Gitea token in {env_file}")
                            return token
    
    # If still not found, prompt user
    print("\n⚠️  Gitea token not found automatically")
    print("Please enter your Gitea personal access token")
    print("You can create one at: https://ci.gmac.io/user/settings/applications")
    print("\nFor future runs, you can save it to:")
    print("  echo 'YOUR_TOKEN' > /Volumes/dev/gmac-io-ci/.gitea-token")
    token = input("\nGitea Token: ").strip()
    
    # Offer to save it
    save = input("\nSave token for future use? (y/N): ").strip().lower()
    if save == 'y':
        save_path = "/Volumes/dev/gmac-io-ci/.gitea-token"
        try:
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            with open(save_path, 'w') as f:
                f.write(token)
            print(f"✅ Token saved to {save_path}")
        except Exception as e:
            print(f"⚠️  Could not save token: {e}")
    
    return token

def get_gitea_username(token):
    """Get the current user's username"""
    headers = {"Authorization": f"token {token}"}
    response = requests.get(urljoin(GITEA_API_URL, "user"), headers=headers)
    if response.status_code == 200:
        return response.json()['username']
    else:
        print(f"Error getting user info: {response.text}")
        sys.exit(1)

def create_repository(token, username, repo_name="clerk-stripe-starter"):
    """Create a new repository"""
    headers = {
        "Authorization": f"token {token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "name": repo_name,
        "description": "SaaS starter kit with Clerk auth and Stripe payments",
        "private": False,
        "auto_init": False,
        "default_branch": "main"
    }
    
    response = requests.post(
        urljoin(GITEA_API_URL, "user/repos"),
        headers=headers,
        json=data
    )
    
    if response.status_code == 201:
        print(f"✅ Repository created: {GITEA_URL}/{username}/{repo_name}")
        return response.json()
    elif response.status_code == 409:
        print(f"ℹ️  Repository already exists: {GITEA_URL}/{username}/{repo_name}")
        # Get existing repo info
        response = requests.get(
            urljoin(GITEA_API_URL, f"repos/{username}/{repo_name}"),
            headers=headers
        )
        return response.json()
    else:
        print(f"❌ Error creating repository: {response.text}")
        sys.exit(1)

def add_secret(token, owner, repo, name, value):
    """Add a secret to the repository"""
    if not value:
        return False
        
    headers = {
        "Authorization": f"token {token}",
        "Content-Type": "application/json"
    }
    
    # Gitea uses a different API endpoint for secrets
    # We need to use Actions secrets API
    url = f"{GITEA_URL}/api/v1/repos/{owner}/{repo}/actions/secrets/{name}"
    
    data = {
        "data": value
    }
    
    response = requests.put(url, headers=headers, json=data)
    
    if response.status_code in [201, 204]:
        print(f"✅ Added secret: {name}")
        return True
    else:
        print(f"❌ Error adding secret {name}: {response.text}")
        return False

def get_kubeconfig():
    """Get kubeconfig from the gmac-io-ci directory"""
    # First try the base64 encoded version
    kubeconfig_base64_path = "/Volumes/dev/gmac-io-ci/kubeconfig-base64.txt"
    if os.path.exists(kubeconfig_base64_path):
        with open(kubeconfig_base64_path, 'r') as f:
            content = f.read().strip()
            if content:
                print("✅ Found kubeconfig-base64.txt in gmac-io-ci directory")
                return content
    
    # Try to find and encode the raw kubeconfig
    kubeconfig_path = "/Volumes/dev/gmac-io-ci/kubeconfig"
    if os.path.exists(kubeconfig_path):
        with open(kubeconfig_path, 'rb') as f:
            content = base64.b64encode(f.read()).decode('utf-8')
            print("✅ Found kubeconfig in gmac-io-ci directory (encoding to base64)")
            return content
    
    # Try .kube/config
    kubeconfig_path = "/Volumes/dev/gmac-io-ci/.kube/config"
    if os.path.exists(kubeconfig_path):
        with open(kubeconfig_path, 'rb') as f:
            content = base64.b64encode(f.read()).decode('utf-8')
            print("✅ Found .kube/config in gmac-io-ci directory (encoding to base64)")
            return content
    
    # If not found, prompt user
    print("⚠️  kubeconfig not found in gmac-io-ci directory")
    print("Please provide the base64-encoded kubeconfig:")
    return input("KUBECONFIG (base64): ").strip()

def main():
    print("🚀 Automated Gitea Deployment Setup for starter.gmac.io")
    print("======================================================")
    print("\nThis script will automatically:")
    print("1. Create/use repository 'clerk-stripe-starter' on ci.gmac.io")
    print("2. Add all required secrets from your .env.local")
    print("3. Configure Git remote")
    print("4. Optionally push code to trigger deployment")
    print("\nCredentials will be loaded from:")
    print("- GITEA_TOKEN: /Volumes/dev/gmac-io-ci/.gitea-token (or prompt)")
    print("- KUBECONFIG: /Volumes/dev/gmac-io-ci/kubeconfig-base64.txt")
    print("")
    
    # Get Gitea token
    token = get_gitea_token()
    username = get_gitea_username(token)
    
    print(f"\n👤 Logged in as: {username}")
    
    # Create repository
    repo = create_repository(token, username)
    repo_name = repo['name']
    
    print("\n📝 Adding repository secrets...")
    
    # Add Gitea token secret
    add_secret(token, username, repo_name, "GITEA_TOKEN", token)
    
    # Add kubeconfig
    kubeconfig = get_kubeconfig()
    add_secret(token, username, repo_name, "KUBECONFIG", kubeconfig)
    
    # Add Clerk secrets
    add_secret(token, username, repo_name, "CLERK_SECRET_KEY", 
               os.getenv('CLERK_SECRET_KEY'))
    add_secret(token, username, repo_name, "CLERK_WEBHOOK_SECRET",
               os.getenv('CLERK_WEBHOOK_SECRET', 'svix_test_secret'))
    add_secret(token, username, repo_name, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
               os.getenv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'))
    
    # Add Stripe secrets
    add_secret(token, username, repo_name, "STRIPE_SECRET_KEY",
               os.getenv('STRIPE_SECRET_KEY'))
    add_secret(token, username, repo_name, "STRIPE_WEBHOOK_SECRET",
               os.getenv('STRIPE_WEBHOOK_SECRET'))
    add_secret(token, username, repo_name, "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
               os.getenv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'))
    
    # Add Stripe Price IDs
    price_ids = [
        ("STRIPE_PRICE_ID_STARTER_MONTHLY", "NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_MONTHLY"),
        ("STRIPE_PRICE_ID_STARTER_YEARLY", "NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_YEARLY"),
        ("STRIPE_PRICE_ID_PRO_MONTHLY", "NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY"),
        ("STRIPE_PRICE_ID_PRO_YEARLY", "NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY"),
        ("STRIPE_PRICE_ID_ENTERPRISE_MONTHLY", "NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_MONTHLY"),
        ("STRIPE_PRICE_ID_ENTERPRISE_YEARLY", "NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_YEARLY"),
    ]
    
    for secret_name, env_name in price_ids:
        add_secret(token, username, repo_name, secret_name, os.getenv(env_name))
        # Also add the NEXT_PUBLIC_ version
        add_secret(token, username, repo_name, env_name, os.getenv(env_name))
    
    # Add Turso database secrets
    add_secret(token, username, repo_name, "TURSO_DATABASE_URL",
               os.getenv('TURSO_DATABASE_URL'))
    add_secret(token, username, repo_name, "TURSO_AUTH_TOKEN",
               os.getenv('TURSO_AUTH_TOKEN'))
    
    # Add optional Redis secrets
    redis_url = os.getenv('UPSTASH_REDIS_REST_URL')
    if redis_url:
        add_secret(token, username, repo_name, "UPSTASH_REDIS_REST_URL", redis_url)
        add_secret(token, username, repo_name, "UPSTASH_REDIS_REST_TOKEN",
                   os.getenv('UPSTASH_REDIS_REST_TOKEN'))
    else:
        # Add empty values to prevent errors
        add_secret(token, username, repo_name, "UPSTASH_REDIS_REST_URL", "")
        add_secret(token, username, repo_name, "UPSTASH_REDIS_REST_TOKEN", "")
    
    print("\n🔗 Setting up Git remote...")
    
    # Initialize git if needed
    if not os.path.exists('.git'):
        subprocess.run(['git', 'init'], check=True)
        subprocess.run(['git', 'add', '.'], check=True)
        subprocess.run(['git', 'commit', '-m', 'Initial commit'], check=True)
    
    # Add remote
    clone_url = repo['clone_url']
    try:
        subprocess.run(['git', 'remote', 'add', 'gitea', clone_url], check=True)
    except subprocess.CalledProcessError:
        # Remote might already exist
        subprocess.run(['git', 'remote', 'set-url', 'gitea', clone_url], check=True)
    
    print(f"\n✅ Repository setup complete!")
    print(f"\n📍 Repository URL: {GITEA_URL}/{username}/{repo_name}")
    print(f"🔗 Clone URL: {clone_url}")
    
    print("\n📋 Next steps:")
    print("1. Push your code to trigger deployment:")
    print(f"   git push gitea main")
    print("\n2. Monitor deployment:")
    print(f"   {GITEA_URL}/{username}/{repo_name}/actions")
    print("\n3. After deployment, update webhooks:")
    print("   - Clerk: https://starter.gmac.io/api/webhooks/clerk")
    print("   - Stripe: https://starter.gmac.io/api/webhooks/stripe")
    
    # Ask if user wants to push now
    push_now = input("\n🚀 Push to Gitea now? (y/N): ").strip().lower()
    if push_now == 'y':
        print("\nPushing to Gitea...")
        try:
            subprocess.run(['git', 'push', '-u', 'gitea', 'main'], check=True)
            print("\n✅ Code pushed! Deployment should start automatically.")
            print(f"🔗 Monitor at: {GITEA_URL}/{username}/{repo_name}/actions")
        except subprocess.CalledProcessError as e:
            print(f"\n❌ Error pushing: {e}")
            print("You can push manually with: git push gitea main")

if __name__ == "__main__":
    # Check if required files exist
    if not os.path.exists('.env.local'):
        print("❌ .env.local not found. Please copy .env.local.example and fill in your values.")
        sys.exit(1)
    
    # Check if requests is installed
    try:
        import requests
    except ImportError:
        print("Installing required package: requests")
        subprocess.run([sys.executable, '-m', 'pip', 'install', 'requests', 'python-dotenv'], check=True)
        import requests
    
    main()