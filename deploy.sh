#!/bin/bash

# WLED Dashboard Deployment Script

echo "🚀 Building WLED Dashboard..."

# Build the project
yarn build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Production files created in dist/ directory"
    echo ""
    echo "🌐 To serve the production build:"
    echo "   cd dist && python3 -m http.server 8080"
    echo "   or"
    echo "   cd dist && npx serve -s . -l 8080"
    echo ""
    echo "🔗 Open http://localhost:8080 in your browser"
else
    echo "❌ Build failed!"
    exit 1
fi
