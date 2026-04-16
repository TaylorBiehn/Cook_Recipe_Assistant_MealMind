import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MealMindScreen } from '@/components/mealmind';
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindShadow, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { FAVORITE_CARDS, type FavoriteCard } from '@/lib/mealmind-recipe-mocks';

type MetaIcon = NonNullable<FavoriteCard['meta']>[number]['icon'];

const FILTER_CHIPS = ['All Favorites', 'Quick Meals', 'Kid-Friendly', 'Healthy'] as const;

function metaIcon(name: MetaIcon): ComponentProps<typeof MaterialIcons>['name'] {
  switch (name) {
    case 'schedule':
      return 'schedule';
    case 'local-fire-department':
      return 'local-fire-department';
    case 'group':
      return 'group';
    default:
      return 'schedule';
  }
}

export default function FavoritesScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof FILTER_CHIPS)[number]>('All Favorites');

  const featured = FAVORITE_CARDS.find((c) => c.featured);
  const compact = FAVORITE_CARDS.filter((c) => !c.featured);

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
                <Text style={styles.count}>12 Recipes</Text>
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
                onPress={() => router.push(`/recipe/${featured.id}`)}
                style={({ pressed }) => [styles.featured, pressed && styles.pressed]}>
                <View style={styles.featuredImageWrap}>
                  <Image source={{ uri: featured.image }} style={styles.featuredImage} contentFit="cover" />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.55)']} style={StyleSheet.absoluteFill} />
                  <Pressable style={styles.fabHeart} hitSlop={8}>
                    <MaterialIcons name="favorite" size={22} color={MealMindColors.primary} />
                  </Pressable>
                </View>
                <View style={styles.featuredBody}>
                  <View style={styles.badgeRow}>
                    {featured.badges.map((b) => (
                      <View key={b.label} style={[styles.badge, badgeStyle(b.variant)]}>
                        <Text style={[styles.badgeText, badgeTextStyle(b.variant)]}>{b.label}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.featuredTitle}>{featured.title}</Text>
                  {featured.blurb != null ? <Text style={styles.featuredBlurb}>{featured.blurb}</Text> : null}
                </View>
              </Pressable>
            ) : null}

            <View style={styles.grid}>
              {compact.map((card) => (
                <Pressable
                  key={card.id}
                  onPress={() => router.push(`/recipe/${card.id}`)}
                  style={({ pressed }) => [styles.compactCard, pressed && styles.pressed]}>
                  <View style={styles.squareImgWrap}>
                    <Image source={{ uri: card.image }} style={styles.squareImg} contentFit="cover" />
                    <Pressable style={styles.fabHeartSm} hitSlop={8}>
                      <MaterialIcons name="favorite" size={20} color={MealMindColors.primary} />
                    </Pressable>
                  </View>
                  <View style={styles.compactBody}>
                    {card.badges[0] != null ? (
                      <Text style={styles.compactKicker}>{card.badges[0].label}</Text>
                    ) : null}
                    <Text style={styles.compactTitle}>{card.title}</Text>
                    {card.meta != null ? (
                      <View style={styles.compactMeta}>
                        {card.meta.map((m) => (
                          <View key={m.text} style={styles.metaItem}>
                            <MaterialIcons name={metaIcon(m.icon)} size={14} color={MealMindColors.onSurfaceVariant} />
                            <Text style={styles.metaXs}>{m.text}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </MealMindScreen>
  );
}

function LinearAccent() {
  return <View style={styles.accentBar} />;
}

function badgeStyle(variant: FavoriteCard['badges'][number]['variant']) {
  switch (variant) {
    case 'tertiary':
      return { backgroundColor: MealMindColors.tertiaryFixed };
    case 'primary':
      return { backgroundColor: MealMindColors.secondaryContainer };
    default:
      return { backgroundColor: MealMindColors.secondaryContainer };
  }
}

function badgeTextStyle(variant: FavoriteCard['badges'][number]['variant']) {
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
