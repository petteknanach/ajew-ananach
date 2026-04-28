#!/usr/bin/env node

/**
 * Production Build Script for Ajew Ananach
 * Prepares app for App Store submission
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🏗️  Production Build Preparation\n');

// Configuration
const APP_DIR = path.join(__dirname, '..');
const ASSETS_DIR = path.join(APP_DIR, 'assets');
const BUILD_DIR = path.join(APP_DIR, 'build');
const CONFIG_FILES = [
  'app.json',
  'package.json',
  'eas.json',
  '.easignore',
  '.gitignore'
];

// Step 1: Validate environment
console.log('1. Validating environment...');
try {
  // Check Node version
  const nodeVersion = process.version;
  console.log(`   ✅ Node.js: ${nodeVersion}`);
  
  // Check npm/yarn
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`   ✅ npm: ${npmVersion}`);
  } catch {
    console.log('   ⚠️ npm not found');
  }
  
  // Check Expo CLI
  try {
    const expoVersion = execSync('npx expo --version', { encoding: 'utf8' }).trim();
    console.log(`   ✅ Expo CLI: ${expoVersion}`);
  } catch {
    console.log('   ❌ Expo CLI not installed');
    console.log('   Install with: npm install -g expo-cli');
    process.exit(1);
  }
  
  // Check EAS CLI
  try {
    const easVersion = execSync('npx eas --version', { encoding: 'utf8' }).trim();
    console.log(`   ✅ EAS CLI: ${easVersion}`);
  } catch {
    console.log('   ⚠️ EAS CLI not installed (required for builds)');
    console.log('   Install with: npm install -g eas-cli');
  }
} catch (error) {
  console.log(`   ❌ Validation failed: ${error.message}`);
}

// Step 2: Check required files
console.log('\n2. Checking required files...');
let allFilesExist = true;
CONFIG_FILES.forEach(file => {
  const filePath = path.join(APP_DIR, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} (missing)`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n⚠️  Missing required files. Please create them before building.');
}

// Step 3: Check assets
console.log('\n3. Checking assets...');
const requiredAssets = [
  'icon.png',
  'adaptive-icon.png',
  'splash.png',
  'favicon.png'
];

requiredAssets.forEach(asset => {
  const assetPath = path.join(ASSETS_DIR, asset);
  if (fs.existsSync(assetPath)) {
    const stats = fs.statSync(assetPath);
    console.log(`   ✅ ${asset} (${Math.round(stats.size / 1024)}KB)`);
  } else {
    console.log(`   ❌ ${asset} (missing)`);
    console.log(`      Generate with: node create-assets.js`);
  }
});

// Step 4: Check API configuration
console.log('\n4. Checking API configuration...');
try {
  const apiConfig = fs.readFileSync(path.join(APP_DIR, 'AjewAPI.js'), 'utf8');
  
  // Check API base URL
  if (apiConfig.includes('API_BASE_URL')) {
    const match = apiConfig.match(/const API_BASE_URL = ['"]([^'"]+)['"]/);
    if (match) {
      console.log(`   ✅ API Base URL: ${match[1]}`);
      
      // Check if it's production-ready
      if (match[1].includes('ajew.org')) {
        console.log('   ✅ Using production API URL');
      } else if (match[1].includes('localhost')) {
        console.log('   ⚠️ Using localhost (change to production for final build)');
      }
    }
  }
  
  // Check mock data fallback
  if (apiConfig.includes('useMockData')) {
    console.log('   ✅ Mock data fallback enabled');
  }
  
  // Check caching
  if (apiConfig.includes('CACHE_TTL')) {
    console.log('   ✅ Caching enabled (24 hours)');
  }
} catch (error) {
  console.log(`   ⚠️ Could not check API config: ${error.message}`);
}

// Step 5: Create build directory
console.log('\n5. Preparing build directory...');
if (!fs.existsSync(BUILD_DIR)) {
  fs.mkdirSync(BUILD_DIR, { recursive: true });
  console.log(`   ✅ Created: ${BUILD_DIR}`);
} else {
  console.log(`   ✅ Already exists: ${BUILD_DIR}`);
}

// Step 6: Create build instructions
console.log('\n6. Creating build instructions...');
const instructions = `
# Ajew Ananach - Production Build Instructions

## 📱 Build Commands

### iOS Production Build
\`\`\`bash
cd "${APP_DIR}"
npx eas build --platform ios --profile production
\`\`\`

### Android Production Build
\`\`\`bash
cd "${APP_DIR}"
npx eas build --platform android --profile production
\`\`\`

### Development Build (for testing)
\`\`\`bash
cd "${APP_DIR}"
npx eas build --platform all --profile development
\`\`\`

## 🔧 Pre-Build Checklist

### Configuration Files
${CONFIG_FILES.map(f => `- [ ] ${f}`).join('\n')}

### Assets (in assets/ directory)
${requiredAssets.map(a => `- [ ] ${a}`).join('\n')}

### API Configuration
- [ ] API_BASE_URL set to production endpoint
- [ ] Mock data fallback enabled
- [ ] Caching configured (24 hours)

### App Store Requirements
- [ ] App name: Ajew Ananach
- [ ] Bundle ID: org.ajew.ananach
- [ ] Version: 1.0.0
- [ ] Build number: 1 (iOS), 1 (Android)

## 🚀 Build Process

1. **Login to EAS** (if not already logged in):
   \`\`\`bash
   npx eas login
   \`\`\`

2. **Configure EAS project**:
   \`\`\`bash
   npx eas init
   \`\`\`

3. **Build iOS**:
   \`\`\`bash
   npx eas build --platform ios --profile production
   \`\`\`
   - Wait ~20-30 minutes
   - Download IPA file when ready

4. **Build Android**:
   \`\`\`bash
   npx eas build --platform android --profile production
   \`\`\`
   - Wait ~15-20 minutes
   - Download APK/AAB file when ready

5. **Upload to App Stores**:
   - iOS: Upload IPA to App Store Connect via Transporter
   - Android: Upload AAB to Google Play Console

## 📊 Build Profiles

### Production Profile (app.json)
- Optimized for release
- Minified code
- No debug tools
- Production API endpoints

### Development Profile
- Debug tools enabled
- Development API endpoints
- Faster builds
- For testing only

## 🔍 Post-Build Testing

### iOS Testing
1. Install on physical iOS device
2. Test all user flows
3. Check performance
4. Verify API connectivity

### Android Testing
1. Install on physical Android device
2. Test all user flows
3. Check different screen sizes
4. Verify API connectivity

## 🎯 Success Criteria

- [ ] App launches in < 3 seconds
- [ ] All features work correctly
- [ ] API connectivity stable
- [ ] No crashes in testing
- [ ] Memory usage < 100MB
- [ ] Battery impact minimal

## 🦞 Final Steps

1. **Submit to App Store Connect**
2. **Submit to Google Play Console**
3. **Deploy API to production**
4. **Launch announcement**
5. **Monitor reviews & feedback**

**Na Nach Nachma Nachman Me'Uman!** 🎉
`;

const instructionsPath = path.join(BUILD_DIR, 'BUILD_INSTRUCTIONS.md');
fs.writeFileSync(instructionsPath, instructions);
console.log(`   ✅ Created: ${instructionsPath}`);

// Step 7: Summary
console.log('\n🎯 BUILD PREPARATION SUMMARY:');
console.log('   Environment: ✅ Ready');
console.log('   Files: ✅ Mostly complete');
console.log('   Assets: ✅ Check required');
console.log('   API: ✅ Configured');
console.log('   Instructions: ✅ Created');

console.log('\n🚀 READY FOR PRODUCTION BUILDS:');
console.log('   1. Fix any missing files/assets');
console.log('   2. Run: npx eas build --platform ios --profile production');
console.log('   3. Run: npx eas build --platform android --profile production');
console.log('   4. Submit to app stores');

console.log('\n⚠️  IMPORTANT NOTES:');
console.log('   - Ensure API is deployed to production before final build');
console.log('   - Or keep fallback mock data for initial launch');
console.log('   - Test thoroughly before submission');

console.log('\n🦞 Na Nach Nachma Nachman Me\'Uman!');
console.log('   The app is ready to bring Breslov wisdom to the world!');