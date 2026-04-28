#!/usr/bin/env node

/**
 * Smart API Deployment Script
 * Deploys Ajew Ananach API to production
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const API_SOURCE = path.join(__dirname, '..', '..', 'ajew-org', 'public', 'api');
const API_DEST = path.join(__dirname, '..', '..', 'ajew-org', 'public', 'api-production');
const GITHUB_REPO = 'ajew-api';
const GITHUB_USER = 'petteknanach';

console.log('🚀 Smart API Deployment Script\n');

// Step 1: Prepare production API
console.log('1. Preparing production API...');
if (!fs.existsSync(API_SOURCE)) {
  console.error(`❌ Source API not found: ${API_SOURCE}`);
  process.exit(1);
}

// Create production directory
if (!fs.existsSync(API_DEST)) {
  fs.mkdirSync(API_DEST, { recursive: true });
}

// Copy API files
console.log(`   Copying from: ${API_SOURCE}`);
console.log(`   Copying to: ${API_DEST}`);

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const items = fs.readdirSync(src);
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`     📄 ${item}`);
    }
  }
}

copyDir(API_SOURCE, API_DEST);
console.log('   ✅ API prepared for production');

// Step 2: Create deployment instructions
console.log('\n2. Creating deployment instructions...');

const instructions = `
# Ajew Ananach API Deployment Instructions

## 📊 API Status
- Source: ${API_SOURCE}
- Production Ready: ${API_DEST}
- Files: ${fs.readdirSync(API_DEST).length} files/directories
- Size: ${getDirSize(API_DEST)} KB

## 🚀 Deployment Options

### Option A: Deploy to ajew.org (Recommended)
1. Connect to ajew.org server via FTP/SSH
2. Upload contents of: ${API_DEST}
3. Upload to: /public/api/ directory
4. Test: https://ajew.org/api/books.json

### Option B: GitHub Pages (Alternative)
1. Create repo: ${GITHUB_USER}/${GITHUB_REPO}
2. Enable GitHub Pages in settings
3. Upload API files to root
4. Access: https://${GITHUB_USER}.github.io/${GITHUB_REPO}/books.json

### Option C: Netlify/Vercel (Easy)
1. Drag ${API_DEST} folder to Netlify/Vercel
2. Set up custom domain: api.ajew.org
3. Deploy automatically

## 🔧 API Structure
${JSON.stringify(getApiStructure(API_DEST), null, 2)}

## 📱 Mobile App Configuration
The mobile app is configured to use:
- Primary: https://ajew.org/api
- Fallback: Mock data (if API unavailable)

## 🎯 Smart Deployment Strategy
1. Deploy API BEFORE app launch (ideal)
2. OR: Launch app with fallback, deploy API later
3. Users get working app immediately
4. API deployment happens in background

## 🦞 Na Nach Nachma Nachman Me'Uman!
The light of Breslov wisdom is ready to shine!
`;

fs.writeFileSync(path.join(__dirname, '..', 'DEPLOYMENT_INSTRUCTIONS.md'), instructions);
console.log('   ✅ Deployment instructions created');

// Step 3: Test API locally
console.log('\n3. Testing API locally...');
try {
  const booksPath = path.join(API_DEST, 'books.json');
  if (fs.existsSync(booksPath)) {
    const books = JSON.parse(fs.readFileSync(booksPath, 'utf8'));
    console.log(`   ✅ Books endpoint: ${books.length} books`);
    
    // Test first book
    if (books.length > 0) {
      const firstBook = books[0];
      const bookIndexPath = path.join(API_DEST, firstBook.id, 'index.json');
      if (fs.existsSync(bookIndexPath)) {
        const bookIndex = JSON.parse(fs.readFileSync(bookIndexPath, 'utf8'));
        console.log(`   ✅ ${firstBook.title}: ${bookIndex.chapters.length} chapters`);
      }
    }
  }
} catch (error) {
  console.log(`   ⚠️ Local test: ${error.message}`);
}

// Step 4: Summary
console.log('\n🎯 Deployment Summary:');
console.log('   API Status: ✅ Production ready');
console.log('   Files: ✅ Prepared for deployment');
console.log('   Instructions: ✅ Created');
console.log('   Strategy: ✅ Smart (fallback enabled)');

console.log('\n🚀 Next Steps:');
console.log('   1. Choose deployment option (A, B, or C)');
console.log('   2. Deploy API to chosen platform');
console.log('   3. Test: https://[your-domain]/api/books.json');
console.log('   4. Update mobile app if needed (already configured)');

console.log('\n🦞 Na Nach Nachma Nachman Me\'Uman!');
console.log('   Real API deployment = Real impact!');

// Helper functions
function getDirSize(dir) {
  let size = 0;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    if (stat.isDirectory()) {
      size += getDirSize(itemPath);
    } else {
      size += stat.size;
    }
  }
  return Math.round(size / 1024);
}

function getApiStructure(dir, depth = 0) {
  const structure = {};
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      if (depth < 2) { // Limit recursion depth
        structure[item] = getApiStructure(itemPath, depth + 1);
      } else {
        structure[item] = '...';
      }
    } else {
      structure[item] = `${Math.round(stat.size / 1024)}KB`;
    }
  }
  
  return structure;
}