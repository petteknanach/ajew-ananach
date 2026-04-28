#!/usr/bin/env node

/**
 * Create Simple Screenshots for Immediate Submission
 * Generates screenshot specifications for manual creation
 */

const fs = require('fs');
const path = require('path');

console.log('📸 Creating Simple Screenshot Specifications\n');

// Screenshot scenarios
const screenshots = [
  {
    name: 'home-screen',
    title: 'Home Screen',
    description: 'Featured books and quick actions',
    features: ['Featured books', 'Quick actions', 'Daily wisdom', 'Search'],
    device: 'iPhone 6.5"',
    size: '1242x2688'
  },
  {
    name: 'browse-library',
    title: 'Browse Library',
    description: 'All Breslov books available',
    features: ['4 books listed', 'Categories', 'Book details', 'Start reading'],
    device: 'iPhone 6.5"',
    size: '1242x2688'
  },
  {
    name: 'chapter-reading',
    title: 'Chapter Reading',
    description: 'Read Likutey Moharan with Hebrew/English toggle',
    features: ['Hebrew/English toggle', 'Font size adjustment', 'Bookmark', 'Navigation'],
    device: 'iPhone 6.5"',
    size: '1242x2688'
  },
  {
    name: 'search-feature',
    title: 'Search Feature',
    description: 'Search across all Breslov teachings',
    features: ['Hebrew search', 'English search', 'Quick results', 'Relevant teachings'],
    device: 'iPhone 6.5"',
    size: '1242x2688'
  },
  {
    name: 'daily-wisdom',
    title: 'Daily Wisdom',
    description: 'Get a new teaching every day',
    features: ['Daily teaching', 'Reflection questions', 'Share feature', 'Date display'],
    device: 'iPhone 6.5"',
    size: '1242x2688'
  },
  {
    name: 'bookmarks',
    title: 'Bookmarks',
    description: 'Save your favorite teachings',
    features: ['Saved teachings', 'Quick access', 'Organize', 'Study progress'],
    device: 'iPhone 6.5"',
    size: '1242x2688'
  },
  {
    name: 'settings',
    title: 'Settings',
    description: 'Customize your reading experience',
    features: ['Language selection', 'Font size', 'Dark mode', 'About section'],
    device: 'iPhone 6.5"',
    size: '1242x2688'
  }
];

// Create screenshot instructions
const instructions = `# Simple Screenshots for Immediate Submission

## 📱 App URL for Screenshots
**Web App**: http://localhost:8081
**Features to showcase**: Browse, Search, Read, Daily Wisdom, Bookmarks

## 🎯 Screenshot Requirements

### iPhone 6.5" (1242x2688 pixels)
Create these 7 screenshots:

${screenshots.map((shot, i) => `
### ${i + 1}. ${shot.title}
**Device**: ${shot.device} (${shot.size})
**Description**: ${shot.description}
**Features to show**: ${shot.features.join(', ')}
**How to capture**:
1. Navigate to: ${shot.name.replace('-', ' ')}
2. Ensure content is loaded
3. Capture full screen
4. Save as: screenshot-${shot.name}-iphone-6.5.png
`).join('\n')}

## 🖼️ Screenshot Creation Methods

### Method A: Browser Screenshot (Easiest)
1. Open http://localhost:8081 in Chrome
2. Open DevTools (F12)
3. Toggle device toolbar (Ctrl+Shift+M)
4. Set to iPhone 12 Pro (390x844)
5. Navigate through app
6. Take screenshot (Ctrl+Shift+P → "screenshot")

### Method B: Manual Creation
1. Use screenshot tool (Windows Snipping Tool, Mac Screenshot)
2. Capture browser window
3. Add iPhone frame using:
   - Online tools (screely.com, mockuphone.com)
   - Photoshop templates
   - Canva templates

### Method C: Automated (Advanced)
1. Use Puppeteer/Playwright scripts
2. Automated browser screenshots
3. Batch processing

## 🎨 Screenshot Guidelines

### Do:
✅ Show real content (10 chapters of Likutey Moharan)
✅ Highlight key features (search, daily wisdom)
✅ Use consistent lighting/colors
✅ Include device frame for professionalism
✅ Show Hebrew text (authenticity)

### Don't:
❌ Show placeholder/lorem ipsum
❌ Include browser UI (address bar, tabs)
❌ Use blurry/low-quality images
❌ Show empty states (unless demonstrating)
❌ Include personal information

## 📁 File Organization

Save screenshots to: \`assets/screenshots/\`

\`\`\`
assets/screenshots/
├── iphone-6.5/
│   ├── screenshot-home-screen.png
│   ├── screenshot-browse-library.png
│   ├── screenshot-chapter-reading.png
│   ├── screenshot-search-feature.png
│   ├── screenshot-daily-wisdom.png
│   ├── screenshot-bookmarks.png
│   └── screenshot-settings.png
├── iphone-5.5/
│   └── (same set, different size)
└── ipad/
    └── (same set, different size)
\`\`\`

## ⏱️ Time Estimate

**Quick method**: 30-45 minutes
**Professional method**: 1-2 hours
**Automated method**: 15 minutes (setup) + 5 minutes (run)

## 🚀 Immediate Action

1. **Open the app**: http://localhost:8081
2. **Navigate through all features**
3. **Take 7 screenshots** (iPhone 6.5")
4. **Add device frames** (optional but recommended)
5. **Save to assets/screenshots/**

## 🦞 Na Nach Nachma Nachman Me'Uman!

These screenshots will get the app submitted TODAY!
Professional graphics can be added tomorrow as an update.
`;

// Save instructions
const instructionsPath = path.join(__dirname, '..', 'SCREENSHOT_INSTRUCTIONS.md');
fs.writeFileSync(instructionsPath, instructions);
console.log(`✅ Created: ${instructionsPath}`);

// Create directory structure
const screenshotDir = path.join(__dirname, '..', 'assets', 'screenshots');
const subdirs = ['iphone-6.5', 'iphone-5.5', 'ipad'];

subdirs.forEach(subdir => {
  const dirPath = path.join(screenshotDir, subdir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  }
});

// Summary
console.log('\n🎯 SCREENSHOT PLAN READY:');
console.log(`   Screenshots needed: ${screenshots.length}`);
console.log(`   Primary device: iPhone 6.5" (1242x2688)`);
console.log(`   Save location: ${screenshotDir}`);
console.log(`   Instructions: ${instructionsPath}`);

console.log('\n🚀 QUICK START:');
console.log('   1. Open http://localhost:8081');
console.log('   2. Take 7 screenshots of key features');
console.log('   3. Add iPhone frames (optional)');
console.log('   4. Save to assets/screenshots/iphone-6.5/');

console.log('\n🦞 Ready for immediate app store submission!');