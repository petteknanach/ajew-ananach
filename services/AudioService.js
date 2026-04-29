// AudioService.js — Kol HaTzadik integration, background audio, playlists
// Uses expo-av for audio playback

let Audio; // Will be imported at runtime to avoid build issues if not installed

const KOL_HATZADIK_BASE = 'https://archive.org/download';
const DEFAULT_PLAYLISTS = {
  likutay_moharan: {
    title: 'Likutay Moharan',
    hebrewTitle: 'ליקוטי מוהר״ן',
    tracks: [], // Populated dynamically from API
  },
  saba: {
    title: 'Saba Recordings',
    hebrewTitle: 'הקלטות סבא',
    tracks: [], // 58 recordings from Sichos Chayay Saba
  },
};

class AudioService {
  constructor() {
    this.sound = null;
    this.currentTrack = null;
    this.playlist = [];
    this.currentIndex = -1;
    this.isPlaying = false;
    this.playbackRate = 1.0;
    this.position = 0;
    this.duration = 0;
    this.listeners = [];
  }

  // ── Initialize ──
  async init() {
    try {
      const { Audio: ExpoAudio } = require('expo-av');
      Audio = ExpoAudio;
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      return true;
    } catch (e) {
      console.warn('Audio init failed (expo-av may not be installed):', e.message);
      return false;
    }
  }

  // ── Track Management ──
  async loadPlaylist(bookId, tracks) {
    this.playlist = tracks.map((track, i) => ({
      id: `${bookId}_${i}`,
      bookId,
      ...track,
    }));
    this.currentIndex = 0;
    return this.playlist;
  }

  async playTrack(index) {
    if (!Audio) {
      await this.init();
      if (!Audio) return { error: 'Audio not available' };
    }
    if (index < 0 || index >= this.playlist.length) {
      return { error: 'Invalid track index' };
    }

    try {
      // Unload previous
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      const track = this.playlist[index];
      this.currentIndex = index;
      this.currentTrack = track;

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.url },
        {
          shouldPlay: true,
          rate: this.playbackRate,
          progressUpdateIntervalMillis: 500,
        }
      );

      this.sound = sound;
      this.isPlaying = true;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          this.position = status.positionMillis;
          this.duration = status.durationMillis;
          this.isPlaying = status.isPlaying;
          this._notifyListeners();
          if (status.didJustFinish) {
            this.next();
          }
        }
      });

      this._notifyListeners();
      return { success: true, track };
    } catch (e) {
      console.error('Audio play error:', e);
      return { error: e.message };
    }
  }

  async pause() {
    if (this.sound) {
      await this.sound.pauseAsync();
      this.isPlaying = false;
      this._notifyListeners();
    }
  }

  async resume() {
    if (this.sound) {
      await this.sound.playAsync();
      this.isPlaying = true;
      this._notifyListeners();
    }
  }

  async toggle() {
    if (this.isPlaying) await this.pause();
    else await this.resume();
  }

  async next() {
    if (this.currentIndex < this.playlist.length - 1) {
      return await this.playTrack(this.currentIndex + 1);
    }
    return { error: 'End of playlist' };
  }

  async prev() {
    if (this.currentIndex > 0) {
      return await this.playTrack(this.currentIndex - 1);
    }
    return { error: 'Start of playlist' };
  }

  async seek(positionMs) {
    if (this.sound) {
      await this.sound.setPositionAsync(positionMs);
      this.position = positionMs;
      this._notifyListeners();
    }
  }

  async setRate(rate) {
    this.playbackRate = rate;
    if (this.sound) {
      await this.sound.setRateAsync(rate, true);
      this._notifyListeners();
    }
  }

  async stop() {
    if (this.sound) {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.sound = null;
      this.isPlaying = false;
      this._notifyListeners();
    }
  }

  async getStatus() {
    if (this.sound) {
      const status = await this.sound.getStatusAsync();
      if (status.isLoaded) {
        this.position = status.positionMillis;
        this.duration = status.durationMillis;
        this.isPlaying = status.isPlaying;
      }
    }
    return this.getState();
  }

  getState() {
    return {
      isPlaying: this.isPlaying,
      currentTrack: this.currentTrack,
      currentIndex: this.currentIndex,
      playlist: this.playlist,
      position: this.position,
      duration: this.duration,
      playbackRate: this.playbackRate,
      hasNext: this.currentIndex < this.playlist.length - 1,
      hasPrev: this.currentIndex > 0,
    };
  }

  // ── Listener System ──
  addListener(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  _notifyListeners() {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
  }

  // ── Build tracks from Kol HaTzadik ──
  // Kol HaTzadik recordings are on Internet Archive
  // URL pattern: https://archive.org/download/kol-hatzadik-{book}/{file}.mp3
  buildKolHaTzadikTracks(bookId, recordings) {
    return recordings.map((rec, i) => ({
      id: `${bookId}_${i}`,
      title: rec.title || `Recording ${i + 1}`,
      hebrewTitle: rec.hebrewTitle || '',
      url: rec.url || `${KOL_HATZADIK_BASE}/kol-hatzadik-${bookId}/${rec.file || `track_${i + 1}.mp3`}`,
      duration: rec.duration || 0,
      bookId,
      type: rec.type || 'voice', // 'voice' or 'melody'
    }));
  }

  // ── Saba recordings ──
  buildSabaTracks() {
    // 58 Saba recordings — URLs would come from the API
    const tracks = [];
    for (let i = 1; i <= 58; i++) {
      tracks.push({
        id: `saba_${i}`,
        title: `Saba Recording ${i}`,
        hebrewTitle: `הקלטת סבא ${i}`,
        url: `${KOL_HATZADIK_BASE}/saba-recordings/recording_${i}.mp3`,
        bookId: 'saba',
        type: 'voice',
      });
    }
    return tracks;
  }
}

export default new AudioService();
