#!/usr/bin/env node

/**
 * Local Test Server for Ajew Ananach API
 * Serves the generated API files for local testing
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Enable CORS for mobile app testing
app.use(cors());

// Serve static files - prefer mobile-optimized API
const mobileApiPath = path.join(__dirname, '../ajew-org/public/api-mobile');
const apiV2Path = path.join(__dirname, '../ajew-org/public/api-v2');
const apiV1Path = path.join(__dirname, '../ajew-org/public/api');

// Check which API version exists (prefer mobile-optimized)
let activeApiPath;
if (fs.existsSync(mobileApiPath)) {
  console.log('🚀 Using MOBILE-OPTIMIZED API (10 real chapters)');
  activeApiPath = mobileApiPath;
} else if (fs.existsSync(apiV2Path)) {
  console.log('Using API v2 (reorganized structure)');
  activeApiPath = apiV2Path;
} else if (fs.existsSync(apiV1Path)) {
  console.log('Using API v1 (sample data)');
  activeApiPath = apiV1Path;
} else {
  console.error('No API directory found!');
  process.exit(1);
}

// Serve static files
app.use('/api', express.static(activeApiPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    api: 'Ajew Ananach Test Server',
    version: '1.0.0',
    path: activeApiPath,
    timestamp: new Date().toISOString()
  });
});

// List available endpoints
app.get('/api/endpoints', (req, res) => {
  try {
    const endpoints = [];
    
    // Check for books.json
    if (fs.existsSync(path.join(activeApiPath, 'books.json'))) {
      endpoints.push('/api/books.json');
    }
    
    // Check for search-index.json
    if (fs.existsSync(path.join(activeApiPath, 'search-index.json'))) {
      endpoints.push('/api/search-index.json');
    }
    
    // Check for daily-wisdom.json
    if (fs.existsSync(path.join(activeApiPath, 'daily-wisdom.json'))) {
      endpoints.push('/api/daily-wisdom.json');
    }
    
    // Check for book directories
    const items = fs.readdirSync(activeApiPath, { withFileTypes: true });
    const bookDirs = items.filter(item => item.isDirectory());
    
    for (const bookDir of bookDirs) {
      const bookPath = path.join(activeApiPath, bookDir.name);
      endpoints.push(`/api/${bookDir.name}/index.json`);
      
      // Check for chapter files
      const chapterFiles = fs.readdirSync(bookPath)
        .filter(file => file.endsWith('.json') && file !== 'index.json')
        .map(file => `/api/${bookDir.name}/${file}`);
      
      endpoints.push(...chapterFiles.slice(0, 5)); // First 5 chapters
    }
    
    res.json({
      endpoints,
      total: endpoints.length,
      apiPath: activeApiPath
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Ajew Ananach Test Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving API from: ${activeApiPath}`);
  console.log(`🔗 Main endpoint: http://localhost:${PORT}/api/books.json`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Endpoints list: http://localhost:${PORT}/api/endpoints`);
  console.log('\n📱 Mobile App Testing:');
  console.log('1. Update AjewAPI.js: const API_BASE_URL = "http://localhost:3000"');
  console.log('2. Set useMockData = false');
  console.log('3. Restart mobile app');
  console.log('4. Test all features');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down test server...');
  process.exit(0);
});