// screens/SmartFeedScreen.js — Daily feed: parsha, yahrzeits, recommendations
import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform, StatusBar, Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import StorageService from '../services/StorageService';

// Yahrzeit data — subset of chinuch yahrzeits
const YAHRZEITS = [
  { name: 'Rebbe Nachman of Breslov', hebrewName: 'ר׳ נחמן מברסלב', date: '18 Tishrei', hebrewDate: 'י״ח תשרי', bio: 'Founder of Breslov Chassidus. Author of Likutay Moharan, Sipurey Maasiyos, and more.' },
  { name: 'Reb Noson of Breslov', hebrewName: 'ר׳ נתן מברסלב', date: '10 Teves', hebrewDate: 'י׳ טבת', bio: 'Closest disciple of Rebbe Nachman. Author of Likutay Halachos, Likutey Tefilos, and more.' },
  { name: "Rabbi Shimon bar Yochai", hebrewName: "ר' שמעון בר יוחאי", date: '18 Iyar', hebrewDate: "י''ח אייר", bio: 'Author of the Zohar. Lag BaOmer.' },
  { name: 'The Baal Shem Tov', hebrewName: 'הבעל שם טוב', date: '6 Sivan', hebrewDate: 'ו׳ סיון', bio: 'Founder of Chassidus.' },
  { name: 'Saba Yisroel Dov Odesser', hebrewName: 'ר׳ ישראל דב אודסר', date: '8 Kislev', hebrewDate: 'ח׳ כסלו', bio: 'The Saba. Revealed the Petek. Beloved Na Nach tzaddik.' },
  { name: 'Rabbi Moshe Feinstein', hebrewName: 'ר׳ משה פיינשטיין', date: '13 Adar II', hebrewDate: 'י״ג אדר ב׳', bio: 'Posek HaDor. Said "Na Nach Nachma Nachman Meuman" is a wonderful thing.' },
  { name: 'The Holy Ari', hebrewName: 'האר״י הקדוש', date: '5 Av', hebrewDate: 'ה׳ אב', bio: 'Rabbi Yitzchak Luria. Master of Kabbalah.' },
  { name: 'Reb Shimshon Barsky', hebrewName: 'ר׳ שמשון ברסקי', date: '28 Kislev', hebrewDate: 'כ״ח כסלו', bio: 'Grandson of Reb Noson. Author of Eitzos HaMevoaros.' },
];

// Parsha list
const PARSHAS = [
  'Bereishis', 'Noach', 'Lech Lecha', 'Vayeira', 'Chayei Sarah', 'Toldos',
  'Vayeitzei', 'Vayishlach', 'Vayeishev', 'Mikeitz', 'Vayigash', 'Vayechi',
  'Shemos', 'Va\'eira', 'Bo', 'Beshalach', 'Yisro', 'Mishpatim',
  'Terumah', 'Tetzaveh', 'Ki Sisa', 'Vayakhel', 'Pekudei',
  'Vayikra', 'Tzav', 'Shemini', 'Tazria', 'Metzora', 'Acharei Mos',
  'Kedoshim', 'Emor', 'Behar', 'Bechukosai',
  'Bamidbar', 'Naso', 'Behaaloscha', 'Shelach', 'Korach', 'Chukas',
  'Balak', 'Pinchas', 'Matos', 'Masei',
  'Devarim', 'Vaeschanan', 'Eikev', 'Re\'eh', 'Shoftim', 'Ki Seitzei',
  'Ki Savo', 'Nitzavim', 'Vayeilech', 'Haazinu', 'Vezos Haberacha',
];

function getCurrentParsha() {
  // Simplified — returns based on approximate date mapping
  // In production, fetch from API or use hebcal
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  // Rough mapping: Parsha cycle starts around Simchas Torah (Tishrei)
  // This gives a reasonable approximation
  const parshaIndex = Math.floor((dayOfYear - 280) / 7) % PARSHAS.length;
  return PARSHAS[Math.max(0, Math.min(parshaIndex, PARSHAS.length - 1))];
}

function getUpcomingYahrzeits(daysAhead = 30) {
  // Simplified — in production, use proper Hebrew calendar
  return YAHRZEITS.slice(0, 3); // Return recent ones for now
}

function getRecommendedBooks() {
  return [
    { id: 'likutay-moharan', title: 'Likutay Moharan', hebrewTitle: 'ליקוטי מוהר״ן', icon: 'auto-stories', color: '#3498db', reason: 'Continue where you left off' },
    { id: 'sichos-haran', title: 'Sichos HaRan', hebrewTitle: 'שיחות הר״ן', icon: 'forum', color: '#2ecc71', reason: 'Daily wisdom' },
    { id: 'likutay-tefilos', title: 'Likutey Tefilos', hebrewTitle: 'ליקוטי תפילות', icon: 'favorite', color: '#e74c3c', reason: 'Powerful prayers' },
  ];
}

export default function SmartFeedScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState({ current: 0, best: 0 });
  const [lastRead, setLastRead] = useState([]);
  const [nanachCount, setNanachCount] = useState({ total: 0, today: 0 });

  const currentParsha = getCurrentParsha();
  const upcomingYahrzeits = getUpcomingYahrzeits();
  const recommended = getRecommendedBooks();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [st, lr, nc] = await Promise.all([
      StorageService.getStreak(),
      StorageService.getLastRead(),
      StorageService.getNanachCount(),
    ]);
    setStreak(st);
    setLastRead(lr);
    setNanachCount(nc);
    setLoading(false);
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Ajew Ananach — The complete Breslov library in your pocket.\nNa Nach Nachma Nachman Meuman!\nhttps://ajew.org',
      });
    } catch (_) {}
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Today's Feed</Text>
          <Text style={styles.headerDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        </View>
        <TouchableOpacity style={styles.shareAppBtn} onPress={handleShareApp}>
          <Icon name="share" size={20} color="#3498db" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#3498db" /></View>
      ) : (
        <ScrollView style={styles.flex1} contentContainerStyle={styles.content}>
          {/* Streak card */}
          <View style={styles.streakCard}>
            <Icon name="local-fire-department" size={32} color="#e74c3c" />
            <View style={styles.streakInfo}>
              <Text style={styles.streakValue}>{streak.current} Day Streak!</Text>
              <Text style={styles.streakSub}>Best: {streak.best} days | Na Nach: {nanachCount.total}</Text>
            </View>
          </View>

          {/* Continue reading */}
          {lastRead.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Continue Reading</Text>
              {lastRead.slice(0, 3).map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.continueCard}
                  onPress={() => navigation.navigate('Reading', {
                    book: item.bookId,
                    part: item.part,
                    sectionNumber: item.section,
                    bookTitle: item.bookTitle,
                    sectionTitle: item.sectionTitle,
                  })}
                >
                  <Icon name="auto-stories" size={20} color="#3498db" />
                  <View style={styles.flex1}>
                    <Text style={styles.continueTitle}>{item.bookTitle}</Text>
                    <Text style={styles.continueSection}>{item.sectionTitle}</Text>
                  </View>
                  <Icon name="play-arrow" size={20} color="#3498db" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Parsha */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>This Week's Parsha</Text>
            <TouchableOpacity style={styles.parshaCard}
              onPress={() => {
                // Navigate to parsha connections
              }}
            >
              <Text style={styles.parshaName}>{currentParsha}</Text>
              <Text style={styles.parshaSub}>
                Explore Breslov teachings connected to Parsha {currentParsha}
              </Text>
              <View style={styles.parshaLink}>
                <Text style={styles.parshaLinkText}>View Parsha Connections</Text>
                <Icon name="chevron-right" size={16} color="#3498db" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Yahrzeits */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Yahrzeits</Text>
            {upcomingYahrzeits.map((tzaddik, i) => (
              <TouchableOpacity key={i} style={styles.yahrzeitCard}
                onPress={() => {
                  // Navigate to tzaddik profile / teachings
                }}
              >
                <View style={styles.yahrzeitDate}>
                  <Text style={styles.yahrzeitDateHebrew}>{tzaddik.hebrewDate}</Text>
                  <Text style={styles.yahrzeitDateEn}>{tzaddik.date}</Text>
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.yahrzeitNameHebrew}>{tzaddik.hebrewName}</Text>
                  <Text style={styles.yahrzeitName}>{tzaddik.name}</Text>
                  <Text style={styles.yahrzeitBio} numberOfLines={2}>{tzaddik.bio}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              {[
                { icon: 'timer', label: 'Hisbodedus', color: '#27ae60', screen: 'Hisbodedus' },
                { icon: 'auto-awesome', label: 'Petek', color: '#e74c3c', screen: 'PetekGenerator' },
                { icon: 'headphones', label: 'Audio', color: '#9b59b6', screen: 'AudioPlayer' },
                { icon: 'star', label: 'Tikun', color: '#f39c12', screen: 'TikunHaKlali' },
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

          {/* Recommended */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended For You</Text>
            {recommended.map((book, i) => (
              <TouchableOpacity key={i} style={styles.recommendCard}
                onPress={() => navigation.navigate('BookDetail', { book })}
              >
                <View style={[styles.recommendIcon, { backgroundColor: book.color }]}>
                  <Icon name={book.icon} size={20} color="white" />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.recommendHebrew}>{book.hebrewTitle}</Text>
                  <Text style={styles.recommendTitle}>{book.title}</Text>
                  <Text style={styles.recommendReason}>{book.reason}</Text>
                </View>
                <Icon name="chevron-right" size={20} color="#bdc3c7" />
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 40 }} />
          <Text style={styles.branding}>נ נח נחמ נחמן מאומן</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  flex1: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 14, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#ecf0f1' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50' },
  headerDate: { fontSize: 13, color: '#7f8c8d', marginTop: 2 },
  shareAppBtn: { padding: 8 },
  content: { padding: 16, paddingBottom: 40 },

  // Streak
  streakCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff5f5', padding: 16, borderRadius: 12, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#e74c3c' },
  streakInfo: { marginLeft: 12, flex: 1 },
  streakValue: { fontSize: 18, fontWeight: 'bold', color: '#e74c3c' },
  streakSub: { fontSize: 12, color: '#7f8c8d', marginTop: 2 },

  // Sections
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#2c3e50', marginBottom: 10 },

  // Continue Reading
  continueCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 14, borderRadius: 10, marginBottom: 6, elevation: 1 },
  continueTitle: { fontSize: 14, fontWeight: '500', color: '#2c3e50' },
  continueSection: { fontSize: 12, color: '#7f8c8d', marginTop: 2 },

  // Parsha
  parshaCard: { backgroundColor: '#e8f4fd', padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#3498db' },
  parshaName: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50' },
  parshaSub: { fontSize: 13, color: '#555', marginTop: 4, marginBottom: 8 },
  parshaLink: { flexDirection: 'row', alignItems: 'center' },
  parshaLinkText: { fontSize: 13, color: '#3498db', fontWeight: '500' },

  // Yahrzeits
  yahrzeitCard: { flexDirection: 'row', backgroundColor: 'white', padding: 14, borderRadius: 10, marginBottom: 6, elevation: 1 },
  yahrzeitDate: { width: 60, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#f0f0f0', marginRight: 12, paddingRight: 12 },
  yahrzeitDateHebrew: { fontSize: 16, fontWeight: '600', color: '#2c3e50', writingDirection: 'rtl', textAlign: 'center' },
  yahrzeitDateEn: { fontSize: 11, color: '#7f8c8d', marginTop: 2 },
  yahrzeitNameHebrew: { fontSize: 16, fontWeight: '600', color: '#2c3e50', writingDirection: 'rtl', textAlign: 'right' },
  yahrzeitName: { fontSize: 13, color: '#555', marginTop: 1 },
  yahrzeitBio: { fontSize: 11, color: '#7f8c8d', marginTop: 2 },

  // Quick Actions
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: { width: '48%', backgroundColor: 'white', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 10, elevation: 1 },
  actionText: { fontSize: 13, fontWeight: '600', color: '#2c3e50', marginTop: 6 },

  // Recommended
  recommendCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 14, borderRadius: 10, marginBottom: 6, elevation: 1 },
  recommendIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  recommendHebrew: { fontSize: 15, fontWeight: '600', color: '#2c3e50', writingDirection: 'rtl', textAlign: 'right' },
  recommendTitle: { fontSize: 13, color: '#555', marginTop: 1 },
  recommendReason: { fontSize: 11, color: '#3498db', marginTop: 2 },

  branding: { textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: '#3498db', writingDirection: 'rtl' },
});
