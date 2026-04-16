import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { MealMindFlowHeader, MealMindScreen } from '@/components/mealmind';
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindShadow, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';

const CONTENT_MAX = 448;
const NAV_MS = 2200;
const PROGRESS_MS = 2000;

const HERO_BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB9xFzJHF0x0V0ScQgCmZK48mGTKS-FoQI3rkh8Du332MaX7Iv69QxLiut_01IF1ee7jfFpKFvCx3mGJO2ip21Cgw47SGZVBLo_WbOUeQAfg-AtVPpXcttSOT3V3OLUtruvjW61B9CSpSkKNkhietM-10ZTFuqR75aloqjdD3igXj_Vmt6bKWlHGHbqy4mBhsh_8239Q_J02mAoNB3giG1E855dR32msh39SXJrpAzGRhoPN4O2OxEIUCZ1m28tYHiTi90Kzxnga4M';

export default function LoadingScreen() {
  const router = useRouter();
  const [percentLabel, setPercentLabel] = useState(0);
  const floatY = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const shimmerX = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  const winW = Dimensions.get('window').width;
  const horizontalPad = MealMindSpace.lg * 2;
  const trackW = Math.min(CONTENT_MAX, Math.max(0, winW - horizontalPad));

  useEffect(() => {
    const navTimer = setTimeout(() => {
      router.replace('/results');
    }, NAV_MS);
    return () => clearTimeout(navTimer);
  }, [router]);

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    floatLoop.start();

    const progressListener = progress.addListener(({ value }) => {
      setPercentLabel(Math.min(100, Math.round(value * 100)));
    });

    Animated.timing(progress, {
      toValue: 1,
      duration: PROGRESS_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const shimmerLoop = Animated.loop(
      Animated.timing(shimmerX, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    shimmerLoop.start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.35,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.start();

    return () => {
      progress.removeListener(progressListener);
      floatLoop.stop();
      shimmerLoop.stop();
      pulseLoop.stop();
    };
  }, [floatY, progress, pulse, shimmerX]);

  const floatTranslate = floatY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, trackW],
  });

  const shimmerTranslate = shimmerX.interpolate({
    inputRange: [0, 1],
    outputRange: [-trackW * 0.8, trackW * 1.2],
  });

  return (
    <MealMindScreen scroll={false} contentBottomInset={0}>
      <View style={styles.shell}>
        <MealMindFlowHeader title="Smart Family Recipe Assistant" showBottomDivider />

        <View style={styles.main}>
          <View style={styles.blobTop} pointerEvents="none" />
          <View style={styles.blobBottom} pointerEvents="none" />

          <View style={styles.column}>
            <Animated.View style={[styles.heroCluster, { transform: [{ translateY: floatTranslate }] }]}>
              <View style={styles.heroFrame}>
                <Image source={{ uri: HERO_BG }} style={styles.heroBgImage} contentFit="cover" />
                <LinearGradient
                  colors={[MealMindColors.primary, MealMindColors.primaryContainer]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.heroOrb}>
                  <MaterialIcons name="restaurant" size={56} color={MealMindColors.onPrimary} />
                </LinearGradient>
              </View>

              <View style={[styles.satCard, styles.satTopRight, MealMindShadow.ambient]}>
                <MaterialIcons name="set-meal" size={32} color={MealMindColors.onSecondaryContainer} />
              </View>
              <View style={[styles.satCard, styles.satBottomLeft, { backgroundColor: MealMindColors.tertiaryFixed }, MealMindShadow.ambient]}>
                <MaterialIcons name="local-fire-department" size={32} color={MealMindColors.onTertiaryFixed} />
              </View>
            </Animated.View>

            <View style={styles.copyBlock}>
              <Text style={styles.title}>Finding the best meals for you...</Text>
              <Text style={styles.subtitle}>
                {"We're curating recipes that match your family's taste and dietary preferences."}
              </Text>
            </View>

            <View style={styles.progressBlock}>
              <View style={[styles.track, { width: trackW }]}>
                <Animated.View style={[styles.fillWrap, { width: fillWidth }]}>
                  <LinearGradient
                    colors={[MealMindColors.primary, MealMindColors.primaryContainer]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Animated.View
                    style={[
                      styles.shimmerStripe,
                      {
                        transform: [{ translateX: shimmerTranslate }],
                      },
                    ]}
                  />
                </Animated.View>
              </View>

              <View style={styles.progressMeta}>
                <View style={styles.statusLeft}>
                  <Animated.View style={[styles.pulseDot, { opacity: pulse }]} />
                  <Text style={styles.statusLabel}>Analyzing pantry items</Text>
                </View>
                <Text style={styles.percent}>{percentLabel}%</Text>
              </View>
            </View>

            <View style={styles.skeletonGrid}>
              <View style={styles.skeletonCard}>
                <MaterialIcons name="eco" size={28} color={MealMindColors.secondary} />
                <View style={styles.skeletonBar} />
              </View>
              <View style={styles.skeletonCard}>
                <MaterialIcons name="timer" size={28} color={MealMindColors.secondary} />
                <View style={styles.skeletonBar} />
              </View>
            </View>
          </View>
        </View>
      </View>
    </MealMindScreen>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: MealMindColors.surface,
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: MealMindSpace.lg,
  },
  blobTop: {
    position: 'absolute',
    top: 80,
    left: 40,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: MealMindColors.secondaryContainer,
    opacity: 0.2,
  },
  blobBottom: {
    position: 'absolute',
    bottom: 160,
    right: 40,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: MealMindColors.primaryContainer,
    opacity: 0.1,
  },
  column: {
    maxWidth: CONTENT_MAX,
    width: '100%',
    alignItems: 'center',
    gap: MealMindSpace.xl + 8,
  },
  heroCluster: {
    width: 216,
    height: 216,
    alignSelf: 'center',
    marginTop: MealMindSpace.md,
  },
  heroFrame: {
    width: 192,
    height: 192,
    borderRadius: MealMindRadii.lg,
    backgroundColor: MealMindColors.surfaceContainerLowest,
    alignSelf: 'center',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    ...MealMindShadow.ambient,
  },
  heroBgImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.2,
    transform: [{ scale: 1.1 }],
  },
  heroOrb: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    ...MealMindShadow.glowCta,
  },
  satCard: {
    position: 'absolute',
    padding: MealMindSpace.md,
    borderRadius: MealMindRadii.md,
    backgroundColor: MealMindColors.secondaryContainer,
  },
  satTopRight: {
    top: -8,
    right: -8,
  },
  satBottomLeft: {
    bottom: -8,
    left: -8,
  },
  copyBlock: {
    gap: MealMindSpace.md,
    alignItems: 'center',
    paddingHorizontal: MealMindSpace.sm,
  },
  title: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: headlineTracking,
    textAlign: 'center',
    color: MealMindColors.onSurface,
  },
  subtitle: {
    fontFamily: MealMindFonts.body,
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
    color: MealMindColors.onSurfaceVariant,
    maxWidth: 300,
    alignSelf: 'center',
  },
  progressBlock: {
    width: '100%',
    gap: MealMindSpace.lg,
    alignItems: 'center',
  },
  track: {
    height: 12,
    borderRadius: 6,
    backgroundColor: MealMindColors.surfaceContainerHigh,
    overflow: 'hidden',
  },
  fillWrap: {
    height: '100%',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  shimmerStripe: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '45%',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  progressMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: MealMindSpace.sm,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MealMindSpace.sm,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: MealMindColors.primary,
  },
  statusLabel: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 14,
    color: MealMindColors.primary,
  },
  percent: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 14,
    color: MealMindColors.onSurfaceVariant,
  },
  skeletonGrid: {
    flexDirection: 'row',
    gap: MealMindSpace.md,
    marginTop: MealMindSpace.lg,
    opacity: 0.4,
    width: '100%',
  },
  skeletonCard: {
    flex: 1,
    backgroundColor: MealMindColors.surfaceContainerLow,
    borderRadius: MealMindRadii.md,
    padding: MealMindSpace.md,
    alignItems: 'center',
    gap: MealMindSpace.sm,
  },
  skeletonBar: {
    height: 8,
    width: 64,
    borderRadius: 4,
    backgroundColor: `${MealMindColors.outlineVariant}4D`,
  },
});
