// StorageService.js — Persistent storage layer for reading progress, settings, highlights
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  READING_PROGRESS: '@ajew_reading_progress',
  HIGHLIGHTS: '@ajew_highlights',
  NOTES: '@ajew_notes',
  SETTINGS: '@ajew_settings',
  STREAK: '@ajew_streak',
  NANACH_COUNT: '@ajew_nanach_count',
  OFFLINE_BOOKS: '@ajew_offline_books',
};

const StorageService = {
  // ── Reading Progress ──
  async getReadingProgress() {
    try {
      const raw = await AsyncStorage.getItem(KEYS.READING_PROGRESS);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  },

  async saveReadingProgress(bookId, partNum, sectionNum, bookTitle, sectionTitle) {
    try {
      const progress = await this.getReadingProgress();
      progress[bookId] = {
        part: partNum,
        section: sectionNum,
        bookTitle,
        sectionTitle,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(KEYS.READING_PROGRESS, JSON.stringify(progress));
      return progress;
    } catch { return {}; }
  },

  async getLastRead() {
    const progress = await this.getReadingProgress();
    const entries = Object.entries(progress)
      .sort(([, a], [, b]) => b.timestamp - a.timestamp);
    return entries.slice(0, 5).map(([bookId, data]) => ({ bookId, ...data }));
  },

  // ── Highlights ──
  async getHighlights(bookId, partNum, sectionNum) {
    try {
      const raw = await AsyncStorage.getItem(KEYS.HIGHLIGHTS);
      const all = raw ? JSON.parse(raw) : {};
      const key = `${bookId}_${partNum}_${sectionNum}`;
      return all[key] || [];
    } catch { return []; }
  },

  async addHighlight(bookId, partNum, sectionNum, segmentIndex, text, color = '#FFEB3B') {
    try {
      const raw = await AsyncStorage.getItem(KEYS.HIGHLIGHTS);
      const all = raw ? JSON.parse(raw) : {};
      const key = `${bookId}_${partNum}_${sectionNum}`;
      if (!all[key]) all[key] = [];
      // Prevent duplicates
      if (!all[key].find(h => h.segmentIndex === segmentIndex)) {
        all[key].push({ segmentIndex, text, color, timestamp: Date.now() });
      }
      await AsyncStorage.setItem(KEYS.HIGHLIGHTS, JSON.stringify(all));
      return all[key];
    } catch { return []; }
  },

  async removeHighlight(bookId, partNum, sectionNum, segmentIndex) {
    try {
      const raw = await AsyncStorage.getItem(KEYS.HIGHLIGHTS);
      const all = raw ? JSON.parse(raw) : {};
      const key = `${bookId}_${partNum}_${sectionNum}`;
      if (all[key]) {
        all[key] = all[key].filter(h => h.segmentIndex !== segmentIndex);
        await AsyncStorage.setItem(KEYS.HIGHLIGHTS, JSON.stringify(all));
      }
      return all[key] || [];
    } catch { return []; }
  },

  // ── Notes ──
  async getNotes(bookId) {
    try {
      const raw = await AsyncStorage.getItem(KEYS.NOTES);
      const all = raw ? JSON.parse(raw) : {};
      return all[bookId] || [];
    } catch { return []; }
  },

  async addNote(bookId, partNum, sectionNum, text, segmentIndex = null) {
    try {
      const raw = await AsyncStorage.getItem(KEYS.NOTES);
      const all = raw ? JSON.parse(raw) : {};
      if (!all[bookId]) all[bookId] = [];
      all[bookId].push({
        part: partNum,
        section: sectionNum,
        segmentIndex,
        text,
        timestamp: Date.now(),
      });
      await AsyncStorage.setItem(KEYS.NOTES, JSON.stringify(all));
      return all[bookId];
    } catch { return []; }
  },

  // ── Settings ──
  async getSettings() {
    try {
      const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
      return raw ? JSON.parse(raw) : {
        darkMode: false,
        fontSize: 18,
        hebrewFont: 'System',
        displayMode: 'both',
        uiLanguage: 'en',
        notificationsEnabled: true,
        yahrzeitNotifications: true,
      };
    } catch {
      return { darkMode: false, fontSize: 18, hebrewFont: 'System', displayMode: 'both', uiLanguage: 'en' };
    }
  },

  async saveSettings(settings) {
    try {
      const current = await this.getSettings();
      const merged = { ...current, ...settings };
      await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(merged));
      return merged;
    } catch { return settings; }
  },

  // ── Streak ──
  async getStreak() {
    try {
      const raw = await AsyncStorage.getItem(KEYS.STREAK);
      return raw ? JSON.parse(raw) : { current: 0, best: 0, lastDate: null };
    } catch { return { current: 0, best: 0, lastDate: null }; }
  },

  async recordDailyRead() {
    try {
      const streak = await this.getStreak();
      const today = new Date().toISOString().split('T')[0];
      if (streak.lastDate === today) return streak;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (streak.lastDate === yesterday) {
        streak.current += 1;
      } else {
        streak.current = 1;
      }
      streak.lastDate = today;
      if (streak.current > streak.best) streak.best = streak.current;
      await AsyncStorage.setItem(KEYS.STREAK, JSON.stringify(streak));
      return streak;
    } catch { return { current: 0, best: 0, lastDate: null }; }
  },

  // ── Nanach Counter ──
  async getNanachCount() {
    try {
      const raw = await AsyncStorage.getItem(KEYS.NANACH_COUNT);
      return raw ? JSON.parse(raw) : { total: 0, today: 0, date: null };
    } catch { return { total: 0, today: 0, date: null }; }
  },

  async incrementNanach() {
    try {
      const count = await this.getNanachCount();
      const today = new Date().toISOString().split('T')[0];
      if (count.date !== today) {
        count.today = 0;
        count.date = today;
      }
      count.total += 1;
      count.today += 1;
      await AsyncStorage.setItem(KEYS.NANACH_COUNT, JSON.stringify(count));
      return count;
    } catch { return { total: 0, today: 0, date: null }; }
  },

  // ── Offline Books ──
  async getOfflineBooks() {
    try {
      const raw = await AsyncStorage.getItem(KEYS.OFFLINE_BOOKS);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  },

  async saveOfflineBook(bookData) {
    try {
      const books = await this.getOfflineBooks();
      const existing = books.findIndex(b => b.book === bookData.book && b.part === bookData.part);
      if (existing >= 0) books[existing] = bookData;
      else books.push(bookData);
      await AsyncStorage.setItem(KEYS.OFFLINE_BOOKS, JSON.stringify(books));
      return books;
    } catch { return []; }
  },

  async removeOfflineBook(bookId, partNum) {
    try {
      const books = await this.getOfflineBooks();
      const filtered = books.filter(b => !(b.book === bookId && b.part === partNum));
      await AsyncStorage.setItem(KEYS.OFFLINE_BOOKS, JSON.stringify(filtered));
      return filtered;
    } catch { return []; }
  },

  async isOfflineAvailable(bookId, partNum) {
    const books = await this.getOfflineBooks();
    return books.some(b => b.book === bookId && (partNum === undefined || b.part === partNum));
  },
};

export { KEYS };
export default StorageService;
