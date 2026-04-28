import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { 
  SafeAreaView, 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  RefreshControl,
  FlatList,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

// API Configuration
const API_BASE_URL = 'https://ajew.org/api';
const SITE_BASE_URL = 'https://ajew.org';

// Sample data for demonstration (would come from API)
const SAMPLE_BOOKS = [
  { id: 1, title: 'Likutey Moharan', author: 'Rabbi Nachman', chapters: 282, color: '#3498db' },
  { id: 2, title: 'Likutey Halachos', author: 'Rabbi Natan', chapters: 600, color: '#2ecc71' },
  { id: 3, title: 'Likutey Tefilos', author: 'Rabbi Natan', chapters: 32, color: '#e74c3c' },
  { id: 4, title: 'Sichos HaRan', author: 'Rabbi Nachman', chapters: 229, color: '#f39c12' },
  { id: 5, title: 'Chayey Moharan', author: 'Rabbi Natan', chapters: 150, color: '#9b59b6' },
  { id: 6, title: 'Sefer Hamidos', author: 'Rabbi Nachman', chapters: 413, color: '#1abc9c' },
];

const SAMPLE_CHAPTERS = [
  { id: 1, bookId: 1, number: 1, title: 'The Importance of Joy', hebrewTitle: 'חשיבות השמחה' },
  { id: 2, bookId: 1, number: 2, title: 'The Power of Prayer', hebrewTitle: 'כוח התפילה' },
  { id: 3, bookId: 1, number: 3, title: 'Overcoming Sadness', hebrewTitle: 'התגברות על עצבות' },
  { id: 4, bookId: 2, number: 1, title: 'Laws of Prayer', hebrewTitle: 'הלכות תפילה' },
  { id: 5, bookId: 2, number: 2, title: 'Laws of Shabbat', hebrewTitle: 'הלכות שבת' },
];

// Home Screen
function HomeScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [featuredContent, setFeaturedContent] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setFeaturedContent(SAMPLE_BOOKS.slice(0, 3));
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderBookCard = ({ item }) => (
    <TouchableOpacity 
      style={[styles.bookCard, { backgroundColor: item.color }]}
      onPress={() => navigation.navigate('BookDetail', { book: item })}
    >
      <Text style={styles.bookTitle}>{item.title}</Text>
      <Text style={styles.bookAuthor}>{item.author}</Text>
      <View style={styles.bookStats}>
        <Icon name="menu-book" size={16} color="white" />
        <Text style={styles.bookStatsText}>{item.chapters} chapters</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>🦞 Ajew Ananach</Text>
            <Text style={styles.headerSubtitle}>Breslov Wisdom in Your Pocket</Text>
          </View>
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Icon name="search" size={24} color="#2c3e50" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.loadingText}>Loading wisdom...</Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Featured Works</Text>
              <FlatList
                horizontal
                data={featuredContent}
                renderItem={renderBookCard}
                keyExtractor={item => item.id.toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.bookList}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionsGrid}>
                <TouchableOpacity 
                  style={styles.actionCard}
                  onPress={() => navigation.navigate('Browse')}
                >
                  <Icon name="library-books" size={32} color="#3498db" />
                  <Text style={styles.actionText}>Browse Library</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionCard}
                  onPress={() => navigation.navigate('DailyWisdom')}
                >
                  <Icon name="lightbulb" size={32} color="#f39c12" />
                  <Text style={styles.actionText}>Daily Wisdom</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionCard}
                  onPress={() => navigation.navigate('Search')}
                >
                  <Icon name="search" size={32} color="#2ecc71" />
                  <Text style={styles.actionText}>Search</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionCard}
                  onPress={() => navigation.navigate('Bookmarks')}
                >
                  <Icon name="bookmark" size={32} color="#9b59b6" />
                  <Text style={styles.actionText}>Bookmarks</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Reading</Text>
              <TouchableOpacity style={styles.recentCard}>
                <Icon name="history" size={24} color="#7f8c8d" />
                <View style={styles.recentContent}>
                  <Text style={styles.recentTitle}>Likutey Moharan 1:1</Text>
                  <Text style={styles.recentSubtitle}>The Importance of Joy</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#bdc3c7" />
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Connected to ajew.org</Text>
              <Text style={styles.footerSubtext}>1,000+ chapters available</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Browse Screen
function BrowseScreen({ navigation }) {
  const [books, setBooks] = useState(SAMPLE_BOOKS);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Works' },
    { id: 'nachman', label: 'Rabbi Nachman' },
    { id: 'natan', label: 'Rabbi Natan' },
    { id: 'prayers', label: 'Prayers' },
  ];

  const renderBookItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.browseBookCard}
      onPress={() => navigation.navigate('BookDetail', { book: item })}
    >
      <View style={[styles.bookColorIndicator, { backgroundColor: item.color }]} />
      <View style={styles.browseBookContent}>
        <Text style={styles.browseBookTitle}>{item.title}</Text>
        <Text style={styles.browseBookAuthor}>{item.author}</Text>
        <View style={styles.browseBookStats}>
          <Icon name="menu-book" size={14} color="#7f8c8d" />
          <Text style={styles.browseBookStatsText}>{item.chapters} chapters</Text>
        </View>
      </View>
      <Icon name="chevron-right" size={24} color="#bdc3c7" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.browseHeader}>
        <Text style={styles.browseTitle}>Browse Library</Text>
        <Text style={styles.browseSubtitle}>Explore Breslov teachings</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category.id && styles.categoryButtonTextActive
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.browseList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// Search Screen
function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Simulate API search
    setTimeout(() => {
      const results = SAMPLE_CHAPTERS.filter(chapter => 
        chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.hebrewTitle.includes(searchQuery)
      );
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity 
      style={styles.searchResultCard}
      onPress={() => navigation.navigate('ChapterDetail', { chapter: item })}
    >
      <View style={styles.searchResultContent}>
        <Text style={styles.searchResultTitle}>{item.title}</Text>
        <Text style={styles.searchResultHebrew}>{item.hebrewTitle}</Text>
        <Text style={styles.searchResultBook}>Book {item.bookId} • Chapter {item.number}</Text>
      </View>
      <Icon name="chevron-right" size={24} color="#bdc3c7" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={24} color="#7f8c8d" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search teachings..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color="#7f8c8d" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButtonLarge} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.searchResultsList}
        />
      ) : searchQuery ? (
        <View style={styles.emptyState}>
          <Icon name="search-off" size={64} color="#bdc3c7" />
          <Text style={styles.emptyStateTitle}>No results found</Text>
          <Text style={styles.emptyStateText}>Try different keywords</Text>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Icon name="search" size={64} color="#bdc3c7" />
          <Text style={styles.emptyStateTitle}>Search Breslov Teachings</Text>
          <Text style={styles.emptyStateText}>Enter keywords in Hebrew or English</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// Bookmarks Screen
function BookmarksScreen() {
  const [bookmarks, setBookmarks] = useState([]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bookmarksHeader}>
        <Text style={styles.bookmarksTitle}>Bookmarks</Text>
        <Text style={styles.bookmarksSubtitle}>Your saved teachings</Text>
      </View>

      {bookmarks.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="bookmark-border" size={64} color="#bdc3c7" />
          <Text style={styles.emptyStateTitle}>No bookmarks yet</Text>
          <Text style={styles.emptyStateText}>Save teachings to read later</Text>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          renderItem={({ item }) => (
            <View style={styles.bookmarkCard}>
              <Text style={styles.bookmarkTitle}>{item.title}</Text>
              <Text style={styles.bookmarkSubtitle}>{item.book}</Text>
            </View>
          )}
          keyExtractor={item => item.id.toString()}
        />
      )}
    </SafeAreaView>
  );
}

// Settings Screen
function SettingsScreen({ navigation }) {
  const [language, setLanguage] = useState('english');
  const [fontSize, setFontSize] = useState('medium');
  const [darkMode, setDarkMode] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.settingsHeader}>
        <Text style={styles.settingsTitle}>Settings</Text>
        <Text style={styles.settingsSubtitle}>Customize your experience</Text>
      </View>

      <ScrollView style={styles.settingsScroll}>
        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>Display</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Language</Text>
            <View style={styles.settingOptions}>
              <TouchableOpacity 
                style={[styles.settingOption, language === 'english' && styles.settingOptionActive]}
                onPress={() => setLanguage('english')}
              >
                <Text style={[styles.settingOptionText, language === 'english' && styles.settingOptionTextActive]}>
                  English
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.settingOption, language === 'hebrew' && styles.settingOptionActive]}
                onPress={() => setLanguage('hebrew')}
              >
                <Text style={[styles.settingOptionText, language === 'hebrew' && styles.settingOptionTextActive]}>
                  עברית
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Font Size</Text>
            <View style={styles.settingOptions}>
              {['small', 'medium', 'large'].map(size => (
                <TouchableOpacity 
                  key={size}
                  style={[styles.settingOption, fontSize === size && styles.settingOptionActive]}
                  onPress={() => setFontSize(size)}
                >
                  <Text style={[styles.settingOptionText, fontSize === size && styles.settingOptionTextActive]}>
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <TouchableOpacity 
                style={[styles.toggle, darkMode && styles.toggleActive]}
                onPress={() => setDarkMode(!darkMode)}
              >
                <View style={[styles.toggleCircle, darkMode && styles.toggleCircleActive]} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>About</Text>
          
          <TouchableOpacity style={styles.aboutItem}>
            <Icon name="info" size={24} color="#3498db" />
            <View style={styles.aboutContent}>
              <Text style={styles.aboutTitle}>App Version</Text>
              <Text style={styles.aboutSubtitle}>1.0.0</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#bdc3c7" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.aboutItem}>
            <Icon name="code" size={24} color="#2ecc71" />
            <View style={styles.aboutContent}>
              <Text style={styles.aboutTitle}>Source Code</Text>
              <Text style={styles.aboutSubtitle}>GitHub Repository</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#bdc3c7" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.aboutItem}>
            <Icon name="public" size={24} color="#f39c12" />
            <View style={styles.aboutContent}>
              <Text style={styles.aboutTitle}>Website</Text>
              <Text style={styles.aboutSubtitle}>ajew.org</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#bdc3c7" />
          </TouchableOpacity>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>Support</Text>
          
          <TouchableOpacity style={styles.aboutItem}>
            <Icon name="email" size={24} color="#9b59b6" />
            <View style={styles.aboutContent}>
              <Text style={styles.aboutTitle}>Contact Us</Text>
              <Text style={styles.aboutSubtitle}>Send feedback</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#bdc3c7" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.aboutItem}>
            <Icon name="bug-report" size={24} color="#e74c3c" />
            <View style={styles.aboutContent}>
              <Text style={styles.aboutTitle}>Report Issue</Text>
              <Text style={styles.aboutSubtitle}>Found a bug?</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#bdc3c7" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive' }
          ])}
        >
          <Icon name="logout" size={24} color="#e74c3c" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Detail Screens (would be in separate files in production)
function BookDetailScreen({ route, navigation }) {
  const { book } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.bookDetailHeader, { backgroundColor: book.color }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.bookDetailHeaderContent}>
          <Text style={styles.bookDetailTitle}>{book.title}</Text>
          <Text style={styles.bookDetailAuthor}>{book.author}</Text>
        </View>
      </View>

      <ScrollView style={styles.bookDetailContent}>
        <View style={styles.bookStatsCard}>
          <View style={styles.bookStat}>
            <Icon name="menu-book" size={32} color={book.color} />
            <Text style={styles.bookStatNumber}>{book.chapters}</Text>
            <Text style={styles.bookStatLabel}>Chapters</Text>
          </View>
          <View style={styles.bookStat}>
            <Icon name="translate" size={32} color={book.color} />
            <Text style={styles.bookStatNumber}>2</Text>
            <Text style={styles.bookStatLabel}>Languages</Text>
          </View>
          <View style={styles.bookStat}>
            <Icon name="access-time" size={32} color={book.color} />
            <Text style={styles.bookStatNumber}>∞</Text>
            <Text style={styles.bookStatLabel}>Wisdom</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Book</Text>
          <Text style={styles.bookDescription}>
            {book.title} is one of the foundational works of Breslov Chassidus. 
            It contains deep insights and practical guidance for spiritual growth.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chapters</Text>
          {Array.from({ length: Math.min(10, book.chapters) }, (_, i) => i + 1).map(chapter => (
            <TouchableOpacity 
              key={chapter}
              style={styles.chapterItem}
              onPress={() => navigation.navigate('ChapterDetail', { 
                chapter: { 
                  id: chapter, 
                  bookId: book.id, 
                  number: chapter, 
                  title: `Chapter ${chapter}`,
                  hebrewTitle: `פרק ${chapter}`
                } 
              })}
            >
              <Text style={styles.chapterNumber}>Chapter {chapter}</Text>
              <Icon name="chevron-right" size={24} color="#bdc3c7" />
            </TouchableOpacity>
          ))}
          
          {book.chapters > 10 && (
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View all {book.chapters} chapters</Text>
              <Icon name="chevron-right" size={20} color="#3498db" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: book.color }]}>
            <Icon name="play-arrow" size={24} color="white" />
            <Text style={styles.actionButtonText}>Start Reading</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButtonOutline}>
            <Icon name="bookmark-border" size={24} color={book.color} />
            <Text style={[styles.actionButtonText, { color: book.color }]}>Bookmark</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ChapterDetailScreen({ route }) {
  const { chapter } = route.params;
  const [isHebrew, setIsHebrew] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.chapterHeader}>
        <Text style={styles.chapterTitle}>{chapter.title}</Text>
        <Text style={styles.chapterHebrewTitle}>{chapter.hebrewTitle}</Text>
      </View>

      <View style={styles.chapterControls}>
        <TouchableOpacity 
          style={[styles.languageButton, !isHebrew && styles.languageButtonActive]}
          onPress={() => setIsHebrew(false)}
        >
          <Text style={[styles.languageButtonText, !isHebrew && styles.languageButtonTextActive]}>
            English
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.languageButton, isHebrew && styles.languageButtonActive]}
          onPress={() => setIsHebrew(true)}
        >
          <Text style={[styles.languageButtonText, isHebrew && styles.languageButtonTextActive]}>
            עברית
          </Text>
        </TouchableOpacity>

        <View style={styles.fontSizeControls}>
          <TouchableOpacity onPress={() => setFontSize(Math.max(12, fontSize - 2))}>
            <Icon name="remove" size={24} color="#7f8c8d" />
          </TouchableOpacity>
          <Text style={styles.fontSizeText}>{fontSize}px</Text>
          <TouchableOpacity onPress={() => setFontSize(Math.min(24, fontSize + 2))}>
            <Icon name="add" size={24} color="#7f8c8d" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.chapterContent}>
        <Text style={[styles.chapterText, { fontSize }]}>
          {isHebrew ? (
            `זהו תוכן הפרק בעברית. כאן יופיע הטקסט המלא של ${chapter.hebrewTitle}. 
            הטקסט יגיע מה-API של ajew.org ויכיל את כל התוכן המקורי.`
          ) : (
            `This is the chapter content in English. Here will appear the full text of ${chapter.title}. 
            The text will come from the ajew.org API and contain all the original content with proper translation.`
          )}
        </Text>

        <Text style={[styles.chapterText, { fontSize }]}>
          {isHebrew ? (
            `התוכן כאן הוא דוגמה בלבד. באפליקציה המלאה, כל פרק יטען ישירות מהשרתים של ajew.org 
            עם אפשרות מעבר חלק בין שפות ושימור המיקום בקריאה.`
          ) : (
            `This content is for demonstration only. In the full app, each chapter will load directly 
            from the ajew.org servers with seamless language switching and reading position preservation.`
          )}
        </Text>
      </ScrollView>

      <View style={styles.chapterFooter}>
        <TouchableOpacity style={styles.navButton}>
          <Icon name="chevron-left" size={24} color="#3498db" />
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bookmarkButton}>
          <Icon name="bookmark-border" size={24} color="#f39c12" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonText}>Next</Text>
          <Icon name="chevron-right" size={24} color="#3498db" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function DailyWisdomScreen() {
  const [wisdom, setWisdom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call for daily wisdom
    setTimeout(() => {
      setWisdom({
        text: "The essence of wisdom is to realize that everything is from God, and to always seek to come closer to Him.",
        source: "Likutey Moharan 1:1",
        hebrew: "עיקר החכמה להכיר שהכל מהשם יתברך, ולחפש תמיד להתקרב אליו.",
        date: new Date().toLocaleDateString()
      });
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.dailyHeader}>
        <Text style={styles.dailyTitle}>Daily Wisdom</Text>
        <Text style={styles.dailySubtitle}>Your spiritual nourishment for today</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading wisdom...</Text>
        </View>
      ) : (
        <ScrollView style={styles.dailyContent}>
          <View style={styles.wisdomCard}>
            <View style={styles.wisdomHeader}>
              <Icon name="lightbulb" size={32} color="#f39c12" />
              <Text style={styles.wisdomDate}>{wisdom.date}</Text>
            </View>
            
            <Text style={styles.wisdomText}>{wisdom.text}</Text>
            <Text style={styles.wisdomHebrew}>{wisdom.hebrew}</Text>
            
            <View style={styles.wisdomSource}>
              <Icon name="menu-book" size={20} color="#7f8c8d" />
              <Text style={styles.wisdomSourceText}>{wisdom.source}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reflection Questions</Text>
            <View style={styles.questionCard}>
              <Text style={styles.question}>How can I apply this wisdom today?</Text>
            </View>
            <View style={styles.questionCard}>
              <Text style={styles.question}>What practical step can I take?</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Share This Wisdom</Text>
            <View style={styles.shareButtons}>
              <TouchableOpacity style={styles.shareButton}>
                <Icon name="share" size={24} color="#3498db" />
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareButton}>
                <Icon name="content-copy" size={24} color="#2ecc71" />
                <Text style={styles.shareButtonText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareButton}>
                <Icon name="bookmark-border" size={24} color="#f39c12" />
                <Text style={styles.shareButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// Navigation Setup
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home';
          } else if (route.name === 'Browse') {
            iconName = focused ? 'library-books' : 'library-books';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search';
          } else if (route.name === 'Bookmarks') {
            iconName = focused ? 'bookmark' : 'bookmark-border';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#7f8c8d',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopColor: '#ecf0f1',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Browse" component={BrowseScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Bookmarks" component={BookmarksScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="BookDetail" component={BookDetailScreen} />
        <Stack.Screen name="ChapterDetail" component={ChapterDetailScreen} />
        <Stack.Screen name="DailyWisdom" component={DailyWisdomScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  searchButton: {
    padding: 8,
  },
  // Section styles
  section: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  // Book card styles
  bookCard: {
    width: 200,
    padding: 20,
    borderRadius: 12,
    marginRight: 15,
    justifyContent: 'space-between',
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  bookAuthor: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 10,
  },
  bookStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  bookStatsText: {
    fontSize: 12,
    color: 'white',
    marginLeft: 5,
  },
  bookList: {
    paddingRight: 20,
  },
  // Actions grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 10,
  },
  // Recent card
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentContent: {
    flex: 1,
    marginLeft: 15,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  recentSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  // Footer
  footer: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 15,
  },
  // Browse styles
  browseHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  browseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  browseSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#3498db',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  browseList: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  browseBookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookColorIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 15,
  },
  browseBookContent: {
    flex: 1,
  },
  browseBookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  browseBookAuthor: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  browseBookStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  browseBookStatsText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 5,
  },
  // Search styles
  searchHeader: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
  },
  searchButtonLarge: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  searchResultsList: {
    padding: 20,
  },
  searchResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  searchResultHebrew: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  searchResultBook: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 5,
  },
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 20,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 8,
    textAlign: 'center',
  },
  // Bookmarks styles
  bookmarksHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  bookmarksTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  bookmarksSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  bookmarkCard: {
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookmarkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  bookmarkSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  // Settings styles
  settingsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  settingsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  settingsSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  settingsScroll: {
    padding: 20,
  },
  settingsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  settingItem: {
    marginBottom: 25,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  settingOption: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  settingOptionActive: {
    backgroundColor: '#3498db',
  },
  settingOptionText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  settingOptionTextActive: {
    color: 'white',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ecf0f1',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#3498db',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  toggleCircleActive: {
    transform: [{ translateX: 22 }],
  },
  aboutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  aboutContent: {
    flex: 1,
    marginLeft: 15,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  aboutSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e74c3c',
    marginLeft: 10,
  },
  // Book detail styles
  bookDetailHeader: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  bookDetailHeaderContent: {
    alignItems: 'center',
  },
  bookDetailTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  bookDetailAuthor: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 5,
    textAlign: 'center',
  },
  bookDetailContent: {
    padding: 20,
  },
  bookStatsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookStat: {
    alignItems: 'center',
  },
  bookStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 10,
  },
  bookStatLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  bookDescription: {
    fontSize: 16,
    color: '#34495e',
    lineHeight: 24,
  },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  chapterNumber: {
    fontSize: 16,
    color: '#2c3e50',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginTop: 10,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
    marginRight: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 30,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
  },
  actionButtonOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3498db',
    backgroundColor: 'transparent',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 10,
  },
  // Chapter detail styles
  chapterHeader: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  chapterTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  chapterHebrewTitle: {
    fontSize: 20,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 10,
  },
  chapterControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  languageButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  languageButtonActive: {
    backgroundColor: '#3498db',
  },
  languageButtonText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  languageButtonTextActive: {
    color: 'white',
  },
  fontSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  fontSizeText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'center',
  },
  chapterContent: {
    padding: 20,
  },
  chapterText: {
    fontSize: 16,
    color: '#34495e',
    lineHeight: 28,
    marginBottom: 20,
  },
  chapterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  navButtonText: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
    marginHorizontal: 5,
  },
  bookmarkButton: {
    padding: 10,
  },
  // Daily wisdom styles
  dailyHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  dailyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  dailySubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  dailyContent: {
    padding: 20,
  },
  wisdomCard: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wisdomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  wisdomDate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  wisdomText: {
    fontSize: 18,
    color: '#2c3e50',
    lineHeight: 28,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  wisdomHebrew: {
    fontSize: 16,
    color: '#34495e',
    lineHeight: 26,
    marginBottom: 20,
    textAlign: 'right',
  },
  wisdomSource: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  wisdomSourceText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 10,
  },
  questionCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  question: {
    fontSize: 16,
    color: '#2c3e50',
    fontStyle: 'italic',
  },
  shareButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    flex: 1,
    marginHorizontal: 5,
    justifyContent: 'center',
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 8,
  },
});