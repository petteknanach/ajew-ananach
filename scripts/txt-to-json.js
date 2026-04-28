#!/usr/bin/env node

/**
 * TXT to JSON Converter for Ajew.org
 * Converts text teachings to structured JSON API
 * 
 * Smart approach: Use actual text files which are cleaner than HTML
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // Source: ajew-org teachings text files
  sourceBase: path.join(__dirname, '../../ajew-org/src/content/teachings'),
  
  // Output: API directory
  outputBase: path.join(__dirname, '../../ajew-org/public'),
  apiDir: 'api',
  
  // Books mapping from analysis
  books: [
    {
      id: 'likutey-moharan',
      files: ['likutay-moharan-vol1.txt', 'likutay-moharan-vol2.txt'],
      title: 'Likutey Moharan',
      hebrewTitle: 'לקוטי מוהר"ן',
      author: 'Rabbi Nachman of Breslov',
      estimatedChapters: 411 // Vol1: 286 + Vol2: 125
    },
    {
      id: 'likutey-halachos',
      files: [], // Will discover from reorganized directory
      title: 'Likutey Halachos',
      hebrewTitle: 'לקוטי הלכות',
      author: 'Rabbi Natan of Breslov',
      estimatedChapters: 600
    },
    {
      id: 'likutey-tefilos',
      files: [], // Will discover
      title: 'Likutey Tefilos',
      hebrewTitle: 'לקוטי תפילות',
      author: 'Rabbi Natan of Breslov',
      estimatedChapters: 32
    },
    {
      id: 'sefer-hamidos',
      files: ['sefer-hamidos.txt'],
      title: 'Sefer Hamidos',
      hebrewTitle: 'ספר המידות',
      author: 'Rabbi Nachman of Breslov',
      estimatedChapters: 413
    },
    {
      id: 'sichos-haran',
      files: ['sichos-haran.txt'],
      title: 'Sichos HaRan',
      hebrewTitle: 'שיחות הר"ן',
      author: 'Rabbi Nachman of Breslov',
      estimatedChapters: 229
    },
    {
      id: 'stories',
      files: [
        'stories-1.txt', 'stories-2.txt', 'stories-3.txt',
        'stories-4.txt', 'stories-5.txt', 'stories-6.txt',
        'stories-7.txt', 'stories-8.txt', 'stories-9.txt',
        'stories-10.txt', 'stories-11.txt', 'stories-12.txt',
        'stories-13.txt'
      ],
      title: 'Stories of Rabbi Nachman',
      hebrewTitle: 'סיפורי רבי נחמן',
      author: 'Rabbi Nachman of Breslov',
      estimatedChapters: 13
    },
    {
      id: 'outpouring-of-soul',
      files: ['outpouring-of-soul.txt'],
      title: 'Outpouring of the Soul',
      hebrewTitle: 'שפיכות הנפש',
      author: 'Rabbi Nachman of Breslov',
      estimatedChapters: 534
    },
    {
      id: 'advice',
      files: ['likutay-aitzos.txt'],
      title: 'Advice (Likutay Eitzos)',
      hebrewTitle: 'לקוטי עצות',
      author: 'Rabbi Nachman of Breslov',
      estimatedChapters: 100
    }
  ]
};

// Ensure directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Parse text file into chapters
function parseTextFile(filePath, book) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    const chapters = [];
    let currentChapter = null;
    let inChapter = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for chapter markers
      if (line.match(/^Chapter \d+/i) || line.match(/^פרק \d+/) || 
          line.match(/^Torah \d+/i) || line.match(/^תורה \d+/)) {
        
        // Save previous chapter if exists
        if (currentChapter) {
          chapters.push(currentChapter);
        }
        
        // Extract chapter number
        const match = line.match(/(\d+)/);
        const chapterNum = match ? parseInt(match[1]) : chapters.length + 1;
        
        // Start new chapter
        currentChapter = {
          number: chapterNum,
          title: line,
          hebrewTitle: line.match(/[\u0590-\u05FF]/) ? line : `פרק ${chapterNum}`,
          content: '',
          lineStart: i
        };
        inChapter = true;
        
      } else if (inChapter && line) {
        // Add to current chapter content
        if (currentChapter.content) {
          currentChapter.content += '\n' + line;
        } else {
          currentChapter.content = line;
        }
      }
    }
    
    // Add last chapter
    if (currentChapter) {
      chapters.push(currentChapter);
    }
    
    console.log(`   Parsed ${filePath}: ${chapters.length} chapters found`);
    return chapters;
    
  } catch (error) {
    console.warn(`   ⚠️ Could not parse ${filePath}:`, error.message);
    return [];
  }
}

// Process a single book
function processBook(book) {
  console.log(`\n📚 Processing ${book.title}...`);
  
  const bookOutputDir = path.join(CONFIG.outputBase, CONFIG.apiDir, book.id);
  ensureDir(bookOutputDir);
  
  const allChapters = [];
  
  // Process each text file
  for (const fileName of book.files) {
    const filePath = path.join(CONFIG.sourceBase, fileName);
    
    if (fs.existsSync(filePath)) {
      const chapters = parseTextFile(filePath, book);
      
      // Add book ID and process content
      for (const chapter of chapters) {
        const chapterData = {
          id: `${book.id}-${chapter.number}`,
          bookId: book.id,
          number: chapter.number,
          title: chapter.title,
          hebrewTitle: chapter.hebrewTitle,
          content: {
            // For now, put all content in both languages
            // In Phase 2, we'll separate Hebrew/English
            he: chapter.content,
            en: chapter.content
          },
          metadata: {
            sourceFile: fileName,
            lineStart: chapter.lineStart,
            wordCount: chapter.content.split(/\s+/).length,
            readingTime: Math.ceil(chapter.content.split(/\s+/).length / 250), // ~250 words/minute
            extracted: new Date().toISOString()
          }
        };
        
        // Save chapter JSON
        const chapterPath = path.join(bookOutputDir, `${chapter.number}.json`);
        fs.writeFileSync(chapterPath, JSON.stringify(chapterData, null, 2));
        
        allChapters.push({
          id: chapterData.id,
          number: chapter.number,
          title: chapterData.title,
          hebrewTitle: chapterData.hebrewTitle,
          preview: chapterData.content.en.substring(0, 150) + '...',
          readingTime: chapterData.metadata.readingTime,
          wordCount: chapterData.metadata.wordCount
        });
      }
    } else {
      console.log(`   ⚠️ File not found: ${fileName}`);
    }
  }
  
  // If no files or chapters, create sample
  if (allChapters.length === 0) {
    console.log(`   Creating sample structure for ${book.title}`);
    return createSampleBook(book, bookOutputDir);
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
      files: book.files,
      description: `${book.title} contains ${allChapters.length} chapters of Breslov wisdom.`
    },
    chapters: allChapters,
    metadata: {
      generated: new Date().toISOString(),
      totalChapters: allChapters.length,
      sourceFiles: book.files.filter(f => fs.existsSync(path.join(CONFIG.sourceBase, f)))
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

// Create sample book if no text files
function createSampleBook(book, outputDir) {
  console.log(`   Creating sample structure for ${book.title}`);
  
  const sampleChapters = [];
  const chapterCount = Math.min(book.estimatedChapters, 10);
  
  // Create sample chapters
  for (let i = 1; i <= chapterCount; i++) {
    const chapterData = {
      id: `${book.id}-${i}`,
      bookId: book.id,
      number: i,
      title: `Chapter ${i}: Sample Teaching`,
      hebrewTitle: `פרק ${i}: תורה לדוגמה`,
      content: {
        he: `זהו תוכן לדוגמה של פרק ${i} מ${book.hebrewTitle}. בעתיד, תוכן זה יוחלף בטקסט האמיתי מהקבצים המקוריים.`,
        en: `This is sample content for chapter ${i} from ${book.title}. In the future, this will be replaced with actual content from the source files.`
      },
      metadata: {
        sourceFile: `sample/${i}.txt`,
        wordCount: { he: 200, en: 250 },
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
      readingTime: 5,
      wordCount: 250
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
      files: ['sample-data'],
      description: `${book.title} will contain ${book.estimatedChapters} chapters of Breslov wisdom.`
    },
    chapters: sampleChapters,
    metadata: {
      generated: new Date().toISOString(),
      totalChapters: book.estimatedChapters,
      processedChapters: chapterCount,
      note: 'Sample data - real text conversion pending'
    }
  };
  
  const indexPath = path.join(outputDir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(bookIndex, null, 2));
  
  return {
    bookId: book.id,
    processed: chapterCount,
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
      chapters: result.chapters?.length || book.estimatedChapters,
      color: getBookColor(book.id),
      category: getBookCategory(book.id),
      description: `${book.title} contains ${result.chapters?.length || book.estimatedChapters} chapters of Breslov wisdom.`,
      availableLanguages: ['he', 'en'],
      stats: {
        processedChapters: result.chapters?.length || 0,
        totalChapters: book.estimatedChapters,
        status: result.note || (result.chapters?.length ? 'partial' : 'pending')
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
    'likutey-halachos': '#2ecc71',
    'likutey-tefilos': '#e74c3c',
    'sefer-hamidos': '#f39c12',
    'sichos-haran': '#9b59b6',
    'chayey-moharan': '#1abc9c',
    'stories': '#e67e22',
    'outpouring-of-soul': '#16a085',
    'advice': '#8e44ad'
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
    'chayey-moharan': 'biography',
    'stories': 'stories',
    'outpouring-of-soul': 'prayer',
    'advice': 'advice'
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
        hebrewContent: '', // Will be filled in Phase 2
        book: CONFIG.books.find(b => b.id === result.bookId)?.title || result.bookId,
        bookId: result.bookId,
        chapter: chapter.number,
        topics: ['breslov', 'wisdom', 'teaching', result.bookId],
        language: 'bilingual',
        wordCount: chapter.wordCount || 0
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
  
  // Cycle through different books
  const books = CONFIG.books.filter(b => b.id !== 'stories');
  const bookIndex = dayOfYear % books.length;
  const selectedBook = books[bookIndex];
  
  const wisdom = {
    date: today.toISOString().split('T')[0],
    dayOfYear: dayOfYear,
    teaching: {
      text: "Every day brings new opportunities for spiritual growth and connection.",
      hebrew: "כל יום מביא איתו הזדמנויות חדשות לצמיחה רוחנית וחיבור.",
      source: `${selectedBook.title} ${(dayOfYear % 50) + 1}`,
      bookId: selectedBook.id,
      chapter: (dayOfYear % 50) + 1
    },
    reflection: {
      question: "What is one small step I can take today to grow spiritually?",
      action: "Choose one teaching from today and apply it practically."
    }
  };
  
  const wisdomPath = path.join(CONFIG.outputBase, CONFIG.apiDir, 'daily-wisdom.json');
  fs.writeFileSync(wisdomPath, JSON.stringify(wisdom, null, 2));
  console.log(`✅ Generated ${wisdomPath}`);
}

// Generate API info
function generateAPIInfo(bookResults) {
  const totalProcessed = bookResults.reduce((sum, r) => sum + (r.chapters?.length || 0), 0);
  const totalEstimated = CONFIG.books.reduce((sum, b) => sum + b.estimatedChapters, 0);
  
  const info = {
    name: 'Ajew Ananach API',
    version: '1.0.0',
    description: 'JSON API generated from ajew.org text teachings',
    stats: {
      books: bookResults.length,
      chapters: {
        processed: totalProcessed,
        estimated: totalEstimated,
        percentage: Math.round((totalProcessed / totalEstimated) * 100)
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
    phase: '1 - Text to JSON Conversion',
    note: 'Initial conversion from text files. Hebrew/English separation in Phase 2.',
    source: 'ajew.org/src/content/teachings/'
  };
  
  const infoPath = path.join(CONFIG.outputBase, CONFIG.apiDir, 'info.json');
  fs.writeFileSync(infoPath, JSON.stringify(info, null, 2));
  console.log(`✅ Generated ${infoPath}`);
}

// Main function
async function main() {
  console.log('🚀 Converting ajew.org text files to JSON API...\n');
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
    generateDailyWisdom();
    generateAPIInfo(bookResults);
    
    // Summary
    console.log('\n🎉 Text to JSON conversion complete!');
    console.log('\n📊 Summary:');
    
    let totalProcessed = 0;
    let totalEstimated = 0;
    
    for (const result of bookResults) {
      const book = CONFIG.books.find(b => b.id === result.bookId);
      console.log(`  ${result.bookId}: ${result.chapters?.length || 0}/${book.estimatedChapters} chapters`);
      totalProcessed += result.chapters?.length || 0;
      totalEstimated += book.estimatedChapters;
    }
    
    console.log(`\n  Total: ${totalProcessed}/${totalEstimated} chapters (${Math.round((totalProcessed / totalEstimated) * 100)}%)`);
    
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
    console.log('3. Process reorganized directory (Phase 2)');
    console.log('4. Separate Hebrew/English content');
    console.log('5. Set up automated conversion pipeline');
    
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
  parseTextFile,
  processBook,
  main
};