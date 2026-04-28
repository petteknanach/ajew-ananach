#!/usr/bin/env node

/**
 * Ajew Ananach API Generator
 * Converts HTML teachings to JSON API
 * 
 * Phase 1: Static JSON files for mobile app
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  sourceDir: '../ajew-org/teachings', // Relative to this script
  outputDir: '../ajew-org/public/api', // Where to write JSON files
  books: [
    {
      id: 'likutey-moharan',
      title: 'Likutey Moharan',
      hebrewTitle: 'לקוטי מוהר"ן',
      author: 'Rabbi Nachman of Breslov',
      chapters: 282,
      color: '#3498db',
      category: 'torah'
    },
    {
      id: 'likutey-halachos',
      title: 'Likutey Halachos',
      hebrewTitle: 'לקוטי הלכות',
      author: 'Rabbi Natan of Breslov',
      chapters: 600,
      color: '#2ecc71',
      category: 'halacha'
    },
    {
      id: 'likutey-tefilos',
      title: 'Likutey Tefilos',
      hebrewTitle: 'לקוטי תפילות',
      author: 'Rabbi Natan of Breslov',
      chapters: 32,
      color: '#e74c3c',
      category: 'prayer'
    },
    {
      id: 'sefer-hamidos',
      title: 'Sefer Hamidos',
      hebrewTitle: 'ספר המידות',
      author: 'Rabbi Nachman of Breslov',
      chapters: 413,
      color: '#f39c12',
      category: 'ethics'
    },
    {
      id: 'sichos-haran',
      title: 'Sichos HaRan',
      hebrewTitle: 'שיחות הר"ן',
      author: 'Rabbi Nachman of Breslov',
      chapters: 229,
      color: '#9b59b6',
      category: 'conversations'
    },
    {
      id: 'chayey-moharan',
      title: 'Chayey Moharan',
      hebrewTitle: 'חיי מוהר"ן',
      author: 'Rabbi Natan of Breslov',
      chapters: 150,
      color: '#1abc9c',
      category: 'biography'
    }
  ]
};

// Ensure output directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Generate books.json
function generateBooksJSON() {
  const books = CONFIG.books.map(book => ({
    ...book,
    description: `${book.title} is one of the foundational works of Breslov Chassidus, containing deep insights and practical guidance for spiritual growth.`,
    availableLanguages: ['he', 'en'],
    lastUpdated: new Date().toISOString().split('T')[0],
    stats: {
      chapters: book.chapters,
      words: '50,000+',
      pages: '300+'
    }
  }));

  const outputPath = path.join(CONFIG.outputDir, 'books.json');
  fs.writeFileSync(outputPath, JSON.stringify(books, null, 2));
  console.log(`✅ Generated ${outputPath} with ${books.length} books`);
}

// Generate book index files
function generateBookIndexes() {
  for (const book of CONFIG.books) {
    const bookDir = path.join(CONFIG.outputDir, book.id);
    ensureDir(bookDir);

    // Create chapters array
    const chapters = [];
    for (let i = 1; i <= Math.min(book.chapters, 10); i++) { // Sample first 10
      chapters.push({
        id: `${book.id}-${i}`,
        number: i,
        title: `Chapter ${i}`,
        hebrewTitle: `פרק ${i}`,
        preview: `This is chapter ${i} of ${book.title}. The full content will be loaded from the actual HTML files.`,
        readingTime: Math.floor(Math.random() * 10) + 5, // 5-15 minutes
        topics: ['wisdom', 'faith', 'prayer'].slice(0, Math.floor(Math.random() * 3) + 1)
      });
    }

    const indexData = {
      book: {
        ...book,
        description: `${book.title} contains ${book.chapters} chapters of Breslov wisdom.`
      },
      chapters,
      metadata: {
        generated: new Date().toISOString(),
        totalChapters: book.chapters,
        sampleChapters: chapters.length
      }
    };

    const indexPath = path.join(bookDir, 'index.json');
    fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
    console.log(`✅ Generated ${indexPath} with ${chapters.length} sample chapters`);
  }
}

// Generate sample chapter content
function generateSampleChapters() {
  for (const book of CONFIG.books.slice(0, 2)) { // Just first 2 books for sample
    const bookDir = path.join(CONFIG.outputDir, book.id);
    
    for (let i = 1; i <= 3; i++) { // First 3 chapters of each
      const chapterData = {
        id: `${book.id}-${i}`,
        bookId: book.id,
        number: i,
        title: `The Importance of Spiritual Concept ${i}`,
        hebrewTitle: `חשיבות הרעיון הרוחני ${i}`,
        content: {
          he: `זהו הטקסט המלא של פרק ${i} בעברית. כאן יופיע התוכן האמיתי מהקבצים המקוריים של ajew.org. הטקסט יכלול את כל הפרק עם ניקוד ופיסוק נכון.`,
          en: `This is the full text of chapter ${i} in English. Here will appear the actual content from the original ajew.org files. The text will include the complete chapter with proper translation.`
        },
        metadata: {
          length: 1500,
          readingTime: 8,
          topics: ['spirituality', 'growth', 'wisdom'],
          related: [
            { bookId: book.id, chapter: i + 1, title: `Chapter ${i + 1}` },
            { bookId: book.id, chapter: i - 1 > 0 ? i - 1 : null, title: `Chapter ${i - 1}` }
          ].filter(r => r.chapter)
        }
      };

      const chapterPath = path.join(bookDir, `${i}.json`);
      fs.writeFileSync(chapterPath, JSON.stringify(chapterData, null, 2));
      console.log(`✅ Generated ${chapterPath}`);
    }
  }
}

// Generate search index
function generateSearchIndex() {
  const documents = [];
  
  for (const book of CONFIG.books) {
    for (let i = 1; i <= Math.min(book.chapters, 5); i++) { // First 5 of each
      documents.push({
        id: `${book.id}-${i}`,
        title: `Chapter ${i}: Spiritual Wisdom`,
        hebrewTitle: `פרק ${i}: חכמה רוחנית`,
        content: `This chapter discusses important spiritual concepts from ${book.title}. It covers topics like faith, prayer, joy, and personal growth.`,
        hebrewContent: `פרק זה דן ברעיונות רוחניים חשובים מתוך ${book.hebrewTitle}. הוא מכסה נושאים כמו אמונה, תפילה, שמחה, וצמיחה אישית.`,
        book: book.title,
        bookId: book.id,
        chapter: i,
        topics: ['faith', 'prayer', 'joy', 'growth'],
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

  const indexPath = path.join(CONFIG.outputDir, 'search-index.json');
  fs.writeFileSync(indexPath, JSON.stringify(searchIndex, null, 2));
  console.log(`✅ Generated ${indexPath} with ${documents.length} search documents`);
}

// Generate daily wisdom
function generateDailyWisdom() {
  const wisdom = {
    date: new Date().toISOString().split('T')[0],
    teaching: {
      text: "The essence of wisdom is to realize that everything is from God, and to always seek to come closer to Him.",
      hebrew: "עיקר החכמה להכיר שהכל מהשם יתברך, ולחפש תמיד להתקרב אליו.",
      source: "Likutey Moharan 1:1",
      bookId: "likutey-moharan",
      chapter: 1
    },
    reflection: {
      question: "How can I apply this wisdom in my life today?",
      action: "Take one practical step based on this teaching."
    }
  };

  const wisdomPath = path.join(CONFIG.outputDir, 'daily-wisdom.json');
  fs.writeFileSync(wisdomPath, JSON.stringify(wisdom, null, 2));
  console.log(`✅ Generated ${wisdomPath}`);
}

// Generate API info
function generateAPIInfo() {
  const info = {
    name: 'Ajew Ananach API',
    version: '1.0.0',
    description: 'Static JSON API for Ajew Ananach mobile app',
    endpoints: {
      books: '/api/books.json',
      book: '/api/{bookId}/index.json',
      chapter: '/api/{bookId}/{chapterNumber}.json',
      search: '/api/search-index.json',
      daily: '/api/daily-wisdom.json'
    },
    generated: new Date().toISOString(),
    phase: '1 - Static JSON',
    nextPhase: '2 - Dynamic API (planned)'
  };

  const infoPath = path.join(CONFIG.outputDir, 'info.json');
  fs.writeFileSync(infoPath, JSON.stringify(info, null, 2));
  console.log(`✅ Generated ${infoPath}`);
}

// Main function
async function main() {
  console.log('🚀 Generating Ajew Ananach API...\n');
  
  try {
    // Create output directory
    ensureDir(CONFIG.outputDir);
    
    // Generate all files
    generateBooksJSON();
    generateBookIndexes();
    generateSampleChapters();
    generateSearchIndex();
    generateDailyWisdom();
    generateAPIInfo();
    
    console.log('\n🎉 API generation complete!');
    console.log('\n📁 Output structure:');
    console.log(`  ${CONFIG.outputDir}/`);
    console.log('  ├── books.json');
    console.log('  ├── search-index.json');
    console.log('  ├── daily-wisdom.json');
    console.log('  ├── info.json');
    console.log('  └── [book-id]/');
    console.log('      ├── index.json');
    console.log('      └── [chapter].json');
    
    console.log('\n🔧 Next steps:');
    console.log('1. Update mobile app to use these endpoints');
    console.log('2. Deploy to ajew.org/public/api/');
    console.log('3. Test with actual mobile app');
    console.log('4. Generate from real HTML files (Phase 1.5)');
    
  } catch (error) {
    console.error('❌ Error generating API:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  generateBooksJSON,
  generateBookIndexes,
  generateSampleChapters,
  generateSearchIndex,
  generateDailyWisdom,
  generateAPIInfo,
  main
};