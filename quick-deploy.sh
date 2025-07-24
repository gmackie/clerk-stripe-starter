#!/bin/bash
# Quick deployment script for clerk-stripe-starter

echo "🚀 Quick Deploy to starter.gmac.io"
echo "=================================="
echo ""
echo "This script will:"
echo "1. Create a Gitea repository"
echo "2. Add all required secrets"
echo "3. Push your code to trigger deployment"
echo ""

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check for .env.local
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found."
    echo "Please copy .env.local.example and fill in your values:"
    echo "  cp .env.local.example .env.local"
    exit 1
fi

# Install dependencies if needed
pip3 install requests python-dotenv --quiet 2>/dev/null || true

# Run the deployment script
python3 deploy-to-gitea.py