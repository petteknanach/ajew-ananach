// App.js — Ajew Ananach v1.1 — Comprehensive Breslov Torah mobile app
// Na Nach Nachma Nachman Meuman
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import {
  SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, FlatList, TextInput, Alert,
  StatusBar, Platform, Dimensions, Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ajewAPI from './AjewAPI';
import StorageService from './services/StorageService';

// Screen imports
import ReadingScreen from './screens/ReadingScreen';
import SettingsScreen from './screens/SettingsScreen';
import AudioPlayerScreen from './screens/AudioPlayerScreen';
import HisbodedusScreen from './screens/HisbodedusScreen';
import PetekGeneratorScreen from './screens/PetekGeneratorScreen';
import SmartFeedScreen from './screens/SmartFeedScreen';

// ── Constants ──
const TIKUN_HAKLALI_PSALMS = [16, 32, 41, 42, 59, 77, 90, 105, 137, 150];

const TIKUN_HAKLALI_DATA = {
  before: [
    { title: 'Hiskashrus', hebrewTitle: 'הריני מקשר', content: 'הריני מקשר את עצמי באמירת העשרה מזמורי תהלים אלו לכל הצדיקים האמיתיים שבדורנו, ולכל הצדיקים האמיתיים שוכני עפר — קדושים אשר בארץ המה — ובפרט לרבינו הקדוש והנורא, מורנו ורבינו, נחל נובע מקור חכמה, רבי נחמן בן פיגא, זכותו יגן עלינו. אמן.' },
    { title: 'Connection to Tzaddikim', hebrewTitle: 'התקשרות לצדיקים', content: 'הריני מקשר את עצמי לכל הצדיקים האמיתיים שוכני עפר, קדושים אשר בארץ המה, ובפרט לרבינו הקדוש רבי נחמן בן פיגא, זכותו יגן עלינו ועל כל ישראל. אמן.' },
    { title: 'Opening', hebrewTitle: 'פתיחה', content: 'הריני מזמן את פי להודות ולהלל ולשבח את בוראי, לעשות נחת רוח לפניו יתברך.' },
    { title: 'Psalm 95', hebrewTitle: 'לכו נרננה', content: 'לְכוּ נְרַנְּנָה לַה\' נָרִיעָה לְצוּר יִשְׁעֵנוּ. נְקַדְּמָה פָנָיו בְּתוֹדָה בִּזְמִרוֹת נָרִיעַ לוֹ. כִּי אֵל גָּדוֹל ה\' וּמֶלֶךְ גָּדוֹל עַל כָּל אֱלֹהִים.' },
  ],
  after: [
    { title: 'Closing Prayer', hebrewTitle: 'תפילת סיום', content: 'מִי יִתֵּן מִצִּיּוֹן יְשׁוּעַת יִשְׂרָאֵל, בְּשׁוּב ה\' שְׁבוּת עַמּוֹ, יָגֵל יַעֲקֹב יִשְׂמַח יִשְׂרָאֵל. וּתְשׁוּעַת צַדִּיקִים מֵה\', מָעוּזָם בְּעֵת צָרָה.' },
  ],
};

// ── HomeScreen ──
function HomeScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [featuredContent, setFeaturedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRead, setLastRead] = useState([]);
  const [streak, setStreak] = useState({ current: 0, best: 0 });
  const [nanachCount, setNanachCount] = useState({ total: 0, today: 0 });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [result, lr, st, nc] = await Promise.all([
        ajewAPI.getBooks(),
        StorageService.getLastRead(),
        StorageService.getStreak(),
        StorageService.getNanachCount(),
      ]);
      if (result.success) {
        setFeaturedContent(result.data.slice(0, 6));
        setError(null);
      } else {
        setError(result.error || 'Failed to load data');
      }
      setLastRead(lr);
      setStreak(st);
      setNanachCount(nc);
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      StorageService.getLastRead().then(setLastRead);
      StorageService.getStreak().then(setStreak);
      StorageService.getNanachCount().then(setNanachCount);
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => { setRefreshing(true); loadData(); }, [loadData]);

  const renderBookCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.bookCard, { backgroundColor: item.color || '#3498db' }]}
      onPress={() => navigation.navigate('BookDetail', { book: item })}
    >
      <Text style={styles.bookCardHebrew}>{item.hebrewTitle}</Text>
      <Text style={styles.bookCardTitle}>{item.title}</Text>
      <Text style={styles.bookCardAuthor}>{item.author}</Text>
      <View style={styles.bookCardStats}>
        <Icon name="menu-book" size={14} color="rgba(255,255,255,0.8)" />
        <Text style={styles.bookCardStatsText}>{item.chapters} sections</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header with streak badge */}
        <View style={styles.homeHeader}>
          <View style={styles.flex1}>
            <Text style={styles.homeTitle}>Ajew Ananach</Text>
            <Text style={styles.homeSubtitle}>Breslov Wisdom in Your Pocket</Text>
          </View>
          <View style={styles.headerBadges}>
            {streak.current > 0 && (
              <View style={styles.streakBadge}>
                <Icon name="local-fire-department" size={14} color="#e74c3c" />
                <Text style={styles.streakBadgeText}>{streak.current}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('SmartFeedTab')}>
              <Icon name="auto-awesome" size={24} color="#f39c12" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('SearchTab')}>
              <Icon name="search" size={24} color="#2c3e50" />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color="#3498db" /><Text style={styles.loadingText}>Loading library...</Text></View>
        ) : error ? (
          <View style={styles.center}>
            <Icon name="cloud-off" size={48} color="#e74c3c" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadData}><Text style={styles.retryBtnText}>Retry</Text></TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Continue Reading */}
            {lastRead.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Continue Reading</Text>
                {lastRead.slice(0, 2).map((item, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.continueCard}
                    onPress={() => navigation.navigate('Reading', {
                      book: item.bookId, part: item.part,
                      sectionNumber: item.section, bookTitle: item.bookTitle,
                      sectionTitle: item.sectionTitle, allSections: [], introSections: [], currentIndex: 0,
                    })}
                  >
                    <Icon name="auto-stories" size={20} color="#3498db" />
                    <View style={styles.flex1}>
                      <Text style={styles.continueTitle} numberOfLines={1}>{item.bookTitle}</Text>
                      <Text style={styles.continueSection} numberOfLines={1}>{item.sectionTitle}</Text>
                    </View>
                    <Icon name="play-arrow" size={20} color="#3498db" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Featured Books */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Featured Works</Text>
              <FlatList
                horizontal
                data={featuredContent}
                renderItem={renderBookCard}
                keyExtractor={item => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
              />
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionsGrid}>
                {[
                  { icon: 'library-books', label: 'Browse', color: '#3498db', screen: 'BrowseTab' },
                  { icon: 'auto-awesome', label: 'Daily Feed', color: '#f39c12', screen: 'SmartFeedTab' },
                  { icon: 'timer', label: 'Hisbodedus', color: '#27ae60', screen: 'Hisbodedus' },
                  { icon: 'headphones', label: 'Audio', color: '#9b59b6', screen: 'AudioPlayer' },
                  { icon: 'auto-stories', label: 'Tikun HaKlali', color: '#e74c3c', screen: 'TikunHaKlali' },
                  { icon: 'star', label: 'Petek', color: '#c0392b', screen: 'PetekGenerator' },
                  { icon: 'bookmark', label: 'Bookmarks', color: '#9b59b6', screen: 'BookmarksTab' },
                  { icon: 'settings', label: 'Settings', color: '#7f8c8d', screen: 'Settings' },
                ].map((action, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.actionCard}
                    onPress={() => navigation.navigate(action.screen)}
                  >
                    <Icon name={action.icon} size={28} color={action.color} />
                    <Text style={styles.actionText}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── BrowseScreen ──
function BrowseScreen({ navigation }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const result = await ajewAPI.getBooks();
        if (result.success) { setBooks(result.data); setError(null); }
        else setError(result.error || 'Failed to load');
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(() => ajewAPI.searchBooks(books, searchQuery), [books, searchQuery]);

  const renderBookItem = ({ item }) => (
    <TouchableOpacity
      style={styles.browseBookCard}
      onPress={() => navigation.navigate('BookDetail', { book: item })}
    >
      <View style={[styles.bookColorBar, { backgroundColor: item.color || '#3498db' }]} />
      <View style={styles.flex1}>
        <Text style={styles.browseBookHebrew}>{item.hebrewTitle}</Text>
        <Text style={styles.browseBookTitle}>{item.title}</Text>
        <Text style={styles.browseBookAuthor}>{item.author}</Text>
      </View>
      <View style={styles.browseBookRight}>
        <Text style={styles.browseBookCount}>{item.chapters}</Text>
        <Icon name="chevron-right" size={20} color="#bdc3c7" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenHeaderTitle}>Browse Library</Text>
        <Text style={styles.screenHeaderSub}>{filtered.length} works</Text>
      </View>
      <View style={styles.searchBarContainer}>
        <Icon name="search" size={20} color="#7f8c8d" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search books..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}><Icon name="close" size={20} color="#7f8c8d" /></TouchableOpacity>
        ) : null}
      </View>
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#3498db" /></View>
      ) : error ? (
        <View style={styles.center}><Icon name="error" size={48} color="#e74c3c" /><Text style={styles.errorText}>{error}</Text></View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderBookItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

// ── BookDetailScreen ──
function BookDetailScreen({ route, navigation }) {
  const { book } = route.params;
  const [selectedPart, setSelectedPart] = useState(null);
  const [indexData, setIndexData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const parts = book.parts || [];

  useEffect(() => {
    if (parts.length > 0) loadPart(parts[0]);
  }, []);

  const loadPart = async (part) => {
    setSelectedPart(part);
    setLoading(true);
    setError(null);
    try {
      const result = await ajewAPI.getBookIndex(part.indexUrl);
      if (result.success) { setIndexData(result.data); }
      else { setError(result.error || 'Failed to load chapters'); }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const onSectionPress = (section, index) => {
    navigation.navigate('Reading', {
      book: book.id, part: selectedPart?.part, sectionNumber: section.number || section.displayNumber,
      sectionTitle: section.title || section.hebrewTitle, sectionType: section.type,
      bookTitle: book.title, bookHebrewTitle: book.hebrewTitle,
      allSections: indexData?.torahs || [], introSections: indexData?.introSections || [],
      currentIndex: index,
      sectionUrl: section.url,
    });
  };

  const renderSection = ({ item, index }) => (
    <TouchableOpacity style={styles.sectionCard} onPress={() => onSectionPress(item, index)}>
      <View style={[styles.sectionNumber, { backgroundColor: book.color || '#3498db' }]}>
        <Text style={styles.sectionNumberText}>{item.displayNumber || index + 1}</Text>
      </View>
      <View style={styles.flex1}>
        {item.hebrewTitle ? <Text style={styles.sectionHebrew}>{item.hebrewTitle}</Text> : null}
        {item.title ? <Text style={styles.sectionTitle} numberOfLines={1}>{item.title}</Text> : null}
        {item.themes && item.themes.length > 0 ? (
          <Text style={styles.sectionThemes} numberOfLines={1}>{item.themes.join(', ')}</Text>
        ) : null}
      </View>
      <View style={styles.sectionMeta}>
        {item.hasEnglish ? <Icon name="translate" size={14} color="#27ae60" /> : null}
        <Icon name="chevron-right" size={18} color="#bdc3c7" />
      </View>
    </TouchableOpacity>
  );

  const introSections = indexData?.introSections || [];
  const mainSections = indexData?.torahs || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.bookDetailHeader, { backgroundColor: book.color || '#3498db' }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.flex1}>
          <Text style={styles.bookDetailHebrew}>{book.hebrewTitle}</Text>
          <Text style={styles.bookDetailTitle}>{book.title}</Text>
          <Text style={styles.bookDetailAuthor}>{book.author}</Text>
        </View>
      </View>

      {parts.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.partSelector} contentContainerStyle={styles.partSelectorContent}>
          {parts.map((part) => (
            <TouchableOpacity
              key={`${part.part}-${part.title}`}
              style={[styles.partChip, selectedPart?.part === part.part && styles.partChipActive]}
              onPress={() => loadPart(part)}
            >
              <Text style={[styles.partChipText, selectedPart?.part === part.part && styles.partChipTextActive]}>
                {part.hebrewTitle || part.title}
              </Text>
              <Text style={[styles.partChipCount, selectedPart?.part === part.part && styles.partChipCountActive]}>
                {part.totalTorahs}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : null}

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={book.color || '#3498db'} /></View>
      ) : error ? (
        <View style={styles.center}>
          <Icon name="error" size={48} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => selectedPart && loadPart(selectedPart)}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={[...introSections, ...mainSections]}
          renderItem={renderSection}
          keyExtractor={(item, idx) => `${item.url || ''}-${idx}`}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            selectedPart ? (
              <Text style={styles.listHeader}>{selectedPart.hebrewTitle || selectedPart.title} - {selectedPart.totalTorahs} sections</Text>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

// ── SearchScreen ──
function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const result = await ajewAPI.getBooks();
      if (result.success) setBooks(result.data);
      setLoading(false);
    })();
  }, []);

  const results = useMemo(() => ajewAPI.searchBooks(books, query), [books, query]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenHeaderTitle}>Search</Text>
      </View>
      <View style={styles.searchBarContainer}>
        <Icon name="search" size={20} color="#7f8c8d" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search books, authors, Hebrew titles..."
          value={query}
          onChangeText={setQuery}
          autoFocus
          returnKeyType="search"
        />
        {query ? (
          <TouchableOpacity onPress={() => setQuery('')}><Icon name="close" size={20} color="#7f8c8d" /></TouchableOpacity>
        ) : null}
      </View>
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#3498db" /></View>
      ) : !query ? (
        <View style={styles.center}>
          <Icon name="search" size={64} color="#ecf0f1" />
          <Text style={styles.placeholderText}>Type to search across all books</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.center}>
          <Icon name="search-off" size={48} color="#bdc3c7" />
          <Text style={styles.noResults}>No results for "{query}"</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listPadding}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.browseBookCard} onPress={() => navigation.navigate('BookDetail', { book: item })}>
              <View style={[styles.bookColorBar, { backgroundColor: item.color || '#3498db' }]} />
              <View style={styles.flex1}>
                <Text style={styles.browseBookHebrew}>{item.hebrewTitle}</Text>
                <Text style={styles.browseBookTitle}>{item.title}</Text>
                <Text style={styles.browseBookAuthor}>{item.author}</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#bdc3c7" />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

// ── DailyWisdomScreen ──
function DailyWisdomScreen() {
  const wisdom = useMemo(() => ajewAPI.getDailyWisdom().data, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.wisdomContainer}>
        <View style={styles.wisdomCard}>
          <Text style={styles.wisdomDate}>{wisdom.date}</Text>
          <Text style={styles.wisdomHebrewTitle}>{wisdom.hebrewTitle}</Text>
          <Text style={styles.wisdomTitle}>{wisdom.title}</Text>
          <View style={styles.wisdomDivider} />
          <Text style={styles.wisdomContent}>{wisdom.content}</Text>
          <Text style={styles.wisdomSource}>{wisdom.source}</Text>
        </View>
        <TouchableOpacity style={styles.wisdomShareBtn} onPress={() => {
          Share.share({ message: `${wisdom.title}\n\n${wisdom.content}\n\n- ${wisdom.source}\n\nFrom Ajew Ananach app` });
        }}>
          <Icon name="share" size={20} color="white" />
          <Text style={styles.wisdomShareText}>Share Today's Wisdom</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── BookmarksScreen ──
function BookmarksScreen({ navigation }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = useCallback(async () => {
    const bm = await ajewAPI.getBookmarks();
    setBookmarks(bm);
    setLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadBookmarks);
    return unsubscribe;
  }, [navigation, loadBookmarks]);

  const removeBookmark = async (bm) => {
    await ajewAPI.removeBookmark(bm.book, bm.part, bm.section);
    loadBookmarks();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenHeaderTitle}>Bookmarks</Text>
        <Text style={styles.screenHeaderSub}>{bookmarks.length} saved</Text>
      </View>
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#9b59b6" /></View>
      ) : bookmarks.length === 0 ? (
        <View style={styles.center}>
          <Icon name="bookmark-border" size={64} color="#ecf0f1" />
          <Text style={styles.placeholderText}>No bookmarks yet</Text>
          <Text style={styles.placeholderSubtext}>Tap the bookmark icon while reading to save sections</Text>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item, idx) => `${item.book}-${item.part}-${item.section}-${idx}`}
          contentContainerStyle={styles.listPadding}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.browseBookCard} onPress={() => navigation.navigate('Reading', {
              book: item.book, part: item.part, sectionNumber: item.section,
              bookTitle: item.bookTitle, bookHebrewTitle: item.bookHebrewTitle,
              sectionTitle: item.sectionTitle, allSections: [], introSections: [], currentIndex: 0,
            })}>
              <View style={styles.flex1}>
                <Text style={styles.browseBookTitle}>{item.bookTitle || item.book}</Text>
                <Text style={styles.browseBookAuthor}>{item.sectionTitle || `Section ${item.section}`}</Text>
                <Text style={styles.bookmarkDate}>{new Date(item.timestamp).toLocaleDateString()}</Text>
              </View>
              <TouchableOpacity style={styles.iconBtn} onPress={() => removeBookmark(item)}>
                <Icon name="delete" size={20} color="#e74c3c" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

// ── TikunHaKlaliScreen ──
function TikunHaKlaliScreen({ navigation }) {
  const [expandedBefore, setExpandedBefore] = useState([]);
  const [expandedAfter, setExpandedAfter] = useState([]);

  const toggleBefore = (idx) => setExpandedBefore(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  const toggleAfter = (idx) => setExpandedAfter(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.readingToolbar, { borderBottomWidth: 1, borderBottomColor: '#ecf0f1' }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <View style={styles.readingToolbarCenter}>
          <Text style={styles.readingToolbarTitle}>Tikun HaKlali</Text>
          <Text style={styles.readingToolbarSub}>The General Remedy</Text>
        </View>
      </View>
      <ScrollView style={styles.flex1} contentContainerStyle={styles.tikunContent}>
        <View style={styles.tikunIntro}>
          <Text style={styles.tikunIntroTitle}>The Ten Psalms</Text>
          <Text style={styles.tikunIntroText}>
            Rabbi Nachman of Breslov revealed that reciting these ten specific psalms constitutes a complete remedy (Tikun HaKlali) for spiritual blemishes. The ten psalms are: {TIKUN_HAKLALI_PSALMS.join(', ')}.
          </Text>
        </View>

        <Text style={styles.tikunSectionHeader}>Before Reciting</Text>
        {TIKUN_HAKLALI_DATA.before.map((item, idx) => (
          <View key={`before-${idx}`} style={styles.tikunCollapsible}>
            <TouchableOpacity style={styles.tikunCollapsibleHeader} onPress={() => toggleBefore(idx)}>
              <View>
                <Text style={styles.tikunCollapsibleHebrew}>{item.hebrewTitle}</Text>
                <Text style={styles.tikunCollapsibleTitle}>{item.title}</Text>
              </View>
              <Icon name={expandedBefore.includes(idx) ? 'expand-less' : 'expand-more'} size={24} color="#7f8c8d" />
            </TouchableOpacity>
            {expandedBefore.includes(idx) && (
              <View style={styles.tikunCollapsibleBody}>
                <Text style={styles.tikunCollapsibleText}>{item.content}</Text>
              </View>
            )}
          </View>
        ))}

        <Text style={styles.tikunSectionHeader}>The Ten Psalms</Text>
        {TIKUN_HAKLALI_PSALMS.map((psalmNum) => (
          <TouchableOpacity
            key={`psalm-${psalmNum}`}
            style={styles.tikunPsalmCard}
            onPress={() => navigation.navigate('Reading', {
              book: 'tehillim', part: 1, sectionNumber: psalmNum,
              bookTitle: 'Tehillim (Psalms)', bookHebrewTitle: 'תהלים',
              sectionTitle: `Psalm ${psalmNum}`, allSections: [], introSections: [], currentIndex: 0,
            })}
          >
            <View style={styles.tikunPsalmNumber}><Text style={styles.tikunPsalmNumberText}>{psalmNum}</Text></View>
            <Text style={styles.tikunPsalmLabel}>Psalm {psalmNum}</Text>
            <Icon name="chevron-right" size={20} color="#bdc3c7" />
          </TouchableOpacity>
        ))}

        <Text style={styles.tikunSectionHeader}>After Reciting</Text>
        {TIKUN_HAKLALI_DATA.after.map((item, idx) => (
          <View key={`after-${idx}`} style={styles.tikunCollapsible}>
            <TouchableOpacity style={styles.tikunCollapsibleHeader} onPress={() => toggleAfter(idx)}>
              <View>
                <Text style={styles.tikunCollapsibleHebrew}>{item.hebrewTitle}</Text>
                <Text style={styles.tikunCollapsibleTitle}>{item.title}</Text>
              </View>
              <Icon name={expandedAfter.includes(idx) ? 'expand-less' : 'expand-more'} size={24} color="#7f8c8d" />
            </TouchableOpacity>
            {expandedAfter.includes(idx) && (
              <View style={styles.tikunCollapsibleBody}>
                <Text style={styles.tikunCollapsibleText}>{item.content}</Text>
              </View>
            )}
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Navigation ──
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} />
      <Stack.Screen name="Reading" component={ReadingScreen} />
      <Stack.Screen name="TikunHaKlali" component={TikunHaKlaliScreen} />
      <Stack.Screen name="Hisbodedus" component={HisbodedusScreen} />
      <Stack.Screen name="PetekGenerator" component={PetekGeneratorScreen} />
      <Stack.Screen name="AudioPlayer" component={AudioPlayerScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

function BrowseStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BrowseMain" component={BrowseScreen} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} />
      <Stack.Screen name="Reading" component={ReadingScreen} />
    </Stack.Navigator>
  );
}

function SearchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchMain" component={SearchScreen} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} />
      <Stack.Screen name="Reading" component={ReadingScreen} />
    </Stack.Navigator>
  );
}

function BookmarksStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BookmarksMain" component={BookmarksScreen} />
      <Stack.Screen name="Reading" component={ReadingScreen} />
    </Stack.Navigator>
  );
}

function DailyWisdomStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DailyWisdomMain" component={DailyWisdomScreen} />
    </Stack.Navigator>
  );
}

function SmartFeedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SmartFeedMain" component={SmartFeedScreen} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} />
      <Stack.Screen name="Reading" component={ReadingScreen} />
      <Stack.Screen name="Hisbodedus" component={HisbodedusScreen} />
      <Stack.Screen name="PetekGenerator" component={PetekGeneratorScreen} />
      <Stack.Screen name="AudioPlayer" component={AudioPlayerScreen} />
      <Stack.Screen name="TikunHaKlali" component={TikunHaKlaliScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            const icons = {
              HomeTab: 'home',
              BrowseTab: 'library-books',
              SmartFeedTab: 'auto-awesome',
              SearchTab: 'search',
              DailyWisdomTab: 'lightbulb',
              BookmarksTab: 'bookmark',
            };
            return <Icon name={icons[route.name] || 'circle'} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#3498db',
          tabBarInactiveTintColor: '#7f8c8d',
          headerShown: false,
          tabBarStyle: { paddingBottom: Platform.OS === 'ios' ? 20 : 6, height: Platform.OS === 'ios' ? 84 : 60 },
          tabBarLabelStyle: { fontSize: 11 },
        })}
      >
        <Tab.Screen name="HomeTab" component={HomeStack} options={{ tabBarLabel: 'Home' }} />
        <Tab.Screen name="SmartFeedTab" component={SmartFeedStack} options={{ tabBarLabel: 'Feed' }} />
        <Tab.Screen name="BrowseTab" component={BrowseStack} options={{ tabBarLabel: 'Browse' }} />
        <Tab.Screen name="SearchTab" component={SearchStack} options={{ tabBarLabel: 'Search' }} />
        <Tab.Screen name="BookmarksTab" component={BookmarksStack} options={{ tabBarLabel: 'Saved' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ── Styles ──
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  flex1: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  listPadding: { paddingHorizontal: 16, paddingBottom: 20 },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 12 },

  // Home header
  homeHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#ecf0f1' },
  homeTitle: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50' },
  homeSubtitle: { fontSize: 13, color: '#7f8c8d', marginTop: 2 },
  headerBadges: { flexDirection: 'row', alignItems: 'center' },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff5f5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginRight: 4 },
  streakBadgeText: { fontSize: 12, fontWeight: 'bold', color: '#e74c3c', marginLeft: 3 },
  iconBtn: { padding: 8 },

  // Screen header
  screenHeader: { padding: 20, paddingBottom: 10, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#ecf0f1' },
  screenHeaderTitle: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50' },
  screenHeaderSub: { fontSize: 13, color: '#7f8c8d', marginTop: 2 },

  // Continue reading
  continueCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 14, borderRadius: 10, marginBottom: 6, elevation: 1 },
  continueTitle: { fontSize: 14, fontWeight: '500', color: '#2c3e50' },
  continueSection: { fontSize: 12, color: '#7f8c8d', marginTop: 2 },

  // Book cards
  bookCard: { width: 180, padding: 16, borderRadius: 12, marginRight: 12, justifyContent: 'space-between', minHeight: 130 },
  bookCardHebrew: { fontSize: 18, fontWeight: 'bold', color: 'white', writingDirection: 'rtl', textAlign: 'right' },
  bookCardTitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  bookCardAuthor: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  bookCardStats: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  bookCardStatsText: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginLeft: 4 },

  // Actions grid
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: { width: '23%', backgroundColor: 'white', padding: 12, borderRadius: 12, alignItems: 'center', marginBottom: 10, elevation: 1 },
  actionText: { fontSize: 11, fontWeight: '600', color: '#2c3e50', marginTop: 6, textAlign: 'center' },

  // Search bar
  searchBarContainer: { flexDirection: 'row', alignItems: 'center', margin: 16, marginTop: 10, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: 'white', borderRadius: 10, borderWidth: 1, borderColor: '#ecf0f1' },
  searchInput: { flex: 1, fontSize: 15, color: '#2c3e50', marginLeft: 8, padding: 0 },
  noResults: { fontSize: 15, color: '#7f8c8d', textAlign: 'center', marginTop: 12 },
  placeholderText: { fontSize: 16, color: '#bdc3c7', marginTop: 16 },
  placeholderSubtext: { fontSize: 13, color: '#ddd', marginTop: 6, textAlign: 'center', paddingHorizontal: 40 },

  // Browse book list
  browseBookCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 14, borderRadius: 10, marginBottom: 8, elevation: 1 },
  bookColorBar: { width: 4, height: 44, borderRadius: 2, marginRight: 12 },
  browseBookHebrew: { fontSize: 16, fontWeight: '600', color: '#2c3e50', writingDirection: 'rtl', textAlign: 'right' },
  browseBookTitle: { fontSize: 14, color: '#2c3e50', marginTop: 1 },
  browseBookAuthor: { fontSize: 12, color: '#7f8c8d', marginTop: 2 },
  browseBookRight: { alignItems: 'center', flexDirection: 'row', marginLeft: 8 },
  browseBookCount: { fontSize: 12, color: '#7f8c8d', marginRight: 4 },

  // Book detail
  bookDetailHeader: { padding: 20, paddingTop: 10, flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 12, padding: 4 },
  bookDetailHebrew: { fontSize: 22, fontWeight: 'bold', color: 'white', writingDirection: 'rtl', textAlign: 'right' },
  bookDetailTitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  bookDetailAuthor: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  // Part selector
  partSelector: { backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#ecf0f1' },
  partSelectorContent: { paddingHorizontal: 16, paddingVertical: 10 },
  partChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 8, flexDirection: 'row', alignItems: 'center' },
  partChipActive: { backgroundColor: '#3498db' },
  partChipText: { fontSize: 13, color: '#555', fontWeight: '500' },
  partChipTextActive: { color: 'white' },
  partChipCount: { fontSize: 11, color: '#999', marginLeft: 6, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  partChipCountActive: { color: 'rgba(255,255,255,0.9)', backgroundColor: 'rgba(255,255,255,0.2)' },

  // Section list
  listHeader: { fontSize: 14, color: '#7f8c8d', paddingHorizontal: 16, paddingVertical: 10 },
  sectionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 10, marginBottom: 6, elevation: 1 },
  sectionNumber: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  sectionNumberText: { fontSize: 14, fontWeight: 'bold', color: 'white' },
  sectionHebrew: { fontSize: 15, color: '#2c3e50', writingDirection: 'rtl', textAlign: 'right' },
  sectionTitle: { fontSize: 13, color: '#7f8c8d', marginTop: 1 },
  sectionThemes: { fontSize: 11, color: '#95a5a6', marginTop: 2 },
  sectionMeta: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },

  // Reading toolbar (shared)
  readingToolbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8, backgroundColor: 'white' },
  readingToolbarCenter: { flex: 1, marginHorizontal: 4 },
  readingToolbarTitle: { fontSize: 15, fontWeight: '600', color: '#2c3e50' },
  readingToolbarSub: { fontSize: 12, color: '#7f8c8d' },

  // Bookmarks
  bookmarkDate: { fontSize: 11, color: '#bdc3c7', marginTop: 2 },

  // Daily wisdom
  wisdomContainer: { padding: 20, justifyContent: 'center', flexGrow: 1 },
  wisdomCard: { backgroundColor: 'white', borderRadius: 16, padding: 24, elevation: 3 },
  wisdomDate: { fontSize: 12, color: '#7f8c8d', textAlign: 'center' },
  wisdomHebrewTitle: { fontSize: 28, fontWeight: 'bold', color: '#2c3e50', textAlign: 'center', marginTop: 10, writingDirection: 'rtl' },
  wisdomTitle: { fontSize: 18, color: '#555', textAlign: 'center', marginTop: 4 },
  wisdomDivider: { height: 2, backgroundColor: '#f39c12', width: 60, alignSelf: 'center', marginVertical: 20, borderRadius: 1 },
  wisdomContent: { fontSize: 17, color: '#2c3e50', lineHeight: 28, textAlign: 'center' },
  wisdomSource: { fontSize: 13, color: '#7f8c8d', textAlign: 'center', marginTop: 16, fontStyle: 'italic' },
  wisdomShareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3498db', paddingVertical: 14, borderRadius: 10, marginTop: 24 },
  wisdomShareText: { color: 'white', fontSize: 15, fontWeight: '600', marginLeft: 8 },

  // Tikun HaKlali
  tikunContent: { padding: 16, paddingBottom: 40 },
  tikunIntro: { backgroundColor: '#fff9e6', padding: 16, borderRadius: 12, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#e74c3c' },
  tikunIntroTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8 },
  tikunIntroText: { fontSize: 14, color: '#555', lineHeight: 22 },
  tikunSectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginTop: 16, marginBottom: 10, paddingHorizontal: 4 },
  tikunCollapsible: { backgroundColor: 'white', borderRadius: 10, marginBottom: 8, overflow: 'hidden', elevation: 1 },
  tikunCollapsibleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  tikunCollapsibleHebrew: { fontSize: 16, fontWeight: '600', color: '#2c3e50', writingDirection: 'rtl' },
  tikunCollapsibleTitle: { fontSize: 13, color: '#7f8c8d', marginTop: 2 },
  tikunCollapsibleBody: { paddingHorizontal: 14, paddingBottom: 14 },
  tikunCollapsibleText: { fontSize: 14, color: '#555', lineHeight: 22 },
  tikunPsalmCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 14, borderRadius: 10, marginBottom: 6, elevation: 1 },
  tikunPsalmNumber: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e74c3c', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  tikunPsalmNumberText: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  tikunPsalmLabel: { flex: 1, fontSize: 15, color: '#2c3e50', fontWeight: '500' },

  // Loading/Error
  loadingText: { fontSize: 14, color: '#7f8c8d', marginTop: 12 },
  errorText: { fontSize: 14, color: '#e74c3c', textAlign: 'center', marginTop: 12, marginBottom: 16 },
  retryBtn: { backgroundColor: '#3498db', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryBtnText: { color: 'white', fontSize: 14, fontWeight: '600' },
});
