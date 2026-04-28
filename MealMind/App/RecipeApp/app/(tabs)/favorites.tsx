import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MealMindScreen } from '@/components/mealmind';
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindShadow, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { getFavorites, removeFavorite, type StoredFavorite } from '@/lib/favorites-storage';
import { showErrorToast, showSuccessToast } from '@/lib/mealmind-toast';
import { FAVORITES_FILTER_CHIPS, type MealTypeId } from '@/lib/meal-taxonomy';

type FilterId = (typeof FAVORITES_FILTER_CHIPS)[number]['id'];

/** Shared image height so featured and grid rows align visually. */
const FAVORITES_CARD_IMAGE_HEIGHT = 220;

export default function FavoritesScreen() {
  const router = useRouter();
  const [items, setItems] = useState<StoredFavorite[]>([]);
  const [filter, setFilter] = useState<FilterId>('all');
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const list = await getFavorites();
      setItems(list);
    } catch (e) {
      showErrorToast('Favorites', e instanceof Error ? e.message : 'Could not load favorites.');
    } finally {
      setLoaded(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((f) => f.mealTypes?.includes(filter as MealTypeId));
  }, [filter, items]);

  const confirmRemove = useCallback(
    (fav: StoredFavorite) => {
      Alert.alert(
        'Remove from favorites?',
        `“${fav.title}” will be removed from your favorites list.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => {
              void (async () => {
                try {
                  const next = await removeFavorite(fav.id);
                  setItems(next);
                  showSuccessToast('Removed', `${fav.title} is no longer in your favorites.`);
                } catch (e) {
                  showErrorToast(
                    'Favorites',
                    e instanceof Error ? e.message : 'Could not remove recipe.',
                  );
                }
              })();
            },
          },
        ],
      );
    },
    [],
  );

  const featured = filtered[0];
  const compact = filtered.length > 1 ? filtered.slice(1) : [];

  return (
    <MealMindScreen scroll={false} contentBottomInset={0} showFooter={false}>
      <View style={styles.shell}>
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={12}
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
              style={styles.iconBtn}>
              <MaterialIcons name="arrow-back" size={24} color={MealMindColors.primary} />
            </Pressable>
            <Text style={styles.topTitle} numberOfLines={1}>
              Your Favorites
            </Text>
          </View>
          <Pressable hitSlop={12} style={styles.iconBtn} accessibilityLabel="Search favorites">
            <MaterialIcons name="search" size={24} color={MealMindColors.onSurface} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.inner}>
            <View style={styles.pageHead}>
              <View style={styles.pageHeadRow}>
                <Text style={styles.headline}>Your Favorites</Text>
                <Text style={styles.count}>
                  {items.length} {items.length === 1 ? 'Recipe' : 'Recipes'}
                </Text>
              </View>
              <View style={styles.accentBar} />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}>
              {FAVORITES_FILTER_CHIPS.map((chip) => {
                const on = filter === chip.id;
                return (
                  <Pressable
                    key={chip.id}
                    onPress={() => setFilter(chip.id)}
                    style={[styles.filterChip, on ? styles.filterChipOn : styles.filterChipOff]}>
                    <Text style={[styles.filterChipText, on && styles.filterChipTextOn]}>
                      {chip.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {loaded && items.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <MaterialIcons name="favorite-border" size={36} color={MealMindColors.primary} />
                </View>
                <Text style={styles.emptyTitle}>No favorites yet</Text>
                <Text style={styles.emptyBody}>
                  Tap the heart on a recipe to save it here for quick access later.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.replace('/(tabs)')}
                  style={({ pressed }) => [styles.emptyCta, pressed && styles.pressed]}>
                  <Text style={styles.emptyCtaText}>Find a Recipe</Text>
                </Pressable>
              </View>
            ) : null}

            {loaded && items.length > 0 && filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Nothing here yet</Text>
                <Text style={styles.emptyBody}>
                  You haven’t saved a recipe tagged with that meal type.
                </Text>
              </View>
            ) : null}

            {featured != null ? (
              <Pressable
                onPress={() => router.push(`/recipe/${featured.id}`)}
                style={({ pressed }) => [styles.featured, pressed && styles.pressed]}>
                <View style={styles.featuredImageWrap}>
                  <Image source={{ uri: featured.image }} style={styles.featuredImage} contentFit="cover" />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.78)']}
                    locations={[0.38, 1]}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                  />
                  <View style={styles.imageOverlayBottom} pointerEvents="none">
                    {featured.badgeLabels && featured.badgeLabels.length > 0 ? (
                      <View style={styles.overlayBadgeRow}>
                        {featured.badgeLabels.slice(0, 2).map((label) => (
                          <View key={label} style={styles.overlayBadge}>
                            <Text style={styles.overlayBadgeText}>{label}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                    <Text style={styles.overlayTitle} numberOfLines={2}>
                      {featured.title}
                    </Text>
                    {featured.meta != null && featured.meta.length > 0 ? (
                      <Text style={styles.overlayMetaLine} numberOfLines={1}>
                        {featured.meta.map((m) => m.text).join(' · ')}
                      </Text>
                    ) : null}
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${featured.title} from favorites`}
                    onPress={() => confirmRemove(featured)}
                    hitSlop={8}
                    style={styles.fabHeart}>
                    <MaterialIcons name="favorite" size={22} color={MealMindColors.primary} />
                  </Pressable>
                </View>
              </Pressable>
            ) : null}

            {compact.length > 0 ? (
              <View style={styles.grid}>
                {compact.map((card) => (
                  <Pressable
                    key={card.id}
                    onPress={() => router.push(`/recipe/${card.id}`)}
                    style={({ pressed }) => [styles.compactCard, pressed && styles.pressed]}>
                    <View style={styles.compactImageWrap}>
                      <Image source={{ uri: card.image }} style={styles.compactImage} contentFit="cover" />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.78)']}
                        locations={[0.42, 1]}
                        style={StyleSheet.absoluteFill}
                        pointerEvents="none"
                      />
                      <View style={styles.imageOverlayBottomCompact} pointerEvents="none">
                        {card.badgeLabels?.[0] != null ? (
                          <Text style={styles.overlayKicker}>{card.badgeLabels[0]}</Text>
                        ) : null}
                        <Text style={styles.overlayTitleCompact} numberOfLines={2}>
                          {card.title}
                        </Text>
                        {card.meta != null && card.meta.length > 0 ? (
                          <Text style={styles.overlayMetaLineCompact} numberOfLines={1}>
                            {card.meta.map((m) => m.text).join(' · ')}
                          </Text>
                        ) : null}
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${card.title} from favorites`}
                        onPress={() => confirmRemove(card)}
                        hitSlop={8}
                        style={styles.fabHeartSm}>
                        <MaterialIcons name="favorite" size={20} color={MealMindColors.primary} />
                      </Pressable>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </MealMindScreen>
  );
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
    paddingVertical: MealMindSpace.xs,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: MealMindSpace.md + 4,
    paddingVertical: MealMindSpace.sm + 4,
    borderRadius: MealMindRadii.full,
    borderWidth: 1.5,
    minHeight: 40,
    justifyContent: 'center',
  },
  filterChipOn: {
    borderColor: MealMindColors.primary,
    backgroundColor: MealMindColors.primary,
  },
  filterChipOff: {
    backgroundColor: MealMindColors.surface,
    borderColor: `${MealMindColors.outlineVariant}BB`,
  },
  filterChipText: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 14,
    color: MealMindColors.onSurface,
  },
  filterChipTextOn: {
    color: MealMindColors.onPrimary,
  },
  pressed: {
    opacity: 0.94,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: MealMindSpace.xl * 1.5,
    gap: MealMindSpace.md,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MealMindColors.secondaryContainer,
  },
  emptyTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 22,
    color: MealMindColors.onSurface,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: MealMindFonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: MealMindColors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 300,
  },
  emptyCta: {
    marginTop: MealMindSpace.sm,
    backgroundColor: MealMindColors.primary,
    paddingHorizontal: MealMindSpace.lg,
    paddingVertical: MealMindSpace.sm + 2,
    borderRadius: MealMindRadii.full,
  },
  emptyCtaText: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 14,
    color: MealMindColors.onPrimary,
  },
  featured: {
    borderRadius: MealMindRadii.md,
    overflow: 'hidden',
    backgroundColor: MealMindColors.surfaceContainerLowest,
    ...MealMindShadow.ambient,
  },
  featuredImageWrap: {
    height: FAVORITES_CARD_IMAGE_HEIGHT,
    width: '100%',
    position: 'relative',
    backgroundColor: MealMindColors.surfaceContainerHigh,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlayBottom: {
    position: 'absolute',
    left: MealMindSpace.lg,
    right: MealMindSpace.lg,
    bottom: MealMindSpace.lg,
    gap: 6,
    zIndex: 1,
  },
  overlayBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: MealMindSpace.xs,
    marginBottom: 2,
  },
  overlayBadge: {
    paddingHorizontal: MealMindSpace.sm,
    paddingVertical: 3,
    borderRadius: MealMindRadii.full,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  overlayBadgeText: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.95)',
  },
  overlayTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 22,
    lineHeight: 28,
    color: '#ffffff',
  },
  overlayMetaLine: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
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
    zIndex: 2,
  },
  grid: {
    gap: MealMindSpace.lg,
  },
  compactCard: {
    borderRadius: MealMindRadii.md,
    overflow: 'hidden',
    backgroundColor: MealMindColors.surfaceContainerLowest,
    ...MealMindShadow.ambient,
  },
  compactImageWrap: {
    height: FAVORITES_CARD_IMAGE_HEIGHT,
    width: '100%',
    position: 'relative',
    backgroundColor: MealMindColors.surfaceContainerHigh,
  },
  compactImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlayBottomCompact: {
    position: 'absolute',
    left: MealMindSpace.md,
    right: MealMindSpace.md,
    bottom: MealMindSpace.md,
    gap: 4,
    zIndex: 1,
  },
  overlayKicker: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.88)',
    marginBottom: 2,
  },
  overlayTitleCompact: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 18,
    lineHeight: 23,
    color: '#ffffff',
  },
  overlayMetaLineCompact: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 2,
  },
  fabHeartSm: {
    position: 'absolute',
    top: MealMindSpace.sm + 4,
    right: MealMindSpace.sm + 4,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
});
