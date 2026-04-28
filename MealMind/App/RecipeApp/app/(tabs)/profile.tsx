import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlowButton, MealMindScreen, OnboardingProfileSummary } from '@/components/mealmind';
import { KITCHEN_COMFORT_LABELS, SKILL_LABELS } from '@/constants/onboarding-options';
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindShadow, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import { resetAppForDev } from '@/lib/dev-reset';
import { getCountryLabel } from '@/lib/country-picker-data';
import { fetchMealMindProfile, upsertMealMindProfile } from '@/lib/supabase-profile';
import type { StoredProfile } from '@/lib/profile-storage';
import {
  clearProfileAndOnboardingState,
  getProfile,
  hydrateLocalFlagsFromRemoteProfile,
  setProfile,
} from '@/lib/profile-storage';
import { showErrorToast, showSuccessToast } from '@/lib/mealmind-toast';
import { getSupabaseSession, signOutMealMind } from '@/lib/supabase-auth';

const AVATAR_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC6zIQpZoLz6lEaMOqDS2VVx0DFeSX-SEjOTIRvz3R5JQPxd7kmv8Um6kRCyZRzMM3BjfHsGzKYYnFakERLimFU8Jfzu5BG7AmqgcoKFnzXwDS0DQeS4briRYgF3IAwAJwE7_yvBOdD8vjsXgVlFRgbjgiCQ1OQjkE-s5bBU81eyGjKd2kQPavZupmThzw_BfjqDGMnnRYTH8Ii03JQoNklpBDrsC8VYSMWn1YX6VGPOJzXcnMSZGO80ctIKWELVq4k7vz5QX8fYUM';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

function defaultProfile(): StoredProfile {
  return {
    countryCode: 'WORLDWIDE',
    skillLevel: 'beginner',
    kitchenComfort: 'balanced',
    preferences: [],
    dislikes: [],
    vegetarianFocus: false,
    pescetarianFriendly: false,
    wellnessGoal: 'unsure',
    dietaryPreference: 'none',
    cuisines: [],
    allergies: [],
    avoidFoods: [],
    cookingExperience: 'home_cook',
    kitchenEquipment: [],
    cookingSchedule: 'flexible',
    flavorProfile: [],
    spicyLevel: 'medium',
    calorieFocus: 'no_preference',
  };
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
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [onboardingDetailsOpen, setOnboardingDetailsOpen] = useState(false);

  const reload = useCallback(() => {
    void (async () => {
      const remote = await fetchMealMindProfile();
      if (remote) {
        await hydrateLocalFlagsFromRemoteProfile(remote);
        setProfileState(remote);
        return;
      }
      const local = await getProfile();
      setProfileState(local);
    })();
  }, []);

  useEffect(() => {
    reload();
    void getSupabaseSession().then((s) => setSessionEmail(s?.user?.email ?? null));
  }, [reload]);

  useFocusEffect(
    useCallback(() => {
      reload();
      void getSupabaseSession().then((s) => setSessionEmail(s?.user?.email ?? null));
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

  async function patchProfile(partial: Partial<StoredProfile>): Promise<void> {
    const cur = (await getProfile()) ?? defaultProfile();
    const next = { ...cur, ...partial };
    await setProfile(next);
    await upsertMealMindProfile(next);
  }

  const onSignOut = useCallback(() => {
    void signOutMealMind().then(() => router.replace('/signin'));
  }, [router]);

  const onConfirmResetOnboarding = useCallback(() => {
    Alert.alert(
      'Reset onboarding?',
      'Your MealMind answers will be reset (including on this account). You can go through the setup wizard again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                const fresh = defaultProfile();
                const { ok, error } = await upsertMealMindProfile(fresh);
                if (!ok) {
                  throw new Error(error ?? 'Could not sync profile.');
                }
                await clearProfileAndOnboardingState();
                await setProfile(fresh);
                setProfileState(fresh);
                showSuccessToast('Onboarding reset', 'Starting fresh — next, complete the wizard.');
                router.replace('/intro');
              } catch (e) {
                showErrorToast(
                  'Profile',
                  e instanceof Error ? e.message : 'Could not reset onboarding.',
                );
              }
            })();
          },
        },
      ],
    );
  }, [router]);

  const spicy = profile?.preferences?.includes('spicy') ? 2 : 1;
  const sweet = profile?.preferences?.includes('sweet') ? 1 : 0;
  const savory =
    profile?.preferences?.includes('savory') || profile?.preferences?.includes('healthy') ? 3 : 2;

  const displayInitial = sessionEmail?.trim()?.charAt(0)?.toUpperCase() ?? '·';

  if (profile == null) {
    return (
      <MealMindScreen scroll contentBottomInset={24} showFooter={false}>
        <View style={[styles.fixedHeader, { paddingTop: insets.top }]}>
          <Pressable
            hitSlop={12}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
            style={styles.iconBtn}>
            <MaterialIcons name="arrow-back" size={24} color={MealMindColors.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.avatarSm}>
            <MaterialIcons name="person" size={20} color={MealMindColors.onSecondaryContainer} />
          </View>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Set up your taste profile</Text>
          <Text style={styles.emptySub}>
            Answer a few questions so recipes, filters, and suggestions match how you actually cook and eat.
          </Text>
          <GlowButton label="Start personalization" onPress={() => router.replace('/intro')} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            style={({ pressed }) => [styles.signOutBtn, pressed && styles.signOutBtnPressed]}
            onPress={onSignOut}>
            <MaterialIcons name="logout" size={20} color={MealMindColors.onSurfaceVariant} />
            <Text style={styles.signOutBtnText}>Sign out</Text>
          </Pressable>
          <Text style={styles.footerNote}>MealMind · v{APP_VERSION}</Text>
        </View>
      </MealMindScreen>
    );
  }

  return (
    <MealMindScreen scroll={false} contentBottomInset={0} showFooter={false}>
      <View style={styles.shell}>
        <View style={[styles.fixedHeader, { paddingTop: insets.top }]}>
          <Pressable
            hitSlop={12}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
            style={styles.iconBtn}>
            <MaterialIcons name="arrow-back" size={24} color={MealMindColors.primary} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Profile
          </Text>
          <View style={styles.avatarRing}>
            <Image source={{ uri: AVATAR_URI }} style={styles.avatarImg} contentFit="cover" />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.inner}>
            {/* Identity */}
            <View style={styles.identityCard}>
              <View style={styles.identityTop}>
                <View style={styles.identityAvatar}>
                  <Image source={{ uri: AVATAR_URI }} style={styles.identityAvatarImg} contentFit="cover" />
                </View>
                <View style={styles.identityTextCol}>
                  <Text style={styles.identityGreeting} numberOfLines={1}>
                    Hi there{displayInitial !== '·' ? `, ${displayInitial}` : ''}
                  </Text>
                  {sessionEmail ? (
                    <Text style={styles.identityEmail} numberOfLines={1}>
                      {sessionEmail}
                    </Text>
                  ) : (
                    <Text style={styles.identityEmail}>Signed in</Text>
                  )}
                  <Text style={styles.identityLine} numberOfLines={1}>
                    {SKILL_LABELS[profile.skillLevel]} · {KITCHEN_COMFORT_LABELS[profile.kitchenComfort]}
                  </Text>
                  <Text style={styles.identityRegion} numberOfLines={1}>
                    {getCountryLabel(profile.countryCode)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Taste & diet */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Taste & nutrition</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Edit in wizard"
                  onPress={() => router.push('/intro')}
                  style={({ pressed }) => [styles.textLink, pressed && styles.pressed]}>
                  <Text style={styles.textLinkLabel}>Edit in wizard</Text>
                  <MaterialIcons name="chevron-right" size={18} color={MealMindColors.primary} />
                </Pressable>
              </View>

              <View style={styles.tasteCard}>
                <View style={styles.tasteHead}>
                  <Text style={styles.cardH3Inline}>Taste balance</Text>
                  <MaterialIcons name="restaurant-menu" size={22} color={MealMindColors.onSurfaceVariant} />
                </View>
                <TasteMeter label="Spiciness" filled={spicy} />
                <TasteMeter label="Sweetness" filled={Math.max(1, sweet)} />
                <TasteMeter label="Umami / savory" filled={savory} />
                <Pressable
                  style={styles.outlineBtn}
                  onPress={() => router.push('/intro')}
                  accessibilityRole="button"
                  accessibilityLabel="Adjust taste in wizard">
                  <Text style={styles.outlineBtnText}>Fine-tune in wizard</Text>
                </Pressable>
              </View>

              <Text style={[styles.miniSectionLabel, styles.dietMiniLabel]}>Strict dietary modes</Text>
              <View style={styles.dietSection}>
                <View style={styles.toggleCard}>
                  <View style={styles.toggleLeft}>
                    <MaterialIcons name="eco" size={22} color={MealMindColors.tertiary} />
                    <Text style={styles.toggleLabel}>Vegetarian focus</Text>
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
                    <Text style={styles.toggleLabel}>Pescatarian-friendly</Text>
                  </View>
                  <Switch
                    accessibilityLabel="Pescatarian-friendly"
                    value={profile.pescetarianFriendly}
                    onValueChange={(v) => void onPesc(v)}
                    trackColor={{ false: MealMindColors.surfaceContainerHighest, true: MealMindColors.primary }}
                    thumbColor={MealMindColors.surfaceContainerLowest}
                  />
                </View>
              </View>
            </View>

            <GlowButton
              label="Save to account"
              trailing={<MaterialIcons name="cloud-upload" size={22} color={MealMindColors.onPrimary} />}
              onPress={() => {
                if (profile) void upsertMealMindProfile(profile);
              }}
            />

            {/* Onboarding answers — collapsible */}
            <View style={styles.collapsibleOuter}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: onboardingDetailsOpen }}
                accessibilityHint="Opens your full onboarding answers"
                onPress={() => setOnboardingDetailsOpen((o) => !o)}
                style={({ pressed }) => [styles.collapsibleHeader, pressed && styles.pressed]}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.collapsibleKicker}>12-step wizard</Text>
                  <Text style={styles.collapsibleTitle}>Onboarding answers</Text>
                  <Text style={styles.collapsibleSub}>
                    Goal, allergies, cuisines, equipment, and calories — synced to your profile.
                  </Text>
                </View>
                <MaterialIcons
                  name={onboardingDetailsOpen ? 'expand-less' : 'expand-more'}
                  size={26}
                  color={MealMindColors.onSurfaceVariant}
                />
              </Pressable>
              {onboardingDetailsOpen ? (
                <View style={styles.collapsibleBody}>
                  <OnboardingProfileSummary embedded profile={profile} />
                </View>
              ) : null}
            </View>

            {/* Account & data */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Account and data</Text>
              <View style={styles.accountCard}>
                <Pressable
                  style={({ pressed }) => [styles.accountRow, pressed && styles.pressed]}
                  onPress={() => router.push('/intro')}>
                  <MaterialIcons name="edit-calendar" size={22} color={MealMindColors.primary} />
                  <Text style={styles.accountRowLabel}>Personalization wizard</Text>
                  <MaterialIcons name="chevron-right" size={22} color={MealMindColors.outlineVariant} />
                </Pressable>
                <View style={styles.accountHairline} />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Reset onboarding"
                  style={({ pressed }) => [styles.accountRow, pressed && styles.pressed]}
                  onPress={onConfirmResetOnboarding}>
                  <MaterialIcons name="refresh" size={22} color={MealMindColors.error} />
                  <Text style={[styles.accountRowLabel, styles.accountRowDanger]}>Reset onboarding</Text>
                  <MaterialIcons name="chevron-right" size={22} color={MealMindColors.outlineVariant} />
                </Pressable>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sign out"
                style={({ pressed }) => [styles.signOutBtn, pressed && styles.signOutBtnPressed]}
                onPress={onSignOut}>
                <MaterialIcons name="logout" size={20} color={MealMindColors.onSurfaceVariant} />
                <Text style={styles.signOutBtnText}>Sign out</Text>
              </Pressable>

              {__DEV__ ? (
                <Pressable
                  style={styles.devLink}
                  onPress={() => {
                    void resetAppForDev().then(() => router.replace('/'));
                  }}>
                  <Text style={styles.devLinkText}>Reset app and sign out (dev)</Text>
                </Pressable>
              ) : null}
            </View>

            <Text style={styles.footerNote}>
              MealMind · v{APP_VERSION} · Taste and nutrition prefs stay on this device until you save or finish the
              wizard.
            </Text>
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
    letterSpacing: headlineTracking,
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
    paddingTop: MealMindSpace.lg,
    paddingBottom: MealMindSpace.xl * 2,
  },
  inner: {
    maxWidth: 672,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: MealMindSpace.lg,
    gap: MealMindSpace.lg + 6,
  },
  identityCard: {
    backgroundColor: MealMindColors.surfaceContainerLowest,
    borderRadius: MealMindRadii.md,
    padding: MealMindSpace.lg,
    ...MealMindShadow.ambient,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${MealMindColors.outlineVariant}44`,
  },
  identityTop: {
    flexDirection: 'row',
    gap: MealMindSpace.md,
    alignItems: 'flex-start',
  },
  identityAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: MealMindColors.primaryContainer,
    backgroundColor: MealMindColors.secondaryContainer,
  },
  identityAvatarImg: {
    width: '100%',
    height: '100%',
  },
  identityTextCol: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  identityGreeting: {
    fontFamily: MealMindFonts.headlineExtraBold,
    fontSize: 22,
    letterSpacing: headlineTracking,
    color: MealMindColors.onSurface,
  },
  identityEmail: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 14,
    color: MealMindColors.onSurfaceVariant,
  },
  identityLine: {
    fontFamily: MealMindFonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: MealMindColors.onSurfaceVariant,
    marginTop: 2,
  },
  identityRegion: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 12,
    color: MealMindColors.primary,
    marginTop: 2,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  sectionBlock: {
    gap: MealMindSpace.md,
  },
  sectionTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 17,
    color: MealMindColors.onSurface,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: MealMindSpace.md,
    marginBottom: -4,
  },
  miniSectionLabel: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: MealMindColors.outlineVariant,
  },
  dietMiniLabel: {
    marginTop: MealMindSpace.sm,
    marginBottom: -4,
  },
  cardH3Inline: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 18,
    color: MealMindColors.onSurface,
  },
  textLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  textLinkLabel: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 14,
    color: MealMindColors.primary,
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
    marginBottom: 2,
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
  dietSection: {
    backgroundColor: `${MealMindColors.tertiaryContainer}33`,
    borderRadius: MealMindRadii.md,
    padding: MealMindSpace.lg,
    gap: MealMindSpace.md,
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
  collapsibleOuter: {
    borderRadius: MealMindRadii.md,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${MealMindColors.outlineVariant}66`,
    backgroundColor: MealMindColors.surfaceContainerLowest,
    ...MealMindShadow.ambient,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MealMindSpace.md,
    padding: MealMindSpace.lg,
  },
  collapsibleKicker: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: MealMindColors.primary,
    marginBottom: 2,
  },
  collapsibleTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 18,
    color: MealMindColors.onSurface,
  },
  collapsibleSub: {
    fontFamily: MealMindFonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: MealMindColors.onSurfaceVariant,
    marginTop: 4,
  },
  collapsibleBody: {
    paddingHorizontal: MealMindSpace.md,
    paddingBottom: MealMindSpace.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: `${MealMindColors.outlineVariant}44`,
    backgroundColor: MealMindColors.surface,
  },
  accountCard: {
    borderRadius: MealMindRadii.md,
    overflow: 'hidden',
    backgroundColor: MealMindColors.surfaceContainerLowest,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${MealMindColors.outlineVariant}66`,
    ...MealMindShadow.ambient,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MealMindSpace.md,
    paddingVertical: MealMindSpace.md + 4,
    paddingHorizontal: MealMindSpace.lg,
    minHeight: 52,
  },
  accountHairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: `${MealMindColors.outlineVariant}66`,
    marginLeft: MealMindSpace.lg + 22 + MealMindSpace.md,
  },
  accountRowLabel: {
    flex: 1,
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 16,
    color: MealMindColors.onSurface,
  },
  accountRowDanger: {
    color: MealMindColors.error,
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 15,
  },
  footerNote: {
    fontFamily: MealMindFonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: MealMindColors.outlineVariant,
    textAlign: 'center',
    marginTop: MealMindSpace.md,
    marginBottom: MealMindSpace.lg,
  },
  pressed: {
    opacity: 0.94,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: MealMindSpace.sm,
    paddingVertical: MealMindSpace.md,
    borderRadius: MealMindRadii.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${MealMindColors.outlineVariant}CC`,
    backgroundColor: MealMindColors.surfaceContainerLow,
  },
  signOutBtnPressed: { opacity: 0.88 },
  signOutBtnText: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 15,
    color: MealMindColors.onSurface,
  },
  devLink: {
    alignSelf: 'center',
    paddingVertical: MealMindSpace.md,
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
