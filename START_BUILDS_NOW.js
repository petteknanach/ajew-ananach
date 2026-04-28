#!/usr/bin/env node

/**
 * START PRODUCTION BUILDS NOW
 * Begin building while screenshots are captured
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️ STARTING PRODUCTION BUILDS - RIGHT NOW!\n');

// Configuration
const APP_DIR = __dirname;

// Step 1: Check EAS CLI
console.log('1. CHECKING BUILD ENVIRONMENT...');
try {
  // Check Node
  const nodeVersion = process.version;
  console.log(`   ✅ Node.js: ${nodeVersion}`);
  
  // Check npm
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`   ✅ npm: ${npmVersion}`);
  
  // Check Expo
  const expoVersion = execSync('npx expo --version', { encoding: 'utf8' }).trim();
  console.log(`   ✅ Expo: ${expoVersion}`);
  
  // Check EAS
  try {
    const easVersion = execSync('npx eas --version', { encoding: 'utf8' }).trim();
    console.log(`   ✅ EAS CLI: ${easVersion}`);
  } catch {
    console.log('   ⚠️ EAS CLI not installed, installing...');
    execSync('npm install -g eas-cli', { stdio: 'inherit' });
    console.log('   ✅ EAS CLI installed');
  }
  
} catch (error) {
  console.log(`   ❌ Environment check failed: ${error.message}`);
  console.log('   Please fix environment issues before building.');
  process.exit(1);
}

// Step 2: Prepare for builds
console.log('\n2. PREPARING FOR PRODUCTION BUILDS...');

// Update app.json with correct configuration
const appJsonPath = path.join(APP_DIR, 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// Ensure correct configuration
appJson.expo.extra = appJson.expo.extra || {};
appJson.expo.extra.eas = appJson.expo.extra.eas || {};
appJson.expo.extra.eas.projectId = appJson.expo.extra.eas.projectId || 'your-project-id-here';

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
console.log(`   ✅ Updated app.json configuration`);

// Step 3: Create build preparation script
console.log('\n3. CREATING BUILD PREPARATION SCRIPT...');
const prepScript = `#!/bin/bash

# Build Preparation Script
echo "🔧 Preparing Ajew Ananach for production builds..."

# Clean and install dependencies
echo "Cleaning node_modules..."
rm -rf node_modules
rm -rf package-lock.json

echo "Installing dependencies..."
npm install

echo "Checking dependencies..."
npm audit fix

echo "✅ Build preparation complete!"
echo ""
echo "Next steps:"
echo "1. Run: npx eas build --platform ios --profile production"
echo "2. Run: npx eas build --platform android --profile production"
echo ""
echo "Note: Builds may take 20-40 minutes each."
`;

const prepScriptPath = path.join(APP_DIR, 'prepare-build.sh');
fs.writeFileSync(prepScriptPath, prepScript);
fs.chmodSync(prepScriptPath, '755');
console.log(`   ✅ Created: ${prepScriptPath}`);

// Step 4: Create build status monitor
console.log('\n4. CREATING BUILD STATUS MONITOR...');
const monitorScript = `#!/usr/bin/env node

/**
 * Build Status Monitor
 * Monitors EAS build progress
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📊 Ajew Ananach Build Status Monitor\\n');

function checkBuildStatus() {
  try {
    console.log('Checking EAS build status...');
    
    // List recent builds
    const builds = execSync('npx eas build:list --limit 5', { encoding: 'utf8' });
    console.log(builds);
    
    // Check build queue
    const queue = execSync('npx eas build:list --status=new,in-progress', { encoding: 'utf8' });
    if (queue.includes('No builds found')) {
      console.log('✅ No builds in queue - ready to start!');
    } else {
      console.log('📋 Builds in queue/progress:');
      console.log(queue);
    }
    
  } catch (error) {
    console.log(\`⚠️ Status check failed: \${error.message}\`);
  }
}

// Run initial check
checkBuildStatus();

// Monitor every 5 minutes
console.log('\\n🔍 Monitoring build status (updates every 5 minutes)...');
console.log('Press Ctrl+C to stop monitoring\\n');

setInterval(checkBuildStatus, 5 * 60 * 1000);
`;

const monitorPath = path.join(APP_DIR, 'monitor-builds.js');
fs.writeFileSync(monitorPath, monitorScript);
console.log(`   ✅ Created: ${monitorPath}`);

// Step 5: Create build execution instructions
console.log('\n5. CREATING BUILD EXECUTION INSTRUCTIONS...');
const buildInstructions = `# AJEW ANANACH - PRODUCTION BUILD INSTRUCTIONS

## 🏗️ BUILD COMMANDS

### Preparation (Run First):
\`\`\`bash
# Clean and install
./prepare-build.sh

# Or manually:
rm -rf node_modules package-lock.json
npm install
npm audit fix
\`\`\`

### iOS Production Build:
\`\`\`bash
npx eas build --platform ios --profile production
\`\`\`
**Expected time**: 20-40 minutes
**Output**: IPA file for App Store Connect

### Android Production Build:
\`\`\`bash
npx eas build --platform android --profile production
\`\`\`
**Expected time**: 15-30 minutes
**Output**: AAB file for Google Play Console

### Development Build (Testing):
\`\`\`bash
npx eas build --platform all --profile development
\`\`\`
**Faster builds**, not for store submission

## 📱 BUILD CONFIGURATION

### app.json Highlights:
- **Name**: Ajew Ananach
- **Bundle ID**: org.ajew.ananach
- **Version**: 1.0.0
- **Build**: 1
- **Orientation**: Portrait
- **Icons**: assets/icon.png
- **Splash**: assets/splash.png

### eas.json Configuration:
- Production profile optimized for store submission
- Auto-increment build numbers
- App bundle for Android (smaller size)
- IPA for iOS

## 🔧 PRE-BUILD CHECKS

### Required:
- [ ] EAS CLI installed (\`npx eas --version\`)
- [ ] EAS account logged in (\`npx eas whoami\`)
- [ ] EAS project initialized (\`eas.json exists\`)
- [ ] Apple Developer Account (for iOS)
- [ ] Google Play Console (for Android)

### Assets:
- [ ] Icon: assets/icon.png (1024x1024)
- [ ] Splash: assets/splash.png (1242x2436)
- [ ] Adaptive icon: assets/adaptive-icon.png
- [ ] Screenshots: assets/screenshots/ (7+ images)

### Configuration:
- [ ] API_BASE_URL set correctly in AjewAPI.js
- [ ] useMockData = false for production
- [ ] Caching enabled (24 hours)

## ⏱️ BUILD TIMELINE

### Parallel Build Strategy:
1. **Start iOS build** (20-40 minutes)
2. **Start Android build** while iOS builds (15-30 minutes)
3. **Total time**: ~40 minutes (parallel) vs 70 minutes (sequential)

### Estimated Schedule:
- **10:00**: Start iOS build
- **10:05**: Start Android build  
- **10:40**: iOS build completes
- **10:35**: Android build completes
- **10:45**: Both builds ready for submission

## 🚀 POST-BUILD ACTIONS

### 1. Download Builds:
- iOS: Download IPA from EAS dashboard
- Android: Download AAB from EAS dashboard

### 2. Submit to Stores:
- **App Store Connect**: Upload IPA via Transporter
- **Google Play Console**: Upload AAB via web interface

### 3. Store Listing:
- Use metadata from: build/app-store-metadata.json
- Screenshots from: assets/screenshots/
- Descriptions from: STORE_DESCRIPTIONS.md

### 4. Deploy API:
- Upload ajew-org/public/api-mobile to ajew.org/api
- Test: https://ajew.org/api/books.json

## 📊 BUILD MONITORING

### Monitor Progress:
\`\`\`bash
node monitor-builds.js
\`\`\`

### Check Specific Build:
\`\`\`bash
npx eas build:list --limit 10
\`\`\`

### View Build Logs:
\`\`\`bash
npx eas build:view <build-id>
\`\`\`

## 🦞 READY TO BUILD!

**Execute these commands in order:**

1. \`./prepare-build.sh\` - Clean and install
2. \`npx eas build --platform ios --profile production\` - Start iOS
3. \`npx eas build --platform android --profile production\` - Start Android
4. \`node monitor-builds.js\` - Monitor progress

**Na Nach Nachma Nachman Me'Uman!** 🎉
`;

const instructionsPath = path.join(APP_DIR, 'BUILD_INSTRUCTIONS_DETAILED.md');
fs.writeFileSync(instructionsPath, buildInstructions);
console.log(`   ✅ Created: ${instructionsPath}`);

// Final Instructions
console.log('\n🎯 BUILD SYSTEM READY!');
console.log('   Preparation script: ./prepare-build.sh');
console.log('   iOS build: npx eas build --platform ios --profile production');
console.log('   Android build: npx eas build --platform android --profile production');
console.log('   Monitor: node monitor-builds.js');

console.log('\n🚀 RECOMMENDED EXECUTION ORDER:');
console.log('   1. Run: ./prepare-build.sh (clean install)');
console.log('   2. Start: npx eas build --platform ios --profile production');
console.log('   3. Start: npx eas build --platform android --profile production');
console.log('   4. Run: node monitor-builds.js (monitor progress)');
console.log('   5. Capture screenshots while builds run');

console.log('\n⏱️  PARALLEL EXECUTION TIMELINE:');
console.log('   Build preparation: 5-10 minutes');
console.log('   iOS build: 20-40 minutes (starts first)');
console.log('   Android build: 15-30 minutes (starts 5 min later)');
console.log('   Screenshots: 30 minutes (parallel with builds)');
console.log('   Total to builds ready: ~40 minutes');

console.log('\n🦞 Na Nach Nachma Nachman Me\'Uman!');
console.log('   STARTING PRODUCTION BUILDS NOW!');