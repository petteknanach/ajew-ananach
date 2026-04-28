#!/bin/bash

# Ajew Ananach - Production Build Script
# Execute this to build for app stores

echo "🚀 Building Ajew Ananach for Production..."

# Install EAS CLI if needed
if ! command -v eas &> /dev/null; then
    echo "Installing EAS CLI..."
    npm install -g eas-cli
fi

# Login to EAS (if not already)
echo "Checking EAS login..."
eas whoami || eas login

# Initialize EAS project (if not already)
if [ ! -f "eas.json" ]; then
    echo "Initializing EAS project..."
    eas init
fi

# Build iOS
echo "Building iOS production..."
eas build --platform ios --profile production

# Build Android  
echo "Building Android production..."
eas build --platform android --profile production

echo "✅ Builds complete! Upload to app stores."
echo "📱 iOS: Upload IPA to App Store Connect"
echo "🤖 Android: Upload AAB to Google Play Console"
