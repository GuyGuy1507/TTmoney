#!/bin/bash

# TTMoney Deployment Script
# This script helps you deploy the application to free hosting services

set -e

echo "🚀 TTMoney Deployment Script"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."

    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi

    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi

    print_success "Dependencies check passed"
}

# Setup environment variables
setup_env() {
    print_status "Setting up environment variables..."

    if [ ! -f "apps/backend/.env.production" ]; then
        print_error "apps/backend/.env.production not found!"
        print_status "Please copy apps/backend/.env.production and fill in your values"
        exit 1
    fi

    print_success "Environment files found"
}

# Deploy database
deploy_database() {
    print_status "Setting up Supabase database..."

    if ! npm list -g | grep -q pg; then
        print_status "Installing pg globally for database setup..."
        npm install -g pg
    fi

    print_status "Running database setup script..."
    node scripts/setup-supabase.js

    print_success "Database setup completed"
}

# Deploy backend
deploy_backend() {
    print_status "Deploying backend to Railway..."

    print_warning "Please complete these steps manually:"
    echo "1. Go to https://railway.app"
    echo "2. Connect your GitHub account"
    echo "3. Click 'New Project' > 'Deploy from GitHub'"
    echo "4. Select your repository"
    echo "5. Set the following in Railway:"
    echo "   - Root Directory: apps/backend"
    echo "   - Environment Variables: Copy from apps/backend/.env.production"
    echo "6. Deploy and get your Railway URL"

    read -p "Enter your Railway backend URL (e.g., https://your-app.railway.app): " RAILWAY_URL
    echo "RAILWAY_URL=$RAILWAY_URL" > .railway_url
    print_success "Railway URL saved"
}

# Deploy frontend
deploy_frontend() {
    print_status "Deploying frontend to Vercel..."

    if [ ! -f ".railway_url" ]; then
        print_error "Railway URL not found. Please run backend deployment first."
        exit 1
    fi

    RAILWAY_URL=$(cat .railway_url)

    print_warning "Please complete these steps manually:"
    echo "1. Go to https://vercel.com"
    echo "2. Connect your GitHub account"
    echo "3. Click 'New Project'"
    echo "4. Import your Git repository"
    echo "5. Configure project settings:"
    echo "   - Framework Preset: Next.js"
    echo "   - Root Directory: apps/frontend"
    echo "   - Build Command: npm run build"
    echo "   - Install Command: npm install"
    echo "6. Add Environment Variable:"
    echo "   - Name: NEXT_PUBLIC_API_URL"
    echo "   - Value: $RAILWAY_URL"
    echo "7. Click 'Deploy'"

    print_success "Frontend deployment instructions provided"
}

# Test deployment
test_deployment() {
    if [ ! -f ".railway_url" ]; then
        print_error "Railway URL not found. Please complete backend deployment first."
        exit 1
    fi

    RAILWAY_URL=$(cat .railway_url)

    print_status "Testing API endpoints..."
    echo "Testing: $RAILWAY_URL/api/health"
    if curl -f "$RAILWAY_URL/api/health" &> /dev/null; then
        print_success "API is responding"
    else
        print_warning "API not responding yet. This is normal for new deployments."
    fi
}

# Main menu
main() {
    echo "TTMoney Free Deployment Assistant"
    echo "=================================="
    echo "1. Check Dependencies"
    echo "2. Setup Environment Variables"
    echo "3. Deploy Database (Supabase)"
    echo "4. Deploy Backend (Railway)"
    echo "5. Deploy Frontend (Vercel)"
    echo "6. Test Deployment"
    echo "7. Full Deployment (Steps 1-6)"
    echo "8. Exit"
    echo ""

    read -p "Choose an option (1-8): " choice

    case $choice in
        1)
            check_dependencies
            ;;
        2)
            setup_env
            ;;
        3)
            deploy_database
            ;;
        4)
            deploy_backend
            ;;
        5)
            deploy_frontend
            ;;
        6)
            test_deployment
            ;;
        7)
            print_status "Starting full deployment..."
            check_dependencies
            setup_env
            deploy_database
            deploy_backend
            deploy_frontend
            test_deployment
            print_success "Full deployment setup completed!"
            ;;
        8)
            print_success "Goodbye!"
            exit 0
            ;;
        *)
            print_error "Invalid option. Please choose 1-8."
            main
            ;;
    esac
}

# Run main function
main