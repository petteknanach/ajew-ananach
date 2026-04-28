// Test script for AjewAPI integration
const AjewAPI = require('./AjewAPI.js').default || require('./AjewAPI.js');

async function testAPI() {
  console.log('=== Testing Ajew Ananach API Integration ===\n');
  
  // Note: This is a Node.js test script
  // For React Native, the API would be tested in the app
  
  console.log('1. Testing getBooks()...');
  try {
    const booksResult = await AjewAPI.getBooks();
    console.log('   Success:', booksResult.success);
    console.log('   Source:', booksResult.source);
    console.log('   Number of books:', booksResult.data?.length || 0);
    if (booksResult.data && booksResult.data.length > 0) {
      console.log('   First book:', booksResult.data[0].title);
    }
  } catch (error) {
    console.log('   Error:', error.message);
  }
  
  console.log('\n2. Testing search()...');
  try {
    const searchResult = await AjewAPI.search('joy');
    console.log('   Success:', searchResult.success);
    console.log('   Query:', searchResult.data?.query);
    console.log('   Results:', searchResult.data?.results?.length || 0);
    if (searchResult.data?.results && searchResult.data.results.length > 0) {
      console.log('   First result:', searchResult.data.results[0].title);
    }
  } catch (error) {
    console.log('   Error:', error.message);
  }
  
  console.log('\n3. Testing getDailyWisdom()...');
  try {
    const wisdomResult = await AjewAPI.getDailyWisdom();
    console.log('   Success:', wisdomResult.success);
    console.log('   Source:', wisdomResult.source);
    console.log('   Title:', wisdomResult.data?.title);
    console.log('   Date:', wisdomResult.data?.date);
  } catch (error) {
    console.log('   Error:', error.message);
  }
  
  console.log('\n4. Testing cache operations...');
  try {
    const clearResult = await AjewAPI.clearCache();
    console.log('   Cache cleared:', clearResult);
    
    // Test with force refresh
    const freshBooks = await AjewAPI.getBooks(true);
    console.log('   Force refresh success:', freshBooks.success);
    console.log('   Force refresh source:', freshBooks.source);
  } catch (error) {
    console.log('   Error:', error.message);
  }
  
  console.log('\n=== Test Complete ===');
  console.log('\nNext steps:');
  console.log('1. Run the mock server: node mock-server.js');
  console.log('2. Update AjewAPI.js to use mock server URL');
  console.log('3. Test the mobile app with the API integration');
  console.log('4. Deploy JSON files to ajew.org/api/');
  console.log('5. Switch to real API in production');
}

// Run tests
testAPI().catch(console.error);