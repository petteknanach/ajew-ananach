// screens/AudioPlayerScreen.js — Full audio player for Kol HaTzadik recordings
import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, Platform, StatusBar, Slider,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AudioService from '../services/AudioService';

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

const DEFAULT_PLAYLISTS = [
  {
    id: 'likutay_moharan', title: 'Likutay Moharan', hebrewTitle: 'ליקוטי מוהר״ן',
    icon: 'auto-stories', color: '#3498db',
    description: 'Complete Likutay Moharan with English translation',
  },
  {
    id: 'sichos_haran', title: 'Sichos HaRan', hebrewTitle: 'שיחות הר״ן',
    icon: 'forum', color: '#2ecc71',
    description: 'Conversations and wisdom of Rebbe Nachman',
  },
  {
    id: 'sippurey_maasiyos', title: 'Sipurey Maasiyos', hebrewTitle: 'סיפורי מעשיות',
    icon: 'book', color: '#e74c3c',
    description: 'The legendary tales of Rebbe Nachman',
  },
  {
    id: 'sefer_hamidos', title: 'Sefer HaMidos', hebrewTitle: 'ספר המדות',
    icon: 'psychology', color: '#f39c12',
    description: 'The Book of Traits — wisdom on every topic',
  },
  {
    id: 'shivchay_haran', title: 'Shivchay HaRan', hebrewTitle: 'שבחי הר״ן',
    icon: 'star', color: '#9b59b6',
    description: 'Praises and stories of Rebbe Nachman',
  },
  {
    id: 'saba', title: 'Saba Recordings', hebrewTitle: 'הקלטות סבא',
    icon: 'person', color: '#e67e22',
    description: '58 recordings of Saba Yisroel Dov Odesser',
  },
];

export default function AudioPlayerScreen({ navigation }) {
  const [audioState, setAudioState] = useState(AudioService.getState());
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);

  useEffect(() => {
    const unsub = AudioService.addListener(setAudioState);
    AudioService.init();
    return unsub;
  }, []);

  const selectPlaylist = async (playlist) => {
    setSelectedPlaylist(playlist);
    setLoading(true);
    // Build tracks — in production, fetch from ajew.org API
    const tracks = [];
    for (let i = 1; i <= 20; i++) {
      tracks.push({
        title: `${playlist.title} — Part ${i}`,
        hebrewTitle: `${playlist.hebrewTitle} — חלק ${i}`,
        url: `https://archive.org/download/kol-hatzadik-${playlist.id}/track_${String(i).padStart(2, '0')}.mp3`,
      });
    }
    await AudioService.loadPlaylist(playlist.id, tracks);
    await AudioService.playTrack(0);
    setLoading(false);
  };

  const formatTime = (ms) => {
    if (!ms) return '0:00';
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${String(sec).padStart(2, '0')}`;
  };

  const {
    isPlaying, currentTrack, currentIndex, playlist,
    position, duration, playbackRate, hasNext, hasPrev,
  } = audioState;
  const progress = duration > 0 ? position / duration : 0;

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Audio</Text>
      </View>

      {!selectedPlaylist ? (
        /* Playlist Selection */
        <FlatList
          data={DEFAULT_PLAYLISTS}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.playlistCard} onPress={() => selectPlaylist(item)}>
              <View style={[styles.playlistIcon, { backgroundColor: item.color }]}>
                <Icon name={item.icon} size={28} color="white" />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.playlistHebrew}>{item.hebrewTitle}</Text>
                <Text style={styles.playlistTitle}>{item.title}</Text>
                <Text style={styles.playlistDesc}>{item.description}</Text>
              </View>
              <Icon name="play-circle-filled" size={32} color={item.color} />
            </TouchableOpacity>
          )}
        />
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading audio...</Text>
        </View>
      ) : (
        /* Player UI */
        <View style={styles.playerContainer}>
          {/* Album art placeholder */}
          <View style={styles.albumArt}>
            <Icon name="graphic-eq" size={120} color="#3498db" />
          </View>

          {/* Track info */}
          <View style={styles.trackInfo}>
            <Text style={styles.trackHebrew}>
              {currentTrack?.hebrewTitle || selectedPlaylist?.hebrewTitle}
            </Text>
            <Text style={styles.trackTitle} numberOfLines={1}>
              {currentTrack?.title || 'Select a track'}
            </Text>
            {currentTrack?.bookId && (
              <Text style={styles.trackBook}>{currentTrack.bookId}</Text>
            )}
          </View>

          {/* Progress bar */}
          <View style={styles.progressBar}>
            <Slider
              style={styles.slider}
              value={progress}
              onSlidingComplete={async (value) => {
                await AudioService.seek(value * duration);
              }}
              minimumTrackTintColor="#3498db"
              maximumTrackTintColor="#ecf0f1"
              thumbTintColor="#3498db"
            />
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity style={styles.controlBtn} onPress={() => AudioService.setRate(1.0)}>
              <Icon name="shuffle" size={24} color="#7f8c8d" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn} onPress={AudioService.prev} disabled={!hasPrev}>
              <Icon name="skip-previous" size={36} color={hasPrev ? '#2c3e50' : '#ddd'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.playBtn} onPress={AudioService.toggle}>
              <Icon name={isPlaying ? 'pause' : 'play-arrow'} size={48} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn} onPress={AudioService.next} disabled={!hasNext}>
              <Icon name="skip-next" size={36} color={hasNext ? '#2c3e50' : '#ddd'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn} onPress={() => setShowSpeedOptions(!showSpeedOptions)}>
              <Text style={styles.speedBtn}>{playbackRate}x</Text>
            </TouchableOpacity>
          </View>

          {/* Speed options */}
          {showSpeedOptions && (
            <View style={styles.speedOptions}>
              {SPEED_OPTIONS.map(speed => (
                <TouchableOpacity
                  key={speed}
                  style={[styles.speedOption, playbackRate === speed && styles.speedOptionActive]}
                  onPress={async () => {
                    await AudioService.setRate(speed);
                    setShowSpeedOptions(false);
                  }}
                >
                  <Text style={[styles.speedOptionText, playbackRate === speed && styles.speedOptionTextActive]}>
                    {speed}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Playlist */}
          <View style={styles.playlistSection}>
            <Text style={styles.playlistSectionTitle}>Playlist ({playlist.length} tracks)</Text>
            <FlatList
              data={playlist}
              keyExtractor={(item, idx) => `${item.id || idx}`}
              style={styles.trackList}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[styles.trackItem, currentIndex === index && styles.trackItemActive]}
                  onPress={() => AudioService.playTrack(index)}
                >
                  <Text style={[styles.trackIndex, currentIndex === index && { color: '#3498db' }]}>
                    {currentIndex === index ? '▶' : String(index + 1)}
                  </Text>
                  <View style={styles.flex1}>
                    <Text style={[styles.trackItemTitle, currentIndex === index && { color: '#3498db' }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => {
            AudioService.stop();
            setSelectedPlaylist(null);
          }}>
            <Text style={styles.backBtnText}>← Back to Playlists</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  flex1: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#ecf0f1' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginLeft: 8 },
  iconBtn: { padding: 8 },
  loadingText: { fontSize: 14, color: '#7f8c8d', marginTop: 12 },
  listContent: { padding: 16 },

  // Playlist cards
  playlistCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 10, elevation: 1 },
  playlistIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  playlistHebrew: { fontSize: 16, fontWeight: '600', color: '#2c3e50', writingDirection: 'rtl', textAlign: 'right' },
  playlistTitle: { fontSize: 14, color: '#2c3e50', marginTop: 1 },
  playlistDesc: { fontSize: 12, color: '#7f8c8d', marginTop: 2 },

  // Player
  playerContainer: { flex: 1, padding: 20 },
  albumArt: { alignItems: 'center', justifyContent: 'center', paddingVertical: 30 },
  trackInfo: { alignItems: 'center', marginBottom: 20 },
  trackHebrew: { fontSize: 20, fontWeight: '600', color: '#2c3e50', writingDirection: 'rtl', textAlign: 'center' },
  trackTitle: { fontSize: 16, color: '#555', marginTop: 4, textAlign: 'center' },
  trackBook: { fontSize: 12, color: '#7f8c8d', marginTop: 2 },

  // Progress
  progressBar: { marginBottom: 10 },
  slider: { width: '100%', height: 40 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  timeText: { fontSize: 12, color: '#7f8c8d' },

  // Controls
  controls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  controlBtn: { padding: 12 },
  playBtn: { backgroundColor: '#3498db', width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginHorizontal: 16, elevation: 3 },
  speedBtn: { fontSize: 14, fontWeight: '600', color: '#3498db' },

  // Speed options
  speedOptions: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  speedOption: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f0f0f0', marginHorizontal: 4 },
  speedOptionActive: { backgroundColor: '#3498db' },
  speedOptionText: { fontSize: 13, color: '#555', fontWeight: '500' },
  speedOptionTextActive: { color: 'white' },

  // Playlist
  playlistSection: { flex: 1, marginTop: 10 },
  playlistSectionTitle: { fontSize: 14, fontWeight: '600', color: '#2c3e50', marginBottom: 8 },
  trackList: { flex: 1 },
  trackItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8, marginBottom: 2 },
  trackItemActive: { backgroundColor: '#f0f7ff' },
  trackIndex: { fontSize: 13, color: '#7f8c8d', width: 30, textAlign: 'center' },
  trackItemTitle: { fontSize: 14, color: '#2c3e50' },

  backBtn: { alignItems: 'center', paddingVertical: 16 },
  backBtnText: { fontSize: 14, color: '#3498db', fontWeight: '500' },
});
