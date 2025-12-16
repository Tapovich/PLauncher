#!/bin/bash

# Push LaunchKit AI to GitHub

echo "🚀 LaunchKit AI - GitHub Setup"
echo "================================"
echo ""

# Check if git remote exists
if git remote | grep -q "origin"; then
    echo "⚠️  Remote 'origin' already exists"
    echo "Current remote URL:"
    git remote -v | grep origin | head -1
    echo ""
    read -p "Do you want to change the remote URL? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote remove origin
        echo "✅ Removed old origin"
    else
        echo "📌 Keeping existing remote"
        exit 0
    fi
fi

echo ""
echo "📝 Enter your GitHub details:"
echo ""

# Get GitHub username
read -p "GitHub username: " github_username

# Get repository name
read -p "Repository name (default: launchkit-ai): " repo_name
repo_name=${repo_name:-launchkit-ai}

# Construct GitHub URL
github_url="https://github.com/$github_username/$repo_name.git"

echo ""
echo "📋 Configuration:"
echo "  Username: $github_username"
echo "  Repository: $repo_name"
echo "  URL: $github_url"
echo ""

read -p "Is this correct? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 1
fi

echo ""
echo "🔗 Adding GitHub remote..."
git remote add origin $github_url

echo "📤 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🎉 Your repository is now available at:"
    echo "   https://github.com/$github_username/$repo_name"
    echo ""
    echo "📋 Next steps:"
    echo "1. Go to Railway.app"
    echo "2. Create new project from GitHub"
    echo "3. Select: $repo_name"
    echo "4. Configure environment variables"
    echo ""
    echo "📖 See DEPLOY_TO_RAILWAY.md for detailed instructions"
else
    echo ""
    echo "❌ Push failed!"
    echo ""
    echo "Common issues:"
    echo "1. Repository doesn't exist on GitHub"
    echo "   → Create it at: https://github.com/new"
    echo ""
    echo "2. Authentication failed"
    echo "   → Set up GitHub token: https://github.com/settings/tokens"
    echo "   → Or use SSH: git@github.com:$github_username/$repo_name.git"
    echo ""
    echo "3. Repository name already taken"
    echo "   → Choose a different name"
fi
