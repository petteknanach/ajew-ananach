# Ajew Ananach API Strategy

## 📊 Current Analysis

### ajew.org Structure:
- **Static site** built with Astro
- **1,000+ HTML pages** already deployed
- **No existing API** - all content is static HTML
- **Search functionality** likely client-side (Lunr.js mentioned in memory)

### Mobile App Requirements:
1. **Book catalog** - List of Breslov works
2. **Chapter listing** - Per book
3. **Chapter content** - Hebrew/English text
4. **Search** - Across all content
5. **User data** - Bookmarks, preferences

## 🎯 SMART APPROACH: Phased Implementation

### Phase 1: Static JSON API (Week 1)
**Goal:** Get app working with real data quickly
**Approach:** Generate JSON files from existing HTML

```
/public/api/
  ├── books.json          # List of all books
  ├── likutey-moharan/
  │   ├── index.json      # Chapter list
  │   ├── 1.json          # Chapter 1 content
  │   └── 2.json          # Chapter 2 content
  ├── search-index.json   # Pre-built search index
  └── daily-wisdom.json   # Daily teachings
```

**Advantages:**
- No server required
- Can deploy to ajew.org immediately
- Fast to implement
- Scales with CDN

### Phase 2: Dynamic API (Month 1-2)
**Goal:** Add user features and real-time updates
**Approach:** Serverless functions (Vercel/Netlify)

```
/api/
  ├── auth/              # Authentication
  ├── users/             # User profiles
  ├── bookmarks/         # User bookmarks
  ├── search/            # Server-side search
  └── analytics/         # Usage tracking
```

### Phase 3: Full Backend (Month 3+)
**Goal:** Advanced features and scaling
**Approach:** Dedicated backend (Node.js + PostgreSQL)

## 🔧 Phase 1 Implementation Plan

### Step 1: Analyze Existing Content
1. Map all HTML files on ajew.org
2. Extract book/chapter structure
3. Identify content patterns

### Step 2: Create JSON Generator
1. Write script to convert HTML → JSON
2. Extract Hebrew/English content
3. Generate search index

### Step 3: Deploy JSON API
1. Add `/public/api/` to ajew.org
2. Update app to use real endpoints
3. Test with mobile app

### Step 4: Update Mobile App
1. Replace sample data with real API calls
2. Add loading states
3. Implement caching

## 📁 JSON Structure Design

### books.json
```json
[
  {
    "id": "likutey-moharan",
    "title": "Likutey Moharan",
    "hebrewTitle": "לקוטי מוהר\"ן",
    "author": "Rabbi Nachman of Breslov",
    "chapters": 282,
    "description": "Primary collection of Rebbe Nachman's Torah teachings...",
    "color": "#3498db",
    "category": "torah",
    "availableLanguages": ["he", "en"],
    "lastUpdated": "2026-03-12"
  }
]
```

### chapter.json
```json
{
  "id": "likutey-moharan-1",
  "bookId": "likutey-moharan",
  "number": 1,
  "title": "The Importance of Joy",
  "hebrewTitle": "חשיבות השמחה",
  "content": {
    "he": "טקסט בעברית של הפרק...",
    "en": "English translation of the chapter..."
  },
  "metadata": {
    "length": 1500,
    "readingTime": 5,
    "topics": ["joy", "faith", "prayer"],
    "relatedChapters": [2, 3, 15]
  }
}
```

### search-index.json
```json
{
  "version": "1.0",
  "lastBuilt": "2026-03-12T10:00:00Z",
  "documents": [
    {
      "id": "likutey-moharan-1",
      "title": "The Importance of Joy",
      "hebrewTitle": "חשיבות השמחה",
      "content": "English text for search...",
      "hebrewContent": "Hebrew text for search...",
      "book": "Likutey Moharan",
      "chapter": 1,
      "topics": ["joy", "faith"]
    }
  ]
}
```

## 🛠️ Technical Implementation

### Tools Needed:
1. **Node.js scripts** for HTML parsing
2. **Cheerio** for DOM manipulation
3. **Lunr.js** for search index generation
4. **GitHub Actions** for automated builds

### Automation Strategy:
```yaml
# GitHub Actions workflow
on:
  push:
    paths:
      - 'teachings/**'
      - 'scripts/generate-api.js'

jobs:
  generate-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: node scripts/generate-api.js
      - run: git add public/api/
      - run: git commit -m "Update API data"
      - run: git push
```

### Script Structure:
```javascript
// scripts/generate-api.js
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

async function generateAPI() {
  // 1. Scan teachings directory
  const books = scanBooks();
  
  // 2. Generate books.json
  fs.writeFileSync('public/api/books.json', JSON.stringify(books, null, 2));
  
  // 3. Generate book-specific JSON
  for (const book of books) {
    await generateBookJSON(book);
  }
  
  // 4. Generate search index
  generateSearchIndex(books);
  
  // 5. Generate daily wisdom
  generateDailyWisdom();
}
```

## 🔄 Mobile App Integration

### Current App Structure:
```javascript
// Current: Sample data
const SAMPLE_BOOKS = [...];
const SAMPLE_CHAPTERS = [...];
```

### New Structure with API:
```javascript
// API Service
class AjewAPI {
  static BASE_URL = 'https://ajew.org/api';
  
  static async getBooks() {
    const response = await fetch(`${this.BASE_URL}/books.json`);
    return response.json();
  }
  
  static async getBook(bookId) {
    const response = await fetch(`${this.BASE_URL}/${bookId}/index.json`);
    return response.json();
  }
  
  static async getChapter(bookId, chapterNumber) {
    const response = await fetch(`${this.BASE_URL}/${bookId}/${chapterNumber}.json`);
    return response.json();
  }
  
  static async search(query) {
    // Client-side search with pre-built index
    const response = await fetch(`${this.BASE_URL}/search-index.json`);
    const index = await response.json();
    return performSearch(index, query);
  }
}
```

### Caching Strategy:
1. **Service Worker** for offline access
2. **AsyncStorage** for user data
3. **React Query** for API state management
4. **Incremental loading** for large books

## 📈 Progressive Enhancement

### Level 1: Static JSON (Launch)
- All content available offline after first load
- Fast, no server costs
- Limited to pre-built data

### Level 2: Serverless Functions (Post-launch)
- User authentication
- Bookmark syncing
- Usage analytics
- Dynamic content updates

### Level 3: Full Backend (Scale)
- Real-time features
- Community interactions
- Advanced search
- Content management system

## 🚀 Implementation Timeline

### Week 1: Foundation
- Day 1-2: Analyze HTML structure
- Day 3-4: Build JSON generator
- Day 5: Generate initial API data
- Day 6-7: Update mobile app

### Week 2: Polish & Test
- Day 8-9: Implement caching
- Day 10-11: Add error handling
- Day 12-13: Performance optimization
- Day 14: Final testing

### Week 3: Launch
- Day 15: Deploy API to ajew.org
- Day 16: Submit app to stores
- Day 17-21: Monitor & fix issues

## 🔍 Risk Assessment

### Low Risk:
- Static JSON generation (proven technique)
- Client-side search (scales well)
- CDN hosting (reliable)

### Medium Risk:
- HTML parsing accuracy
- Content structure changes
- Mobile app compatibility

### Mitigation Strategies:
1. **Validation scripts** to check JSON quality
2. **Versioned API** to handle changes
3. **Feature flags** to roll back if needed
4. **Comprehensive testing** before launch

## 💰 Cost Analysis

### Phase 1 (Static JSON):
- **Hosting**: $0 (uses existing ajew.org hosting)
- **Development**: 2 weeks of work
- **Maintenance**: Minimal (regenerate on content updates)

### Phase 2 (Serverless):
- **Hosting**: ~$10-20/month (Vercel/Netlify)
- **Development**: 2-4 weeks
- **Maintenance**: Low

### Phase 3 (Full Backend):
- **Hosting**: ~$50-100/month (VPS + database)
- **Development**: 1-2 months
- **Maintenance**: Medium

## 🎯 Success Metrics

### Technical:
- ✅ API response time < 200ms
- ✅ App loads in < 3 seconds
- ✅ Offline functionality works
- ✅ Search returns results in < 100ms

### User:
- 📈 Daily active users
- 📈 Session duration
- 📈 Chapter completion rate
- 📈 Search usage

### Business:
- 📈 App store ratings
- 📈 User retention
- 📈 Feature adoption
- 📈 Community growth

## 🤝 Team Coordination

### Subagents Strategy:
1. **API Generator Agent**: Builds JSON from HTML
2. **Mobile Integration Agent**: Updates app code
3. **Testing Agent**: Validates everything works
4. **Deployment Agent**: Handles releases

### Communication:
- Daily progress updates
- Weekly milestone reviews
- Immediate issue reporting
- Collaborative decision making

## 📝 Next Immediate Steps

### Today:
1. [ ] Create HTML analysis script
2. [ ] Map existing content structure
3. [ ] Design exact JSON schemas
4. [ ] Update API_STRATEGY with findings

### Tomorrow:
1. [ ] Build JSON generator prototype
2. [ ] Generate sample API data
3. [ ] Test with mobile app
4. [ ] Refine based on results

### This Week:
1. [ ] Complete API generation
2. [ ] Update mobile app
3. [ ] Deploy to ajew.org
4. [ ] Begin app store submission

## 🏁 Conclusion

**Smart Approach:** Start with static JSON API because:
1. **Fastest path** to real data
2. **Zero server costs**
3. **Proven scalability**
4. **Easy to enhance later**

**Key Insight:** We already have 1,000+ HTML files. Converting them to JSON is straightforward and immediately enables the mobile app to access real Breslov content.

**Next Action:** Begin Phase 1 implementation with subagent coordination.