#!/usr/bin/env node

/**
 * Reorganized JSON to Mobile API Converter
 * Converts existing reorganized JSON structure to mobile app API
 * 
 * Smart approach: Use the already-structured JSON data
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // Source: reorganized JSON structure
  sourceBase: path.join(__dirname, '../../ajew-org/src/content/reorganized'),
  
  // Output: API directory
  outputBase: path.join(__dirname, '../../ajew-org/public'),
  apiDir: 'api-v2', // Different directory to avoid overwriting
  
  // Books mapping
  books: [
    {
      id: 'likutey-moharan',
      sourcePath: 'rabbainu/likutay-moharan',
      title: 'Likutey Moharan',
      hebrewTitle: 'לקוטי מוהר"ן',
      author: 'Rabbi Nachman of Breslov',
      parts: ['part-1', 'part-2']
    },
    {
      id: 'sefer-hamidos',
      sourcePath: 'rabbainu/sefer-hamidos',
      title: 'Sefer Hamidos',
      hebrewTitle: 'ספר המידות',
      author: 'Rabbi Nachman of Breslov'
    },
    {
      id: 'stories',
      sourcePath: 'rabbainu/sippurei-maasiyos',
      title: 'Stories of Rabbi Nachman',
      hebrewTitle: 'סיפורי רבי נחמן',
      author: 'Rabbi Nachman of Breslov'
    },
    {
      id: 'other-works',
      sourcePath: 'rabbainu/other-works',
      title: 'Other Works',
      hebrewTitle: 'כתבים נוספים',
      author: 'Rabbi Nachman of Breslov'
    }
  ]
};

// Ensure directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Load and process a book
function processBook(book) {
  console.log(`\n📚 Processing ${book.title}...`);
  
  const bookSourceDir = path.join(CONFIG.sourceBase, book.sourcePath);
  const bookOutputDir = path.join(CONFIG.outputBase, CONFIG.apiDir, book.id);
  ensureDir(bookOutputDir);
  
  const allChapters = [];
  
  // Check if book has parts (like Likutey Moharan)
  if (book.parts) {
    for (const part of book.parts) {
      const partDir = path.join(bookSourceDir, part);
      if (fs.existsSync(partDir)) {
        const partChapters = processPart(partDir, book.id, part);
        allChapters.push(...partChapters);
      }
    }
  } else {
    // Process as single directory
    const chapters = processDirectory(bookSourceDir, book.id);
    allChapters.push(...chapters);
  }
  
  // Sort chapters by number
  allChapters.sort((a, b) => a.number - b.number);
  
  // Create book index
  const bookIndex = {
    book: {
      id: book.id,
      title: book.title,
      hebrewTitle: book.hebrewTitle,
      author: book.author,
      chapters: allChapters.length,
      description: `${book.title} contains ${allChapters.length} teachings of Breslov wisdom.`,
      color: getBookColor(book.id),
      category: getBookCategory(book.id)
    },
    chapters: allChapters.map(ch => ({
      id: ch.id,
      number: ch.number,
      title: ch.title,
      hebrewTitle: ch.hebrewTitle,
      preview: ch.preview,
      readingTime: ch.readingTime,
      topics: ch.topics || []
    })),
    metadata: {
      generated: new Date().toISOString(),
      totalChapters: allChapters.length,
      source: book.sourcePath
    }
  };
  
  const indexPath = path.join(bookOutputDir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(bookIndex, null, 2));
  
  console.log(`   ✅ Created ${allChapters.length} chapters`);
  
  return {
    bookId: book.id,
    processed: allChapters.length,
    chapters: allChapters
  };
}

// Process a part directory (e.g., part-1, part-2)
function processPart(partDir, bookId, partName) {
  const chapters = [];
  
  try {
    const files = fs.readdirSync(partDir);
    const jsonFiles = files.filter(f => f.endsWith('.json') && f.startsWith('torah-'));
    
    for (const jsonFile of jsonFiles) {
      const filePath = path.join(partDir, jsonFile);
      const chapterData = processTorahJSON(filePath, bookId, partName);
      if (chapterData) {
        chapters.push(chapterData);
        
        // Save individual chapter
        const chapterPath = path.join(
          CONFIG.outputBase, 
          CONFIG.apiDir, 
          bookId, 
          `${chapterData.number}.json`
        );
        ensureDir(path.dirname(chapterPath));
        fs.writeFileSync(chapterPath, JSON.stringify(chapterData, null, 2));
      }
    }
    
  } catch (error) {
    console.warn(`   ⚠️ Could not process part ${partName}:`, error.message);
  }
  
  return chapters;
}

// Process a single torah JSON file
function processTorahJSON(filePath, bookId, partName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    if (!data.torah) return null;
    
    const torah = data.torah;
    const chapterNum = parseInt(torah.id.replace('torah-', ''));
    
    // Extract simanim content if available
    let hebrewContent = '';
    let englishContent = '';
    
    if (torah.simanim && torah.simanim.length > 0) {
      // Try to load simanim text files
      const contentDir = path.join(path.dirname(filePath), 'content', torah.id);
      if (fs.existsSync(contentDir)) {
        // In Phase 2, we'll load actual content
        hebrewContent = `תוכן מלא של ${torah.hebrewTitle} - ${torah.simanim.length} סימנים`;
        englishContent = `Full content of ${torah.title} - ${torah.simanim.length} sections`;
      } else {
        // Use summaries for now
        hebrewContent = torah.simanim.map(s => s.hebrewTitle).join('. ');
        englishContent = torah.simanim.map(s => s.summary).join('. ');
      }
    }
    
    const chapterData = {
      id: `${bookId}-${chapterNum}`,
      bookId: bookId,
      number: chapterNum,
      title: torah.title,
      hebrewTitle: torah.hebrewTitle,
      part: partName,
      content: {
        he: hebrewContent || torah.hebrewTitle,
        en: englishContent || torah.title
      },
      metadata: {
        sourceFile: path.relative(CONFIG.sourceBase, filePath),
        simanim: torah.simanim?.length || 0,
        themes: torah.themes || [],
        keywords: torah.keywords || [],
        dateDelivered: torah.dateDelivered,
        location: torah.location,
        readingTime: torah.simanim ? torah.simanim.length * 3 : 5, // ~3 minutes per siman
        extracted: new Date().toISOString()
      },
      navigation: torah.navigation || {}
    };
    
    return chapterData;
    
  } catch (error) {
    console.warn(`   ⚠️ Could not process ${filePath}:`, error.message);
    return null;
  }
}

// Process a directory without parts
function processDirectory(dirPath, bookId) {
  const chapters = [];
  
  try {
    // Look for JSON files or subdirectories
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      if (item.isFile() && item.name.endsWith('.json') && item.name !== 'metadata.json') {
        const filePath = path.join(dirPath, item.name);
        const chapterData = processGenericJSON(filePath, bookId);
        if (chapterData) {
          chapters.push(chapterData);
          
          // Save individual chapter
          const chapterPath = path.join(
            CONFIG.outputBase, 
            CONFIG.apiDir, 
            bookId, 
            `${chapterData.number}.json`
          );
          ensureDir(path.dirname(chapterPath));
          fs.writeFileSync(chapterPath, JSON.stringify(chapterData, null, 2));
        }
      }
    }
    
  } catch (error) {
    console.warn(`   ⚠️ Could not process directory ${dirPath}:`, error.message);
  }
  
  return chapters;
}

// Process generic JSON file
function processGenericJSON(filePath, bookId) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Extract chapter number from filename
    const match = path.basename(filePath).match(/(\d+)/);
    const chapterNum = match ? parseInt(match[1]) : 1;
    
    // Try to extract title and content
    let title = 'Teaching';
    let hebrewTitle = 'תורה';
    let contentText = '';
    
    if (data.title || data.hebrewTitle) {
      title = data.title || data.hebrewTitle;
      hebrewTitle = data.hebrewTitle || data.title;
    } else if (data.torah) {
      title = data.torah.title || data.torah.hebrewTitle;
      hebrewTitle = data.torah.hebrewTitle || data.torah.title;
    }
    
    // Create preview
    const preview = data.summary || data.description || title;
    
    const chapterData = {
      id: `${bookId}-${chapterNum}`,
      bookId: bookId,
      number: chapterNum,
      title: title,
      hebrewTitle: hebrewTitle,
      content: {
        he: hebrewTitle,
        en: title
      },
      metadata: {
        sourceFile: path.relative(CONFIG.sourceBase, filePath),
        preview: preview.substring(0, 150) + '...',
        readingTime: 5,
        extracted: new Date().toISOString()
      }
    };
    
    return chapterData;
    
  } catch (error) {
    console.warn(`   ⚠️ Could not process ${filePath}:`, error.message);
    return null;
  }
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
      chapters: result.chapters?.length || 0,
      color: getBookColor(book.id),
      category: getBookCategory(book.id),
      description: `${book.title} contains ${result.chapters?.length || 0} teachings of Breslov wisdom.`,
      availableLanguages: ['he', 'en'],
      stats: {
        processedChapters: result.chapters?.length || 0,
        status: result.chapters?.length ? 'ready' : 'pending'
      },
      lastUpdated: new Date().toISOString().split('T')[0]
    };
  });
  
  const outputPath = path.join(CONFIG.outputBase, CONFIG.apiDir, 'books.json');
  fs.writeFileSync(outputPath, JSON.stringify(books, null, 2));
  console.log(`\n✅ Generated ${outputPath} with ${books.length} books`);
}

// Helper: Get book color
function getBookColor(bookId) {
  const colors = {
    'likutey-moharan': '#3498db',
    'sefer-hamidos': '#f39c12',
    'stories': '#e67e22',
    'other-works': '#95a5a6'
  };
  return colors[bookId] || '#7f8c8d';
}

// Helper: Get book category
function getBookCategory(bookId) {
  const categories = {
    'likutey-moharan': 'torah',
    'sefer-hamidos': 'ethics',
    'stories': 'stories',
    'other-works': 'teachings'
  };
  return categories[bookId] || 'teaching';
}

// Generate search index from reorganized data
function generateSearchIndex(bookResults) {
  const documents = [];
  
  for (const result of bookResults) {
    for (const chapter of result.chapters || []) {
      documents.push({
        id: chapter.id,
        title: chapter.title,
        hebrewTitle: chapter.hebrewTitle,
        content: chapter.metadata.preview || chapter.title,
        hebrewContent: chapter.hebrewTitle,
        book: CONFIG.books.find(b => b.id === result.bookId)?.title || result.bookId,
        bookId: result.bookId,
        chapter: chapter.number,
        topics: chapter.metadata.themes || [],
        keywords: chapter.metadata.keywords || [],
        language: 'bilingual',
        readingTime: chapter.metadata.readingTime || 5
      });
    }
  }
  
  const searchIndex = {
    version: '2.0',
    lastBuilt: new Date().toISOString(),
    totalDocuments: documents.length,
    documents
  };
  
  const indexPath = path.join(CONFIG.outputBase, CONFIG.apiDir, 'search-index.json');
  fs.writeFileSync(indexPath, JSON.stringify(searchIndex, null, 2));
  console.log(`✅ Generated ${indexPath} with ${documents.length} search documents`);
}

// Generate daily wisdom
function generateDailyWisdom(bookResults) {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  
  // Find a book with chapters
  const bookWithChapters = bookResults.find(r => r.chapters?.length > 0);
  if (!bookWithChapters) {
    console.log('⚠️ No chapters found for daily wisdom');
    return;
  }
  
  const chapters = bookWithChapters.chapters;
  const chapterIndex = dayOfYear % chapters.length;
  const selectedChapter = chapters[chapterIndex];
  
  const wisdom = {
    date: today.toISOString().split('T')[0],
    dayOfYear: dayOfYear,
    teaching: {
      text: selectedChapter.title,
      hebrew: selectedChapter.hebrewTitle,
      source: `${CONFIG.books.find(b => b.id === selectedChapter.bookId)?.title} ${selectedChapter.number}`,
      bookId: selectedChapter.bookId,
      chapter: selectedChapter.number
    },
    reflection: {
      question: "How can I apply this teaching in my life today?",
      action: "Reflect on one practical application."
    }
  };
  
  const wisdomPath = path.join(CONFIG.outputBase, CONFIG.apiDir, 'daily-wisdom.json');
  fs.writeFileSync(wisdomPath, JSON.stringify(wisdom, null, 2));
  console.log(`✅ Generated ${wisdomPath}`);
}

// Generate API info
function generateAPIInfo(bookResults) {
  const totalProcessed = bookResults.reduce((sum, r) => sum + (r.chapters?.length || 0), 0);
  
  const info = {
    name: 'Ajew Ananach API v2',
    version: '2.0.0',
    description: 'JSON API generated from reorganized structured data',
    stats: {
      books: bookResults.length,
      chapters: {
        processed: totalProcessed,
        generated: new Date().toISOString()
      }
    },
    endpoints: {
      books: '/api-v2/books.json',
      book: '/api-v2/{bookId}/index.json',
      chapter: '/api-v2/{bookId}/{chapterNumber}.json',
      search: '/api-v2/search-index.json',
      daily: '/api-v2/daily-wisdom.json'
    },
    phase: '2 - Structured JSON Conversion',
    note: 'Using existing reorganized JSON structure. Full content loading in Phase 3.',
    source: 'ajew.org/src/content/reorganized/'
  };
  
  const infoPath = path.join(CONFIG.outputBase, CONFIG.apiDir, 'info.json');
  fs.writeFileSync(infoPath, JSON.stringify(info, null, 2));
  console.log(`✅ Generated ${infoPath}`);
}

// Main function
async function main() {
  console.log('🚀 Converting reorganized JSON to Mobile API...\n');
  console.log(`Source: ${CONFIG.sourceBase}`);
  console.log(`Output: ${path.join(CONFIG.outputBase, CONFIG.apiDir)}\n`);
  
  try {
    // Ensure API directory exists
    const apiDir = path.join(CONFIG.outputBase, CONFIG.apiDir);
    ensureDir(apiDir);
    
    // Process each book
    const bookResults = [];
    
    for (const book of CONFIG.books) {
      const result = processBook(book);
      bookResults.push(result);
    }
    
    // Generate supporting files
    generateBooksJSON(bookResults);
    generateSearchIndex(bookResults);
    generateDailyWisdom(bookResults);
    generateAPIInfo(bookResults);
    
    // Summary
    console.log('\n🎉 Reorganized JSON to API conversion complete!');
    console.log('\n📊 Summary:');
    
    let totalProcessed = 0;
    
    for (const result of bookResults) {
      console.log(`  ${result.bookId}: ${result.chapters?.length || 0} chapters`);
      totalProcessed += result.chapters?.length || 0;
    }
    
    console.log(`\n  Total: ${totalProcessed} chapters processed`);
    
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
    console.log('2. Update mobile app to use api-v2 endpoints');
    console.log('3. Load actual content from simanim text files (Phase 3)');
    console.log('4. Add more books from reorganized structure');
    console.log('5. Set up automated updates');
    
  } catch (error) {
    console.error('❌ Error during conversion:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  processBook,
  processTorahJSON,
  main
};