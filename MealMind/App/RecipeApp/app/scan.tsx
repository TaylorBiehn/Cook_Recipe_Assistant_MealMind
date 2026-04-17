import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindShadow, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';

const { width: WIN_W } = Dimensions.get('window');
const FRAME_W = WIN_W * 0.9;
const FRAME_H = Math.min(520, FRAME_W * 1.15);

const SIM_CHIPS = [
  { id: 'tomato', label: 'Heirloom Tomato' },
  { id: 'basil', label: 'Basil Leaves' },
] as const;

const HEADER_BG = 'rgba(254, 248, 245, 0.92)';

export default function KitchenScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ imageUri?: string }>();
  const imageUri = useMemo(() => {
    const raw = params.imageUri;
    if (typeof raw !== 'string' || !raw.length) {
      return null;
    }
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }, [params.imageUri]);

  const lineOpacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    if (!imageUri) {
      router.back();
    }
  }, [imageUri, router]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(lineOpacity, {
          toValue: 0.85,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(lineOpacity, {
          toValue: 0.35,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [lineOpacity]);

  if (!imageUri) {
    return null;
  }

  const bottomPad = Math.max(insets.bottom, MealMindSpace.lg) + MealMindSpace.xl;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close scanner"
          hitSlop={12}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}>
          <MaterialIcons name="close" size={24} color={MealMindColors.primary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Kitchen Scanner
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Scanner settings"
          hitSlop={12}
          style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}>
          <MaterialIcons name="settings" size={24} color={MealMindColors.primary} />
        </Pressable>
      </View>

      <View style={styles.main}>
        <View style={[styles.frame, { width: FRAME_W, height: FRAME_H }]}>
          <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <View style={styles.overlay} pointerEvents="none">
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            <Animated.View style={[styles.scanLineWrap, { opacity: lineOpacity }]}>
              <LinearGradient
                colors={['transparent', MealMindColors.primaryFixed, 'transparent']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.scanLine}
              />
            </Animated.View>
            <View style={styles.chipRow}>
              {SIM_CHIPS.map((c) => (
                <View key={c.id} style={styles.chip}>
                  <View style={styles.chipDot} />
                  <Text style={styles.chipLabel}>{c.label.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <Text style={styles.tip}>
          Frame your ingredients clearly within the guide to scan them into your{' '}
          <Text style={styles.tipAccent}>Pantry</Text>.
        </Text>
      </View>

      <View style={[styles.captureWrap, { paddingBottom: bottomPad }]}>
        <View style={styles.captureRing} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue to review ingredients"
          onPress={() =>
            router.push({
              pathname: '/scan-review',
              params: { imageUri: encodeURIComponent(imageUri) },
            })
          }
          style={({ pressed }) => [styles.captureBtn, pressed && styles.capturePressed]}>
          <LinearGradient
            colors={[MealMindColors.primary, MealMindColors.primaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.captureGradient}>
            <MaterialIcons name="center-focus-strong" size={36} color={MealMindColors.onPrimary} />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const CORNER = 48;
const CORNER_INSET = MealMindSpace.lg;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: MealMindColors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: MealMindSpace.lg,
    height: 56,
    backgroundColor: HEADER_BG,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${MealMindColors.outlineVariant}33`,
  },
  headerIcon: {
    padding: 4,
    width: 40,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 18,
    letterSpacing: headlineTracking,
    color: MealMindColors.onSurface,
  },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: MealMindSpace.md,
  },
  frame: {
    borderRadius: MealMindRadii.xl,
    overflow: 'hidden',
    backgroundColor: MealMindColors.surfaceContainer,
    ...MealMindShadow.ambient,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: MealMindSpace.lg,
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: MealMindColors.primaryFixed,
    opacity: 0.72,
  },
  cornerTL: {
    top: CORNER_INSET,
    left: CORNER_INSET,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: CORNER_INSET,
    right: CORNER_INSET,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: CORNER_INSET,
    left: CORNER_INSET,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: CORNER_INSET,
    right: CORNER_INSET,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomRightRadius: 4,
  },
  scanLineWrap: {
    width: '88%',
    alignItems: 'center',
  },
  scanLine: {
    width: '100%',
    height: 3,
    borderRadius: 2,
  },
  chipRow: {
    position: 'absolute',
    bottom: MealMindSpace.xl,
    left: MealMindSpace.md,
    right: MealMindSpace.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: MealMindSpace.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: MealMindSpace.md,
    borderRadius: MealMindRadii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    ...MealMindShadow.ambient,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: MealMindColors.secondaryFixed,
  },
  chipLabel: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 11,
    letterSpacing: 0.2,
    color: MealMindColors.onSurface,
  },
  tip: {
    marginTop: MealMindSpace.lg,
    paddingHorizontal: MealMindSpace.xl + 8,
    textAlign: 'center',
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
    color: MealMindColors.onSurfaceVariant,
  },
  tipAccent: {
    fontFamily: MealMindFonts.headlineBold,
    color: MealMindColors.primary,
  },
  captureWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: MealMindSpace.sm,
  },
  captureRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: `${MealMindColors.primary}33`,
    transform: [{ scale: 1.2 }],
  },
  captureBtn: {
    borderRadius: 40,
    overflow: 'hidden',
    ...MealMindShadow.glowCta,
  },
  capturePressed: {
    opacity: 0.92,
    transform: [{ scale: 0.94 }],
  },
  captureGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
