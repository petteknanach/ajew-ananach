#!/usr/bin/env node

/**
 * Test API Connection for Ajew Ananach
 * Tests the connection between mobile app and local API server
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000
});

async function testConnection() {
  console.log('🔍 Testing Ajew Ananach API Connection...\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const health = await axiosInstance.get('/health');
    console.log(`   ✅ Health: ${health.data.status}`);
    console.log(`   📁 API Path: ${health.data.path}`);
    
    // Test 2: Books endpoint
    console.log('\n2. Testing books endpoint...');
    const books = await axiosInstance.get('/api/books.json');
    console.log(`   ✅ Books: ${books.data.length} books found`);
    
    books.data.forEach(book => {
      console.log(`   📚 ${book.title}: ${book.chapters} chapters (${book.stats.status})`);
    });
    
    // Test 3: Book details (first book with chapters)
    const bookWithChapters = books.data.find(b => b.chapters > 0);
    if (bookWithChapters) {
      console.log(`\n3. Testing ${bookWithChapters.title} details...`);
      const bookDetails = await axiosInstance.get(`/api/${bookWithChapters.id}/index.json`);
      console.log(`   ✅ Book details: ${bookDetails.data.chapters.length} chapters listed`);
      
      // Test 4: Chapter details (first chapter)
      if (bookDetails.data.chapters.length > 0) {
        const firstChapter = bookDetails.data.chapters[0];
        console.log(`\n4. Testing chapter ${firstChapter.number}...`);
        const chapterDetails = await axiosInstance.get(`/api/${bookWithChapters.id}/${firstChapter.number}.json`);
        console.log(`   ✅ Chapter: ${chapterDetails.data.title}`);
        console.log(`   📖 Preview: ${chapterDetails.data.content.en.substring(0, 100)}...`);
      }
    }
    
    // Test 5: Search index
    console.log('\n5. Testing search index...');
    const searchIndex = await axiosInstance.get('/api/search-index.json');
    console.log(`   ✅ Search index: ${searchIndex.data.totalDocuments} documents`);
    
    // Test 6: Daily wisdom
    console.log('\n6. Testing daily wisdom...');
    const dailyWisdom = await axiosInstance.get('/api/daily-wisdom.json');
    console.log(`   ✅ Daily wisdom: ${dailyWisdom.data.teaching.source}`);
    
    // Summary
    console.log('\n🎉 API Connection Test Complete!');
    console.log('\n📊 Summary:');
    console.log(`   Health: ✅ ${health.data.status}`);
    console.log(`   Books: ✅ ${books.data.length} books`);
    console.log(`   Search: ✅ ${searchIndex.data.totalDocuments} documents`);
    console.log(`   Daily Wisdom: ✅ Available`);
    
    console.log('\n📱 Mobile App Configuration:');
    console.log(`   Update AjewAPI.js with:`);
    console.log(`   const API_BASE_URL = '${API_BASE_URL}';`);
    console.log(`   Set useMockData = false;`);
    
    console.log('\n🚀 Ready for mobile app testing!');
    
  } catch (error) {
    console.error('\n❌ API Connection Test Failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   URL: ${error.response.config.url}`);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Is the test server running? (node local-test-server.js)');
    console.log('   2. Check if API files exist in ajew-org/public/api-v2/');
    console.log('   3. Try using API v1 instead (rename api-v2 to api)');
    
    process.exit(1);
  }
}

// Run test
testConnection();