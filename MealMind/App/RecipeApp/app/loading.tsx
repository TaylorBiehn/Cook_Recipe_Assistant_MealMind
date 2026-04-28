import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { FallbackRecipeImage } from '@/components/FallbackRecipeImage';
import { MealMindFlowHeader, MealMindScreen } from '@/components/mealmind';
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindShadow, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { generateRecipesFromContext } from '@/lib/ai-recipe-generate';
import { showErrorToast } from '@/lib/mealmind-toast';
import { getProfile } from '@/lib/profile-storage';
import { recordRecentIngredients } from '@/lib/recent-ingredients-api';
import {
  clearLastGeneratedRecipes,
  setLastGeneratedRecipes,
  takePendingRecipeSearch,
} from '@/lib/recipe-generation-session';

const CONTENT_MAX = 420;
const MIN_SPIN_MS = 1200;
const PROGRESS_MS = 2200;

/**
 * Appetizing harvest quinoa bowl — already in `TRUSTED_RECIPE_HERO_URLS` (confirmed loading on the design CDN).
 * `FallbackRecipeImage` will swap to other curated food photos if this ever fails.
 */
const HERO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuARJ93sHwYt5yEXdlDISjupfDinSIbuRMHA32tDfboyASbE893eOY5hhMm-TQFYWzo96JHL2EC3UTtly9_WtxOAp16_qaSs5rO6pjEO-jFrRS37N3EpGJLZULmVwZv0edQ0CjqqnPSk78LNVKVbETo8wt-zuxqb85CqRx1g4ydLX1SgvJtsbzCcpRsQJJBnEsCGbtaAnbPT4UgXwpRWBgTsojFl3OPcgdSkxFxncEYNXcffi8oNGU7l_dbSz163ns15UzQE7vebvJ0';

export default function LoadingScreen() {
  const router = useRouter();
  const [pct, setPct] = useState(0);
  const floatY = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const t0 = Date.now();
      const pending = await takePendingRecipeSearch();
      if (pending) {
        try {
          const profile = await getProfile();
          const recipes = await generateRecipesFromContext(pending, profile);
          if (recipes.length > 0) {
            await setLastGeneratedRecipes(recipes, {
              mealTypeLabel: pending.mealTypeLabel,
              cookingTimeLabel: pending.cookingTimeLabel,
              cookingStyleLabel: pending.cookingStyleLabel,
              searchContext: pending,
            });
            try {
              await recordRecentIngredients(pending.ingredients);
            } catch {
              // Keep recipe flow resilient when backend history is unavailable.
            }
            for (const r of recipes) {
              const u = r.heroImage?.trim();
              if (u?.startsWith('http')) {
                void Image.prefetch(u);
              }
            }
          } else {
            await clearLastGeneratedRecipes();
          }
        } catch (e) {
          await clearLastGeneratedRecipes();
          showErrorToast('Recipes', e instanceof Error ? e.message : 'Could not generate recipes.');
        }
      }
      const elapsed = Date.now() - t0;
      const wait = Math.max(0, MIN_SPIN_MS - elapsed);
      await new Promise<void>((resolve) => setTimeout(resolve, wait));
      if (!cancelled) {
        router.replace('/results');
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
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

    const sub = progress.addListener(({ value }) => {
      setPct(Math.min(100, Math.round(value * 100)));
    });

    Animated.timing(progress, {
      toValue: 1,
      duration: PROGRESS_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    return () => {
      progress.removeListener(sub);
      floatLoop.stop();
    };
  }, [floatY, progress]);

  const translateY = floatY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <MealMindScreen scroll={false} contentBottomInset={0}>
      <View style={styles.shell}>
        <MealMindFlowHeader title="Meal Planner" showBottomDivider />

        <View style={styles.main}>
          <View style={styles.column}>
            <Animated.View style={[styles.heroWrap, { transform: [{ translateY }] }]}>
              <View style={styles.heroFrame}>
                <FallbackRecipeImage
                  uri={HERO_IMG}
                  style={styles.heroImg}
                  contentFit="cover"
                  stableKey="loading-hero"
                />
              </View>
              <View style={[styles.heroBadge, styles.heroBadgeKcal]}>
                <MaterialIcons name="local-fire-department" size={18} color={MealMindColors.primary} />
              </View>
              <View style={[styles.heroBadge, styles.heroBadgeSpark]}>
                <MaterialIcons name="auto-awesome" size={16} color={MealMindColors.secondary} />
              </View>
            </Animated.View>

            <Text style={styles.title}>Finding the best meals for you</Text>
            <Text style={styles.subtitle}>
              Matching recipes to your ingredients, taste, and time available.
            </Text>

            <View style={styles.progressBlock}>
              <View style={styles.track}>
                <Animated.View style={[styles.fill, { width: fillWidth }]} />
              </View>
              <View style={styles.progressMeta}>
                <View style={styles.statusLeft}>
                  <MaterialIcons name="auto-awesome" size={16} color={MealMindColors.primary} />
                  <Text style={styles.statusLabel}>Curating your plate</Text>
                </View>
                <Text style={styles.percent}>{pct}%</Text>
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
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: MealMindSpace.lg,
  },
  column: {
    maxWidth: CONTENT_MAX,
    width: '100%',
    alignItems: 'center',
    gap: MealMindSpace.md,
  },
  heroWrap: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: MealMindSpace.md,
  },
  heroFrame: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    backgroundColor: MealMindColors.surfaceContainerHigh,
    borderWidth: 6,
    borderColor: 'rgba(255,255,255,0.85)',
    ...MealMindShadow.ambient,
  },
  heroImg: {
    width: '100%',
    height: '100%',
  },
  heroBadge: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: MealMindColors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    ...MealMindShadow.ambient,
  },
  heroBadgeKcal: {
    top: 8,
    right: 4,
  },
  heroBadgeSpark: {
    bottom: 12,
    left: 0,
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  title: {
    fontFamily: MealMindFonts.headlineExtraBold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: headlineTracking,
    textAlign: 'center',
    color: MealMindColors.onSurface,
  },
  subtitle: {
    fontFamily: MealMindFonts.body,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: MealMindColors.onSurfaceVariant,
    maxWidth: 320,
    marginBottom: MealMindSpace.lg,
  },
  progressBlock: {
    width: '100%',
    gap: MealMindSpace.sm,
  },
  track: {
    width: '100%',
    height: 8,
    borderRadius: MealMindRadii.full,
    backgroundColor: MealMindColors.surfaceContainerHigh,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: MealMindRadii.full,
    backgroundColor: MealMindColors.primary,
  },
  progressMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusLabel: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 13,
    color: MealMindColors.primary,
  },
  percent: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 13,
    letterSpacing: 1,
    color: MealMindColors.onSurfaceVariant,
  },
});
