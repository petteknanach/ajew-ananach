// screens/HisbodedusScreen.js — Hisbodedus companion: timer, voice notes, guidance
import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Platform, StatusBar, Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import WHISPER_SERVICE from '../services/WhisperService';
import StorageService from '../services/StorageService';

const TIMER_OPTIONS = [15, 30, 60, 90, 120]; // minutes
const GUIDANCE_TEXTS = [
  {
    he: 'התבודדות היא הדרך הכי טובה להתקרב להשם יתברך',
    en: 'Hitbodedut is the best path to come close to Hashem. Set aside time each day to speak to God in your own words, in your own language.',
    source: 'Likutay Moharan II, 25',
  },
  {
    he: 'צריך האדם לדבר עם קונו כמו שמדבר עם חברו הטוב',
    en: 'A person must speak to their Creator as they would speak to their closest friend. Tell Him everything — your joys, your struggles, your desires.',
    source: 'Sichos HaRan, 154',
  },
  {
    he: 'אפילו אם אינו יכול לדבר כלל — יצעק להשם',
    en: 'Even if you cannot speak at all — cry out to Hashem. Even a simple cry from the heart is precious.',
    source: 'Likutay Moharan II, 97',
  },
  {
    he: 'צריך להתבודד בכל יום ויום שעה אחת לפחות',
    en: 'One must practice hitbodedut every single day for at least one hour. This is the foundation of everything.',
    source: 'Likutay Moharan I, 52',
  },
];

export default function HisbodedusScreen({ navigation }) {
  const [selectedTime, setSelectedTime] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState('');
  const [showGuidance, setShowGuidance] = useState(false);
  const [guidanceIndex, setGuidanceIndex] = useState(0);
  const [sessions, setSessions] = useState([]);
  const intervalRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadSessions();
    startPulse();
    return () => clearInterval(intervalRef.current);
  }, []);

  const loadSessions = async () => {
    const s = await StorageService.getNotes('hisbodedus');
    setSessions(s || []);
  };

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  };

  const startTimer = () => {
    setTimeLeft(selectedTime * 60);
    setIsRunning(true);
    setIsPaused(false);
    setSessionComplete(false);

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          setSessionComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    clearInterval(intervalRef.current);
    setIsPaused(true);
  };

  const resumeTimer = () => {
    setIsPaused(false);
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          setSessionComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setSessionComplete(false);
    setTimeLeft(selectedTime * 60);
  };

  const toggleVoiceNote = async () => {
    if (isRecording) {
      await WHISPER_SERVICE.stopListening();
      setIsRecording(false);
      if (recordedText) {
        await saveNote(recordedText);
      }
    } else {
      setIsRecording(true);
      try {
        const text = await WHISPER_SERVICE.dictateNote({
          language: 'he-IL',
          onPartial: (partial) => setRecordedText(partial),
        });
        setRecordedText(text || '');
      } catch (e) {
        console.warn('Dictation failed:', e);
      } finally {
        setIsRecording(false);
      }
    }
  };

  const saveNote = async (text) => {
    if (!text.trim()) return;
    await StorageService.addNote('hisbodedus', 0, Date.now(), text.trim());
    await loadSessions();
    setRecordedText('');
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const progress = 1 - (timeLeft / (selectedTime * 60));
  const guidance = GUIDANCE_TEXTS[guidanceIndex % GUIDANCE_TEXTS.length];

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hisbodedus</Text>
        <Text style={styles.headerSub}>התבודדות</Text>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.content}>
        {/* Timer Selection */}
        {!isRunning && !sessionComplete && (
          <View style={styles.timerSelect}>
            <Text style={styles.sectionTitle}>Session Duration</Text>
            <View style={styles.timeOptions}>
              {TIMER_OPTIONS.map(min => (
                <TouchableOpacity
                  key={min}
                  style={[styles.timeOption, selectedTime === min && styles.timeOptionActive]}
                  onPress={() => setSelectedTime(min)}
                >
                  <Text style={[styles.timeOptionText, selectedTime === min && styles.timeOptionTextActive]}>
                    {min} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.startBtn} onPress={startTimer}>
              <Icon name="timer" size={24} color="white" />
              <Text style={styles.startBtnText}>Begin Hisbodedus</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Active Timer */}
        {isRunning && (
          <View style={styles.activeTimer}>
            <Animated.View style={[styles.timerCircle, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
              <Text style={styles.timerLabel}>remaining</Text>
            </Animated.View>

            {/* Progress bar */}
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>

            <View style={styles.timerControls}>
              {isPaused ? (
                <TouchableOpacity style={styles.timerBtn} onPress={resumeTimer}>
                  <Icon name="play-arrow" size={28} color="white" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.timerBtn} onPress={pauseTimer}>
                  <Icon name="pause" size={28} color="white" />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.stopBtn} onPress={stopTimer}>
                <Icon name="stop" size={20} color="#e74c3c" />
                <Text style={styles.stopBtnText}>End</Text>
              </TouchableOpacity>
            </View>

            {/* Voice note */}
            <TouchableOpacity
              style={[styles.voiceBtn, isRecording && styles.voiceBtnActive]}
              onPress={toggleVoiceNote}
            >
              <Icon name={isRecording ? "mic" : "mic-none"} size={28} color={isRecording ? 'white' : '#2c3e50'} />
              <Text style={[styles.voiceBtnText, isRecording && { color: 'white' }]}>
                {isRecording ? 'Recording...' : 'Speak Your Heart'}
              </Text>
            </TouchableOpacity>

            {recordedText ? (
              <View style={styles.recordedBox}>
                <Text style={styles.recordedText}>{recordedText}</Text>
              </View>
            ) : null}

            {/* Guidance */}
            <TouchableOpacity
              style={styles.guidanceToggle}
              onPress={() => setShowGuidance(!showGuidance)}
            >
              <Icon name="lightbulb" size={18} color="#f39c12" />
              <Text style={styles.guidanceToggleText}>Guidance</Text>
              <Icon name={showGuidance ? 'expand-less' : 'expand-more'} size={18} color="#7f8c8d" />
            </TouchableOpacity>

            {showGuidance && (
              <View style={styles.guidanceCard}>
                <Text style={styles.guidanceHebrew}>{guidance.he}</Text>
                <Text style={styles.guidanceEnglish}>{guidance.en}</Text>
                <Text style={styles.guidanceSource}>{guidance.source}</Text>
                <TouchableOpacity
                  style={styles.guidanceNext}
                  onPress={() => setGuidanceIndex(guidanceIndex + 1)}
                >
                  <Text style={styles.guidanceNextText}>Next →</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Session Complete */}
        {sessionComplete && (
          <View style={styles.completeSection}>
            <Icon name="check-circle" size={80} color="#27ae60" />
            <Text style={styles.completeTitle}>Session Complete!</Text>
            <Text style={styles.completeSub}>
              {selectedTime} minutes of hisbodedus — May it be accepted before Hashem
            </Text>
            <TouchableOpacity style={styles.startBtn} onPress={startTimer}>
              <Text style={styles.startBtnText}>Another Session</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.newBtn} onPress={() => {
              setSessionComplete(false);
              setTimeLeft(selectedTime * 60);
            }}>
              <Text style={styles.newBtnText}>Change Duration</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Past Sessions */}
        {sessions.length > 0 && !isRunning && !sessionComplete && (
          <View style={styles.pastSessions}>
            <Text style={styles.sectionTitle}>Past Sessions</Text>
            {sessions.slice(0, 5).map((session, i) => (
              <View key={i} style={styles.sessionItem}>
                <Text style={styles.sessionText} numberOfLines={3}>{session.text}</Text>
                <Text style={styles.sessionDate}>
                  {new Date(session.timestamp).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  flex1: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#ecf0f1' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginLeft: 8 },
  headerSub: { fontSize: 18, color: '#2c3e50', writingDirection: 'rtl', marginLeft: 'auto', marginRight: 12 },
  iconBtn: { padding: 8 },
  content: { padding: 20, alignItems: 'center' },

  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#2c3e50', marginBottom: 14, textAlign: 'center' },

  // Timer Selection
  timerSelect: { width: '100%', alignItems: 'center', marginTop: 20 },
  timeOptions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 30 },
  timeOption: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: 'white', margin: 4, elevation: 1 },
  timeOptionActive: { backgroundColor: '#3498db' },
  timeOptionText: { fontSize: 14, color: '#555', fontWeight: '500' },
  timeOptionTextActive: { color: 'white' },
  startBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#27ae60', paddingHorizontal: 30, paddingVertical: 16, borderRadius: 30, elevation: 3 },
  startBtnText: { color: 'white', fontSize: 18, fontWeight: '600', marginLeft: 8 },

  // Active Timer
  activeTimer: { width: '100%', alignItems: 'center', marginTop: 10 },
  timerCircle: { width: 200, height: 200, borderRadius: 100, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 4, marginBottom: 20, borderWidth: 4, borderColor: '#3498db' },
  timerText: { fontSize: 42, fontWeight: 'bold', color: '#2c3e50' },
  timerLabel: { fontSize: 14, color: '#7f8c8d', marginTop: 4 },
  progressBar: { width: '100%', height: 6, backgroundColor: '#ecf0f1', borderRadius: 3, marginBottom: 20 },
  progressFill: { height: 6, backgroundColor: '#27ae60', borderRadius: 3 },
  timerControls: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  timerBtn: { backgroundColor: '#3498db', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  stopBtn: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  stopBtnText: { color: '#e74c3c', fontSize: 14, fontWeight: '600', marginLeft: 4 },

  // Voice
  voiceBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 25, marginBottom: 16, elevation: 2 },
  voiceBtnActive: { backgroundColor: '#e74c3c' },
  voiceBtnText: { fontSize: 15, color: '#2c3e50', fontWeight: '500', marginLeft: 8 },
  recordedBox: { backgroundColor: '#fff9e6', padding: 16, borderRadius: 10, width: '100%', marginBottom: 16 },
  recordedText: { fontSize: 14, color: '#2c3e50', lineHeight: 22 },

  // Guidance
  guidanceToggle: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  guidanceToggleText: { fontSize: 14, color: '#f39c12', fontWeight: '500', marginLeft: 8, marginRight: 8 },
  guidanceCard: { backgroundColor: 'white', padding: 16, borderRadius: 12, width: '100%', marginBottom: 16, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#f39c12' },
  guidanceHebrew: { fontSize: 16, color: '#2c3e50', writingDirection: 'rtl', textAlign: 'right', lineHeight: 26, marginBottom: 8 },
  guidanceEnglish: { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 8 },
  guidanceSource: { fontSize: 12, color: '#7f8c8d', fontStyle: 'italic' },
  guidanceNext: { alignSelf: 'flex-end', padding: 4 },
  guidanceNextText: { fontSize: 13, color: '#3498db', fontWeight: '500' },

  // Complete
  completeSection: { alignItems: 'center', marginTop: 40 },
  completeTitle: { fontSize: 28, fontWeight: 'bold', color: '#27ae60', marginTop: 16 },
  completeSub: { fontSize: 15, color: '#555', textAlign: 'center', marginTop: 8, marginBottom: 30, paddingHorizontal: 30 },
  newBtn: { marginTop: 16, padding: 12 },
  newBtnText: { fontSize: 14, color: '#3498db', fontWeight: '500' },

  // Past Sessions
  pastSessions: { width: '100%', marginTop: 30 },
  sessionItem: { backgroundColor: 'white', padding: 14, borderRadius: 10, marginBottom: 8, elevation: 1 },
  sessionText: { fontSize: 13, color: '#555', lineHeight: 20 },
  sessionDate: { fontSize: 11, color: '#bdc3c7', marginTop: 6 },
});
