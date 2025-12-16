#!/bin/bash

# 🚀 LaunchKit AI - Telegram Mini-App Deployment Script

echo "🚀 LaunchKit AI - Telegram Mini-App Deployment"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_dependencies() {
    echo -e "${BLUE}Checking dependencies...${NC}"

    if ! command -v vercel &> /dev/null; then
        echo -e "${RED}❌ Vercel CLI not found. Install with: npm i -g vercel${NC}"
        exit 1
    fi

    if ! command -v pnpm &> /dev/null; then
        echo -e "${RED}❌ pnpm not found. Install from: https://pnpm.io/installation${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Dependencies OK${NC}"
}

# Deploy mini-app to Vercel
deploy_miniapp() {
    echo -e "${BLUE}Step 1: Deploying mini-app to Vercel...${NC}"

    cd apps/miniapp

    # Build for production
    echo "Building production bundle..."
    pnpm build

    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    fi

    # Deploy to Vercel
    echo "Deploying to Vercel..."
    vercel --prod --yes

    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Vercel deployment failed${NC}"
        exit 1
    fi

    # Get the deployment URL
    DEPLOYMENT_URL=$(vercel --ls | grep "https://" | head -1 | awk '{print $2}')

    if [ -z "$DEPLOYMENT_URL" ]; then
        echo -e "${YELLOW}⚠️  Could not get deployment URL automatically${NC}"
        echo -e "${YELLOW}Please check your Vercel dashboard and update the following files:${NC}"
        echo "  - apps/bot/.env (WEBAPP_URL)"
        echo "  - apps/miniapp/.env.local (VITE_TONCONNECT_MANIFEST_URL)"
        exit 1
    fi

    echo -e "${GREEN}✅ Mini-app deployed to: $DEPLOYMENT_URL${NC}"

    cd ../..
    MINIAPP_URL=$DEPLOYMENT_URL
}

# Update bot configuration
update_bot_config() {
    echo -e "${BLUE}Step 2: Updating bot configuration...${NC}"

    # Update bot .env
    sed -i '' "s|WEBAPP_URL=.*|WEBAPP_URL=$MINIAPP_URL|" apps/bot/.env

    echo -e "${GREEN}✅ Bot configuration updated${NC}"
}

# Update mini-app configuration
update_miniapp_config() {
    echo -e "${BLUE}Step 3: Updating mini-app configuration...${NC}"

    # Update TON Connect manifest URL
    sed -i '' "s|VITE_TONCONNECT_MANIFEST_URL=.*|VITE_TONCONNECT_MANIFEST_URL=$MINIAPP_URL/tonconnect-manifest.json|" apps/miniapp/.env.local

    echo -e "${GREEN}✅ Mini-app configuration updated${NC}"
}

# Configure Telegram BotFather
configure_botfather() {
    echo -e "${BLUE}Step 4: Telegram BotFather Configuration${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: You need to configure your bot with @BotFather${NC}"
    echo ""
    echo "1. Go to @BotFather on Telegram"
    echo "2. Send: /mybots"
    echo "3. Select your bot: @plauncher_robot"
    echo "4. Send: /setmenubutton"
    echo "5. Send: Web App"
    echo "6. Send your mini-app URL: $MINIAPP_URL"
    echo "7. Send: LaunchKit AI"
    echo ""
    echo -e "${GREEN}After configuration, users can access the mini-app by clicking the menu button in your bot!${NC}"
    echo ""
}

# Test the mini-app
test_miniapp() {
    echo -e "${BLUE}Step 5: Testing mini-app...${NC}"

    # Wait a bit for deployment to propagate
    echo "Waiting for deployment to propagate..."
    sleep 10

    # Test if the mini-app loads
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$MINIAPP_URL")

    if [ "$HTTP_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Mini-app is live and accessible!${NC}"
        echo -e "${GREEN}🌐 URL: $MINIAPP_URL${NC}"
    else
        echo -e "${RED}❌ Mini-app test failed (HTTP $HTTP_STATUS)${NC}"
        echo -e "${YELLOW}⚠️  Deployment may still be in progress. Check Vercel dashboard.${NC}"
    fi
}

# Main deployment flow
main() {
    check_dependencies
    deploy_miniapp
    update_bot_config
    update_miniapp_config
    configure_botfather
    test_miniapp

    echo ""
    echo -e "${GREEN}🎉 Telegram Mini-App Deployment Complete!${NC}"
    echo ""
    echo -e "${BLUE}📱 How users access your mini-app:${NC}"
    echo "1. Users message your bot: @plauncher_robot"
    echo "2. Click the menu button (bottom of chat)"
    echo "3. Select 'LaunchKit AI' to open the mini-app"
    echo ""
    echo -e "${BLUE}🔗 Mini-app URL: $MINIAPP_URL${NC}"
    echo ""
    echo -e "${YELLOW}📋 Next steps:${NC}"
    echo "- Test all features in Telegram"
    echo "- Configure payment providers (Stripe, TON)"
    echo "- Set up monitoring and analytics"
}

# Run the deployment
main
