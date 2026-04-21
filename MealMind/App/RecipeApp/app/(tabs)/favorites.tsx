import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Fragment, useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FallbackRecipeImage } from '@/components/FallbackRecipeImage';
import { MealMindScreen } from '@/components/mealmind';
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindShadow, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { getFavoriteEntries, removeFavoriteRecipe, type FavoriteEntry } from '@/lib/favorites-storage';
import { showErrorToast, showSuccessToast } from '@/lib/mealmind-toast';

const FILTER_CHIPS = ['All Favorites', 'Quick Meals', 'Kid-Friendly', 'Healthy'] as const;

export default function FavoritesScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof FILTER_CHIPS)[number]>('All Favorites');
  const [entries, setEntries] = useState<FavoriteEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void getFavoriteEntries().then((list) => {
        if (alive) setEntries(list);
      });
      return () => {
        alive = false;
      };
    }, []),
  );

  const featured = entries[0];
  const compact = entries.slice(1);

  const onRemove = useCallback(async (id: string) => {
    try {
      await removeFavoriteRecipe(id);
      setEntries((prev) => prev.filter((e) => e.recipe.id !== id));
      showSuccessToast('Removed from Favorites');
    } catch (e) {
      showErrorToast('Favorites', e instanceof Error ? e.message : 'Could not remove favorite.');
    }
  }, []);

  return (
    <MealMindScreen scroll={false} contentBottomInset={0} showFooter={false}>
      <View style={styles.shell}>
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <Pressable hitSlop={12} style={styles.iconBtn}>
              <MaterialIcons name="arrow-back" size={24} color={MealMindColors.primary} />
            </Pressable>
            <Text style={styles.topTitle} numberOfLines={1}>
              Smart Family Recipe Assistant
            </Text>
          </View>
          <Pressable hitSlop={12} style={styles.iconBtn}>
            <MaterialIcons name="search" size={24} color={MealMindColors.onSurface} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.inner}>
            <View style={styles.pageHead}>
              <View style={styles.pageHeadRow}>
                <Text style={styles.headline}>Your Favorites</Text>
                <Text style={styles.count}>{entries.length} Recipes</Text>
              </View>
              <LinearAccent />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {FILTER_CHIPS.map((label) => {
                const on = filter === label;
                return (
                  <Pressable
                    key={label}
                    onPress={() => setFilter(label)}
                    style={[styles.filterChip, on ? styles.filterChipOn : styles.filterChipOff]}>
                    <Text style={[styles.filterChipText, on && styles.filterChipTextOn]}>{label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {featured != null ? (
              <Pressable
                onPress={() => router.push(`/recipe/${featured.recipe.id}`)}
                style={({ pressed }) => [styles.featured, pressed && styles.pressed]}>
                <View style={styles.featuredImageWrap}>
                  <FallbackRecipeImage
                    uri={featured.recipe.heroImage}
                    style={styles.featuredImage}
                    contentFit="cover"
                    useNeutralFallbacks
                    stableKey={`${featured.recipe.id}-fav-featured`}
                  />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.55)']} style={StyleSheet.absoluteFill} />
                  <Pressable
                    style={styles.fabHeart}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Remove from favorites"
                    onPress={() => void onRemove(featured.recipe.id)}>
                    <MaterialIcons name="favorite" size={22} color={MealMindColors.primary} />
                  </Pressable>
                </View>
                <View style={styles.featuredBody}>
                  <View style={styles.badgeRow}>
                    {featured.recipe.tags.slice(0, 2).map((t) => (
                      <View key={t.label} style={[styles.badge, badgeStyle(t.variant === 'tertiary' ? 'tertiary' : 'primary')]}>
                        <Text style={[styles.badgeText, badgeTextStyle(t.variant === 'tertiary' ? 'tertiary' : 'primary')]}>{t.label}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.featuredTitle}>{featured.recipe.title}</Text>
                  <Text style={styles.featuredBlurb} numberOfLines={2}>
                    {featured.recipe.subtitle}
                  </Text>
                </View>
              </Pressable>
            ) : null}

            {compact.length > 0 ? (
              <View style={styles.grid}>
                {compact.map((entry) => (
                  <Pressable
                    key={entry.recipe.id}
                    onPress={() => router.push(`/recipe/${entry.recipe.id}`)}
                    style={({ pressed }) => [styles.compactCard, pressed && styles.pressed]}>
                    <View style={styles.squareImgWrap}>
                      <FallbackRecipeImage
                        uri={entry.recipe.heroImage}
                        style={styles.squareImg}
                        contentFit="cover"
                        useNeutralFallbacks
                        stableKey={`${entry.recipe.id}-fav`}
                      />
                      <Pressable
                        style={styles.fabHeartSm}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel="Remove from favorites"
                        onPress={() => void onRemove(entry.recipe.id)}>
                        <MaterialIcons name="favorite" size={20} color={MealMindColors.primary} />
                      </Pressable>
                    </View>
                    <View style={styles.compactBody}>
                      {entry.recipe.tags[0] != null ? (
                        <Text style={styles.compactKicker}>{entry.recipe.tags[0].label}</Text>
                      ) : null}
                      <Text style={styles.compactTitle}>{entry.recipe.title}</Text>
                      <View style={styles.compactMeta}>
                        <View style={styles.metaItem}>
                          <MaterialIcons name="schedule" size={14} color={MealMindColors.onSurfaceVariant} />
                          <Text style={styles.metaXs}>{entry.recipe.timeLabel}</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <MaterialIcons name="local-fire-department" size={14} color={MealMindColors.onSurfaceVariant} />
                          <Text style={styles.metaXs}>{entry.recipe.kcalLabel}</Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : entries.length === 0 ? (
              <Fragment>
                <Text style={styles.emptyTitle}>No favorites yet</Text>
                <Text style={styles.emptyBody}>
                  Open a recipe and tap “Save to Favorites”. Your saved recipes will show up here.
                </Text>
              </Fragment>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </MealMindScreen>
  );
}

function LinearAccent() {
  return <View style={styles.accentBar} />;
}

type FavBadgeVariant = 'primary' | 'tertiary';

function badgeStyle(variant: FavBadgeVariant) {
  switch (variant) {
    case 'tertiary':
      return { backgroundColor: MealMindColors.tertiaryFixed };
    case 'primary':
      return { backgroundColor: MealMindColors.secondaryContainer };
    default:
      return { backgroundColor: MealMindColors.secondaryContainer };
  }
}

function badgeTextStyle(variant: FavBadgeVariant) {
  switch (variant) {
    case 'tertiary':
      return { color: MealMindColors.onTertiaryFixed };
    case 'primary':
      return { color: MealMindColors.secondary };
    default:
      return { color: MealMindColors.onSecondaryContainer };
  }
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: MealMindColors.surface,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: MealMindSpace.lg,
    paddingVertical: MealMindSpace.md,
    backgroundColor: `${MealMindColors.surface}CC`,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${MealMindColors.outlineVariant}26`,
  },
  topBarLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: MealMindSpace.md,
    minWidth: 0,
  },
  topTitle: {
    flex: 1,
    fontFamily: MealMindFonts.headlineExtraBold,
    fontSize: 17,
    letterSpacing: headlineTracking,
    color: MealMindColors.primary,
  },
  iconBtn: {
    padding: 4,
  },
  scroll: {
    paddingHorizontal: MealMindSpace.lg,
    paddingTop: MealMindSpace.lg,
    paddingBottom: MealMindSpace.xl * 2,
  },
  inner: {
    maxWidth: 1024,
    width: '100%',
    alignSelf: 'center',
    gap: MealMindSpace.lg + 4,
  },
  pageHead: {
    gap: MealMindSpace.sm,
  },
  pageHeadRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: MealMindSpace.md,
  },
  headline: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.68,
    color: MealMindColors.onSurface,
    flex: 1,
  },
  count: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 14,
    color: MealMindColors.onSurfaceVariant,
    marginBottom: 4,
  },
  accentBar: {
    width: 64,
    height: 6,
    borderRadius: 3,
    backgroundColor: MealMindColors.primary,
  },
  filterRow: {
    gap: MealMindSpace.sm,
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: MealMindSpace.lg,
    paddingVertical: MealMindSpace.sm + 2,
    borderRadius: MealMindRadii.md,
  },
  filterChipOn: {
    backgroundColor: MealMindColors.primary,
    ...MealMindShadow.glowCta,
  },
  filterChipOff: {
    backgroundColor: MealMindColors.secondaryContainer,
  },
  filterChipText: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 14,
    color: MealMindColors.onSecondaryContainer,
  },
  filterChipTextOn: {
    color: MealMindColors.onPrimary,
  },
  pressed: {
    opacity: 0.94,
  },
  featured: {
    borderRadius: MealMindRadii.md,
    overflow: 'hidden',
    backgroundColor: MealMindColors.surfaceContainerLowest,
    ...MealMindShadow.ambient,
  },
  featuredImageWrap: {
    aspectRatio: 16 / 9,
    width: '100%',
    position: 'relative',
    backgroundColor: MealMindColors.surfaceContainerHigh,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  fabHeart: {
    position: 'absolute',
    top: MealMindSpace.md,
    right: MealMindSpace.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...MealMindShadow.ambient,
  },
  featuredBody: {
    padding: MealMindSpace.lg,
    gap: MealMindSpace.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: MealMindSpace.sm,
  },
  badge: {
    paddingHorizontal: MealMindSpace.sm + 2,
    paddingVertical: 4,
    borderRadius: MealMindRadii.full,
  },
  badgeText: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  emptyTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 22,
    color: MealMindColors.onSurface,
    marginTop: MealMindSpace.lg,
  },
  emptyBody: {
    fontFamily: MealMindFonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: MealMindColors.onSurfaceVariant,
    maxWidth: 520,
  },
  featuredTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 22,
    lineHeight: 28,
    color: MealMindColors.onSurface,
  },
  featuredBlurb: {
    fontFamily: MealMindFonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: MealMindColors.onSurfaceVariant,
  },
  grid: {
    gap: MealMindSpace.lg,
  },
  compactCard: {
    borderRadius: MealMindRadii.md,
    overflow: 'hidden',
    backgroundColor: MealMindColors.surfaceContainerLowest,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
    ...MealMindShadow.ambient,
  },
  squareImgWrap: {
    aspectRatio: 1,
    width: '100%',
    position: 'relative',
    backgroundColor: MealMindColors.surfaceContainerHigh,
  },
  squareImg: {
    width: '100%',
    height: '100%',
  },
  fabHeartSm: {
    position: 'absolute',
    top: MealMindSpace.md,
    right: MealMindSpace.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactBody: {
    padding: MealMindSpace.md,
    gap: 6,
    flex: 1,
  },
  compactKicker: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: MealMindColors.secondary,
  },
  compactTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 18,
    lineHeight: 24,
    color: MealMindColors.onSurface,
    marginBottom: 4,
  },
  compactMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: MealMindSpace.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaXs: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 12,
    color: MealMindColors.onSurfaceVariant,
  },
});
