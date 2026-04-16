import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlowButton, MealMindFlowHeader, MealMindScreen } from '@/components/mealmind';
import { FLAVOR_OPTIONS, SKILL_LABELS } from '@/constants/onboarding-options';
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindShadow, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts } from '@/constants/mealmind-typography';
import { getCountryLabel, getCountryPickerItems } from '@/lib/country-picker-data';
import type { SkillLevel, StoredProfile } from '@/lib/profile-storage';
import { getProfile, setGetStartedSeen, setOnboardingComplete, setProfile } from '@/lib/profile-storage';

/** ~Tailwind `max-w-xl` — keeps chips readable on wide web / tablet layouts. */
const FORM_MAX_WIDTH = 576;

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

const SKILL_CHIPS: { id: SkillLevel; label: string }[] = (Object.keys(SKILL_LABELS) as SkillLevel[]).map((id) => ({
  id,
  label: SKILL_LABELS[id],
}));

const OUTLINE_BORDER = `${MealMindColors.outlineVariant}26`;

function SectionHeader({
  title,
  iconName,
  wellColor,
  iconColor,
}: {
  title: string;
  iconName: MaterialIconName;
  wellColor: string;
  iconColor: string;
}) {
  return (
    <View style={styles.sectionHeaderRow}>
      <View style={[styles.sectionIconWell, { backgroundColor: wellColor }]}>
        <MaterialIcons name={iconName} size={22} color={iconColor} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const countryItems = useMemo(() => getCountryPickerItems(), []);
  const [countryCode, setCountryCode] = useState('WORLDWIDE');
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [countryQuery, setCountryQuery] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('beginner');
  const [preferences, setPreferences] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [dislikeDraft, setDislikeDraft] = useState('');
  const [hydrated, setHydrated] = useState(false);

  const filteredCountries = useMemo(() => {
    const q = countryQuery.trim().toLowerCase();
    if (q.length === 0) return countryItems;
    return countryItems.filter(
      (row) => row.label.toLowerCase().includes(q) || row.value.toLowerCase().includes(q),
    );
  }, [countryItems, countryQuery]);

  useEffect(() => {
    void getProfile().then((p) => {
      if (p != null) {
        setCountryCode(p.countryCode);
        setSkillLevel(p.skillLevel);
        setPreferences(p.preferences);
        setDislikes(p.dislikes);
      }
      setHydrated(true);
    });
  }, []);

  const openCountryModal = useCallback(() => {
    setCountryQuery('');
    setCountryModalOpen(true);
  }, []);

  const closeCountryModal = useCallback(() => {
    setCountryModalOpen(false);
    setCountryQuery('');
  }, []);

  const selectCountry = useCallback((code: string) => {
    setCountryCode(code);
    closeCountryModal();
  }, [closeCountryModal]);

  const togglePreference = useCallback((tag: string) => {
    setPreferences((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }, []);

  const addDislike = useCallback(() => {
    const t = dislikeDraft.trim().toLowerCase();
    if (t.length === 0) return;
    setDislikes((prev) => (prev.includes(t) ? prev : [...prev, t]));
    setDislikeDraft('');
  }, [dislikeDraft]);

  const removeDislike = useCallback((tag: string) => {
    setDislikes((prev) => prev.filter((d) => d !== tag));
  }, []);

  const complete = useCallback(async () => {
    const prev = await getProfile();
    const next: StoredProfile = {
      countryCode,
      skillLevel,
      kitchenComfort: prev?.kitchenComfort ?? 'balanced',
      preferences,
      dislikes,
      vegetarianFocus: prev?.vegetarianFocus ?? false,
      pescetarianFriendly: prev?.pescetarianFriendly ?? false,
      wellnessGoal: prev?.wellnessGoal ?? 'unsure',
      dietaryPreference: prev?.dietaryPreference ?? 'none',
      cuisines: prev?.cuisines ?? [],
      allergies: prev?.allergies ?? [],
      avoidFoods: prev?.avoidFoods ?? [],
      cookingExperience: prev?.cookingExperience ?? 'home_cook',
      kitchenEquipment: prev?.kitchenEquipment ?? [],
      cookingSchedule: prev?.cookingSchedule ?? 'flexible',
      flavorProfile: prev?.flavorProfile ?? [],
      spicyLevel: prev?.spicyLevel ?? 'medium',
      calorieFocus: prev?.calorieFocus ?? 'no_preference',
    };
    await setProfile(next);
    await setGetStartedSeen();
    await setOnboardingComplete();
    router.replace('/(tabs)');
  }, [countryCode, dislikes, preferences, router, skillLevel]);

  const stickyBottomPad = insets.bottom + MealMindSpace.lg;

  if (!hydrated) {
    return (
      <MealMindScreen scroll={false}>
        <MealMindFlowHeader title="Registration" showBottomDivider />
        <View style={styles.hydrate} />
      </MealMindScreen>
    );
  }

  return (
    <MealMindScreen scroll={false} contentBottomInset={0}>
      <View style={styles.root}>
        <View style={styles.decor} pointerEvents="none">
          <View style={styles.blobPrimary} />
          <View style={styles.blobSecondary} />
        </View>

        <View style={styles.column}>
          <MealMindFlowHeader title="Registration" showBottomDivider />

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: stickyBottomPad + 120 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.formInner}>
              <View style={styles.hero}>
                <Text style={styles.heroTitle}>Registration</Text>
                <Text style={styles.heroSub}>
                  Let’s set up your profile to discover flavors your family will love.
                </Text>
              </View>

              <View style={styles.sections}>
                <View style={styles.sectionBlock}>
                  <SectionHeader
                    title="Culinary culture"
                    iconName="public"
                    wellColor={MealMindColors.primaryFixed}
                    iconColor={MealMindColors.onPrimaryFixedVariant}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Region or country"
                    accessibilityHint="Opens a list to choose your region or country"
                    onPress={openCountryModal}
                    style={({ pressed }) => [styles.selectField, pressed && styles.selectFieldPressed]}>
                    <Text style={styles.selectFieldText} numberOfLines={1}>
                      {getCountryLabel(countryCode)}
                    </Text>
                    <MaterialIcons name="expand-more" size={24} color={MealMindColors.outline} />
                  </Pressable>
                  <Text style={styles.cultureHint}>
                    This helps us suggest authentic spices and seasonal favorites from your region.
                  </Text>
                </View>

                <View style={styles.sectionBlock}>
                  <SectionHeader
                    title="Culinary skill level"
                    iconName="outdoor-grill"
                    wellColor={MealMindColors.tertiaryContainer}
                    iconColor={MealMindColors.onTertiaryContainer}
                  />
                  <View style={styles.skillRow}>
                    {SKILL_CHIPS.map(({ id, label }) => {
                      const on = skillLevel === id;
                      return (
                        <Pressable
                          key={id}
                          onPress={() => setSkillLevel(id)}
                          style={[
                            styles.choiceChip,
                            styles.skillChipCell,
                            on ? styles.choiceChipOn : styles.choiceChipOff,
                            on && MealMindShadow.ambient,
                          ]}>
                          <Text style={[styles.choiceChipText, on && styles.choiceChipTextOn]}>{label}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.sectionBlock}>
                  <SectionHeader
                    title="Taste preferences"
                    iconName="restaurant-menu"
                    wellColor={MealMindColors.secondaryContainer}
                    iconColor={MealMindColors.onSecondaryContainer}
                  />
                  <View style={styles.tasteRow}>
                    {FLAVOR_OPTIONS.map((tag) => {
                      const on = preferences.includes(tag);
                      return (
                        <Pressable
                          key={tag}
                          onPress={() => togglePreference(tag)}
                          style={[
                            styles.choiceChip,
                            styles.tasteChip,
                            on ? styles.choiceChipOn : styles.choiceChipOff,
                            on && MealMindShadow.ambient,
                          ]}>
                          <Text style={[styles.choiceChipText, on && styles.choiceChipTextOn]}>{tag}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.sectionBlock}>
                  <SectionHeader
                    title="Dislikes"
                    iconName="block"
                    wellColor={MealMindColors.errorContainer}
                    iconColor={MealMindColors.onErrorContainer}
                  />
                  <View style={styles.dislikeCard}>
                    <Text style={styles.dislikeCardLead}>Commonly avoided ingredients:</Text>
                    <View style={styles.dislikePillWrap}>
                      {dislikes.map((d) => (
                        <View key={d} style={styles.dislikePill}>
                          <Text style={styles.dislikePillText}>{d}</Text>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Remove ${d}`}
                            hitSlop={8}
                            onPress={() => removeDislike(d)}
                            style={styles.dislikePillClose}>
                            <MaterialIcons name="close" size={16} color={MealMindColors.onSurfaceVariant} />
                          </Pressable>
                        </View>
                      ))}
                      <Pressable
                        accessibilityRole="button"
                        onPress={addDislike}
                        style={styles.addIngredientPill}
                        disabled={dislikeDraft.trim().length === 0}>
                        <MaterialIcons
                          name="add"
                          size={16}
                          color={MealMindColors.onSurface}
                          style={{ opacity: dislikeDraft.trim().length === 0 ? 0.4 : 1 }}
                        />
                        <Text
                          style={[
                            styles.addIngredientText,
                            dislikeDraft.trim().length === 0 && styles.addIngredientTextDisabled,
                          ]}>
                          Add ingredient
                        </Text>
                      </Pressable>
                    </View>
                    <TextInput
                      value={dislikeDraft}
                      onChangeText={setDislikeDraft}
                      onSubmitEditing={addDislike}
                      placeholder="Type an ingredient, then tap Add ingredient"
                      placeholderTextColor={`${MealMindColors.onSurfaceVariant}99`}
                      style={styles.dislikeField}
                      returnKeyType="done"
                    />
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={[styles.stickyBottom, { paddingBottom: stickyBottomPad }]}>
            <View style={styles.stickyBottomInner}>
              <Text style={styles.footerCaption}>You can refine tastes and diet anytime in Profile.</Text>
              <GlowButton style={styles.nextCtaFull} label="Next" onPress={() => void complete()} />
            </View>
          </View>
        </View>

        <Modal
          visible={countryModalOpen}
          animationType="slide"
          presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
          onRequestClose={closeCountryModal}>
          <SafeAreaView style={styles.modalRoot} edges={['top', 'bottom']}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select your region or country</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={12}
                onPress={closeCountryModal}
                style={({ pressed }) => [styles.modalClose, pressed && styles.pressed]}>
                <MaterialIcons name="close" size={26} color={MealMindColors.primary} />
              </Pressable>
            </View>
            <TextInput
              value={countryQuery}
              onChangeText={setCountryQuery}
              placeholder="Search"
              placeholderTextColor={`${MealMindColors.onSurfaceVariant}99`}
              style={styles.modalSearch}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalListContent}
              renderItem={({ item }) => {
                const selected = item.value === countryCode;
                return (
                  <Pressable
                    onPress={() => selectCountry(item.value)}
                    style={({ pressed }) => [
                      styles.modalRow,
                      selected && styles.modalRowSelected,
                      pressed && styles.modalRowPressed,
                    ]}>
                    <Text style={[styles.modalRowLabel, selected && styles.modalRowLabelSelected]}>{item.label}</Text>
                    {selected ? (
                      <MaterialIcons name="check" size={22} color={MealMindColors.primary} />
                    ) : null}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.modalEmpty}>No matches. Try another search.</Text>
              }
            />
          </SafeAreaView>
        </Modal>
      </View>
    </MealMindScreen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: MealMindColors.surface,
    overflow: 'hidden',
  },
  decor: {
    ...StyleSheet.absoluteFillObject,
  },
  blobPrimary: {
    position: 'absolute',
    top: -96,
    right: -96,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: `${MealMindColors.primaryContainer}1A`,
  },
  blobSecondary: {
    position: 'absolute',
    top: '42%',
    left: -128,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: `${MealMindColors.secondaryContainer}1A`,
  },
  column: {
    flex: 1,
    zIndex: 1,
  },
  hydrate: { flex: 1 },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: MealMindSpace.lg,
    paddingTop: MealMindSpace.lg,
    flexGrow: 1,
  },
  formInner: {
    maxWidth: FORM_MAX_WIDTH,
    width: '100%',
    alignSelf: 'center',
  },
  hero: {
    marginBottom: 40,
    alignItems: 'center',
    width: '100%',
  },
  heroTitle: {
    fontFamily: MealMindFonts.headlineExtraBold,
    fontSize: 34,
    letterSpacing: -0.5,
    color: MealMindColors.onSurface,
    marginBottom: MealMindSpace.md,
    textAlign: 'center',
  },
  heroSub: {
    fontFamily: MealMindFonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: MealMindColors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 400,
    alignSelf: 'center',
  },
  sections: {
    gap: 48,
  },
  sectionBlock: {
    gap: 0,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MealMindSpace.md,
    marginBottom: 20,
  },
  sectionIconWell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    flex: 1,
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 20,
    letterSpacing: -0.2,
    color: MealMindColors.onSurface,
  },
  /** Matches HTML `<select>` row: surface-container-low, rounded-xl, py-4 px-5. */
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingVertical: MealMindSpace.md,
    paddingHorizontal: 20,
    borderRadius: MealMindRadii.xl,
    backgroundColor: MealMindColors.surfaceContainerLow,
  },
  selectFieldPressed: {
    opacity: 0.92,
  },
  selectFieldText: {
    flex: 1,
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 16,
    color: MealMindColors.onSurface,
    marginRight: MealMindSpace.sm,
  },
  cultureHint: {
    marginTop: MealMindSpace.sm,
    paddingHorizontal: 4,
    fontFamily: MealMindFonts.body,
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
    color: `${MealMindColors.onSurfaceVariant}B3`,
  },
  skillRow: {
    flexDirection: 'row',
    gap: MealMindSpace.md,
    width: '100%',
  },
  skillChipCell: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tasteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: MealMindSpace.md,
    width: '100%',
  },
  choiceChip: {
    paddingHorizontal: MealMindSpace.lg,
    paddingVertical: MealMindSpace.sm + 2,
    borderRadius: MealMindRadii.xl,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tasteChip: {
    minWidth: 108,
    alignItems: 'center',
  },
  choiceChipOff: {
    backgroundColor: MealMindColors.surfaceContainerLowest,
    borderColor: OUTLINE_BORDER,
  },
  choiceChipOn: {
    backgroundColor: MealMindColors.primaryContainer,
    borderColor: 'transparent',
  },
  choiceChipText: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 15,
    color: MealMindColors.onSurface,
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  choiceChipTextOn: {
    fontFamily: MealMindFonts.labelSemibold,
    color: MealMindColors.onPrimaryContainer,
  },
  dislikeCard: {
    backgroundColor: MealMindColors.surfaceContainerLow,
    borderRadius: MealMindRadii.lg,
    padding: MealMindSpace.lg,
  },
  dislikeCardLead: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 14,
    color: MealMindColors.onSurfaceVariant,
    marginBottom: MealMindSpace.md,
  },
  dislikePillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: MealMindSpace.sm,
    alignItems: 'center',
  },
  dislikePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: MealMindSpace.md,
    paddingRight: MealMindSpace.sm,
    paddingVertical: 8,
    borderRadius: MealMindRadii.full,
    backgroundColor: MealMindColors.surfaceContainerLowest,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OUTLINE_BORDER,
  },
  dislikePillText: {
    fontFamily: MealMindFonts.body,
    fontSize: 14,
    color: MealMindColors.onSurface,
  },
  dislikePillClose: {
    padding: 2,
  },
  addIngredientPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: MealMindSpace.md,
    paddingVertical: 8,
    borderRadius: MealMindRadii.full,
    backgroundColor: `${MealMindColors.outline}1A`,
  },
  addIngredientText: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 14,
    color: MealMindColors.onSurface,
  },
  addIngredientTextDisabled: {
    opacity: 0.45,
  },
  dislikeField: {
    marginTop: MealMindSpace.md,
    fontFamily: MealMindFonts.body,
    fontSize: 15,
    color: MealMindColors.onSurface,
    backgroundColor: MealMindColors.surfaceContainerLowest,
    borderRadius: MealMindRadii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OUTLINE_BORDER,
    paddingHorizontal: MealMindSpace.md,
    paddingVertical: MealMindSpace.sm,
  },
  stickyBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: MealMindSpace.lg,
    paddingTop: MealMindSpace.md,
    backgroundColor: `${MealMindColors.surface}F2`,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: `${MealMindColors.outlineVariant}1A`,
  },
  stickyBottomInner: {
    maxWidth: FORM_MAX_WIDTH,
    width: '100%',
    alignSelf: 'center',
  },
  footerCaption: {
    fontFamily: MealMindFonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: MealMindColors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: MealMindSpace.md,
  },
  nextCtaFull: {
    alignSelf: 'stretch',
  },
  modalRoot: {
    flex: 1,
    backgroundColor: MealMindColors.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: MealMindSpace.lg,
    paddingVertical: MealMindSpace.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${MealMindColors.outlineVariant}33`,
  },
  modalTitle: {
    flex: 1,
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 18,
    color: MealMindColors.onSurface,
    marginRight: MealMindSpace.sm,
  },
  modalClose: {
    padding: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  modalSearch: {
    marginHorizontal: MealMindSpace.lg,
    marginVertical: MealMindSpace.sm,
    fontFamily: MealMindFonts.body,
    fontSize: 16,
    color: MealMindColors.onSurface,
    backgroundColor: MealMindColors.surfaceContainerHigh,
    borderRadius: MealMindRadii.md,
    paddingHorizontal: MealMindSpace.md,
    paddingVertical: MealMindSpace.sm,
  },
  modalListContent: {
    paddingBottom: MealMindSpace.xl,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: MealMindSpace.md,
    paddingHorizontal: MealMindSpace.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${MealMindColors.outlineVariant}1F`,
  },
  modalRowPressed: {
    backgroundColor: MealMindColors.surfaceContainerLow,
  },
  modalRowSelected: {
    backgroundColor: `${MealMindColors.primaryFixed}66`,
  },
  modalRowLabel: {
    flex: 1,
    fontFamily: MealMindFonts.body,
    fontSize: 16,
    color: MealMindColors.onSurface,
    marginRight: MealMindSpace.sm,
  },
  modalRowLabelSelected: {
    fontFamily: MealMindFonts.bodyMedium,
    color: MealMindColors.onPrimaryContainer,
  },
  modalEmpty: {
    textAlign: 'center',
    fontFamily: MealMindFonts.body,
    fontSize: 15,
    color: MealMindColors.onSurfaceVariant,
    padding: MealMindSpace.xl,
  },
});
