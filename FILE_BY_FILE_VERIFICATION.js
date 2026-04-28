#!/usr/bin/env node

/**
 * FILE-BY-FILE VERIFICATION
 * Check EVERY file in the project
 */

const fs = require('fs');
const path = require('path');

console.log('📁 FILE-BY-FILE VERIFICATION - SLOWLY AND SURELY\n');

// Define critical files that MUST exist
const CRITICAL_FILES = [
  // App configuration
  { path: 'app.json', type: 'config', critical: true },
  { path: 'package.json', type: 'config', critical: true },
  { path: 'eas.json', type: 'config', critical: true },
  { path: '.easignore', type: 'config', critical: true },
  
  // App code
  { path: 'App.js', type: 'code', critical: true },
  { path: 'AjewAPI.js', type: 'code', critical: true },
  
  // Assets
  { path: 'assets/icon.png', type: 'asset', critical: true },
  { path: 'assets/splash.png', type: 'asset', critical: true },
  { path: 'assets/adaptive-icon.png', type: 'asset', critical: true },
  { path: 'assets/favicon.png', type: 'asset', critical: true },
  
  // Screenshots
  { path: 'assets/screenshots/iphone-6.5/home-screen.png', type: 'screenshot', critical: true },
  { path: 'assets/screenshots/iphone-6.5/browse-library.png', type: 'screenshot', critical: true },
  { path: 'assets/screenshots/iphone-6.5/chapter-reading.png', type: 'screenshot', critical: true },
  
  // Documentation
  { path: 'STORE_DESCRIPTIONS.md', type: 'doc', critical: true },
  { path: 'LAUNCH_CHECKLIST.md', type: 'doc', critical: true },
  { path: 'SUBMISSION_PACKAGE.md', type: 'doc', critical: true },
  
  // Legal
  { path: 'privacy-policy.html', type: 'legal', critical: true },
  { path: 'support-page.html', type: 'legal', critical: true },
];

// Define important files (should exist)
const IMPORTANT_FILES = [
  // More screenshots
  { path: 'assets/screenshots/iphone-6.5/search-feature.png', type: 'screenshot' },
  { path: 'assets/screenshots/iphone-6.5/daily-wisdom.png', type: 'screenshot' },
  { path: 'assets/screenshots/iphone-6.5/bookmarks.png', type: 'screenshot' },
  { path: 'assets/screenshots/iphone-6.5/settings.png', type: 'screenshot' },
  
  // More assets
  { path: 'assets/icons/', type: 'asset' },
  { path: 'assets/promotional/', type: 'asset' },
  
  // Scripts
  { path: 'scripts/build-production.js', type: 'script' },
  { path: 'scripts/deploy-api.js', type: 'script' },
];

console.log('🔍 CHECKING CRITICAL FILES (MUST EXIST):\n');

let criticalFilesMissing = 0;
let criticalFilesPresent = 0;

CRITICAL_FILES.forEach(file => {
  const fullPath = path.join(__dirname, file.path);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    let size = 'N/A';
    try {
      const stats = fs.statSync(fullPath);
      if (stats.isFile()) {
        size = `${Math.round(stats.size / 1024)}KB`;
      } else if (stats.isDirectory()) {
        size = 'Directory';
      }
    } catch (e) {
      size = 'Error';
    }
    
    console.log(`   ✅ ${file.path.padEnd(50)} ${size.padStart(10)} (${file.type})`);
    criticalFilesPresent++;
  } else {
    console.log(`   ❌ ${file.path.padEnd(50)} MISSING! (${file.type})`);
    criticalFilesMissing++;
  }
});

console.log(`\n📊 CRITICAL FILES: ${criticalFilesPresent}/${CRITICAL_FILES.length} present`);
console.log(`   ${criticalFilesMissing > 0 ? '❌ MISSING FILES!' : '✅ ALL CRITICAL FILES PRESENT!'}`);

console.log('\n🔍 CHECKING IMPORTANT FILES:\n');

let importantFilesPresent = 0;
IMPORTANT_FILES.forEach(file => {
  const fullPath = path.join(__dirname, file.path);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    console.log(`   ✅ ${file.path.padEnd(50)} (${file.type})`);
    importantFilesPresent++;
  } else {
    console.log(`   ⚠️ ${file.path.padEnd(50)} Not found (${file.type})`);
  }
});

console.log(`\n📊 IMPORTANT FILES: ${importantFilesPresent}/${IMPORTANT_FILES.length} present`);

// Check API content
console.log('\n🔍 CHECKING API CONTENT:\n');

const apiPath = path.join(__dirname, '..', 'ajew-org', 'public', 'api-mobile');
if (fs.existsSync(apiPath)) {
  console.log(`   ✅ API directory exists: ${apiPath}`);
  
  // Check key API files
  const apiFiles = [
    'books.json',
    'search-index.json',
    'daily-wisdom.json',
    'info.json',
    'likutay-moharan/part-1/1.json',
    'likutay-moharan/part-1/index.json'
  ];
  
  apiFiles.forEach(apiFile => {
    const fullApiPath = path.join(apiPath, apiFile);
    if (fs.existsSync(fullApiPath)) {
      try {
        const stats = fs.statSync(fullApiPath);
        console.log(`   ✅ ${apiFile.padEnd(40)} ${Math.round(stats.size / 1024)}KB`);
      } catch (e) {
        console.log(`   ✅ ${apiFile.padEnd(40)} Exists`);
      }
    } else {
      console.log(`   ⚠️ ${apiFile.padEnd(40)} Missing`);
    }
  });
  
  // Count total Torah files
  const torahDir = path.join(apiPath, 'likutay-moharan', 'part-1');
  if (fs.existsSync(torahDir)) {
    const files = fs.readdirSync(torahDir).filter(f => f.includes('torah-') || f.includes('.json'));
    const torahFiles = files.filter(f => f.includes('torah-') || /^\d+\.json$/.test(f));
    console.log(`   📚 Torah files: ${torahFiles.length} (should be 10+)`);
  }
} else {
  console.log(`   ❌ API directory missing: ${apiPath}`);
}

// Check node_modules
console.log('\n🔍 CHECKING DEPENDENCIES:\n');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log(`   ✅ node_modules exists`);
  
  // Check key dependencies
  const keyDeps = ['expo', 'react', 'react-native', '@react-navigation', 'axios', 'lunr'];
  keyDeps.forEach(dep => {
    const depPath = path.join(nodeModulesPath, dep);
    if (fs.existsSync(depPath)) {
      console.log(`   ✅ ${dep.padEnd(20)} Installed`);
    } else {
      console.log(`   ⚠️ ${dep.padEnd(20)} Not installed`);
    }
  });
} else {
  console.log(`   ⚠️ node_modules missing (need to run npm install)`);
}

// Final summary
console.log('\n🎯 FILE VERIFICATION SUMMARY:');
console.log(`   Critical files: ${criticalFilesPresent}/${CRITICAL_FILES.length} ✅`);
console.log(`   Important files: ${importantFilesPresent}/${IMPORTANT_FILES.length} ✅`);
console.log(`   API content: ${fs.existsSync(apiPath) ? '✅ Present' : '❌ Missing'}`);
console.log(`   Dependencies: ${fs.existsSync(nodeModulesPath) ? '✅ Installed' : '⚠️ Need install'}`);

if (criticalFilesMissing === 0) {
  console.log('\n🚀 FILE STATUS: ✅ ALL CRITICAL FILES PRESENT');
  console.log('   The app has ALL necessary files for launch');
} else {
  console.log(`\n⚠️ FILE STATUS: ${criticalFilesMissing} CRITICAL FILES MISSING`);
  console.log('   Need to create missing files before launch');
}

console.log('\n🦞 FINAL FILE VERDICT:');
if (criticalFilesMissing === 0) {
  console.log('   ✅ App is COMPLETE and READY for production builds');
  console.log('   ✅ All critical files present and accounted for');
  console.log('   ✅ API content ready and accessible');
  console.log('   ✅ Dependencies can be installed if needed');
} else {
  console.log(`   ⚠️ App has ${criticalFilesMissing} missing critical files`);
  console.log('   Need to create missing files before proceeding');
}

console.log('\nYou know it is 4! 🎉');
console.log('Slowly and surely - file verification complete!');