// CompassScreen.js — Points toward Jerusalem / Even HaShtiyah
// Uses device magnetometer to show direction to the Holy of Holies
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

// Fallback heading if geolocation unavailable (approximate from NYC)
const FALLBACK_HEADING = 54; // degrees from north

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
  const [accuracy, setAccuracy] = useState(0);
  const [hasCompass, setHasCompass] = useState(false);
  const [error, setError] = useState(null);

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const spinRef = useRef(null);

  // Start compass
  useEffect(() => {
    let magnetometerSub = null;
    let watchId = null;

    const startCompass = async () => {
      try {
        Magnetometer.setUpdateInterval(100);
        magnetometerSub = Magnetometer.addListener(data => {
          const { x, y } = data;
          let angle = Math.atan2(y, x) * (180 / Math.PI);
          angle = (angle + 360) % 360;
          // Adjust: magnetometer gives magnetic north; in app we use true north approx
          setHeading(angle);
          setHasCompass(true);
        });
        setError(null);
      } catch (e) {
        setHasCompass(false);
        // Fallback: try geolocation heading
        try {
          const pos = await Location.getCurrentPositionAsync({});
          // Some devices provide heading
        } catch (e2) {
          setError('Compass not available on this device');
          setHasCompass(false);
        }
      }
    };

    startCompass();

    return () => {
      if (magnetometerSub) magnetometerSub.remove();
    };
  }, []);

  // Get location and calculate bearing to Jerusalem
  useEffect(() => {
    const getLocation = async () => {
      try {
        const pos = await Location.getCurrentPositionAsync({ accuracy: 3 });
        if (pos && pos.coords) {
          const b = calculateBearing(
            pos.coords.latitude,
            pos.coords.longitude,
            JERUSALEM_LAT,
            JERUSALEM_LON
          );
          setBearing(b);
          setAccuracy(pos.coords.accuracy || 0);
          setError(null);
        }
      } catch (e) {
        // Use fallback - approximate Jerusalem bearing from most locations
        setBearing(FALLBACK_HEADING);
        setError('Using approximate direction. Enable location for accuracy.');
      }
    };
    getLocation();
  }, []);

  // Animate compass rotation
  useEffect(() => {
    // The compass dial should rotate so Jerusalem is at the top
    // needleAngle = bearing - heading
    const needleAngle = ((bearing - heading) + 360) % 360;

    Animated.timing(rotateAnim, {
      toValue: needleAngle,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [heading, bearing]);

  const needleRotation = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  // Calculate distance (approximate)
  const distanceKm = '';

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Jerusalem Compass</Text>
      </View>

      <View style={styles.container}>
        {/* Header info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoHebrew} dir="rtl">מצפן ירושלים</Text>
          <Text style={styles.infoSubtitle}>Toward the Even HaShtiyah</Text>
          <Text style={styles.infoSubtitle}>לכוון אבן השתיה</Text>
          {bearing !== FALLBACK_HEADING && (
            <Text style={styles.distanceText}>
              Bearing: {Math.round(bearing)}° from North
            </Text>
          )}
        </View>

        {/* Compass */}
        <View style={styles.compassContainer}>
          {/* Outer ring */}
          <View style={styles.compassOuter}>
            {/* Cardinal directions */}
            <Text style={[styles.cardinal, styles.cardinalN]}>N</Text>
            <Text style={[styles.cardinal, styles.cardinalS]}>S</Text>
            <Text style={[styles.cardinal, styles.cardinalE]}>E</Text>
            <Text style={[styles.cardinal, styles.cardinalW]}>W</Text>

            {/* Rotating dial */}
            <Animated.View style={[styles.compassDial, { transform: [{ rotate: needleRotation }] }]}>
              {/* Jerusalem marker at top (0 degrees) */}
              <View style={styles.jerusalemMarker}>
                <Icon name="location-on" size={24} color="#FFD700" />
                <Text style={styles.jerusalemLabel}>ירושלים</Text>
              </View>
              {/* Opposite marker */}
              <View style={styles.oppositeMarker}>
                <View style={styles.oppositeDot} />
              </View>
            </Animated.View>

            {/* Center */}
            <View style={styles.compassCenter}>
              <View style={styles.centerDot} />
            </View>
          </View>

          {/* Heading display */}
          <Text style={styles.headingText}>
            {hasCompass ? `${Math.round(heading)}°` : '...'}
          </Text>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <Icon name="location-on" size={14} color="#FFD700" />
            <Text style={styles.legendText}>Jerusalem / Even HaShtiyah</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendNorth} />
            <Text style={styles.legendText}>North / צפון</Text>
          </View>
        </View>

        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Prayer */}
        <View style={styles.prayerCard}>
          <Text style={styles.prayerHebrew} dir="rtl">
            ואני תפילתי לך ה' עת רצון
          </Text>
          <Text style={styles.prayerEnglish}>
            "And I, my prayer to You, Hashem, at a time of favor"
          </Text>
          <Text style={styles.prayerSource}>Tehillim 69:14</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    backgroundColor: '#1a365d', borderBottomWidth: 1, borderBottomColor: '#e0e0e0',
  },
  iconBtn: { padding: 8, marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', flex: 1 },
  container: { flex: 1, alignItems: 'center', paddingTop: 20 },
  infoCard: {
    alignItems: 'center', marginBottom: 20, padding: 16,
    backgroundColor: '#fff', borderRadius: 12, width: '90%',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 4,
  },
  infoHebrew: { fontSize: 28, fontFamily: Platform.OS === 'ios' ? 'System' : 'serif', color: '#1a365d', fontWeight: '700' },
  infoSubtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  distanceText: { fontSize: 12, color: '#999', marginTop: 4 },
  compassContainer: { alignItems: 'center', marginBottom: 20 },
  compassOuter: {
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center',
    borderWidth: 4, borderColor: '#c9a87c', elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  cardinal: {
    position: 'absolute', fontSize: 18, fontWeight: 'bold', color: '#c9a87c',
  },
  cardinalN: { top: 12, alignSelf: 'center' },
  cardinalS: { bottom: 12, alignSelf: 'center', color: '#888' },
  cardinalE: { right: 12, top: '45%' },
  cardinalW: { left: 12, top: '45%', color: '#888' },
  compassDial: {
    width: 220, height: 220, justifyContent: 'center', alignItems: 'center',
  },
  jerusalemMarker: {
    position: 'absolute', top: -8, alignSelf: 'center', alignItems: 'center',
  },
  jerusalemLabel: {
    fontSize: 10, color: '#FFD700', fontWeight: '600',
    marginTop: -2,
  },
  oppositeMarker: {
    position: 'absolute', bottom: -8, alignSelf: 'center',
  },
  oppositeDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#666',
  },
  compassCenter: {
    position: 'absolute', width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#c9a87c', justifyContent: 'center', alignItems: 'center',
  },
  centerDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#1a1a2e',
  },
  headingText: {
    fontSize: 32, fontWeight: 'bold', color: '#1a365d', marginTop: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  legend: {
    flexDirection: 'column', gap: 8, padding: 16, width: '90%',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendText: { fontSize: 12, color: '#666' },
  legendNorth: {
    width: 14, height: 14, borderRadius: 7, backgroundColor: '#c9a87c',
    borderWidth: 1, borderColor: '#1a365d',
  },
  errorCard: {
    backgroundColor: '#fff3cd', padding: 12, borderRadius: 8, width: '90%',
    marginBottom: 12, borderWidth: 1, borderColor: '#ffc107',
  },
  errorText: { fontSize: 12, color: '#856404', textAlign: 'center' },
  prayerCard: {
    alignItems: 'center', padding: 20, backgroundColor: '#eef2ff',
    borderRadius: 12, width: '90%', marginTop: 8,
  },
  prayerHebrew: {
    fontSize: 18, fontWeight: '600', color: '#1a365d',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'serif',
  },
  prayerEnglish: { fontSize: 12, color: '#666', marginTop: 8, textAlign: 'center', fontStyle: 'italic' },
  prayerSource: { fontSize: 10, color: '#999', marginTop: 4 },
});
