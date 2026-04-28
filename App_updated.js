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

// Import our API service
import ajewAPI from './AjewAPI';

// Home Screen with API integration
function HomeScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [featuredContent, setFeaturedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setError(null);
      const result = await ajewAPI.getBooks();
      
      if (result.success) {
        // Take first 3 books as featured content
        setFeaturedContent(result.data.slice(0, 3));
      } else {
        setError(result.error || 'Failed to load books');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="error" size={48} color="#e74c3c" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadData}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Featured Works</Text>
              <FlatList
                horizontal
                data={featuredContent}
                renderItem={renderBookCard}
                keyExtractor={item => item.id}
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

            <View style={styles.footer}>
              <Text style={styles.footerText}>Connected to ajew.org API</Text>
              <Text style={styles.footerSubtext}>Using {ajewAPI.useMockData ? 'mock data' : 'live API'}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Browse Screen with API integration
function BrowseScreen({ navigation }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Works' },
    { id: 'nachman', label: 'Rabbi Nachman' },
    { id: 'natan', label: 'Rabbi Natan' },
    { id: 'prayers', label: 'Prayers' },
  ];

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setError(null);
      const result = await ajewAPI.getBooks();
      
      if (result.success) {
        setBooks(result.data);
      } else {
        setError(result.error || 'Failed to load books');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

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
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Browse Library</Text>
          <Text style={styles.headerSubtitle}>{books.length} works available</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading library...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="error" size={48} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadBooks}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
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
            keyExtractor={item => item.id}
            contentContainerStyle={styles.browseList}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </SafeAreaView>
  );
}

// Search Screen with Lunr.js integration
function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState(['joy', 'prayer', 'faith']);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const result = await ajewAPI.search(searchQuery, { limit: 10 });
      
      if (result.success) {
        setResults(result.data.results);
        
        // Add to recent searches if not already there
        if (!recentSearches.includes(searchQuery)) {
          setRecentSearches(prev => [searchQuery, ...prev.slice(0, 4)]);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Failed to perform search');
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = () => {
    performSearch(query);
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity 
      style={styles.searchResultCard}
      onPress={() => {
        if (item.type === 'book') {
          navigation.navigate('BookDetail', { book: { id: item.bookId, title: item.title, author: item.author } });
        }
      }}
    >
      <View style={styles.searchResultIcon}>
        <Icon 
          name={item.type === 'book' ? 'library-books' : 'menu-book'} 
          size={24} 
          color="#3498db" 
        />
      </View>
      <View style={styles.searchResultContent}>
        <Text style={styles.searchResultTitle}>{item.title}</Text>
        <Text style={styles.searchResultSubtitle}>
          {item.type === 'book' ? 'Book' : 'Chapter'} • {item.author || 'No author'}
        </Text>
        {item.score && (
          <Text style={styles.searchResultScore}>Relevance: {item.score.toFixed(2)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Search</Text>
          <Text style={styles.headerSubtitle}>Search across all Breslov works</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for teachings, topics, or authors..."
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Icon name="close" size={20} color="#7f8c8d" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity style={styles.searchButtonLarge} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {searching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderSearchResult}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.searchResultsList}
          ListHeaderComponent={
            <Text style={styles.resultsHeader}>
              {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
            </Text>
          }
        />
      ) : query.length > 0 ? (
        <View style={styles.noResultsContainer}>
          <Icon name="search-off" size={48} color="#bdc3c7" />
          <Text style={styles.noResultsText}>No results found for "{query}"</Text>
          <Text style={styles.noResultsSubtext}>Try different keywords or check spelling</Text>
        </View>
      ) : (
        <ScrollView style={styles.recentSearchesContainer}>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recentSearchItem}
              onPress={() => {
                setQuery(search);
                performSearch(search);
              }}
            >
              <Icon name="history" size={20} color="#7f8c8d" />
              <Text style={styles.recentSearchText}>{search}</Text>
              <Icon name="chevron-right" size={20} color="#bdc3c7" />
            </TouchableOpacity>
          ))}
          
          <Text style={styles.sectionTitle}>Search Tips</Text>
          <View style={styles.tipsContainer}>
            <View style={styles.tipItem}>
              <Icon name="lightbulb" size={20} color="#f39c12" />
              <Text style={styles.tipText}>Try searching in English or Hebrew</Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="lightbulb" size={20} color="#f39c12" />
              <Text style={styles.tipText}>Search by topic: joy, prayer, faith</Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="lightbulb" size={20} color="#f39c12" />
              <Text style={styles.tipText}>Search by author: Nachman, Natan</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// Daily Wisdom Screen
function DailyWisdomScreen({ navigation }) {
  const [wisdom, setWisdom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDailyWisdom();
  }, []);

  const loadDailyWisdom = async () => {
    try {
      setError(null);
      const result = await ajewAPI.getDailyWisdom();
      
      if (result.success) {
        setWisdom(result.data);
      } else {
        setError(result.error || 'Failed to load daily wisdom');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Daily Wisdom</Text>
          <Text style={styles.headerSubtitle}>Your daily dose of Breslov inspiration</Text>
        </View>
        <TouchableOpacity onPress={loadDailyWisdom}>
          <Icon name="refresh" size={24} color="#2c3e50" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading wisdom...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="error" size={48} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadDailyWisdom}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : wisdom && (
        <ScrollView style={styles.wisdomContainer}>
          <View style={styles.wisdomDateContainer}>
            <Icon name="today" size={20} color="#3498db" />
            <Text style={styles.wisdomDate}>{wisdom.date}</Text>
          </View>
          
          <Text style={