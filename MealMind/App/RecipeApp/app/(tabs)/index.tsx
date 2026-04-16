import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ChipRow, GlowButton, MealMindScreen } from '@/components/mealmind';
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindShadow, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';

/** ~Tailwind `max-w-2xl` from home mock. */
const CONTENT_MAX = 672;

const TIME_CHIPS = [
  { id: '15', label: '<15 min' },
  { id: '30', label: '15-30 min' },
  { id: '45', label: '30+ min' },
];

const MEAL_TYPE_CHIPS = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snacks', label: 'Snacks' },
];

const COOKING_STYLE_CHIPS = [
  { id: 'quick', label: 'Quick Meals' },
  { id: 'family', label: 'Family Meals' },
  { id: 'budget', label: 'Budget Friendly' },
  { id: 'healthy', label: 'Healthy' },
];

const RECENT_COOKBOOKS = [
  {
    id: 'autumn-stew',
    date: 'Oct 24, 2023',
    title: 'Autumn Stew Night',
    tags: ['Beef Chuck', 'Carrots', 'Red Wine', 'Thyme'],
  },
  {
    id: 'quick-pasta',
    date: 'Yesterday',
    title: 'Quick Pasta Dinner',
    tags: ['Penne', 'Zucchini', 'Parmesan', 'Lemon'],
  },
] as const;

const RECOMMENDED_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCUYrigExE_1p27TyKw-Dzrul_Fo6P2M4pAbBPVHjgW-UEoiIiLtdcM7Vkr_JwM-4RJYgD25yLR62o3KiqHZ1pltianwOLn_jdqbliqE46QDa8fTDBfsndoaaYq_PTJscR5n5Vbhz0_YCQQJXVEa6F9CnW0bWcIDkPotOXMxuklkA6q-BZhKqIWCyz3S6nipJKpVeMVz3kBdF0XQPT-roApjEAuiT0BN0ySZdVuGTimffjDlxy7CGd0tPJEHzPmo639v8kwWRVlM78';

export default function HomeScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [timeId, setTimeId] = useState<string | null>('15');
  const [mealTypeId, setMealTypeId] = useState<string | null>('breakfast');
  const [cookingStyleId, setCookingStyleId] = useState<string | null>(null);

  const fabBottom = Math.max(tabBarHeight, 52) + MealMindSpace.md;

  return (
    <MealMindScreen scroll={false} contentBottomInset={0} showFooter={false}>
      <View style={styles.shell}>
        <View style={styles.topBar}>
          <View style={styles.topBarRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open menu"
              hitSlop={12}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
              <MaterialIcons name="menu" size={24} color={MealMindColors.primary} />
            </Pressable>
            <Text style={styles.topBarTitle}>Culinary Curator</Text>
          </View>
          <View style={styles.avatarWell}>
            <MaterialIcons name="account-circle" size={26} color={MealMindColors.primary} />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: fabBottom + 72 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.formMax}>
            <View style={styles.hero}>
              <Text style={styles.headline}>{"What's in your kitchen?"}</Text>
              <Text style={styles.subhead}>Add ingredients to discover your next family meal.</Text>
            </View>

            <View style={styles.searchRow}>
              <MaterialIcons name="search" size={22} color={MealMindColors.outline} />
              <TextInput
                value={ingredientsInput}
                onChangeText={setIngredientsInput}
                placeholder="Enter ingredients (e.g. Chicken, Spinach)"
                placeholderTextColor={MealMindColors.outlineVariant}
                style={styles.searchInput}
              />
              <View style={styles.inputActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Voice input"
                  style={({ pressed }) => [styles.iconRound, pressed && styles.pressed]}>
                  <MaterialIcons name="mic" size={20} color={MealMindColors.primary} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Add from photo"
                  style={({ pressed }) => [styles.iconRound, pressed && styles.pressed]}>
                  <MaterialIcons name="photo-camera" size={20} color={MealMindColors.primary} />
                </Pressable>
              </View>
            </View>

            <View style={styles.filters}>
              <ChipRow
                sectionLabel="Meal Type"
                chips={MEAL_TYPE_CHIPS}
                selectedId={mealTypeId}
                onSelect={setMealTypeId}
                edgeBleed
              />
              <ChipRow
                sectionLabel="Cooking Style"
                chips={COOKING_STYLE_CHIPS}
                selectedId={cookingStyleId}
                onSelect={(id) => setCookingStyleId((prev) => (prev === id ? null : id))}
                edgeBleed
              />
              <ChipRow
                sectionLabel="Cooking Time"
                chips={TIME_CHIPS}
                selectedId={timeId}
                onSelect={setTimeId}
                edgeBleed
              />
            </View>

            <View style={styles.historySection}>
              <View style={styles.historyHeader}>
                <View>
                  <Text style={styles.historyTitle}>Recent Cookbooks</Text>
                  <Text style={styles.historySub}>Ingredients you used recently</Text>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel="Clear all history">
                  <Text style={styles.clearAll}>Clear all</Text>
                </Pressable>
              </View>

              {RECENT_COOKBOOKS.map((item) => (
                <View key={item.id} style={styles.historyCard}>
                  <View style={styles.historyCardHeader}>
                    <View>
                      <Text style={styles.historyDate}>{item.date}</Text>
                      <Text style={styles.historyCardTitle}>{item.title}</Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Reuse ingredients from ${item.title}`}
                      style={({ pressed }) => [styles.reuseBtn, pressed && styles.pressed]}>
                      <MaterialIcons name="add-circle" size={20} color={MealMindColors.primary} />
                    </Pressable>
                  </View>
                  <View style={styles.historyTags}>
                    {item.tags.map((tag) => (
                      <View key={tag} style={styles.historyTag}>
                        <Text style={styles.historyTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}

              <View style={[styles.historyCard, styles.historyMoreCard]}>
                <MaterialIcons name="history" size={20} color={MealMindColors.outline} />
                <Text style={styles.historyMoreText}>View Full History</Text>
              </View>
            </View>

            <View style={styles.recommendWrap}>
              <Image
                source={{ uri: RECOMMENDED_IMAGE }}
                style={styles.recommendImage}
                contentFit="cover"
                accessibilityLabel="Featured chef pick soup"
              />
              <View style={styles.recommendOverlay} pointerEvents="none" />
              <View style={styles.recommendContent}>
                <Text style={styles.recommendBadge}>CHEF&apos;S PICK</Text>
                <Text style={styles.recommendTitle}>Hearty Pumpkin & Sage Soup</Text>
                <Text style={styles.recommendBody}>Perfect for a cozy autumn evening.</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Full-area overlay so `flex-end` pins the CTA above the tab bar on web + native. */}
        <View
          pointerEvents="box-none"
          style={[StyleSheet.absoluteFillObject, styles.fabOverlay, { paddingBottom: fabBottom }]}>
          <View style={styles.fabInner}>
            <GlowButton
              label="Find My Meal"
              trailing={<MaterialIcons name="restaurant-menu" size={22} color={MealMindColors.onPrimary} />}
              style={styles.fabButton}
              onPress={() => router.push('/loading')}
            />
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: MealMindSpace.lg,
    paddingVertical: MealMindSpace.md + 2,
    backgroundColor: `${MealMindColors.surface}CC`,
    ...MealMindShadow.ambient,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MealMindSpace.sm,
  },
  topBarTitle: {
    fontFamily: MealMindFonts.headlineExtraBold,
    fontSize: 22,
    letterSpacing: headlineTracking,
    color: MealMindColors.primary,
  },
  iconBtn: {
    padding: 6,
  },
  pressed: {
    opacity: 0.75,
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: MealMindSpace.lg,
    paddingTop: MealMindSpace.lg,
  },
  formMax: {
    maxWidth: CONTENT_MAX,
    width: '100%',
    alignSelf: 'center',
    gap: MealMindSpace.xl,
  },
  hero: {
    gap: 8,
  },
  headline: {
    fontFamily: MealMindFonts.headlineExtraBold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: headlineTracking,
    color: MealMindColors.onSurface,
  },
  subhead: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 15,
    color: MealMindColors.onSurfaceVariant,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MealMindSpace.sm,
    backgroundColor: MealMindColors.surfaceContainerHigh,
    borderRadius: MealMindRadii.md,
    paddingHorizontal: MealMindSpace.md,
    paddingVertical: 8,
    minHeight: 64,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontFamily: MealMindFonts.body,
    fontSize: 15,
    paddingVertical: 8,
    color: MealMindColors.onSurface,
  },
  inputActions: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    flexShrink: 0,
  },
  iconRound: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${MealMindColors.secondaryContainer}80`,
  },
  filters: {
    gap: MealMindSpace.xl,
  },
  historySection: {
    gap: MealMindSpace.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: MealMindSpace.md,
  },
  historyTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 28,
    color: MealMindColors.onSurface,
  },
  historySub: {
    marginTop: 2,
    fontFamily: MealMindFonts.body,
    fontSize: 13,
    color: MealMindColors.onSurfaceVariant,
  },
  clearAll: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 13,
    color: MealMindColors.primary,
  },
  historyCard: {
    backgroundColor: MealMindColors.surfaceContainerLow,
    borderRadius: MealMindRadii.md,
    padding: MealMindSpace.lg,
    gap: MealMindSpace.md,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: MealMindSpace.md,
  },
  historyDate: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 11,
    textTransform: 'uppercase',
    color: MealMindColors.outline,
  },
  historyCardTitle: {
    marginTop: 4,
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 20,
    color: MealMindColors.onSurface,
  },
  reuseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${MealMindColors.primaryContainer}33`,
  },
  historyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  historyTag: {
    backgroundColor: MealMindColors.surfaceContainerLowest,
    borderRadius: MealMindRadii.full,
    paddingHorizontal: MealMindSpace.md,
    paddingVertical: 6,
  },
  historyTagText: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 12,
    color: MealMindColors.onSurfaceVariant,
  },
  historyMoreCard: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: `${MealMindColors.outlineVariant}66`,
    backgroundColor: MealMindColors.surfaceContainerLow,
    minHeight: 96,
  },
  historyMoreText: {
    marginTop: 6,
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 14,
    color: MealMindColors.onSurfaceVariant,
  },
  recommendWrap: {
    height: 256,
    borderRadius: MealMindRadii.md,
    overflow: 'hidden',
    position: 'relative',
  },
  recommendImage: {
    ...StyleSheet.absoluteFillObject,
  },
  recommendOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  recommendContent: {
    position: 'absolute',
    left: MealMindSpace.lg,
    right: MealMindSpace.lg,
    bottom: MealMindSpace.lg,
  },
  recommendBadge: {
    alignSelf: 'flex-start',
    backgroundColor: MealMindColors.primary,
    color: MealMindColors.onPrimary,
    borderRadius: MealMindRadii.full,
    paddingHorizontal: MealMindSpace.sm + 2,
    paddingVertical: 5,
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 11,
    overflow: 'hidden',
  },
  recommendTitle: {
    marginTop: MealMindSpace.sm,
    fontFamily: MealMindFonts.headlineExtraBold,
    fontSize: 28,
    color: '#FFFFFF',
  },
  recommendBody: {
    marginTop: 4,
    fontFamily: MealMindFonts.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  fabOverlay: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: MealMindSpace.lg,
    zIndex: 20,
  },
  fabInner: {
    width: '100%',
    maxWidth: CONTENT_MAX,
    alignItems: 'stretch',
  },
  fabButton: {
    alignSelf: 'stretch',
  },
});
