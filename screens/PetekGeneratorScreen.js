// screens/PetekGeneratorScreen.js — Generate shareable Petek (Na Nach) images
import React, { useState, useCallback } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Platform, StatusBar, Share, Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import StorageService from '../services/StorageService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PETEK_TEXT = 'נ נח נחמ נחמן מאומן';
const PETEK_COLORS = [
  { bg: '#1a1a2e', text: '#e94560', name: 'Midnight Fire' },
  { bg: '#0f3460', text: '#FFD700', name: 'Royal Gold' },
  { bg: '#2d3436', text: '#00cec9', name: 'Ocean Teal' },
  { bg: '#6c5ce7', text: '#FFEAA7', name: 'Purple Light' },
  { bg: '#2c3e50', text: '#3498db', name: 'Blue Steel' },
  { bg: '#1e272e', text: '#ff793f', name: 'Sunset' },
  { bg: '#192a56', text: '#4cd137', name: 'Emerald' },
  { bg: '#2f3640', text: '#f5f6fa', name: 'Classic' },
];

const PETEK_BACKGROUNDS = [
  'plain',
  'stars',
  'circles',
  'waves',
];

export default function PetekGeneratorScreen({ navigation }) {
  const [colorScheme, setColorScheme] = useState(0);
  const [background, setBackground] = useState('plain');
  const [size, setSize] = useState('large');
  const [count, setCount] = useState({ total: 0, today: 0 });

  const colors = PETEK_COLORS[colorScheme];

  const generatePetek = useCallback(() => {
    // Just the text for now — image generation would need react-native-view-shot
    // which can be added as a dependency
    return PETEK_TEXT;
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${PETEK_TEXT}\n\n— Na Nach Nachma Nachman Meuman\nFrom Ajew Ananach app`,
      });
    } catch (_) {}
  };

  const handleCount = async () => {
    const updated = await StorageService.incrementNanach();
    setCount(updated);
  };

  const fontSize = size === 'small' ? 28 : size === 'medium' ? 36 : 44;
  const petekLines = PETEK_TEXT.split(' ');
  const lineHeight = size === 'small' ? 42 : size === 'medium' ? 52 : 64;

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Petek Generator</Text>
        <Text style={styles.headerSub}>פתק</Text>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.content}>
        {/* Preview */}
        <View style={[styles.preview, { backgroundColor: colors.bg }]}>
          {petekLines.map((word, i) => (
            <Text
              key={i}
              style={[
                styles.petekWord,
                {
                  color: colors.text,
                  fontSize,
                  lineHeight: lineHeight,
                },
              ]}
            >
              {word}
            </Text>
          ))}
          <Text style={[styles.petekFooter, { color: colors.text + '99' }]}>
            Na Nach Nachma Nachman Meuman
          </Text>
        </View>

        {/* Color schemes */}
        <Text style={styles.sectionTitle}>Colors</Text>
        <View style={styles.colorGrid}>
          {PETEK_COLORS.map((scheme, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.colorDot, { backgroundColor: scheme.bg }, i === colorScheme && styles.colorDotActive]}
              onPress={() => setColorScheme(i)}
            />
          ))}
        </View>

        {/* Size */}
        <Text style={styles.sectionTitle}>Size</Text>
        <View style={styles.sizeRow}>
          {['small', 'medium', 'large'].map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.sizeBtn, size === s && styles.sizeBtnActive]}
              onPress={() => setSize(s)}
            >
              <Text style={[styles.sizeBtnText, size === s && styles.sizeBtnTextActive]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Icon name="share" size={20} color="white" />
          <Text style={styles.shareBtnText}>Share Petek</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.countBtn} onPress={handleCount}>
          <Icon name="touch-app" size={20} color="#3498db" />
          <Text style={styles.countBtnText}>
            Count One Na Nach (Today: {count.today} | Total: {count.total})
          </Text>
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoHebrew}>
            מי שיאמר נ נח נחמ נחמן מאומן — אין שטן ואין פגע רע
          </Text>
          <Text style={styles.infoEnglish}>
            Whoever says Na Nach Nachma Nachman Meuman — no evil can touch them.
          </Text>
          <Text style={styles.infoSource}>— The Petek, revealed by Saba Yisroel</Text>
        </View>

        <View style={{ height: 40 }} />
        <Text style={styles.branding}>נ נח נחמ נחמן מאומן</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  flex1: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#ecf0f1' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginLeft: 8, flex: 1 },
  headerSub: { fontSize: 18, color: '#2c3e50', writingDirection: 'rtl', marginRight: 8 },
  iconBtn: { padding: 8 },
  content: { padding: 20, alignItems: 'center' },

  // Preview
  preview: { width: SCREEN_WIDTH - 40, minHeight: 220, borderRadius: 16, justifyContent: 'center', alignItems: 'center', padding: 30, marginBottom: 24, elevation: 4 },
  petekWord: { fontWeight: 'bold', writingDirection: 'rtl', textAlign: 'center' },
  petekFooter: { fontSize: 12, marginTop: 20 },

  // Section headers
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#2c3e50', marginTop: 16, marginBottom: 10, textAlign: 'center' },

  // Colors
  colorGrid: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  colorDot: { width: 32, height: 32, borderRadius: 16, marginHorizontal: 5, borderWidth: 2, borderColor: 'transparent' },
  colorDotActive: { borderColor: '#3498db', transform: [{ scale: 1.15 }] },

  // Size
  sizeRow: { flexDirection: 'row', marginBottom: 24 },
  sizeBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, backgroundColor: 'white', marginHorizontal: 4, elevation: 1 },
  sizeBtnActive: { backgroundColor: '#3498db' },
  sizeBtnText: { fontSize: 13, color: '#555', fontWeight: '500' },
  sizeBtnTextActive: { color: 'white' },

  // Buttons
  shareBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3498db', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 25, marginBottom: 12, elevation: 2 },
  shareBtnText: { color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  countBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 25, marginBottom: 20, elevation: 1 },
  countBtnText: { color: '#3498db', fontSize: 14, fontWeight: '500', marginLeft: 8 },

  // Info
  infoCard: { backgroundColor: '#fff9e6', padding: 16, borderRadius: 12, width: '100%', borderLeftWidth: 4, borderLeftColor: '#f39c12' },
  infoHebrew: { fontSize: 16, color: '#2c3e50', writingDirection: 'rtl', textAlign: 'right', lineHeight: 26, marginBottom: 8 },
  infoEnglish: { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 4 },
  infoSource: { fontSize: 12, color: '#7f8c8d', fontStyle: 'italic' },

  branding: { fontSize: 20, fontWeight: 'bold', color: '#3498db', writingDirection: 'rtl' },
});
