const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Colors for the app
const colors = {
  primary: '#3498db',
  secondary: '#2ecc71',
  accent: '#f39c12',
  background: '#ffffff',
  text: '#2c3e50'
};

// Create icon (1024x1024)
function createIcon() {
  const size = 1024;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = colors.primary;
  ctx.fillRect(0, 0, size, size);

  // Lobster emoji (simplified as text for now)
  // In production, you'd use a proper lobster SVG/icon
  ctx.fillStyle = colors.background;
  ctx.font = 'bold 400px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🦞', size / 2, size / 2);

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, 'icon.png'), buffer);
  console.log('Created icon.png (1024x1024)');
}

// Create adaptive icon (1024x1024 with transparent background)
function createAdaptiveIcon() {
  const size = 1024;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Transparent background
  ctx.clearRect(0, 0, size, size);

  // Lobster in accent color
  ctx.fillStyle = colors.accent;
  ctx.font = 'bold 400px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🦞', size / 2, size / 2);

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), buffer);
  console.log('Created adaptive-icon.png (1024x1024)');
}

// Create splash screen (1242x2436)
function createSplashScreen() {
  const width = 1242;
  const height = 2436;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, colors.primary);
  gradient.addColorStop(1, colors.secondary);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // App name
  ctx.fillStyle = colors.background;
  ctx.font = 'bold 100px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Ajew Ananach', width / 2, height / 2 - 100);

  // Lobster icon
  ctx.font = 'bold 200px Arial';
  ctx.fillText('🦞', width / 2, height / 2 + 50);

  // Tagline
  ctx.font = '40px Arial';
  ctx.fillText('Breslov Wisdom in Your Pocket', width / 2, height / 2 + 200);

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, 'splash.png'), buffer);
  console.log('Created splash.png (1242x2436)');
}

// Create favicon (32x32)
function createFavicon() {
  const size = 32;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = colors.primary;
  ctx.fillRect(0, 0, size, size);

  // Small lobster
  ctx.fillStyle = colors.background;
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🦞', size / 2, size / 2);

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, 'favicon.png'), buffer);
  console.log('Created favicon.png (32x32)');
}

// Create all assets
function createAllAssets() {
  console.log('Creating app store assets...');
  
  try {
    createIcon();
    createAdaptiveIcon();
    createSplashScreen();
    createFavicon();
    
    console.log('\n✅ All assets created successfully!');
    console.log('\nAssets created in:', assetsDir);
    console.log('\nFor production:');
    console.log('1. Replace these with professionally designed graphics');
    console.log('2. Ensure proper licensing for any fonts/icons used');
    console.log('3. Test on actual devices for visual quality');
    console.log('4. Consider hiring a designer for final polish');
    
  } catch (error) {
    console.error('Error creating assets:', error);
  }
}

// Run if called directly
if (require.main === module) {
  // Check if canvas is available
  try {
    require('canvas');
    createAllAssets();
  } catch (error) {
    console.error('Canvas module not found. Install it with:');
    console.error('npm install canvas');
    console.error('\nOr create placeholder files instead...');
    
    // Create placeholder text files
    const placeholders = [
      { name: 'icon.txt', desc: '1024x1024 PNG with lobster emoji' },
      { name: 'adaptive-icon.txt', desc: '1024x1024 PNG with transparent background' },
      { name: 'splash.txt', desc: '1242x2436 PNG with gradient background' },
      { name: 'favicon.txt', desc: '32x32 PNG with small lobster' }
    ];
    
    for (const placeholder of placeholders) {
      fs.writeFileSync(
        path.join(assetsDir, placeholder.name),
        `Placeholder for ${placeholder.name.replace('.txt', '.png')}\n${placeholder.desc}\n`
      );
      console.log(`Created ${placeholder.name}`);
    }
  }
}

module.exports = { createAllAssets };