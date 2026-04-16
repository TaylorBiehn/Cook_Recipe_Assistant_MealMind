import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MealMindMainTabFooter, MealMindScreen } from '@/components/mealmind';
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindShadow, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { RESULTS_FEATURED, RESULTS_SECONDARY } from '@/lib/mealmind-recipe-mocks';

const MAX_W = 1152;
const OUTLINE_15 = `${MealMindColors.outlineVariant}24`;

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

export default function ResultsScreen() {
  const router = useRouter();

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
            <Text style={styles.lead}>Curated based on your seasonal preferences</Text>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.bestPill}>
              <MaterialIcons name="star" size={14} color={MealMindColors.onPrimary} />
              <Text style={styles.bestPillText}>Best Choice for Tonight</Text>
            </View>
            <View style={styles.heroImageWrap}>
              <Image source={{ uri: RESULTS_FEATURED.image }} style={styles.heroImage} contentFit="cover" />
            </View>
            <View style={styles.heroTextCol}>
              <View style={styles.rowBetween}>
                <Text style={styles.heroTitle}>{RESULTS_FEATURED.title}</Text>
                <Text style={styles.heroTime}>{RESULTS_FEATURED.time.replace(' mins', 'm')}</Text>
              </View>
              <View style={styles.heroMetaRow}>
                <Text style={styles.badge}>HEALTHY</Text>
                <View style={styles.metaItem}>
                  <MaterialIcons name="local-fire-department" size={16} color={MealMindColors.onSurfaceVariant} />
                  <Text style={styles.metaTextSm}>420 kcal</Text>
                </View>
              </View>
            </View>
          </View>

          <Pressable
            onPress={() => router.push(`/recipe/${RESULTS_SECONDARY[0].id}`)}
            style={({ pressed }) => [styles.sideCard, pressed && styles.pressed]}>
            <View style={styles.recipeImageWrap}>
              <Image source={{ uri: RESULTS_SECONDARY[0].image }} style={styles.sideImage} contentFit="cover" />
            </View>
            <View style={styles.recipeBody}>
              <View style={styles.rowBetween}>
                <Text style={styles.sideTitle}>{RESULTS_SECONDARY[0].title}</Text>
                <Text style={styles.recipeTime}>{RESULTS_SECONDARY[0].time.replace(' mins', 'm')}</Text>
              </View>
              <View style={styles.heroMetaRow}>
                <Text style={styles.badge}>VEGAN</Text>
                <Text style={styles.metaTextSm}>Easy Prep</Text>
              </View>
            </View>
          </Pressable>

          <Pressable
            onPress={() => router.push(`/recipe/${RESULTS_SECONDARY[1].id}`)}
            style={({ pressed }) => [styles.horizontalCard, pressed && styles.pressed]}>
            <View style={styles.recipeImageWrap}>
              <Image source={{ uri: RESULTS_SECONDARY[1].image }} style={styles.sideImage} contentFit="cover" />
            </View>
            <View style={styles.recipeBody}>
              <View style={styles.rowBetween}>
                <Text style={styles.sideTitle}>{RESULTS_SECONDARY[1].title}</Text>
                <Text style={styles.recipeTime}>{RESULTS_SECONDARY[1].time.replace(' mins', 'm')}</Text>
              </View>
              <View style={styles.heroMetaRow}>
                <Text style={styles.badge}>LIGHT</Text>
                <Text style={styles.metaTextSm}>Family Choice</Text>
              </View>
            </View>
          </Pressable>

          {EXTRA_RESULTS.map((item) => (
            <View key={item.id} style={styles.horizontalCard}>
              <View style={styles.recipeImageWrap}>
                <Image source={{ uri: item.image }} style={styles.sideImage} contentFit="cover" />
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
            <Pressable style={({ pressed }) => [styles.loadMoreBtn, pressed && styles.pressed]}>
              <Text style={styles.loadMoreLabel}>Load More</Text>
              <MaterialIcons name="expand-more" size={20} color={MealMindColors.onPrimary} />
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
