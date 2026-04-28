// screens/SettingsScreen.js — Settings with dark mode, fonts, zmanim toggle, notifications
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Platform, StatusBar, Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import StorageService from '../services/StorageService';

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

export default function SettingsScreen({ navigation }) {
  const [settings, setSettings] = useState({
    darkMode: false,
    fontSize: 18,
    hebrewFont: 'System',
    displayMode: 'both',
    uiLanguage: 'en',
    notificationsEnabled: true,
    yahrzeitNotifications: true,
  });
  const [nanachCount, setNanachCount] = useState({ total: 0, today: 0 });
  const [streak, setStreak] = useState({ current: 0, best: 0 });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const s = await StorageService.getSettings();
    setSettings(s);
    const nc = await StorageService.getNanachCount();
    setNanachCount(nc);
    const st = await StorageService.getStreak();
    setStreak(st);
  };

  const update = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await StorageService.saveSettings({ [key]: value });
  };

  const clearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached book data and downloads. Your bookmarks, highlights, and notes will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear', style: 'destructive',
          onPress: async () => {
            try {
              const { default: ajewAPI } = require('../AjewAPI');
              await ajewAPI.clearCache();
              Alert.alert('Done', 'Cache cleared successfully.');
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  const SectionHeader = ({ title, icon }) => (
    <View style={styles.sectionHeader}>
      <Icon name={icon} size={18} color="#3498db" />
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  const SettingRow = ({ label, value, onPress, right }) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress}>
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {right || <Icon name="chevron-right" size={20} color="#bdc3c7" />}
      </View>
    </TouchableOpacity>
  );

  const ToggleRow = ({ label, value, onToggle }) => (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch value={value} onValueChange={onToggle} trackColor={{ false: '#ddd', true: '#3498db' }} />
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.flex1} contentContainerStyle={styles.content}>
        {/* Reading */}
        <SectionHeader title="Reading" icon="menu-book" />
        <SettingRow
          label="Default Font Size"
          value={`${settings.fontSize}px`}
          onPress={() => {
            Alert.alert('Font Size', 'Adjust using the reading screen controls');
          }}
        />
        <SettingRow
          label="Hebrew Font"
          value={settings.hebrewFont === 'System' ? 'System Default' : settings.hebrewFont}
          onPress={() => {
            Alert.alert(
              'Choose Font',
              'Font can be changed in the reading screen',
              HEBREW_FONTS.map(f => ({
                text: f.label,
                onPress: () => update('hebrewFont', f.value),
              })).concat([{ text: 'Cancel', style: 'cancel' }])
            );
          }}
        />
        <SettingRow
          label="Default Display"
          value={settings.displayMode === 'both' ? 'Hebrew + English' : settings.displayMode === 'he' ? 'Hebrew Only' : 'English Only'}
          onPress={() => {
            const next = settings.displayMode === 'both' ? 'he' : settings.displayMode === 'he' ? 'en' : 'both';
            update('displayMode', next);
          }}
        />

        {/* Appearance */}
        <SectionHeader title="Appearance" icon="palette" />
        <ToggleRow label="Dark Mode" value={settings.darkMode} onToggle={(v) => update('darkMode', v)} />

        {/* Notifications */}
        <SectionHeader title="Notifications" icon="notifications" />
        <ToggleRow label="Daily Wisdom" value={settings.notificationsEnabled} onToggle={(v) => update('notificationsEnabled', v)} />
        <ToggleRow label="Yahrzeit Reminders" value={settings.yahrzeitNotifications} onToggle={(v) => update('yahrzeitNotifications', v)} />

        {/* Stats */}
        <SectionHeader title="Your Stats" icon="trending-up" />
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{streak.current}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{streak.best}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{nanachCount.total}</Text>
            <Text style={styles.statLabel}>Na Nach</Text>
          </View>
        </View>

        {/* Data */}
        <SectionHeader title="Data" icon="storage" />
        <SettingRow label="Clear Cache" onPress={clearCache} right={null} />

        {/* About */}
        <SectionHeader title="About" icon="info" />
        <SettingRow label="Version" value="1.1.0" right={null} />
        <SettingRow label="Privacy Policy" onPress={() => {
          // Open privacy policy URL
        }} />
        <SettingRow label="ajew.org" onPress={() => {
          // Open ajew.org
        }} />

        <View style={{ height: 40 }} />
        <Text style={styles.branding}>נחמן מאומן — Na Nach</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  flex1: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#ecf0f1' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginLeft: 8 },
  iconBtn: { padding: 8 },
  content: { paddingBottom: 40 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 },
  sectionHeaderText: { fontSize: 14, fontWeight: '600', color: '#3498db', marginLeft: 8, textTransform: 'uppercase', letterSpacing: 0.5 },

  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  settingLabel: { fontSize: 15, color: '#2c3e50', flex: 1 },
  settingRight: { flexDirection: 'row', alignItems: 'center' },
  settingValue: { fontSize: 14, color: '#7f8c8d', marginRight: 8 },

  statsRow: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 10 },
  statCard: { flex: 1, backgroundColor: 'white', padding: 14, borderRadius: 10, marginHorizontal: 4, alignItems: 'center', elevation: 1 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#3498db' },
  statLabel: { fontSize: 11, color: '#7f8c8d', marginTop: 4 },

  branding: { textAlign: 'center', fontSize: 16, color: '#3498db', fontWeight: '600', writingDirection: 'rtl' },
});
