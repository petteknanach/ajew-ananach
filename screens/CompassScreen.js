// CompassScreen.js — Points toward Jerusalem / Even HaShtiyah
// Na Nach Nachma Nachman MeUman
import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Platform, Animated, Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Magnetometer } from 'expo-sensors';
import * as Location from 'expo-location';

// Jerusalem / Even HaShtiyah coordinates
const JERUSALEM_LAT = 31.7780;
const JERUSALEM_LON = 35.2354;
const FALLBACK_HEADING = 54;

function degreesToRadians(deg) { return deg * (Math.PI / 180); }
function radiansToDegrees(rad) { return rad * (180 / Math.PI); }

function calculateBearing(lat1, lon1, lat2, lon2) {
  const dLon = degreesToRadians(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(degreesToRadians(lat2));
  const x = Math.cos(degreesToRadians(lat1)) * Math.sin(degreesToRadians(lat2)) -
            Math.sin(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) * Math.cos(dLon);
  let bearing = radiansToDegrees(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

export default function CompassScreen({ navigation }) {
  const [heading, setHeading] = useState(0);
  const [bearing, setBearing] = useState(FALLBACK_HEADING);
  const [hasCompass, setHasCompass] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let sub = null;

    const start = async () => {
      try {
        Magnetometer.setUpdateInterval(100);
        sub = Magnetometer.addListener(({ x, y }) => {
          let angle = Math.atan2(y, x) * (180 / Math.PI);
          setHeading((angle + 360) % 360);
          setHasCompass(true);
        });
      } catch (e) {
        setHasCompass(false);
        setErrorMsg('Compass not available — showing approximate direction');
      }
    };

    start();
    return () => { if (sub) sub.remove(); };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const pos = await Location.getCurrentPositionAsync({ accuracy: 3 });
        if (pos && pos.coords) {
          setBearing(calculateBearing(
            pos.coords.latitude, pos.coords.longitude,
            JERUSALEM_LAT, JERUSALEM_LON
          ));
          return;
        }
      } catch (e) {}
      setBearing(FALLBACK_HEADING);
    })();
  }, []);

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: ((bearing - heading) + 360) % 360,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [heading, bearing]);

  const needleRotation = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Jerusalem Compass</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.infoCard}>
          <Text style={styles.infoHebrew} dir="rtl">מצפן ירושלים</Text>
          <Text style={styles.infoSubtitle}>Toward the Even HaShtiyah · אבן השתיה</Text>
        </View>

        <View style={styles.compassContainer}>
          <View style={styles.compassOuter}>
            <Text style={[styles.cardinal, styles.cardinalN]}>N</Text>
            <Text style={[styles.cardinal, styles.cardinalS]}>S</Text>
            <Text style={[styles.cardinal, styles.cardinalE]}>E</Text>
            <Text style={[styles.cardinal, styles.cardinalW]}>W</Text>

            <Animated.View style={[styles.compassDial, { transform: [{ rotate: needleRotation }] }]}>
              <View style={styles.jerusalemMarker}>
                <Icon name="location-on" size={24} color="#FFD700" />
                <Text style={styles.jerusalemLabel}>ירושלים</Text>
              </View>
            </Animated.View>

            <View style={styles.compassCenter}>
              <View style={styles.centerDot} />
            </View>
          </View>

          <Text style={styles.headingText}>
            {hasCompass ? `${Math.round(heading)}°` : `${Math.round(bearing)}°`}
          </Text>
        </View>

        <View style={styles.prayerCard}>
          <Text style={styles.prayerHebrew} dir="rtl">ואני תפילתי לך ה' עת רצון</Text>
          <Text style={styles.prayerEnglish}>"And I, my prayer to You, Hashem, at a time of favor"</Text>
          <Text style={styles.prayerSource}>Tehillim 69:14</Text>
        </View>

        {errorMsg ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <Text style={styles.bearingText}>Bearing to Jerusalem: {Math.round(bearing)}°</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#1a365d' },
  iconBtn: { padding: 8, marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', flex: 1 },
  container: { flex: 1, alignItems: 'center', paddingTop: 20 },
  infoCard: { alignItems: 'center', marginBottom: 20, padding: 16, backgroundColor: '#fff', borderRadius: 12, width: '90%', elevation: 2 },
  infoHebrew: { fontSize: 28, fontWeight: '700', color: '#1a365d' },
  infoSubtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  compassContainer: { alignItems: 'center', marginBottom: 20 },
  compassOuter: { width: 260, height: 260, borderRadius: 130, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#c9a87c', elevation: 8 },
  cardinal: { position: 'absolute', fontSize: 18, fontWeight: 'bold', color: '#c9a87c' },
  cardinalN: { top: 12, alignSelf: 'center' },
  cardinalS: { bottom: 12, alignSelf: 'center', color: '#888' },
  cardinalE: { right: 12, top: 130 },
  cardinalW: { left: 12, top: 130, color: '#888' },
  compassDial: { width: 220, height: 220, justifyContent: 'center', alignItems: 'center' },
  jerusalemMarker: { position: 'absolute', top: -8, alignSelf: 'center', alignItems: 'center' },
  jerusalemLabel: { fontSize: 10, color: '#FFD700', fontWeight: '600', marginTop: -2 },
  compassCenter: { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: '#c9a87c', justifyContent: 'center', alignItems: 'center' },
  centerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#1a1a2e' },
  headingText: { fontSize: 32, fontWeight: 'bold', color: '#1a365d', marginTop: 12 },
  prayerCard: { alignItems: 'center', padding: 20, backgroundColor: '#eef2ff', borderRadius: 12, width: '90%', marginTop: 8 },
  prayerHebrew: { fontSize: 18, fontWeight: '600', color: '#1a365d' },
  prayerEnglish: { fontSize: 12, color: '#666', marginTop: 8, textAlign: 'center', fontStyle: 'italic' },
  prayerSource: { fontSize: 10, color: '#999', marginTop: 4 },
  errorCard: { backgroundColor: '#fff3cd', padding: 12, borderRadius: 8, width: '90%', marginTop: 8 },
  errorText: { fontSize: 12, color: '#856404', textAlign: 'center' },
  bearingText: { fontSize: 12, color: '#888', marginTop: 8, textAlign: 'center' },
});
