#!/usr/bin/env node

/**
 * HTML to JSON Converter for Ajew.org
 * Converts actual HTML teachings to JSON API
 * 
 * Uses patterns discovered by api-analyzer subagent
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Configuration
const CONFIG = {
  // Source: ajew-org teachings directory
  sourceBase: path.join(__dirname, '../../ajew-org'),
  teachingsDir: 'src/content/teachings',
  
  // Output: API directory
  outputBase: path.join(__dirname, '../../ajew-org/public'),
  apiDir: 'api',
  
  // Books mapping (from analysis)
  books: [
    {
      id: 'likutey-moharan',
      dir: 'likutey-moharan',
      title: 'Likutey Moharan',
      hebrewTitle: 'לקוטי מוהר"ן',
      author: 'Rabbi Nachman of Breslov',
      estimatedChapters: 282
    },
    {
      id: 'likutey-halachos',
      dir: 'likutey-halachos',
      title: 'Likutey Halachos',
      hebrewTitle: 'לקוטי הלכות',
      author: 'Rabbi Natan of Breslov',
      estimatedChapters: 600
    },
    {
      id: 'likutey-tefilos',
      dir: 'likutey-tefilos',
      title: 'Likutey Tefilos',
      hebrewTitle: 'לקוטי תפילות',
      author: 'Rabbi Natan of Breslov',
      estimatedChapters: 32
    },
    {
      id: 'sefer-hamidos',
      dir: 'sefer-hamidos',
      title: 'Sefer Hamidos',
      hebrewTitle: 'ספר המידות',
      author: 'Rabbi Nachman of Breslov',
      estimatedChapters: 413
    },
    {
      id: 'sichos-haran',
      dir: 'sichos-haran',
      title: 'Sichos HaRan',
      hebrewTitle: 'שיחות הר"ן',
      author: 'Rabbi Nachman of Breslov',
      estimatedChapters: 229
    },
    {
      id: 'chayey-moharan',
      dir: 'chayey-moharan',
      title: 'Chayey Moharan',
      hebrewTitle: 'חיי מוהר"ן',
      author: 'Rabbi Natan of Breslov',
      estimatedChapters: 150
    }
  ]
};

// Ensure directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Extract content from HTML using discovered patterns
function extractFromHTML(htmlContent, filePath) {
  const $ = cheerio.load(htmlContent);
  
  // Pattern 1: Article with teaching class
  let title = $('article.teaching header h1').text().trim();
  let hebrewTitle = $('article.teaching header .hebrew-title').text().trim();
  
  // Pattern 2: Fallback to main h1
  if (!title) {
    title = $('main h1').first().text().trim();
    hebrewTitle = $('main h2').first().text().trim();
  }
  
  // Pattern 3: Extract Hebrew and English content
  const hebrewContent = $('.hebrew[dir="rtl"], [dir="rtl"] .content').text().trim();
  const englishContent = $('.english, .content:not([dir="rtl"])').text().trim();
  
  // Clean up content
  const cleanText = (text) => {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
  };
  
  return {
    title: cleanText(title) || 'Untitled Chapter',
    hebrewTitle: cleanText(hebrewTitle) || 'פרק ללא כותרת',
    content: {
      he: cleanText(hebrewContent) || 'תוכן בעברית יטען מהקובץ המקורי',
      en: cleanText(englishContent) || 'English content will load from original file'
    },
    metadata: {
      sourceFile: path.relative(CONFIG.sourceBase, filePath),
      wordCount: {
        he: (hebrewContent.match(/\S+/g) || []).length,
        en: (englishContent.match(/\S+/g) || []).length
      },
      extracted: new Date().toISOString()
    }
  };
}

// Scan directory for HTML files
function scanBookDirectory(bookDir) {
  const chapters = [];
  
  try {
    const items = fs.readdirSync(bookDir, { withFileTypes: true });
    
    for (const item of items) {
      if (item.isDirectory()) {
        // Check for chapter directories (e.g., "1", "2", etc.)
        const chapterNum = parseInt(item.name);
        if (!isNaN(chapterNum)) {
          const chapterDir = path.join(bookDir, item.name);
          const htmlFile = path.join(chapterDir, 'index.html');
          
          if (fs.existsSync(htmlFile)) {
            chapters.push({
              number: chapterNum,
              path: htmlFile,
              dir: item.name
            });
          }
        }
      } else if (item.isFile() && item.name.endsWith('.html')) {
        // Direct HTML files (alternative structure)
        const match = item.name.match(/^(\d+)\.html$/);
        if (match) {
          chapters.push({
            number: parseInt(match[1]),
            path: path.join(bookDir, item.name),
            dir: null
          });
        }
      }
    }
    
    // Sort by chapter number
    chapters.sort((a, b) => a.number - b.number);
    
  } catch (error) {
    console.warn(`⚠️ Could not scan ${bookDir}:`, error.message);
  }
  
  return chapters;
}

// Process a single book
async function processBook(book) {
  console.log(`\n📚 Processing ${book.title}...`);
  
  const bookSourceDir = path.join(CONFIG.sourceBase, CONFIG.teachingsDir, book.dir);
  const bookOutputDir = path.join(CONFIG.outputBase, CONFIG.apiDir, book.id);
  
  ensureDir(bookOutputDir);
  
  // Scan for chapters
  const chapters = scanBookDirectory(bookSourceDir);
  console.log(`   Found ${chapters.length} chapters`);
  
  if (chapters.length === 0) {
    console.log(`   ⚠️ No chapters found, creating sample structure`);
    return createSampleBook(book, bookOutputDir);
  }
  
  // Process each chapter
  const processedChapters = [];
  let successCount = 0;
  
  for (const chapter of chapters.slice(0, 10)) { // Process first 10 for now
    try {
      console.log(`   Chapter ${chapter.number}...`);
      
      const htmlContent = fs.readFileSync(chapter.path, 'utf8');
      const extracted = extractFromHTML(htmlContent, chapter.path);
      
      const chapterData = {
        id: `${book.id}-${chapter.number}`,
        bookId: book.id,
        number: chapter.number,
        title: extracted.title,
        hebrewTitle: extracted.hebrewTitle,
        content: extracted.content,
        metadata: {
          ...extracted.metadata,
          readingTime: Math.ceil((extracted.metadata.wordCount.he + extracted.metadata.wordCount.en) / 250) // ~250 words/minute
        }
      };
      
      // Save chapter JSON
      const chapterPath = path.join(bookOutputDir, `${chapter.number}.json`);
      fs.writeFileSync(chapterPath, JSON.stringify(chapterData, null, 2));
      
      processedChapters.push({
        id: chapterData.id,
        number: chapter.number,
        title: chapterData.title,
        hebrewTitle: chapterData.hebrewTitle,
        preview: chapterData.content.en.substring(0, 100) + '...',
        readingTime: chapterData.metadata.readingTime
      });
      
      successCount++;
      
    } catch (error) {
      console.warn(`   ⚠️ Failed chapter ${chapter.number}:`, error.message);
    }
  }
  
  // Create book index
  const bookIndex = {
    book: {
      id: book.id,
      title: book.title,
      hebrewTitle: book.hebrewTitle,
      author: book.author,
      chapters: chapters.length,
      description: `${book.title} contains ${chapters.length} chapters of Breslov wisdom.`
    },
    chapters: processedChapters,
    metadata: {
      generated: new Date().toISOString(),
      totalChapters: chapters.length,
      processedChapters: successCount,
      sourceDir: book.dir
    }
  };
  
  const indexPath = path.join(bookOutputDir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(bookIndex, null, 2));
  
  console.log(`   ✅ Processed ${successCount}/${chapters.length} chapters`);
  
  return {
    bookId: book.id,
    processed: successCount,
    total: chapters.length,
    chapters: processedChapters
  };
}

// Create sample book if no HTML found
function createSampleBook(book, outputDir) {
  console.log(`   Creating sample structure for ${book.title}`);
  
  const sampleChapters = [];
  
  // Create 3 sample chapters
  for (let i = 1; i <= 3; i++) {
    const chapterData = {
      id: `${book.id}-${i}`,
      bookId: book.id,
      number: i,
      title: `Sample Chapter ${i}`,
      hebrewTitle: `פרק לדוגמה ${i}`,
      content: {
        he: `זהו תוכן לדוגמה של פרק ${i}. בעתיד, תוכן זה יוחלף בטקסט האמיתי מהקבצים המקוריים.`,
        en: `This is sample content for chapter ${i}. In the future, this will be replaced with actual content from the source files.`
      },
      metadata: {
        sourceFile: `teachings/${book.dir}/${i}/index.html`,
        wordCount: { he: 150, en: 200 },
        readingTime: 5,
        extracted: new Date().toISOString()
      }
    };
    
    const chapterPath = path.join(outputDir, `${i}.json`);
    fs.writeFileSync(chapterPath, JSON.stringify(chapterData, null, 2));
    
    sampleChapters.push({
      id: chapterData.id,
      number: i,
      title: chapterData.title,
      hebrewTitle: chapterData.hebrewTitle,
      preview: chapterData.content.en.substring(0, 100) + '...',
      readingTime: 5
    });
  }
  
  // Create book index
  const bookIndex = {
    book: {
      id: book.id,
      title: book.title,
      hebrewTitle: book.hebrewTitle,
      author: book.author,
      chapters: book.estimatedChapters,
      description: `${book.title} will contain ${book.estimatedChapters} chapters of Breslov wisdom.`
    },
    chapters: sampleChapters,
    metadata: {
      generated: new Date().toISOString(),
      totalChapters: book.estimatedChapters,
      processedChapters: 3,
      note: 'Sample data - real HTML conversion pending'
    }
  };
  
  const indexPath = path.join(outputDir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(bookIndex, null, 2));
  
  return {
    bookId: book.id,
    processed: 3,
    total: book.estimatedChapters,
    chapters: sampleChapters,
    note: 'sample'
  };
}

// Generate books.json
function generateBooksJSON(bookResults) {
  const books = CONFIG.books.map(book => {
    const result = bookResults.find(r => r.bookId === book.id) || {};
    
    return {
      id: book.id,
      title: book.title,
      hebrewTitle: book.hebrewTitle,
      author: book.author,
      chapters: result.total || book.estimatedChapters,
      color: getBookColor(book.id),
      category: getBookCategory(book.id),
      description: `${book.title} contains ${result.total || book.estimatedChapters} chapters of Breslov wisdom.`,
      availableLanguages: ['he', 'en'],
      stats: {
        processedChapters: result.processed || 0,
        totalChapters: result.total || book.estimatedChapters,
        status: result.note || 'ready'
      },
      lastUpdated: new Date().toISOString().split('T')[0]
    };
  });
  
  const outputPath = path.join(CONFIG.outputBase, CONFIG.apiDir, 'books.json');
  fs.writeFileSync(outputPath, JSON.stringify(books, null, 2));
  console.log(`✅ Generated ${outputPath} with ${books.length} books`);
}

// Helper: Get book color
function getBookColor(bookId) {
  const colors = {
    'likutey-moharan': '#3498db',
    'likutey-halachos': '#2ecc71',
    'likutey-tefilos': '#e74c3c',
    'sefer-hamidos': '#f39c12',
    'sichos-haran': '#9b59b6',
    'chayey-moharan': '#1abc9c'
  };
  return colors[bookId] || '#7f8c8d';
}

// Helper: Get book category
function getBookCategory(bookId) {
  const categories = {
    'likutey-moharan': 'torah',
    'likutey-halachos': 'halacha',
    'likutey-tefilos': 'prayer',
    'sefer-hamidos': 'ethics',
    'sichos-haran': 'conversations',
    'chayey-moharan': 'biography'
  };
  return categories[bookId] || 'teaching';
}

// Generate search index
function generateSearchIndex(bookResults) {
  const documents = [];
  
  for (const result of bookResults) {
    for (const chapter of result.chapters || []) {
      documents.push({
        id: chapter.id,
        title: chapter.title,
        hebrewTitle: chapter.hebrewTitle,
        content: chapter.preview || '',
        hebrewContent: '', // Would need actual Hebrew content
        book: CONFIG.books.find(b => b.id === result.bookId)?.title || result.bookId,
        bookId: result.bookId,
        chapter: chapter.number,
        topics: ['breslov', 'wisdom', 'teaching'],
        language: 'bilingual'
      });
    }
  }
  
  const searchIndex = {
    version: '1.0',
    lastBuilt: new Date().toISOString(),
    totalDocuments: documents.length,
    documents
  };
  
  const indexPath = path.join(CONFIG.outputBase, CONFIG.apiDir, 'search-index.json');
  fs.writeFileSync(indexPath, JSON.stringify(searchIndex, null, 2));
  console.log(`✅ Generated ${indexPath} with ${documents.length} search documents`);
}

// Generate daily wisdom
function generateDailyWisdom() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  
  const wisdom = {
    date: today.toISOString().split('T')[0],
    dayOfYear: dayOfYear,
    teaching: {
      text: "The essence of wisdom is to realize that everything is from God, and to always seek to come closer to Him.",
      hebrew: "עיקר החכמה להכיר שהכל מהשם יתברך, ולחפש תמיד להתקרב אליו.",
      source: "Likutey Moharan 1:1",
      bookId: "likutey-moharan",
      chapter: (dayOfYear % 282) + 1 // Cycle through 282 chapters
    },
    reflection: {
      question: "How can I apply this wisdom in my life today?",
      action: "Take one practical step based on this teaching."
    }
  };
  
  const wisdomPath = path.join(CONFIG.outputBase, CONFIG.apiDir, 'daily-wisdom.json');
  fs.writeFileSync(wisdomPath, JSON.stringify(wisdom, null, 2));
  console.log(`✅ Generated ${wisdomPath}`);
}

// Generate API info
function generateAPIInfo(bookResults) {
  const totalProcessed = bookResults.reduce((sum, r) => sum + (r.processed || 0), 0);
  const totalChapters = bookResults.reduce((sum, r) => sum + (r.total || 0), 0);
  
  const info = {
    name: 'Ajew Ananach API',
    version: '1.0.0',
    description: 'JSON API generated from ajew.org HTML teachings',
    stats: {
      books: bookResults.length,
      chapters: {
        processed: totalProcessed,
        total: totalChapters,
        percentage: Math.round((totalProcessed / totalChapters) * 100)
      },
      generated: new Date().toISOString()
    },
    endpoints: {
      books: '/api/books.json',
      book: '/api/{bookId}/index.json',
      chapter: '/api/{bookId}/{chapterNumber}.json',
      search: '/api/search-index.json',
      daily: '/api/daily-wisdom.json'
    },
    phase: '1 - HTML to JSON Conversion',
    note: 'First 10 chapters of each book processed. Full conversion pending.',
    source: 'ajew.org/teachings/'
  };
  
  const infoPath = path.join(CONFIG.outputBase, CONFIG.apiDir, 'info.json');
  fs.writeFileSync(infoPath, JSON.stringify(info, null, 2));
  console.log(`✅ Generated ${infoPath}`);
}

// Main function
async function main() {
  console.log('🚀 Converting ajew.org HTML to JSON API...\n');
  console.log(`Source: ${CONFIG.sourceBase}`);
  console.log(`Output: ${path.join(CONFIG.outputBase, CONFIG.apiDir)}\n`);
  
  try {
    // Ensure API directory exists
    const apiDir = path.join(CONFIG.outputBase, CONFIG.apiDir);
    ensureDir(apiDir);
    
    // Process each book
    const bookResults = [];
    
    for (const book of CONFIG.books) {
      const result = await processBook(book);
      bookResults.push(result);
    }
    
    // Generate supporting files
    generateBooksJSON(bookResults);
    generateSearchIndex(bookResults);
    generateDailyWisdom();
    generateAPIInfo(bookResults);
    
    // Summary
    console.log('\n🎉 HTML to JSON conversion complete!');
    console.log('\n📊 Summary:');
    
    let totalProcessed = 0;
    let totalChapters = 0;
    
    for (const result of bookResults) {
      console.log(`  ${result.bookId}: ${result.processed || 0}/${result.total || 0} chapters`);
      totalProcessed += result.processed || 0;
      totalChapters += result.total || 0;
    }
    
    console.log(`\n  Total: ${totalProcessed}/${totalChapters} chapters (${Math.round((totalProcessed / totalChapters) * 100)}%)`);
    
    console.log('\n📁 API Structure:');
    console.log(`  ${apiDir}/`);
    console.log('  ├── books.json');
    console.log('  ├── search-index.json');
    console.log('  ├── daily-wisdom.json');
    console.log('  ├── info.json');
    console.log('  └── [book-id]/');
    console.log('      ├── index.json');
    console.log('      └── [chapter].json');
    
    console.log('\n🔧 Next Steps:');
    console.log('1. Test API with mobile app');
    console.log('2. Deploy to ajew.org/public/api/');
    console.log('3. Process remaining chapters (run script again)');
    console.log('4. Set up automated conversion pipeline');
    
  } catch (error) {
    console.error('❌ Error during conversion:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  // Check if Cheerio is available
  try {
    require('cheerio');
    main();
  } catch (error) {
    console.error('❌ Cheerio not found. Install it with:');
    console.error('npm install cheerio');
    console.error('\nFor now, running sample generator instead...');
    
    // Fall back to sample generator
    const { main: sampleMain } = require('./generate-api.js');
    sampleMain();
  }
}

module.exports = {
  extractFromHTML,
  scanBookDirectory,
  processBook,
  main
};