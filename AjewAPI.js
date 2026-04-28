// AjewAPI.js - API Service Layer for Ajew Ananach Mobile App
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// API Configuration
const BASE_URL = 'https://ajew.org';
const CACHE_PREFIX = '@AjewAnanach_';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Cache service
const CacheService = {
  async set(key, data) {
    try {
      const cacheItem = { data, timestamp: Date.now() };
      await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheItem));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  async get(key) {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!cached) return null;
      const cacheItem = JSON.parse(cached);
      if (Date.now() - cacheItem.timestamp > CACHE_TTL) {
        await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
        return null;
      }
      return cacheItem.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  async clearAll() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(appKeys);
      return true;
    } catch (error) {
      console.error('Cache clearAll error:', error);
      return false;
    }
  },
};

// Book color palette
const BOOK_COLORS = [
  '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6',
  '#1abc9c', '#e67e22', '#2980b9', '#27ae60', '#c0392b',
  '#8e44ad', '#16a085', '#d35400', '#2c3e50', '#7f8c8d',
];

// Main API class
class AjewAPI {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      timeout: 15000,
    });
  }

  // Fetch the full book catalog from ajew.org
  async getBooks(forceRefresh = false) {
    const cacheKey = 'catalog';
    if (!forceRefresh) {
      const cached = await CacheService.get(cacheKey);
      if (cached) return { success: true, data: cached, source: 'cache' };
    }

    try {
      const response = await this.axiosInstance.get('/reader/catalog.json');
      const catalog = response.data;
      const books = (catalog.books || []).map((book, i) => ({
        ...book,
        color: book.color || BOOK_COLORS[i % BOOK_COLORS.length],
        chapters: book.parts
          ? book.parts.reduce((sum, p) => sum + (p.totalTorahs || 0), 0)
          : 0,
      }));
      await CacheService.set(cacheKey, books);
      return { success: true, data: books, source: 'api' };
    } catch (error) {
      console.warn('Catalog fetch failed:', error.message);
      // Return cached even if expired
      try {
        const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}catalog`);
        if (raw) {
          const parsed = JSON.parse(raw);
          return { success: true, data: parsed.data, source: 'stale_cache' };
        }
      } catch (_) { /* ignore */ }
      return { success: false, data: [], error: error.message };
    }
  }

  // Fetch the index (chapter list) for a book part
  async getBookIndex(indexUrl, forceRefresh = false) {
    const cacheKey = `index_${indexUrl}`;
    if (!forceRefresh) {
      const cached = await CacheService.get(cacheKey);
      if (cached) return { success: true, data: cached, source: 'cache' };
    }

    try {
      const response = await this.axiosInstance.get(indexUrl);
      const indexData = response.data;
      await CacheService.set(cacheKey, indexData);
      return { success: true, data: indexData, source: 'api' };
    } catch (error) {
      console.warn('Index fetch failed:', error.message);
      return { success: false, data: null, error: error.message };
    }
  }

  // Fetch a single section/torah content
  // sectionUrl is the URL from the index, e.g. "/reader/sichos-haran/1/5"
  // We need to map it to the actual JSON file path
  async getSectionContent(book, part, sectionId, forceRefresh = false) {
    const cacheKey = `content_${book}_${part}_${sectionId}`;
    if (!forceRefresh) {
      const cached = await CacheService.get(cacheKey);
      if (cached) return { success: true, data: cached, source: 'cache' };
    }

    // Try different file naming patterns — expanded to cover all book types
    const prefixes = [
      'torah', 'sicha', 'section', 'topic', 'halacha', 'tefila',
      'letter', 'story', 'eitza', 'chapter', 'teaching', 'prayer',
    ];
    const partPath = part ? `part-${part}/` : '';

    // Also try volume-N pattern (used by Likutay Nanach, Likutay Halachos)
    const volumePath = part ? `volume-${part}/` : '';
    const pathsToTry = [];

    // Standard prefix patterns
    for (const prefix of prefixes) {
      if (partPath) pathsToTry.push(`/reader/${book}/${partPath}${prefix}-${sectionId}.json`);
      // Also try without part
      pathsToTry.push(`/reader/${book}/${prefix}-${sectionId}.json`);
    }

    // volume-N pattern (for books using volume- instead of part-)
    if (volumePath) {
      for (const prefix of prefixes) {
        pathsToTry.push(`/reader/${book}/${volumePath}${prefix}-${sectionId}.json`);
      }
    }

    // section-N pattern (used by Fires of Israel, Otzar HaYirah, etc.)
    pathsToTry.push(`/reader/${book}/${partPath}section-${sectionId}.json`);
    pathsToTry.push(`/reader/${book}/section-${sectionId}.json`);

    // chumash-lh/section-N pattern (for Chumash with Likutay Halachos)
    pathsToTry.push(`/reader/${book}/chumash-lh/section-${sectionId}.json`);

    // No prefix — some books just use the section number directly
    if (partPath) pathsToTry.push(`/reader/${book}/${partPath}${sectionId}.json`);
    pathsToTry.push(`/reader/${book}/${sectionId}.json`);

    // Try chain-of-light paths
    pathsToTry.push(`/reader/${book}/chain-${sectionId}.json`);

    let lastError = null;

    for (const url of pathsToTry) {
      try {
        const response = await this.axiosInstance.get(url);
        const content = response.data;
        await CacheService.set(cacheKey, content);
        return { success: true, data: content, source: 'api' };
      } catch (error) {
        lastError = error;
        continue;
      }
    }

    return { success: false, data: null, error: lastError?.message || 'Content not found' };
  }

  // Smarter content fetch using the actual URL from the index
  async getSectionByUrl(jsonFileUrl, forceRefresh = false) {
    const cacheKey = `url_${jsonFileUrl}`;
    if (!forceRefresh) {
      const cached = await CacheService.get(cacheKey);
      if (cached) return { success: true, data: cached, source: 'cache' };
    }

    try {
      const response = await this.axiosInstance.get(jsonFileUrl);
      const content = response.data;
      await CacheService.set(cacheKey, content);
      return { success: true, data: content, source: 'api' };
    } catch (error) {
      return { success: false, data: null, error: error.message };
    }
  }

  // Search across books (searches book titles, authors, hebrew titles)
  searchBooks(books, query) {
    if (!query || !query.trim()) return books;
    const q = query.toLowerCase().trim();
    return books.filter(book =>
      (book.title || '').toLowerCase().includes(q) ||
      (book.hebrewTitle || '').includes(q) ||
      (book.author || '').toLowerCase().includes(q) ||
      (book.hebrewAuthor || '').includes(q)
    );
  }

  // Search within section segments
  searchInSegments(segments, query) {
    if (!query || !query.trim()) return segments;
    const q = query.toLowerCase().trim();
    return segments.filter(seg =>
      (seg.he || '').includes(q) ||
      (seg.he_nikud || '').includes(q) ||
      (seg.en || '').toLowerCase().includes(q)
    );
  }

  // Get daily wisdom - random teaching from a curated list
  getDailyWisdom() {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
    );
    const wisdoms = [
      { title: 'The Power of Joy', hebrewTitle: 'כוח השמחה', content: 'It is a great mitzvah to always be happy. Strengthen yourself to push away all sadness and depression with all your might.', source: 'Likutay Moharan II, 24' },
      { title: 'Judging Favorably', hebrewTitle: 'אזמרה', content: 'You must search and find in yourself some modicum of good. Even if you know that you are full of sins, it is impossible that you have not done some mitzvah or good thing in your life.', source: 'Likutay Moharan I, 282' },
      { title: 'Hitbodedut', hebrewTitle: 'התבודדות', content: 'Set aside an hour or more each day to talk to God in your own words, as you would speak to a close friend.', source: 'Likutay Moharan II, 25' },
      { title: 'The Whole World is a Narrow Bridge', hebrewTitle: 'כל העולם כולו גשר צר מאוד', content: 'The whole world is a very narrow bridge, and the main thing is not to be afraid at all.', source: 'Likutay Moharan II, 48' },
      { title: 'Simplicity', hebrewTitle: 'תמימות', content: 'God is found in simplicity, in ordinary words and conversations. Speak to Him simply with whatever words you can, in whatever language you know best.', source: 'Sichos HaRan, 154' },
      { title: 'Prayer', hebrewTitle: 'תפילה', content: 'Prayer is the foundation of everything. Through prayer one can attain everything: Torah, devotion, holiness - everything.', source: 'Likutay Moharan I, 9' },
      { title: 'Patience', hebrewTitle: 'סבלנות', content: 'If you believe that you can damage, believe that you can fix. If you believe that you can harm, believe that you can heal.', source: 'Likutay Moharan II, 112' },
    ];
    const wisdom = wisdoms[dayOfYear % wisdoms.length];
    return {
      success: true,
      data: {
        ...wisdom,
        date: new Date().toISOString().split('T')[0],
      },
    };
  }

  // Bookmarks management
  async getBookmarks() {
    try {
      const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}bookmarks`);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  async addBookmark(bookmark) {
    const bookmarks = await this.getBookmarks();
    const exists = bookmarks.some(
      b => b.book === bookmark.book && b.part === bookmark.part && b.section === bookmark.section
    );
    if (!exists) {
      const updated = [{ ...bookmark, timestamp: Date.now() }, ...bookmarks];
      await AsyncStorage.setItem(`${CACHE_PREFIX}bookmarks`, JSON.stringify(updated));
      return updated;
    }
    return bookmarks;
  }

  async removeBookmark(book, part, section) {
    const bookmarks = await this.getBookmarks();
    const updated = bookmarks.filter(
      b => !(b.book === book && b.part === part && b.section === section)
    );
    await AsyncStorage.setItem(`${CACHE_PREFIX}bookmarks`, JSON.stringify(updated));
    return updated;
  }

  async isBookmarked(book, part, section) {
    const bookmarks = await this.getBookmarks();
    return bookmarks.some(
      b => b.book === book && b.part === part && b.section === section
    );
  }

  // Clear all cache
  async clearCache() {
    return await CacheService.clearAll();
  }
}

// Export singleton instance
const ajewAPI = new AjewAPI();
export default ajewAPI;
