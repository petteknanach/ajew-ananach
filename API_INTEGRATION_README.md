# Ajew Ananach API Integration

## Overview

This document describes the API integration implemented for the Ajew Ananach mobile app. The integration replaces hardcoded sample data with a robust API service layer that supports real API calls, mock data for development, caching, and client-side search.

## Architecture

### 1. API Service Layer (`AjewAPI.js`)

The main API service provides:
- **Unified interface** for all API calls
- **Automatic caching** with AsyncStorage (24-hour TTL)
- **Mock data fallback** for development
- **Error handling** and retry logic
- **Client-side search** with Lunr.js

### 2. Data Flow

```
Mobile App → AjewAPI.js → [Cache Check] → [API Call / Mock Data] → Response
```

### 3. Key Features

- **Progressive enhancement**: Starts with mock data, switches to real API when available
- **Offline support**: Cached data works without network connection
- **Search**: Client-side search using Lunr.js with pre-built indexes
- **Error recovery**: Graceful fallbacks and user-friendly error messages

## Implementation Details

### API Endpoints

The app expects the following JSON endpoints at `https://ajew.org/api/`:

1. **`/books.json`** - List of all books
2. **`/{bookId}/index.json`** - Specific book details
3. **`/{bookId}/chapters.json`** - Chapters for a book
4. **`/{bookId}/{chapterNumber}.json`** - Specific chapter content
5. **`/search-index.json`** - Pre-built search index for Lunr.js
6. **`/daily-wisdom.json`** - Daily teaching

### Mock API Server

For development, a mock server is provided (`mock-server.js`):

```bash
node mock-server.js
```

Server runs on `http://localhost:3001` and provides all expected endpoints with realistic mock data.

### Caching Strategy

- **Cache prefix**: `@AjewAnanach_`
- **TTL**: 24 hours
- **Storage**: AsyncStorage (persistent across app restarts)
- **Cache keys**: 
  - `books` - All books
  - `book_{id}` - Specific book
  - `chapters_{bookId}` - Book chapters
  - `chapter_{bookId}_{number}` - Specific chapter
  - `search_index` - Search index
  - `daily_wisdom` - Daily wisdom (invalidates daily)

### Search Implementation

1. **Client-side search** using Lunr.js
2. **Pre-built index** loaded from `/search-index.json`
3. **Fallback** to simple string search if Lunr fails
4. **Multi-language** support (English and Hebrew)
5. **Relevance scoring** and ranking

## Usage

### 1. Basic API Calls

```javascript
import ajewAPI from './AjewAPI';

// Get all books
const result = await ajewAPI.getBooks();
if (result.success) {
  console.log('Books:', result.data);
  console.log('Source:', result.source); // 'cache', 'mock', 'api', or 'mock_fallback'
}

// Search
const searchResult = await ajewAPI.search('joy');
```

### 2. Toggle Between Mock and Real API

```javascript
// Use mock data for development
ajewAPI.setUseMockData(true);

// Switch to real API for production
ajewAPI.setUseMockData(false);
```

### 3. Cache Management

```javascript
// Clear all cache
await ajewAPI.clearCache();

// Force refresh (bypass cache)
const books = await ajewAPI.getBooks(true);
```

### 4. Error Handling

```javascript
try {
  const result = await ajewAPI.getBooks();
  if (!result.success) {
    // Handle API error
    console.error('API Error:', result.error);
  }
} catch (error) {
  // Handle network error
  console.error('Network Error:', error);
}
```

## App Integration

### Updated Screens

1. **HomeScreen** (`App.js`)
   - Fetches featured books from API
   - Shows loading states
   - Handles errors with retry buttons
   - Pull-to-refresh support

2. **BrowseScreen** (`App.js`)
   - Loads full book list from API
   - Category filtering (client-side)
   - Error handling and retry

3. **SearchScreen** (Planned)
   - Integrated Lunr.js search
   - Recent searches history
   - Search tips and suggestions

### New Components

1. **Error Display**: Shows error messages with retry buttons
2. **Loading States**: Consistent loading indicators
3. **Cache Status**: Shows data source (mock/API/cache)

## Development Workflow

### 1. Local Development with Mock Data

```bash
# Start mock server
node mock-server.js

# Update App.js to use local server
# Change API_BASE_URL in AjewAPI.js to 'http://localhost:3001/api'
```

### 2. Testing with Real API

```bash
# Deploy JSON files to ajew.org/api/
# Set useMockData to false
ajewAPI.setUseMockData(false);
```

### 3. Building for Production

1. Ensure `useMockData` is `false`
2. Verify all API endpoints are available
3. Test offline functionality
4. Validate cache behavior

## Configuration

### Environment Variables (Planned)

```javascript
// Future enhancement
const API_BASE_URL = process.env.API_URL || 'https://ajew.org/api';
const USE_MOCK_DATA = process.env.NODE_ENV === 'development';
```

### Current Configuration in `AjewAPI.js`

```javascript
const API_BASE_URL = 'https://ajew.org/api';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_PREFIX = '@AjewAnanach_';
```

## Testing

### Manual Tests

1. **Network online**: Verify API calls work
2. **Network offline**: Verify cache works
3. **API failure**: Verify mock fallback works
4. **Search**: Test English and Hebrew queries
5. **Cache**: Verify cache expiration (24 hours)

### Automated Tests (Planned)

```javascript
// Unit tests for AjewAPI.js
// Integration tests for API calls
// Cache tests for AsyncStorage
// Search tests for Lunr.js
```

## Performance Considerations

1. **Cache size**: Monitor AsyncStorage usage
2. **Search performance**: Lunr.js indexes in memory
3. **Network requests**: Minimize with caching
4. **Bundle size**: Lunr.js adds ~30KB minified

## Future Enhancements

1. **React Query**: For advanced cache management
2. **Service Worker**: For offline PWA support
3. **Incremental loading**: For large books/chapters
4. **Background sync**: For bookmarks/user data
5. **Analytics**: Track API usage and errors
6. **A/B testing**: Feature flags for API versions

## Troubleshooting

### Common Issues

1. **"Network error"**: Check internet connection
2. **"API failed"**: Verify API endpoints are accessible
3. **Search not working**: Check Lunr.js initialization
4. **Cache not clearing**: Verify AsyncStorage permissions

### Debugging

```javascript
// Enable debug logging
console.log('API Result:', result);

// Check cache status
const stats = await ajewAPI.getCacheStats();
console.log('Cache Stats:', stats);
```

## Deployment Checklist

- [ ] API endpoints deployed to ajew.org/api/
- [ ] `useMockData` set to `false`
- [ ] Cache TTL appropriate for content update frequency
- [ ] Search index generated and deployed
- [ ] Error handling tested
- [ ] Offline functionality verified
- [ ] Performance tested on target devices

## Conclusion

The API integration provides a solid foundation for the Ajew Ananach mobile app with:

1. **Real data access** from ajew.org
2. **Robust development experience** with mock data
3. **Offline capability** through caching
4. **Fast search** with Lunr.js
5. **Graceful degradation** when API is unavailable

The architecture supports easy migration from mock data to real API and provides a path for future enhancements like user accounts, bookmarks, and advanced search features.