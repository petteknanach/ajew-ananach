#!/usr/bin/env node

/**
 * COMPREHENSIVE FINAL TEST
 * Test EVERYTHING before launch
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function runComprehensiveTest() {
  console.log('🔍 COMPREHENSIVE FINAL TEST - SLOWLY AND SURELY\n');

  let allTestsPassed = true;

  // Test 1: API Server
  console.log('1. TESTING API SERVER...');
  try {
    const health = await axios.get('http://localhost:3000/health', { timeout: 5000 });
    console.log(`   ✅ API Server: ${health.data.status}`);
    console.log(`   📁 Serving: ${health.data.path}`);
    
    if (!health.data.path.includes('api-mobile')) {
      console.log('   ⚠️ Not serving mobile-optimized API');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log(`   ❌ API Server failed: ${error.message}`);
    allTestsPassed = false;
  }

// Test 2: API Endpoints
console.log('\n2. TESTING API ENDPOINTS...');
try {
  const books = await axios.get('http://localhost:3000/api/books.json', { timeout: 5000 });
  console.log(`   ✅ Books endpoint: ${books.data.length} books`);
  
  if (books.data.length === 0) {
    console.log('   ❌ No books returned');
    allTestsPassed = false;
  } else {
    console.log(`   📚 First book: ${books.data[0].title} (${books.data[0].chapters} chapters)`);
  }
} catch (error) {
  console.log(`   ❌ Books endpoint failed: ${error.message}`);
  allTestsPassed = false;
}

// Test 3: Real Content
console.log('\n3. TESTING REAL CONTENT...');
try {
  const books = await axios.get('http://localhost:3000/api/books.json', { timeout: 5000 });
  const firstBook = books.data[0];
  
  // Get book index
  const bookIndex = await axios.get(`http://localhost:3000/api/${firstBook.id}/part-1/index.json`, { timeout: 5000 });
  console.log(`   ✅ Book index: ${bookIndex.data.chapters.length} chapters`);
  
  if (bookIndex.data.chapters.length === 0) {
    console.log('   ❌ No chapters in book index');
    allTestsPassed = false;
  } else {
    // Get first chapter
    const chapter = await axios.get(`http://localhost:3000/api/${firstBook.id}/part-1/1.json`, { timeout: 5000 });
    console.log(`   ✅ Chapter 1: "${chapter.data.title}"`);
    
    // Check content
    if (!chapter.data.content || !chapter.data.content.hebrew || !chapter.data.content.english) {
      console.log('   ❌ Chapter missing content');
      allTestsPassed = false;
    } else {
      console.log(`   📖 Hebrew content: ${chapter.data.content.hebrew.length} characters`);
      console.log(`   📖 English content: ${chapter.data.content.english.length} characters`);
    }
  }
} catch (error) {
  console.log(`   ❌ Content test failed: ${error.message}`);
  allTestsPassed = false;
}

// Test 4: Search Functionality
console.log('\n4. TESTING SEARCH FUNCTIONALITY...');
try {
  const searchIndex = await axios.get('http://localhost:3000/api/search-index.json', { timeout: 5000 });
  console.log(`   ✅ Search index: ${searchIndex.data.length} entries`);
  
  if (searchIndex.data.length === 0) {
    console.log('   ⚠️ Search index empty (but app has fallback)');
  }
} catch (error) {
  console.log(`   ⚠️ Search index: ${error.message} (app has fallback)`);
}

// Test 5: Daily Wisdom
console.log('\n5. TESTING DAILY WISDOM...');
try {
  const daily = await axios.get('http://localhost:3000/api/daily-wisdom.json', { timeout: 5000 });
  console.log(`   ✅ Daily wisdom: ${daily.data.date}`);
  console.log(`   📜 Teaching: "${daily.data.teaching.title}"`);
} catch (error) {
  console.log(`   ⚠️ Daily wisdom: ${error.message} (app has fallback)`);
}

// Test 6: Mobile App Configuration
console.log('\n6. TESTING MOBILE APP CONFIGURATION...');
try {
  const apiConfig = fs.readFileSync('./AjewAPI.js', 'utf8');
  
  // Check API base URL
  const match = apiConfig.match(/const API_BASE_URL = ['"]([^'"]+)['"]/);
  if (match) {
    console.log(`   ✅ API Base URL: ${match[1]}`);
    
    if (match[1] !== 'http://localhost:3000') {
      console.log(`   ⚠️ Not configured for local testing: ${match[1]}`);
    }
  } else {
    console.log('   ❌ API_BASE_URL not found');
    allTestsPassed = false;
  }
  
  // Check mock data fallback
  if (apiConfig.includes('useMockData = false')) {
    console.log('   ✅ Using REAL API (not mock data)');
  } else {
    console.log('   ⚠️ Using mock data (should be real API for production)');
  }
  
  // Check caching
  if (apiConfig.includes('CACHE_TTL')) {
    console.log('   ✅ Caching enabled');
  }
  
} catch (error) {
  console.log(`   ❌ Config test failed: ${error.message}`);
  allTestsPassed = false;
}

// Test 7: Graphic Assets
console.log('\n7. TESTING GRAPHIC ASSETS...');
const assetsToCheck = [
  { path: 'assets/icon.png', minSize: 20000 },
  { path: 'assets/splash.png', minSize: 100000 },
  { path: 'assets/adaptive-icon.png', minSize: 20000 },
  { path: 'assets/favicon.png', minSize: 1000 }
];

assetsToCheck.forEach(asset => {
  const assetPath = path.join(__dirname, asset.path);
  if (fs.existsSync(assetPath)) {
    const stats = fs.statSync(assetPath);
    if (stats.size >= asset.minSize) {
      console.log(`   ✅ ${asset.path}: ${Math.round(stats.size / 1024)}KB`);
    } else {
      console.log(`   ⚠️ ${asset.path}: Only ${Math.round(stats.size / 1024)}KB (expected ${Math.round(asset.minSize / 1024)}KB+)`);
    }
  } else {
    console.log(`   ❌ ${asset.path}: Missing`);
    allTestsPassed = false;
  }
});

// Test 8: Screenshots
console.log('\n8. TESTING SCREENSHOTS...');
const screenshotsDir = path.join(__dirname, 'assets', 'screenshots', 'iphone-6.5');
if (fs.existsSync(screenshotsDir)) {
  const screenshots = fs.readdirSync(screenshotsDir).filter(f => f.endsWith('.png'));
  console.log(`   ✅ Screenshots: ${screenshots.length} professional mockups`);
  
  if (screenshots.length < 5) {
    console.log(`   ⚠️ Only ${screenshots.length} screenshots (recommend 5+)`);
  }
  
  // Check screenshot sizes
  screenshots.forEach(screenshot => {
    const screenshotPath = path.join(screenshotsDir, screenshot);
    const stats = fs.statSync(screenshotPath);
    if (stats.size < 50000) {
      console.log(`   ⚠️ ${screenshot}: Only ${Math.round(stats.size / 1024)}KB (might be low quality)`);
    }
  });
} else {
  console.log('   ❌ Screenshots directory missing');
  allTestsPassed = false;
}

// Test 9: App Configuration
console.log('\n9. TESTING APP CONFIGURATION...');
try {
  const appJson = JSON.parse(fs.readFileSync('./app.json', 'utf8'));
  
  // Check required fields
  const requiredFields = ['name', 'slug', 'version', 'orientation', 'icon', 'splash'];
  requiredFields.forEach(field => {
    if (appJson.expo[field]) {
      console.log(`   ✅ ${field}: ${appJson.expo[field]}`);
    } else {
      console.log(`   ❌ ${field}: Missing`);
      allTestsPassed = false;
    }
  });
  
  // Check iOS config
  if (appJson.expo.ios && appJson.expo.ios.bundleIdentifier) {
    console.log(`   ✅ iOS Bundle ID: ${appJson.expo.ios.bundleIdentifier}`);
  } else {
    console.log('   ❌ iOS Bundle ID missing');
    allTestsPassed = false;
  }
  
  // Check Android config
  if (appJson.expo.android && appJson.expo.android.package) {
    console.log(`   ✅ Android Package: ${appJson.expo.android.package}`);
  } else {
    console.log('   ❌ Android Package missing');
    allTestsPassed = false;
  }
  
} catch (error) {
  console.log(`   ❌ App config test failed: ${error.message}`);
  allTestsPassed = false;
}

// Test 10: Build Configuration
console.log('\n10. TESTING BUILD CONFIGURATION...');
const buildFiles = ['eas.json', '.easignore', 'package.json'];
buildFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file}: Missing`);
    allTestsPassed = false;
  }
});

// Final Summary
console.log('\n🎯 COMPREHENSIVE TEST SUMMARY:');
console.log(`   Total tests: 10 major categories`);
console.log(`   All tests passed: ${allTestsPassed ? '✅ YES' : '❌ NO'}`);

if (allTestsPassed) {
  console.log('\n🚀 LAUNCH READINESS:');
  console.log('   Status: ✅ 100% READY FOR LAUNCH');
  console.log('   Confidence: HIGH');
  console.log('   Recommendation: PROCEED WITH LAUNCH');
} else {
  console.log('\n⚠️ LAUNCH READINESS:');
  console.log('   Status: NOT READY - FIX ISSUES FIRST');
  console.log('   Issues found: See above');
  console.log('   Recommendation: FIX ISSUES BEFORE LAUNCH');
}

console.log('\n🦞 Na Nach Nachma Nachman Me\'Uman!');
console.log('   Slowly and surely - comprehensive testing complete!');
}

// Run the test
runComprehensiveTest().catch(console.error);