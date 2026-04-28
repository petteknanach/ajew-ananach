// Mock API Server for Ajew Ananach Development
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Mock data matching the API structure
const MOCK_BOOKS = [
  { id: 'likutey-moharan', title: 'Likutey Moharan', hebrewTitle: 'לקוטי מוהר"ן', author: 'Rabbi Nachman of Breslov', chapters: 282, color: '#3498db', category: 'torah', description: 'Primary collection of Rebbe Nachman\'s Torah teachings...', availableLanguages: ['he', 'en'], lastUpdated: '2026-03-12' },
  { id: 'likutey-halachos', title: 'Likutey Halachos', hebrewTitle: 'לקוטי הלכות', author: 'Rabbi Natan of Breslov', chapters: 600, color: '#2ecc71', category: 'halacha', description: 'Rabbi Natan\'s halachic insights based on Rebbe Nachman\'s teachings...', availableLanguages: ['he', 'en'], lastUpdated: '2026-03-12' },
  { id: 'likutey-tefilos', title: 'Likutey Tefilos', hebrewTitle: 'לקוטי תפילות', author: 'Rabbi Natan of Breslov', chapters: 32, color: '#e74c3c', category: 'prayer', description: 'Prayers composed by Rabbi Natan based on Rebbe Nachman\'s teachings...', availableLanguages: ['he', 'en'], lastUpdated: '2026-03-12' },
  { id: 'sichos-haran', title: 'Sichos HaRan', hebrewTitle: 'שיחות הר"ן', author: 'Rabbi Nachman of Breslov', chapters: 229, color: '#f39c12', category: 'conversations', description: 'Recorded conversations of Rebbe Nachman with his disciples...', availableLanguages: ['he', 'en'], lastUpdated: '2026-03-12' },
  { id: 'chayey-moharan', title: 'Chayey Moharan', hebrewTitle: 'חיי מוהר"ן', author: 'Rabbi Natan of Breslov', chapters: 150, color: '#9b59b6', category: 'biography', description: 'Biographical accounts of Rebbe Nachman\'s life and teachings...', availableLanguages: ['he', 'en'], lastUpdated: '2026-03-12' },
  { id: 'sefer-hamidos', title: 'Sefer Hamidos', hebrewTitle: 'ספר המידות', author: 'Rabbi Nachman of Breslov', chapters: 413, color: '#1abc9c', category: 'ethics', description: 'Ethical teachings arranged alphabetically by topic...', availableLanguages: ['he', 'en'], lastUpdated: '2026-03-12' },
];

const MOCK_CHAPTERS = {
  'likutey-moharan': [
    { id: 'likutey-moharan-1', bookId: 'likutey-moharan', number: 1, title: 'The Importance of Joy', hebrewTitle: 'חשיבות השמחה', content: { he: 'טקסט בעברית של הפרק הראשון...', en: 'English text of the first chapter...' }, metadata: { length: 1500, readingTime: 5, topics: ['joy', 'faith', 'prayer'], relatedChapters: [2, 3, 15] } },
    { id: 'likutey-moharan-2', bookId: 'likutey-moharan', number: 2, title: 'The Power of Prayer', hebrewTitle: 'כוח התפילה', content: { he: 'טקסט בעברית של הפרק השני...', en: 'English text of the second chapter...' }, metadata: { length: 1800, readingTime: 6, topics: ['prayer', 'concentration', 'devotion'], relatedChapters: [1, 3, 4] } },
    { id: 'likutey-moharan-3', bookId: 'likutey-moharan', number: 3, title: 'Overcoming Sadness', hebrewTitle: 'התגברות על עצבות', content: { he: 'טקסט בעברית של הפרק השלישי...', en: 'English text of the third chapter...' }, metadata: { length: 2000, readingTime: 7, topics: ['sadness', 'joy', 'faith'], relatedChapters: [1, 2, 4] } },
  ]
};

// API Endpoints
app.get('/api/books.json', (req, res) => {
  console.log('GET /api/books.json');
  res.json(MOCK_BOOKS);
});

app.get('/api/:bookId/index.json', (req, res) => {
  const { bookId } = req.params;
  console.log(`GET /api/${bookId}/index.json`);
  
  const book = MOCK_BOOKS.find(b => b.id === bookId);
  if (book) {
    res.json(book);
  } else {
    res.status(404).json({ error: 'Book not found' });
  }
});

app.get('/api/:bookId/chapters.json', (req, res) => {
  const { bookId } = req.params;
  console.log(`GET /api/${bookId}/chapters.json`);
  
  const chapters = MOCK_CHAPTERS[bookId] || [];
  res.json(chapters);
});

app.get('/api/:bookId/:chapterNumber.json', (req, res) => {
  const { bookId, chapterNumber } = req.params;
  console.log(`GET /api/${bookId}/${chapterNumber}.json`);
  
  const chapterNum = parseInt(chapterNumber);
  const chapters = MOCK_CHAPTERS[bookId] || [];
  const chapter = chapters.find(c => c.number === chapterNum);
  
  if (chapter) {
    res.json(chapter);
  } else {
    res.status(404).json({ error: 'Chapter not found' });
  }
});

app.get('/api/search-index.json', (req, res) => {
  console.log('GET /api/search-index.json');
  
  // Build search index from mock data
  const documents = [];
  
  MOCK_BOOKS.forEach(book => {
    documents.push({
      id: `book_${book.id}`,
      type: 'book',
      title: book.title,
      hebrewTitle: book.hebrewTitle,
      author: book.author,
      description: book.description,
      content: `${book.title} ${book.hebrewTitle} ${book.author} ${book.description}`,
      bookId: book.id,
    });
  });
  
  Object.keys(MOCK_CHAPTERS).forEach(bookId => {
    MOCK_CHAPTERS[bookId].forEach(chapter => {
      documents.push({
        id: chapter.id,
        type: 'chapter',
        title: chapter.title,
        hebrewTitle: chapter.hebrewTitle,
        content: `${chapter.title} ${chapter.hebrewTitle}`,
        bookId: chapter.bookId,
        chapterNumber: chapter.number,
      });
    });
  });
  
  res.json({
    version: '1.0',
    lastBuilt: new Date().toISOString(),
    documents,
    source: 'mock-server',
  });
});

app.get('/api/daily-wisdom.json', (req, res) => {
  console.log('GET /api/daily-wisdom.json');
  
  const today = new Date().toISOString().split('T')[0];
  const wisdom = {
    date: today,
    title: 'The Power of Joy',
    hebrewTitle: 'כוח השמחה',
    content: 'Rebbe Nachman taught that it is a great mitzvah to always be happy. He emphasized that joy can break through all barriers and bring a person closer to God.',
    hebrewContent: 'רבי נחמן לימד שזה מצווה גדולה להיות תמיד בשמחה. הוא הדגיש שהשמחה יכולה לפרוץ כל מחסום ולהביא אדם קרוב יותר לאלוהים.',
    source: 'Likutey Moharan 2:24',
    bookId: 'likutey-moharan',
    chapterNumber: 24,
  };
  
  res.json(wisdom);
});

// Search endpoint
app.get('/api/search.json', (req, res) => {
  const { q: query, limit = 20, offset = 0 } = req.query;
  console.log(`GET /api/search.json?q=${query}`);
  
  if (!query) {
    return res.json({ results: [], total: 0, query: '' });
  }
  
  // Simple search across all data
  const allResults = [];
  
  // Search in books
  MOCK_BOOKS.forEach(book => {
    if (book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.hebrewTitle.includes(query) ||
        book.author.toLowerCase().includes(query.toLowerCase()) ||
        book.description.toLowerCase().includes(query.toLowerCase())) {
      allResults.push({
        type: 'book',
        id: book.id,
        title: book.title,
        hebrewTitle: book.hebrewTitle,
        author: book.author,
        relevance: 1.0,
      });
    }
  });
  
  // Search in chapters
  Object.keys(MOCK_CHAPTERS).forEach(bookId => {
    MOCK_CHAPTERS[bookId].forEach(chapter => {
      if (chapter.title.toLowerCase().includes(query.toLowerCase()) ||
          chapter.hebrewTitle.includes(query)) {
        allResults.push({
          type: 'chapter',
          id: chapter.id,
          bookId: chapter.bookId,
          title: chapter.title,
          hebrewTitle: chapter.hebrewTitle,
          number: chapter.number,
          relevance: 0.8,
        });
      }
    });
  });
  
  // Sort by relevance and paginate
  allResults.sort((a, b) => b.relevance - a.relevance);
  const results = allResults.slice(offset, offset + parseInt(limit));
  
  res.json({
    query,
    results,
    total: allResults.length,
    limit: parseInt(limit),
    offset: parseInt(offset),
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock API server running at http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log(`  GET http://localhost:${PORT}/api/books.json`);
  console.log(`  GET http://localhost:${PORT}/api/{bookId}/index.json`);
  console.log(`  GET http://localhost:${PORT}/api/{bookId}/chapters.json`);
  console.log(`  GET http://localhost:${PORT}/api/{bookId}/{chapterNumber}.json`);
  console.log(`  GET http://localhost:${PORT}/api/search-index.json`);
  console.log(`  GET http://localhost:${PORT}/api/daily-wisdom.json`);
  console.log(`  GET http://localhost:${PORT}/api/search.json?q={query}`);
  console.log(`  GET http://localhost:${PORT}/api/health`);
});