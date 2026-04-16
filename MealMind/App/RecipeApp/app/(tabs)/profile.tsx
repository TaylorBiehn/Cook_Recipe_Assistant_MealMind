import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlowButton, MealMindScreen } from '@/components/mealmind';
import { SKILL_LABELS } from '@/constants/onboarding-options';
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindShadow, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts } from '@/constants/mealmind-typography';
import { getCountryLabel } from '@/lib/country-picker-data';
import type { StoredProfile } from '@/lib/profile-storage';
import { clearOnboardingForDev, getProfile, setProfile } from '@/lib/profile-storage';

const AVATAR_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC6zIQpZoLz6lEaMOqDS2VVx0DFeSX-SEjOTIRvz3R5JQPxd7kmv8Um6kRCyZRzMM3BjfHsGzKYYnFakERLimFU8Jfzu5BG7AmqgcoKFnzXwDS0DQeS4briRYgF3IAwAJwE7_yvBOdD8vjsXgVlFRgbjgiCQ1OQjkE-s5bBU81eyGjKd2kQPavZupmThzw_BfjqDGMnnRYTH8Ii03JQoNklpBDrsC8VYSMWn1YX6VGPOJzXcnMSZGO80ctIKWELVq4k7vz5QX8fYUM';

const defaultProfile = (): StoredProfile => ({
  countryCode: 'WORLDWIDE',
  skillLevel: 'beginner',
  kitchenComfort: 'balanced',
  preferences: [],
  dislikes: [],
  vegetarianFocus: false,
  pescetarianFriendly: false,
});

async function patchProfile(partial: Partial<StoredProfile>): Promise<void> {
  const cur = (await getProfile()) ?? defaultProfile();
  await setProfile({ ...cur, ...partial });
}

function TasteMeter({ label, filled }: { label: string; filled: number }) {
  return (
    <View style={styles.tasteRow}>
      <Text style={styles.tasteLabel}>{label}</Text>
      <View style={styles.tasteDots}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.tasteDot, i < filled ? styles.tasteDotOn : styles.tasteDotOff]} />
        ))}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [profile, setProfileState] = useState<StoredProfile | null>(null);

  const reload = useCallback(() => {
    void getProfile().then(setProfileState);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const onVeg = async (value: boolean) => {
    setProfileState((p) => {
      const base = p ?? defaultProfile();
      return { ...base, vegetarianFocus: value };
    });
    await patchProfile({ vegetarianFocus: value });
  };

  const onPesc = async (value: boolean) => {
    setProfileState((p) => {
      const base = p ?? defaultProfile();
      return { ...base, pescetarianFriendly: value };
    });
    await patchProfile({ pescetarianFriendly: value });
  };

  const spicy = profile?.preferences.includes('spicy') ? 2 : 1;
  const sweet = profile?.preferences.includes('sweet') ? 1 : 0;
  const savory =
    profile?.preferences.includes('savory') || profile?.preferences.includes('healthy') ? 3 : 2;

  if (profile == null) {
    return (
      <MealMindScreen scroll contentBottomInset={24} showFooter={false}>
        <View style={[styles.fixedHeader, { paddingTop: insets.top }]}>
          <Pressable hitSlop={12} onPress={() => router.back()} style={styles.iconBtn}>
            <MaterialIcons name="arrow-back" size={24} color={MealMindColors.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>The Culinary Curator</Text>
          <View style={styles.avatarSm}>
            <MaterialIcons name="person" size={20} color={MealMindColors.onSecondaryContainer} />
          </View>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Your Palate Profile</Text>
          <Text style={styles.emptySub}>Finish onboarding to customize your experience.</Text>
          <GlowButton label="Go to onboarding" onPress={() => router.replace('/onboarding')} />
        </View>
      </MealMindScreen>
    );
  }

  return (
    <MealMindScreen scroll={false} contentBottomInset={0} showFooter={false}>
      <View style={styles.shell}>
        <View style={[styles.fixedHeader, { paddingTop: insets.top }]}>
          <Pressable hitSlop={12} onPress={() => router.back()} style={styles.iconBtn}>
            <MaterialIcons name="arrow-back" size={24} color={MealMindColors.primary} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            The Culinary Curator
          </Text>
          <View style={styles.avatarRing}>
            <Image source={{ uri: AVATAR_URI }} style={styles.avatarImg} contentFit="cover" />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.inner}>
            <View style={styles.intro}>
              <Text style={styles.pageTitle}>Your Palate Profile</Text>
              <Text style={styles.pageSub}>
                Customize your culinary experience to help us curate the perfect weekly meal plan for your family.
              </Text>
            </View>

            <View style={styles.countryCard}>
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.kicker}>CULTURAL ROOTS</Text>
                  <Text style={styles.cardH3}>Country & Heritage</Text>
                </View>
                <Pressable style={styles.editPill} onPress={() => router.push('/onboarding')}>
                  <Text style={styles.editPillText}>Edit</Text>
                </Pressable>
              </View>
              <View style={styles.countryRow}>
                <View style={styles.countryIconWell}>
                  <MaterialIcons name="public" size={24} color={MealMindColors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.countryTitle}>{getCountryLabel(profile.countryCode)}</Text>
                  <Text style={styles.countrySub}>Primary influence for seasonal suggestions</Text>
                  <Text style={styles.countrySkill}>Skill: {SKILL_LABELS[profile.skillLevel]}</Text>
                </View>
              </View>
              <MaterialIcons name="language" size={120} color={MealMindColors.onSurface} style={styles.watermark} />
            </View>

            <View style={styles.tasteCard}>
              <View style={styles.tasteHead}>
                <Text style={styles.cardH3}>Taste Preferences</Text>
                <MaterialIcons name="restaurant-menu" size={22} color={MealMindColors.onSurfaceVariant} />
              </View>
              <TasteMeter label="Spiciness" filled={spicy} />
              <TasteMeter label="Sweetness" filled={Math.max(1, sweet)} />
              <TasteMeter label="Umami / Savory" filled={savory} />
              <Pressable style={styles.outlineBtn}>
                <Text style={styles.outlineBtnText}>Fine Tune</Text>
              </Pressable>
            </View>

            <View style={styles.dislikesCard}>
              <View style={styles.tasteHead}>
                <Text style={styles.cardH3}>Dislikes & Allergies</Text>
                <MaterialIcons name="warning" size={22} color={MealMindColors.error} />
              </View>
              <View style={styles.pillWrap}>
                {profile.dislikes.length === 0 ? (
                  <Text style={styles.muted}>None added yet — set them in registration or here soon.</Text>
                ) : (
                  profile.dislikes.map((d) => (
                    <View key={d} style={styles.dislikePill}>
                      <Text style={styles.dislikePillText}>{d}</Text>
                      <MaterialIcons name="close" size={16} color={MealMindColors.onSecondaryContainer} />
                    </View>
                  ))
                )}
                <Pressable style={styles.addPill}>
                  <MaterialIcons name="add" size={16} color={MealMindColors.onSurfaceVariant} />
                  <Text style={styles.addPillText}>Add New</Text>
                </Pressable>
              </View>
              <Text style={styles.disclaimer}>
                We automatically exclude recipes containing these ingredients from your discovery feed.
              </Text>
            </View>

            <View style={styles.dietSection}>
              <Text style={styles.dietTitle}>Strict Dietary Mode</Text>
              <View style={styles.toggleCard}>
                <View style={styles.toggleLeft}>
                  <MaterialIcons name="eco" size={22} color={MealMindColors.tertiary} />
                  <Text style={styles.toggleLabel}>Vegetarian Focus</Text>
                </View>
                <Switch
                  accessibilityLabel="Vegetarian focus"
                  value={profile.vegetarianFocus}
                  onValueChange={(v) => void onVeg(v)}
                  trackColor={{ false: MealMindColors.surfaceContainerHighest, true: MealMindColors.primary }}
                  thumbColor={MealMindColors.surfaceContainerLowest}
                />
              </View>
              <View style={styles.toggleCard}>
                <View style={styles.toggleLeft}>
                  <MaterialIcons name="set-meal" size={22} color={MealMindColors.tertiary} />
                  <Text style={styles.toggleLabel}>Pescetarian Friendly</Text>
                </View>
                <Switch
                  accessibilityLabel="Pescetarian friendly"
                  value={profile.pescetarianFriendly}
                  onValueChange={(v) => void onPesc(v)}
                  trackColor={{ false: MealMindColors.surfaceContainerHighest, true: MealMindColors.primary }}
                  thumbColor={MealMindColors.surfaceContainerLowest}
                />
              </View>
            </View>

            <GlowButton
              label="Update My Preferences"
              trailing={<MaterialIcons name="save" size={22} color={MealMindColors.onPrimary} />}
              onPress={() => {}}
            />

            <Pressable
              style={styles.devLink}
              onPress={() => {
                void clearOnboardingForDev().then(() => router.replace('/'));
              }}>
              <Text style={styles.devLinkText}>Clear onboarding (dev)</Text>
            </Pressable>
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
  fixedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MealMindSpace.md,
    paddingHorizontal: MealMindSpace.lg,
    paddingBottom: MealMindSpace.md,
    backgroundColor: MealMindColors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${MealMindColors.outlineVariant}26`,
  },
  iconBtn: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 20,
    letterSpacing: -0.4,
    color: MealMindColors.primary,
  },
  avatarRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: MealMindColors.primaryContainer,
  },
  avatarSm: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MealMindColors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  scroll: {
    paddingTop: MealMindSpace.md,
    paddingBottom: MealMindSpace.xl * 2,
  },
  inner: {
    maxWidth: 672,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: MealMindSpace.lg,
    gap: MealMindSpace.lg,
  },
  intro: {
    gap: MealMindSpace.sm,
    marginBottom: MealMindSpace.sm,
  },
  pageTitle: {
    fontFamily: MealMindFonts.headlineExtraBold,
    fontSize: 28,
    letterSpacing: -0.56,
    color: MealMindColors.onSurface,
  },
  pageSub: {
    fontFamily: MealMindFonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: MealMindColors.onSurfaceVariant,
  },
  countryCard: {
    backgroundColor: MealMindColors.surfaceContainerLowest,
    borderRadius: MealMindRadii.md,
    padding: MealMindSpace.lg,
    gap: MealMindSpace.md,
    overflow: 'hidden',
    position: 'relative',
    ...MealMindShadow.ambient,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  kicker: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 11,
    letterSpacing: 2,
    color: MealMindColors.primary,
  },
  cardH3: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 18,
    color: MealMindColors.onSurface,
  },
  editPill: {
    backgroundColor: MealMindColors.secondaryContainer,
    paddingHorizontal: MealMindSpace.md,
    paddingVertical: MealMindSpace.sm,
    borderRadius: MealMindRadii.md,
  },
  editPillText: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 13,
    color: MealMindColors.onSecondaryContainer,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MealMindSpace.md,
    backgroundColor: MealMindColors.surfaceContainerLow,
    borderRadius: MealMindRadii.md,
    padding: MealMindSpace.md,
    zIndex: 1,
  },
  countryIconWell: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: MealMindColors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 16,
    color: MealMindColors.onSurface,
  },
  countrySub: {
    fontFamily: MealMindFonts.body,
    fontSize: 13,
    color: MealMindColors.onSurfaceVariant,
  },
  countrySkill: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 13,
    color: MealMindColors.onSurfaceVariant,
    marginTop: 4,
  },
  watermark: {
    position: 'absolute',
    bottom: -24,
    right: -16,
    opacity: 0.05,
    zIndex: 0,
  },
  tasteCard: {
    backgroundColor: MealMindColors.surfaceContainerLowest,
    borderRadius: MealMindRadii.md,
    padding: MealMindSpace.lg,
    gap: MealMindSpace.md,
    borderLeftWidth: 4,
    borderLeftColor: MealMindColors.primary,
    ...MealMindShadow.ambient,
  },
  tasteHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tasteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tasteLabel: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 14,
    color: MealMindColors.onSurface,
  },
  tasteDots: {
    flexDirection: 'row',
    gap: 4,
  },
  tasteDot: {
    width: 24,
    height: 8,
    borderRadius: 4,
  },
  tasteDotOn: {
    backgroundColor: MealMindColors.primary,
  },
  tasteDotOff: {
    backgroundColor: MealMindColors.surfaceContainerHighest,
  },
  outlineBtn: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: MealMindColors.outlineVariant,
    borderRadius: MealMindRadii.md,
    paddingVertical: MealMindSpace.sm + 2,
    alignItems: 'center',
    marginTop: MealMindSpace.sm,
  },
  outlineBtnText: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 14,
    color: MealMindColors.onSurface,
  },
  dislikesCard: {
    backgroundColor: MealMindColors.surfaceContainerLowest,
    borderRadius: MealMindRadii.md,
    padding: MealMindSpace.lg,
    gap: MealMindSpace.md,
    ...MealMindShadow.ambient,
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: MealMindSpace.sm,
    alignItems: 'center',
  },
  dislikePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: MealMindSpace.sm + 2,
    paddingVertical: 6,
    borderRadius: MealMindRadii.full,
    backgroundColor: MealMindColors.secondaryContainer,
  },
  dislikePillText: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 12,
    color: MealMindColors.onSecondaryContainer,
  },
  addPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: MealMindSpace.sm + 2,
    paddingVertical: 6,
    borderRadius: MealMindRadii.full,
    backgroundColor: MealMindColors.surfaceContainerHigh,
  },
  addPillText: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 12,
    color: MealMindColors.onSurfaceVariant,
  },
  disclaimer: {
    fontFamily: MealMindFonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: MealMindColors.onSurfaceVariant,
  },
  muted: {
    fontFamily: MealMindFonts.body,
    fontSize: 14,
    color: MealMindColors.onSurfaceVariant,
  },
  dietSection: {
    backgroundColor: `${MealMindColors.tertiaryContainer}33`,
    borderRadius: MealMindRadii.md,
    padding: MealMindSpace.lg,
    gap: MealMindSpace.md,
  },
  dietTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 17,
    color: MealMindColors.onTertiaryContainer,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MealMindColors.surfaceContainerLowest,
    padding: MealMindSpace.md,
    borderRadius: MealMindRadii.md,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MealMindSpace.md,
    flex: 1,
    paddingRight: MealMindSpace.md,
  },
  toggleLabel: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 15,
    color: MealMindColors.onSurface,
  },
  devLink: {
    alignSelf: 'center',
    paddingVertical: MealMindSpace.lg,
  },
  devLinkText: {
    fontFamily: MealMindFonts.body,
    fontSize: 13,
    color: MealMindColors.primary,
    textDecorationLine: 'underline',
  },
  empty: {
    padding: MealMindSpace.lg,
    gap: MealMindSpace.md,
  },
  emptyTitle: {
    fontFamily: MealMindFonts.headlineExtraBold,
    fontSize: 24,
    color: MealMindColors.onSurface,
  },
  emptySub: {
    fontFamily: MealMindFonts.body,
    fontSize: 15,
    color: MealMindColors.onSurfaceVariant,
  },
});
