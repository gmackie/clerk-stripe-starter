#!/bin/bash

# Quick start script for SaaS Starter Kit
# This script sets up everything needed to get started

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print colored output
print_color() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

# Print header
print_header() {
    echo ""
    print_color "$CYAN" "================================================"
    print_color "$CYAN" "$1"
    print_color "$CYAN" "================================================"
    echo ""
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main setup
main() {
    print_header "🚀 SaaS Starter Kit - Quick Start"
    
    # Check Node.js
    if ! command_exists node; then
        print_color "$RED" "❌ Node.js is not installed"
        print_color "$YELLOW" "Please install Node.js 18+ from https://nodejs.org"
        exit 1
    fi
    
    # Check npm
    if ! command_exists npm; then
        print_color "$RED" "❌ npm is not installed"
        exit 1
    fi
    
    print_color "$GREEN" "✅ Node.js $(node --version) and npm $(npm --version) detected"
    
    # Install dependencies
    print_header "📦 Installing Dependencies"
    npm install
    
    # Check if .env.local exists
    if [ -f .env.local ]; then
        print_color "$YELLOW" "⚠️  .env.local already exists"
        read -p "Do you want to reconfigure? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_color "$BLUE" "Skipping configuration..."
        else
            npm run setup
        fi
    else
        # Run setup wizard
        print_header "🔧 Configuration Wizard"
        npm run setup
    fi
    
    # Ask about Stripe setup
    print_header "💳 Stripe Setup"
    read -p "Do you want to set up Stripe products now? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        npm run setup:stripe
    fi
    
    # Ask about demo data
    print_header "🌱 Demo Data"
    read -p "Do you want to seed demo data? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        npm run setup:demo
    fi
    
    # Ask about branding
    print_header "🎨 Branding"
    read -p "Do you want to customize branding? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm run setup:branding
    fi
    
    # Final instructions
    print_header "✨ Setup Complete!"
    
    print_color "$GREEN" "Your SaaS starter kit is ready!"
    echo ""
    print_color "$CYAN" "Next steps:"
    print_color "$YELLOW" "1. Start the development server:"
    print_color "$NC" "   npm run dev"
    echo ""
    print_color "$YELLOW" "2. Open your browser:"
    print_color "$NC" "   http://localhost:3000"
    echo ""
    print_color "$YELLOW" "3. (Optional) View documentation:"
    print_color "$NC" "   npm run docs:dev"
    echo ""
    
    if command_exists stripe; then
        print_color "$YELLOW" "4. (Optional) Forward Stripe webhooks:"
        print_color "$NC" "   stripe listen --forward-to localhost:3000/api/webhooks/stripe"
        echo ""
    fi
    
    print_color "$CYAN" "📚 For more information, see SETUP.md"
    print_color "$CYAN" "💬 Happy building! 🚀"
    echo ""
}

# Run main function
main