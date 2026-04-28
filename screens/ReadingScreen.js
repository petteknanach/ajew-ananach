// screens/ReadingScreen.js — Full reading experience with highlights, notes, swipe nav, progress
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, FlatList, Alert, Platform, StatusBar,
  Share, PanResponder, Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ajewAPI from '../AjewAPI';
import StorageService from '../services/StorageService';
import WHISPER_SERVICE from '../services/WhisperService';

// ── 11 Hebrew Fonts ──
const HEBREW_FONTS = [
  { label: 'System Default', value: 'System' },
  { label: 'Frank Ruhl Libre', value: 'FrankRuhlLibre' },
  { label: 'Taamey Frank CLM', value: 'TaameyFrankCLM' },
  { label: 'Keter YG', value: 'KeterYG' },
  { label: 'David Libre', value: 'DavidLibre' },
  { label: 'Noto Serif Hebrew', value: 'NotoSerifHebrew' },
  { label: 'Suez One', value: 'SuezOne' },
  { label: 'Drugulin CLM', value: 'DrugulinCLM' },
  { label: 'Shlomo Stam', value: 'ShlomoStam' },
  { label: 'Heebo', value: 'Heebo' },
  { label: 'Assistant', value: 'Assistant' },
  { label: 'Rubik', value: 'Rubik' },
];

const HIGHLIGHT_COLORS = ['#FFEB3B', '#FF9800', '#4CAF50', '#2196F3', '#E91E63', '#9C27B0'];

export default function ReadingScreen({ route, navigation }) {
  const {
    book, part, sectionNumber, sectionTitle, sectionType,
    bookTitle, bookHebrewTitle, allSections = [], introSections = [], currentIndex = 0,
  } = route.params;

  // ── State ──
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayMode, setDisplayMode] = useState('both');
  const [fontSize, setFontSize] = useState(18);
  const [hebrewFont, setHebrewFont] = useState('System');
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [highlights, setHighlights] = useState([]);
  const [notes, setNotes] = useState([]);
  const [showNotes, setShowNotes] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(new Animated.Value(0));
  const scrollRef = useRef(null);
  const panX = useRef(new Animated.Value(0)).current;

  // ── Load settings ──
  useEffect(() => {
    (async () => {
      const settings = await StorageService.getSettings();
      setDisplayMode(settings.displayMode || 'both');
      setFontSize(settings.fontSize || 18);
      setHebrewFont(settings.hebrewFont || 'System');
    })();
  }, []);

  // ── Load content ──
  const loadContent = useCallback(async (bookId, partNum, secNum, secType) => {
    setLoading(true);
    setError(null);
    setSearchQuery('');
    setShowSearch(false);

    let result;
    if (secType === 'haskamos' || secType === 'intro') {
      result = await ajewAPI.getSectionByUrl(
        `/reader/${bookId}/${partNum ? `part-${partNum}/` : ''}${secType === 'haskamos' ? 'haskamos' : 'intro'}.json`
      );
    }

    if (!result?.success) {
      result = await ajewAPI.getSectionContent(bookId, partNum, secNum);
    }

    if (result.success) {
      setContent(result.data);
      const bm = await ajewAPI.isBookmarked(bookId, partNum, secNum);
      setIsBookmarked(bm);

      // Load highlights
      const hl = await StorageService.getHighlights(bookId, partNum, secNum);
      setHighlights(hl);

      // Load notes for this book
      const n = await StorageService.getNotes(bookId);
      setNotes(n);

      // Save reading progress
      await StorageService.saveReadingProgress(
        bookId, partNum, secNum,
        bookTitle,
        content?.hebrewTitle || content?.title || sectionTitle || ''
      );
      await StorageService.recordDailyRead();
    } else {
      setError(result.error || 'Failed to load content');
    }
    setLoading(false);
  }, [bookTitle]);

  useEffect(() => {
    loadContent(book, part, sectionNumber, sectionType);
  }, [book, part, sectionNumber, sectionType, loadContent]);

  // ── Swipe gesture ──
  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) =>
      Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 20,
    onPanResponderMove: (_, gestureState) => {
      panX.setValue(gestureState.dx);
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > 80) {
        navigateSection(-1);
      } else if (gestureState.dx < -80) {
        navigateSection(1);
      }
      Animated.spring(panX, { toValue: 0, useNativeDriver: false }).start();
    },
  }), [currentIndex, content, allSections]);

  // ── Navigation ──
  const navigateSection = useCallback((direction) => {
    if (content?.navigation) {
      const nav = direction > 0 ? content.navigation.next : content.navigation.prev;
      const navUrl = direction > 0 ? content.navigation.nextUrl : content.navigation.prevUrl;
      if (nav && navUrl) {
        const urlParts = navUrl.split('/').filter(Boolean);
        const secNum = urlParts[urlParts.length - 1];
        const partNum = urlParts.length >= 4 ? urlParts[urlParts.length - 2] : part;
        navigation.replace('Reading', {
          ...route.params,
          sectionNumber: secNum, part: partNum,
          sectionType: null, currentIndex: currentIndex + direction,
        });
        return;
      }
    }
    const idx = currentIndex + direction;
    if (idx >= 0 && idx < allSections.length) {
      const sec = allSections[idx];
      navigation.replace('Reading', {
        ...route.params,
        sectionNumber: sec.number || sec.displayNumber,
        sectionTitle: sec.title || sec.hebrewTitle,
        sectionType: sec.type || null, currentIndex: idx,
      });
    }
  }, [content, currentIndex, allSections, navigation, route.params, part]);

  // ── Bookmarks ──
  const toggleBookmark = useCallback(async () => {
    if (isBookmarked) {
      await ajewAPI.removeBookmark(book, part, sectionNumber);
      setIsBookmarked(false);
    } else {
      await ajewAPI.addBookmark({
        book, part, section: sectionNumber, bookTitle, bookHebrewTitle,
        sectionTitle: content?.title || content?.hebrewTitle || sectionTitle,
      });
      setIsBookmarked(true);
    }
  }, [isBookmarked, book, part, sectionNumber, bookTitle, bookHebrewTitle, content, sectionTitle]);

  // ── Highlights ──
  const toggleHighlight = async (segmentIndex, text) => {
    const existing = highlights.find(h => h.segmentIndex === segmentIndex);
    if (existing) {
      const updated = await StorageService.removeHighlight(book, part, sectionNumber, segmentIndex);
      setHighlights(updated);
    } else {
      const updated = await StorageService.addHighlight(book, part, sectionNumber, segmentIndex, text);
      setHighlights(updated);
    }
  };

  const isHighlighted = (segmentIndex) => highlights.some(h => h.segmentIndex === segmentIndex);

  // ── Notes ──
  const addNote = async () => {
    if (!newNote.trim()) return;
    const updated = await StorageService.addNote(book, part, sectionNumber, newNote.trim());
    setNotes(updated);
    setNewNote('');
  };

  // ── Voice search ──
  const handleVoiceSearch = async () => {
    try {
      setIsListening(true);
      const text = await WHISPER_SERVICE.voiceSearch({
        language: 'he-IL',
        onPartial: (partial) => setSearchQuery(partial),
      });
      setSearchQuery(text);
    } catch (e) {
      Alert.alert('Voice', 'Voice search failed: ' + (e?.message || e));
    } finally {
      setIsListening(false);
    }
  };

  // ── Share ──
  const handleShare = useCallback(async () => {
    const title = content?.title || content?.hebrewTitle || sectionTitle || '';
    try {
      await Share.share({
        message: `${bookTitle} - ${title}\nhttps://ajew.org/reader/${book}/${part}/${sectionNumber}`,
      });
    } catch (_) {}
  }, [content, bookTitle, book, part, sectionNumber, sectionTitle]);

  // ── Save display settings ──
  const updateDisplayMode = async (mode) => {
    setDisplayMode(mode);
    await StorageService.saveSettings({ displayMode: mode });
  };

  const updateFontSize = async (size) => {
    setFontSize(size);
    await StorageService.saveSettings({ fontSize: size });
  };

  const updateHebrewFont = async (font) => {
    setHebrewFont(font);
    setShowFontPicker(false);
    await StorageService.saveSettings({ hebrewFont: font });
  };

  // ── Segment processing ──
  const segments = content?.segments || [];
  const filteredSegments = useMemo(() => {
    if (!searchQuery.trim()) return segments;
    return ajewAPI.searchInSegments(segments, searchQuery);
  }, [segments, searchQuery]);

  const hasEnglish = segments.some(s => s.en);
  const displayTitle = content?.hebrewTitle || content?.title || sectionTitle || '';

  const totalSections = introSections.length + allSections.length;
  const positionText = totalSections > 0
    ? `${currentIndex + 1} / ${totalSections}`
    : `${sectionNumber}`;

  // ── Render ──
  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
      {/* Top toolbar */}
      <View style={styles.readingToolbar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <View style={styles.readingToolbarCenter}>
          <Text style={styles.readingToolbarTitle} numberOfLines={1}>{displayTitle}</Text>
          <Text style={styles.readingToolbarSub} numberOfLines={1}>{bookTitle}</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setShowSearch(!showSearch)}>
          <Icon name="search" size={22} color="#2c3e50" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={handleVoiceSearch}>
          <Icon name={isListening ? "mic" : "mic-none"} size={22} color={isListening ? "#e74c3c" : "#2c3e50"} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={toggleBookmark}>
          <Icon name={isBookmarked ? 'bookmark' : 'bookmark-border'} size={22} color={isBookmarked ? '#f39c12' : '#2c3e50'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
          <Icon name="share" size={22} color="#2c3e50" />
        </TouchableOpacity>
      </View>

      {/* In-book search bar */}
      {showSearch && (
        <View style={styles.inBookSearch}>
          <Icon name="search" size={18} color="#7f8c8d" />
          <TextInput
            style={styles.inBookSearchInput}
            placeholder="Search in this section..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={18} color="#7f8c8d" />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={handleVoiceSearch}>
            <Icon name="mic" size={18} color={isListening ? "#e74c3c" : "#7f8c8d"} />
          </TouchableOpacity>
          <Text style={styles.inBookSearchCount}>{filteredSegments.length}/{segments.length}</Text>
        </View>
      )}

      {/* Display mode + font controls */}
      <View style={styles.readingControls}>
        <View style={styles.modeToggle}>
          {[
            { key: 'he', label: 'עב' },
            { key: 'both', label: 'Both' },
            { key: 'en', label: 'En' },
          ].map(mode => (
            <TouchableOpacity
              key={mode.key}
              style={[styles.modeBtn, displayMode === mode.key && styles.modeBtnActive]}
              onPress={() => updateDisplayMode(mode.key)}
              disabled={mode.key === 'en' && !hasEnglish}
            >
              <Text style={[styles.modeBtnText, displayMode === mode.key && styles.modeBtnTextActive,
                mode.key === 'en' && !hasEnglish && { color: '#ccc' }]}>
                {mode.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.fontControls}>
          <TouchableOpacity onPress={() => updateFontSize(Math.max(12, fontSize - 2))}>
            <Icon name="remove" size={20} color="#2c3e50" />
          </TouchableOpacity>
          <Text style={styles.fontSizeLabel}>{fontSize}</Text>
          <TouchableOpacity onPress={() => updateFontSize(Math.min(36, fontSize + 2))}>
            <Icon name="add" size={20} color="#2c3e50" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.fontPickerBtn} onPress={() => setShowFontPicker(!showFontPicker)}>
            <Icon name="text-fields" size={18} color="#2c3e50" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Font picker */}
      {showFontPicker && (
        <View style={styles.fontPickerDropdown}>
          <ScrollView style={{ maxHeight: 250 }}>
            {HEBREW_FONTS.map(font => (
              <TouchableOpacity
                key={font.value}
                style={[styles.fontOption, hebrewFont === font.value && styles.fontOptionActive]}
                onPress={() => updateHebrewFont(font)}
              >
                <Text style={[styles.fontOptionText, font.value !== 'System' && { fontFamily: font.value }]}>
                  {font.label}
                </Text>
                {hebrewFont === font.value && <Icon name="check" size={16} color="#3498db" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Content */}
      <Animated.View style={[styles.flex1, { transform: [{ translateX: panX }] }]} {...panResponder.panHandlers}>
        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color="#3498db" /><Text style={styles.loadingText}>Loading...</Text></View>
        ) : error ? (
          <View style={styles.center}>
            <Icon name="error" size={48} color="#e74c3c" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => loadContent(book, part, sectionNumber, sectionType)}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            style={styles.flex1}
            contentContainerStyle={styles.readingContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Key verse */}
            {content?.keyVerse && (
              <View style={styles.keyVerseBox}>
                <Text style={[styles.keyVerseText, { fontFamily: hebrewFont === 'System' ? undefined : hebrewFont, fontSize: fontSize + 2 }]}>
                  {content.keyVerse}
                </Text>
                {content.keyVerseTranslation && <Text style={styles.keyVerseTranslation}>{content.keyVerseTranslation}</Text>}
                {content.keyVerseRef && <Text style={styles.keyVerseRef}>{content.keyVerseRef}</Text>}
              </View>
            )}

            {/* Segments with highlights */}
            {filteredSegments.map((seg, idx) => {
              const segIdx = seg.index || idx;
              const highlighted = isHighlighted(segIdx);
              return (
                <TouchableOpacity
                  key={segIdx}
                  style={[styles.segment, highlighted && { backgroundColor: '#FFFDE7', borderRadius: 8, padding: 8 }]}
                  onLongPress={() => {
                    const text = (seg.he_nikud || seg.he) + (seg.en ? '\n' + seg.en : '');
                    toggleHighlight(segIdx, text);
                  }}
                  activeOpacity={0.7}
                >
                  {(displayMode === 'he' || displayMode === 'both') && (
                    <Text style={[
                      styles.hebrewText,
                      { fontFamily: hebrewFont === 'System' ? undefined : hebrewFont, fontSize, lineHeight: fontSize * 1.8 },
                      highlighted && { backgroundColor: '#FFEB3B' },
                    ]}>
                      {seg.he_nikud || seg.he}
                    </Text>
                  )}
                  {(displayMode === 'en' || displayMode === 'both') && seg.en && (
                    <Text style={[styles.englishText, { fontSize: fontSize - 2, lineHeight: (fontSize - 2) * 1.6 }]}>
                      {seg.en}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}

            {filteredSegments.length === 0 && searchQuery && (
              <View style={styles.center}><Text style={styles.noResults}>No matches for "{searchQuery}"</Text></View>
            )}

            {/* Notes section */}
            <View style={styles.notesSection}>
              <TouchableOpacity
                style={styles.notesToggle}
                onPress={() => setShowNotes(!showNotes)}
              >
                <Icon name="edit-note" size={20} color="#7f8c8d" />
                <Text style={styles.notesToggleText}>
                  Notes ({notes.filter(n => n.section === sectionNumber).length})
                </Text>
                <Icon name={showNotes ? 'expand-less' : 'expand-more'} size={20} color="#7f8c8d" />
              </TouchableOpacity>
              {showNotes && (
                <View style={styles.notesBody}>
                  {notes.filter(n => n.section === sectionNumber).map((note, i) => (
                    <View key={i} style={styles.noteItem}>
                      <Text style={styles.noteText}>{note.text}</Text>
                      <Text style={styles.noteDate}>{new Date(note.timestamp).toLocaleDateString()}</Text>
                    </View>
                  ))}
                  <View style={styles.noteInput}>
                    <TextInput
                      style={styles.noteInputField}
                      placeholder="Add a note..."
                      value={newNote}
                      onChangeText={setNewNote}
                      multiline
                    />
                    <TouchableOpacity style={styles.noteAddBtn} onPress={addNote}>
                      <Icon name="send" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            <View style={{ height: 20 }} />
            <Text style={styles.swipeHint}>← Swipe to navigate →</Text>
            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </Animated.View>

      {/* Bottom navigation */}
      <View style={styles.readingNav}>
        <TouchableOpacity
          style={[styles.navBtn, (!content?.navigation?.prev && currentIndex <= 0) && styles.navBtnDisabled]}
          onPress={() => navigateSection(-1)}
          disabled={!content?.navigation?.prev && currentIndex <= 0}
        >
          <Icon name="chevron-left" size={24} color={(!content?.navigation?.prev && currentIndex <= 0) ? '#ddd' : '#2c3e50'} />
          <Text style={styles.navBtnText}>Prev</Text>
        </TouchableOpacity>
        <Text style={styles.navPosition}>{positionText}</Text>
        <TouchableOpacity
          style={[styles.navBtn, (!content?.navigation?.next && currentIndex >= allSections.length - 1) && styles.navBtnDisabled]}
          onPress={() => navigateSection(1)}
          disabled={!content?.navigation?.next && currentIndex >= allSections.length - 1}
        >
          <Text style={styles.navBtnText}>Next</Text>
          <Icon name="chevron-right" size={24} color={(!content?.navigation?.next && currentIndex >= allSections.length - 1) ? '#ddd' : '#2c3e50'} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Styles ──
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  flex1: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },

  // Toolbar
  readingToolbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#ecf0f1' },
  readingToolbarCenter: { flex: 1, marginHorizontal: 4 },
  readingToolbarTitle: { fontSize: 15, fontWeight: '600', color: '#2c3e50' },
  readingToolbarSub: { fontSize: 12, color: '#7f8c8d' },
  iconBtn: { padding: 8 },

  // In-book search
  inBookSearch: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#fff9e6', borderBottomWidth: 1, borderBottomColor: '#f5e6b8' },
  inBookSearchInput: { flex: 1, fontSize: 14, color: '#2c3e50', marginLeft: 8, padding: 0 },
  inBookSearchCount: { fontSize: 12, color: '#7f8c8d', marginLeft: 8 },

  // Reading controls
  readingControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#ecf0f1' },
  modeToggle: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderRadius: 8, overflow: 'hidden' },
  modeBtn: { paddingHorizontal: 14, paddingVertical: 6 },
  modeBtnActive: { backgroundColor: '#3498db' },
  modeBtnText: { fontSize: 13, color: '#555', fontWeight: '600' },
  modeBtnTextActive: { color: 'white' },
  fontControls: { flexDirection: 'row', alignItems: 'center' },
  fontSizeLabel: { fontSize: 14, color: '#2c3e50', marginHorizontal: 8, fontWeight: '600' },
  fontPickerBtn: { marginLeft: 10, padding: 4 },

  // Font picker
  fontPickerDropdown: { backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#ecf0f1', paddingHorizontal: 16 },
  fontOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  fontOptionActive: { backgroundColor: '#f0f7ff' },
  fontOptionText: { fontSize: 16, color: '#2c3e50' },

  // Reading content
  readingContent: { padding: 16, paddingBottom: 40 },
  keyVerseBox: { backgroundColor: '#f8f4e8', padding: 16, borderRadius: 10, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#f39c12' },
  keyVerseText: { color: '#2c3e50', writingDirection: 'rtl', textAlign: 'right' },
  keyVerseTranslation: { fontSize: 14, color: '#555', marginTop: 8, fontStyle: 'italic' },
  keyVerseRef: { fontSize: 12, color: '#7f8c8d', marginTop: 4 },
  segment: { marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5', paddingBottom: 16 },
  hebrewText: { color: '#2c3e50', writingDirection: 'rtl', textAlign: 'right' },
  englishText: { color: '#444', marginTop: 10 },

  // Notes
  notesSection: { marginTop: 20, backgroundColor: 'white', borderRadius: 10, padding: 12, elevation: 1 },
  notesToggle: { flexDirection: 'row', alignItems: 'center' },
  notesToggleText: { flex: 1, fontSize: 14, color: '#7f8c8d', marginLeft: 8 },
  notesBody: { marginTop: 10 },
  noteItem: { backgroundColor: '#f8f9fa', padding: 10, borderRadius: 8, marginBottom: 8 },
  noteText: { fontSize: 14, color: '#2c3e50' },
  noteDate: { fontSize: 11, color: '#bdc3c7', marginTop: 4 },
  noteInput: { flexDirection: 'row', alignItems: 'flex-end' },
  noteInputField: { flex: 1, borderWidth: 1, borderColor: '#ecf0f1', borderRadius: 8, padding: 10, fontSize: 14, color: '#2c3e50', maxHeight: 100 },
  noteAddBtn: { backgroundColor: '#3498db', borderRadius: 20, width: 36, height: 36, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },

  // Loading/Error
  loadingText: { fontSize: 14, color: '#7f8c8d', marginTop: 12 },
  errorText: { fontSize: 14, color: '#e74c3c', textAlign: 'center', marginTop: 12, marginBottom: 16 },
  retryBtn: { backgroundColor: '#3498db', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryBtnText: { color: 'white', fontSize: 14, fontWeight: '600' },
  noResults: { fontSize: 15, color: '#7f8c8d', textAlign: 'center', marginTop: 12 },

  // Navigation
  readingNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#ecf0f1' },
  navBtn: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: { fontSize: 14, color: '#2c3e50', fontWeight: '500' },
  navPosition: { fontSize: 14, color: '#7f8c8d', fontWeight: '600' },
  swipeHint: { textAlign: 'center', fontSize: 11, color: '#ddd', marginTop: 10 },
});
