import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Fragment, useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FallbackRecipeImage } from '@/components/FallbackRecipeImage';
import { MealMindMainTabFooter, MealMindScreen } from '@/components/mealmind';
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindShadow, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { generateRecipesFromContext } from '@/lib/ai-recipe-generate';
import { showErrorToast } from '@/lib/mealmind-toast';
import type { MockRecipe } from '@/lib/mealmind-recipe-mocks';
import { RESULTS_FEATURED, RESULTS_SECONDARY } from '@/lib/mealmind-recipe-mocks';
import { getProfile } from '@/lib/profile-storage';
import {
  getLastGeneratedSession,
  setLastGeneratedRecipes,
  type LastGeneratedSession,
} from '@/lib/recipe-generation-session';

const MAX_W = 1152;
const OUTLINE_15 = `${MealMindColors.outlineVariant}24`;
const MAX_AI_RECIPES = 12;

function dedupeNewIds(existing: MockRecipe[], batch: MockRecipe[]): MockRecipe[] {
  const taken = new Set(existing.map((r) => r.id));
  return batch.map((r) => {
    if (!taken.has(r.id)) {
      taken.add(r.id);
      return r;
    }
    const nid = `${r.id}-more-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    taken.add(nid);
    return { ...r, id: nid };
  });
}

function AiRecipeMetaRow({ recipe, session }: { recipe: MockRecipe; session: LastGeneratedSession }) {
  const mealRaw = session.mealTypeLabel?.trim() || recipe.tags[0]?.label || 'Meal';
  const styleRaw = session.cookingStyleLabel?.trim() || '—';
  return (
    <View style={[styles.heroMetaRow, styles.metaRowWrap]}>
      <Text style={styles.badge}>{mealRaw.toUpperCase()}</Text>
      <View style={styles.metaItem}>
        <MaterialIcons name="local-fire-department" size={16} color={MealMindColors.onSurfaceVariant} />
        <Text style={styles.metaTextSm}>{recipe.kcalLabel}</Text>
      </View>
      <View style={[styles.metaItem, styles.styleMeta]}>
        <MaterialIcons name="tune" size={16} color={MealMindColors.onSurfaceVariant} />
        <Text style={styles.metaTextSm} numberOfLines={1}>
          {styleRaw}
        </Text>
      </View>
    </View>
  );
}

const EXTRA_RESULTS = [
  {
    id: 'rustic-basil-pesto',
    title: 'Rustic Basil Pesto',
    time: '12m',
    badge: 'Fast Food',
    note: '3 Ingredients',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDfj4UoJ1eA8V6-cDxL37r1SSbsUqKD9Yov1FDdCAa9AIecvOxALEI7U7tzheSAhBjGFxDM2Oj-0VSowkJunbGSHzhwwAUwsap_tZpml9ll9oSTNeUPjF-qMLP9Mp0V84uLdVbBtfUjRwksoo3kulQj_i9HfpcioYvBKQh5X_CwbMRoRRRdn9uVLVgADXIsBodj79Cz5XWMSwwbU61XXucsWnbwgYpB5VoUKHIorS6zkmhqXaPGevt8hYV7nLUiIEqHjCSWCxxaFCg',
  },
  {
    id: 'artisan-thin-crust',
    title: 'Artisan Thin Crust',
    time: '45m',
    badge: 'Snacks',
    note: 'Weekend Special',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCckoldbZ4qg3y0p3KL-CqqxiW6l68cJqXbu1f4izoqoZ_htO_Fxt-F5ToZPUFJUiKN4vBFMUWNFpMK-0qz5XaxG-hwR1ou4Q95FPwGRAIoaKr5pUGLw6CuCDMceC_5eTBjKpZCG1vVnnFb6hTtn0rl2yeWAHUvRb7bAU_nxp85MSj5HPZ41Mqb83kztZ55pnpiqmVHhdcKLfBJB11360bD-GLlRC2nri0gPRLK8KR1b6QXZZiAP-Ade1XIgEEniJNj7GL-17dU2C8',
  },
] as const;

function shortTime(label: string): string {
  return label.replace(/\s*mins?\s*$/i, 'm').replace(/\s+min\s*$/i, 'm');
}

function bestPickPillText(mealTypeLabel: string | undefined): string {
  const t = mealTypeLabel?.trim().toLowerCase() ?? '';
  if (t.includes('breakfast')) {
    return 'Best choice for breakfast';
  }
  if (t.includes('lunch')) {
    return 'Best choice for lunch';
  }
  if (t.includes('dinner')) {
    return 'Best choice for dinner';
  }
  if (t.includes('snack')) {
    return 'Best pick for snacks';
  }
  return 'Top pick for you';
}

export default function ResultsScreen() {
  const router = useRouter();
  const [session, setSession] = useState<LastGeneratedSession | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void getLastGeneratedSession().then((s) => {
        if (!alive) {
          return;
        }
        if (s != null && s.recipes.length > 0) {
          setSession(s);
        } else {
          setSession(null);
        }
      });
      return () => {
        alive = false;
      };
    }, []),
  );

  const aiRecipes = session?.recipes;
  const featured = aiRecipes?.[0];
  const restAi = aiRecipes != null && aiRecipes.length > 1 ? aiRecipes.slice(1) : [];
  const canLoadMore =
    Boolean(featured && session?.searchContext && (session.recipes.length ?? 0) < MAX_AI_RECIPES);

  const onLoadMore = () => {
    if (loadingMore || session == null) {
      return;
    }
    if (!session.searchContext) {
      showErrorToast('Recipes', 'Run Find My Meal on Home first, then you can load more ideas here.');
      return;
    }
    if ((session.recipes?.length ?? 0) >= MAX_AI_RECIPES) {
      showErrorToast('Recipes', 'List is full. Start a new search from Home.');
      return;
    }
    setLoadingMore(true);
    void (async () => {
      try {
        const profile = await getProfile();
        const more = await generateRecipesFromContext(session.searchContext!, profile, {
          excludeRecipeTitles: session.recipes.map((r) => r.title),
        });
        if (more.length === 0) {
          showErrorToast('Recipes', 'Could not generate more. Check API keys or try again.');
          return;
        }
        const added = dedupeNewIds(session.recipes, more);
        const merged = [...session.recipes, ...added].slice(0, MAX_AI_RECIPES);
        await setLastGeneratedRecipes(merged, {
          mealTypeLabel: session.mealTypeLabel,
          cookingTimeLabel: session.cookingTimeLabel,
          cookingStyleLabel: session.cookingStyleLabel,
          searchContext: session.searchContext,
        });
        for (const r of added) {
          const u = r.heroImage?.trim();
          if (u?.startsWith('http')) {
            void Image.prefetch(u);
          }
        }
        const next = await getLastGeneratedSession();
        if (next != null) {
          setSession(next);
        }
      } catch (e) {
        showErrorToast('Recipes', e instanceof Error ? e.message : 'Could not load more.');
      } finally {
        setLoadingMore(false);
      }
    })();
  };

  return (
    <MealMindScreen scroll={false} contentBottomInset={24} footer={<MealMindMainTabFooter />}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.inner}>
          <View style={styles.topBar}>
            <View style={styles.topBarRow}>
              <Pressable accessibilityRole="button" accessibilityLabel="Open menu" style={styles.iconBtn}>
                <MaterialIcons name="menu" size={24} color={MealMindColors.primary} />
              </Pressable>
              <Text style={styles.topBarTitle}>Culinary Curator</Text>
            </View>
            <View style={styles.avatarWell}>
              <MaterialIcons name="account-circle" size={26} color={MealMindColors.primary} />
            </View>
          </View>

          <View style={styles.pageHeader}>
            <Text style={styles.headline}>Best Picks for You</Text>
            <Text style={styles.lead}>
              {featured
                ? 'Generated from your profile, filters, and ingredients'
                : 'Curated based on your seasonal preferences'}
            </Text>
          </View>

          <Pressable
            onPress={() => router.push(`/recipe/${featured ? featured.id : RESULTS_FEATURED.id}`)}
            style={({ pressed }) => [styles.heroCard, pressed && styles.pressed]}>
            <View style={styles.bestPill}>
              <MaterialIcons name="star" size={14} color={MealMindColors.onPrimary} />
              <Text style={styles.bestPillText}>
                {featured ? bestPickPillText(session?.mealTypeLabel) : 'Best Choice for Tonight'}
              </Text>
            </View>
            <View style={styles.heroImageWrap}>
              <FallbackRecipeImage
                uri={featured ? featured.heroImage : RESULTS_FEATURED.image}
                style={styles.heroImage}
                contentFit="cover"
                useNeutralFallbacks={Boolean(featured)}
                stableKey={featured ? `${featured.id}-hero` : `${RESULTS_FEATURED.id}-hero`}
              />
            </View>
            <View style={styles.heroTextCol}>
              <View style={styles.rowBetween}>
                <Text style={styles.heroTitle}>{featured ? featured.title : RESULTS_FEATURED.title}</Text>
                <Text style={styles.heroTime}>
                  {featured ? shortTime(featured.timeLabel) : RESULTS_FEATURED.time.replace(' mins', 'm')}
                </Text>
              </View>
              {featured && session ? (
                <AiRecipeMetaRow recipe={featured} session={session} />
              ) : (
                <View style={styles.heroMetaRow}>
                  <Text style={styles.badge}>HEALTHY</Text>
                  <View style={styles.metaItem}>
                    <MaterialIcons name="local-fire-department" size={16} color={MealMindColors.onSurfaceVariant} />
                    <Text style={styles.metaTextSm}>420 kcal</Text>
                  </View>
                  <View style={[styles.metaItem, styles.styleMeta]}>
                    <MaterialIcons name="tune" size={16} color={MealMindColors.onSurfaceVariant} />
                    <Text style={styles.metaTextSm}>—</Text>
                  </View>
                </View>
              )}
            </View>
          </Pressable>

          {restAi.length > 0
            ? restAi.map((recipe, idx) => {
                const cardStyle = idx % 2 === 0 ? styles.sideCard : styles.horizontalCard;
                return (
                  <Pressable
                    key={recipe.id}
                    onPress={() => router.push(`/recipe/${recipe.id}`)}
                    style={({ pressed }) => [cardStyle, pressed && styles.pressed]}>
                    <View style={styles.recipeImageWrap}>
                      <FallbackRecipeImage
                        uri={recipe.heroImage}
                        style={styles.sideImage}
                        contentFit="cover"
                        useNeutralFallbacks
                        stableKey={`${recipe.id}-card`}
                      />
                    </View>
                    <View style={styles.recipeBody}>
                      <View style={styles.rowBetween}>
                        <Text style={styles.sideTitle}>{recipe.title}</Text>
                        <Text style={styles.recipeTime}>{shortTime(recipe.timeLabel)}</Text>
                      </View>
                      {session ? <AiRecipeMetaRow recipe={recipe} session={session} /> : null}
                    </View>
                  </Pressable>
                );
              })
            : (
                <Fragment>
                <Pressable
                  key="mock-a"
                  onPress={() => router.push(`/recipe/${RESULTS_SECONDARY[0].id}`)}
                  style={({ pressed }) => [styles.sideCard, pressed && styles.pressed]}>
                  <View style={styles.recipeImageWrap}>
                    <FallbackRecipeImage
                      uri={RESULTS_SECONDARY[0].image}
                      style={styles.sideImage}
                      contentFit="cover"
                      stableKey={`${RESULTS_SECONDARY[0].id}-card`}
                    />
                  </View>
                  <View style={styles.recipeBody}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.sideTitle}>{RESULTS_SECONDARY[0].title}</Text>
                      <Text style={styles.recipeTime}>{RESULTS_SECONDARY[0].time.replace(' mins', 'm')}</Text>
                    </View>
                    <View style={styles.heroMetaRow}>
                      <Text style={styles.badge}>VEGAN</Text>
                      <View style={styles.metaItem}>
                        <MaterialIcons name="local-fire-department" size={16} color={MealMindColors.onSurfaceVariant} />
                        <Text style={styles.metaTextSm}>320 kcal</Text>
                      </View>
                      <View style={[styles.metaItem, styles.styleMeta]}>
                        <MaterialIcons name="tune" size={16} color={MealMindColors.onSurfaceVariant} />
                        <Text style={styles.metaTextSm}>—</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
                <Pressable
                  key="mock-b"
                  onPress={() => router.push(`/recipe/${RESULTS_SECONDARY[1].id}`)}
                  style={({ pressed }) => [styles.horizontalCard, pressed && styles.pressed]}>
                  <View style={styles.recipeImageWrap}>
                    <FallbackRecipeImage
                      uri={RESULTS_SECONDARY[1].image}
                      style={styles.sideImage}
                      contentFit="cover"
                      stableKey={`${RESULTS_SECONDARY[1].id}-card`}
                    />
                  </View>
                  <View style={styles.recipeBody}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.sideTitle}>{RESULTS_SECONDARY[1].title}</Text>
                      <Text style={styles.recipeTime}>{RESULTS_SECONDARY[1].time.replace(' mins', 'm')}</Text>
                    </View>
                    <View style={styles.heroMetaRow}>
                      <Text style={styles.badge}>LIGHT</Text>
                      <View style={styles.metaItem}>
                        <MaterialIcons name="local-fire-department" size={16} color={MealMindColors.onSurfaceVariant} />
                        <Text style={styles.metaTextSm}>280 kcal</Text>
                      </View>
                      <View style={[styles.metaItem, styles.styleMeta]}>
                        <MaterialIcons name="tune" size={16} color={MealMindColors.onSurfaceVariant} />
                        <Text style={styles.metaTextSm}>—</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
                </Fragment>
              )}

          {!featured &&
            EXTRA_RESULTS.map((item) => (
              <View key={item.id} style={styles.horizontalCard}>
                <View style={styles.recipeImageWrap}>
                  <FallbackRecipeImage
                    uri={item.image}
                    style={styles.sideImage}
                    contentFit="cover"
                    stableKey={`${item.id}-extra`}
                  />
                </View>
                <View style={styles.recipeBody}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.sideTitle}>{item.title}</Text>
                    <Text style={styles.recipeTime}>{item.time}</Text>
                  </View>
                  <View style={styles.heroMetaRow}>
                    <Text style={styles.badge}>{item.badge}</Text>
                    <Text style={styles.metaTextSm}>{item.note}</Text>
                  </View>
                </View>
              </View>
            ))}

          <View style={styles.loadMoreSection}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Load more recipe ideas"
              disabled={!canLoadMore || loadingMore}
              onPress={onLoadMore}
              style={({ pressed }) => [
                styles.loadMoreBtn,
                pressed && styles.pressed,
                (!canLoadMore || loadingMore) && styles.loadMoreBtnDisabled,
              ]}>
              {loadingMore ? (
                <ActivityIndicator color={MealMindColors.onPrimary} />
              ) : (
                <>
                  <Text style={styles.loadMoreLabel}>Load More</Text>
                  <MaterialIcons name="expand-more" size={20} color={MealMindColors.onPrimary} />
                </>
              )}
            </Pressable>
            <Text style={styles.categoryTitle}>Explore More Categories</Text>
            <View style={styles.categoryWrap}>
              {['Fast Food', 'Snacks', 'Desserts', 'Healthy Bites'].map((label) => (
                <View key={label} style={styles.categoryChip}>
                  <Text style={styles.categoryChipText}>{label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.bottomPad} />
        </View>
      </ScrollView>
    </MealMindScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: MealMindSpace.xl,
  },
  inner: {
    maxWidth: MAX_W,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: MealMindSpace.lg,
    paddingTop: MealMindSpace.lg,
    gap: MealMindSpace.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: MealMindSpace.sm,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MealMindSpace.sm,
  },
  iconBtn: {
    padding: 6,
  },
  topBarTitle: {
    fontFamily: MealMindFonts.headlineExtraBold,
    fontSize: 22,
    letterSpacing: headlineTracking,
    color: MealMindColors.primary,
  },
  avatarWell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MealMindColors.surfaceContainerHigh,
    borderWidth: 2,
    borderColor: `${MealMindColors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageHeader: {
    gap: 4,
  },
  headline: {
    fontFamily: MealMindFonts.headlineExtraBold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: headlineTracking,
    color: MealMindColors.onSurface,
  },
  lead: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 14,
    color: MealMindColors.onSurfaceVariant,
  },
  pressed: {
    opacity: 0.94,
  },
  heroCard: {
    backgroundColor: MealMindColors.surfaceContainerLowest,
    borderRadius: MealMindRadii.md,
    overflow: 'hidden',
    ...MealMindShadow.ambient,
    position: 'relative',
  },
  bestPill: {
    position: 'absolute',
    top: MealMindSpace.md,
    left: MealMindSpace.md,
    zIndex: 2,
    backgroundColor: MealMindColors.primary,
    borderRadius: MealMindRadii.full,
    paddingHorizontal: MealMindSpace.md,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bestPillText: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 12,
    color: MealMindColors.onPrimary,
  },
  heroImageWrap: {
    height: 256,
    width: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroTextCol: {
    padding: MealMindSpace.lg,
    gap: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: MealMindSpace.sm,
  },
  heroTitle: {
    flex: 1,
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 24,
    color: MealMindColors.onSurface,
  },
  heroTime: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 20,
    color: MealMindColors.primary,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MealMindSpace.sm,
  },
  metaRowWrap: {
    flexWrap: 'wrap',
    rowGap: 6,
  },
  styleMeta: {
    flexShrink: 1,
    maxWidth: '100%',
  },
  badge: {
    backgroundColor: MealMindColors.secondaryContainer,
    color: MealMindColors.onSecondaryContainer,
    paddingHorizontal: MealMindSpace.md,
    paddingVertical: 4,
    borderRadius: MealMindRadii.full,
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 11,
    overflow: 'hidden',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaTextSm: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 12,
    color: MealMindColors.onSurfaceVariant,
  },
  sideCard: {
    backgroundColor: MealMindColors.surfaceContainerLowest,
    borderRadius: MealMindRadii.md,
    overflow: 'hidden',
    ...MealMindShadow.ambient,
  },
  horizontalCard: {
    backgroundColor: MealMindColors.surfaceContainerLowest,
    borderRadius: MealMindRadii.md,
    overflow: 'hidden',
    ...MealMindShadow.ambient,
  },
  recipeImageWrap: {
    height: 224,
    width: '100%',
    backgroundColor: MealMindColors.surfaceContainerHigh,
  },
  sideImage: {
    width: '100%',
    height: '100%',
  },
  recipeBody: {
    padding: MealMindSpace.lg,
    gap: MealMindSpace.sm,
  },
  sideTitle: {
    flex: 1,
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 22,
    color: MealMindColors.onSurface,
  },
  recipeTime: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 18,
    color: MealMindColors.primary,
  },
  loadMoreSection: {
    alignItems: 'center',
    paddingVertical: MealMindSpace.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: OUTLINE_15,
    gap: MealMindSpace.lg,
  },
  loadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: MealMindSpace.md,
    paddingHorizontal: MealMindSpace.xl,
    borderRadius: MealMindRadii.md,
    backgroundColor: MealMindColors.primary,
    minHeight: 48,
  },
  loadMoreBtnDisabled: {
    opacity: 0.45,
  },
  loadMoreLabel: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 16,
    color: MealMindColors.onPrimary,
  },
  categoryTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 20,
    color: MealMindColors.onSurface,
  },
  categoryWrap: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: MealMindSpace.sm,
  },
  categoryChip: {
    backgroundColor: MealMindColors.surfaceContainer,
    borderRadius: MealMindRadii.md,
    paddingHorizontal: MealMindSpace.md,
    paddingVertical: MealMindSpace.sm,
  },
  categoryChipText: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 14,
    color: MealMindColors.onSurface,
  },
  bottomPad: {
    height: MealMindSpace.xl,
  },
});
