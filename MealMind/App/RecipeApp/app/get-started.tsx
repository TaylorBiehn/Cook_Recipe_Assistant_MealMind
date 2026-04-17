import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { GlowButton, MealMindScreen } from '@/components/mealmind';
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindShadow, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts, headlineTracking } from '@/constants/mealmind-typography';
import {
  getProfile,
  setGetStartedSeen,
  setOnboardingComplete,
  setProfile,
  type StoredProfile,
} from '@/lib/profile-storage';
import { upsertMealMindProfile } from '@/lib/supabase-profile';

const HERO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCO52_7ozVxh5WvNiZDQyDtU3dJwOKEtPlCCUNZTgsfhOZInryw4L0i-iCCmc_856pZXewDUfpBF1Wbg6Ioiaz5rHpvpt5aipZG0D-ascbkYBZ0ylF-PvhHt64exdQtZ7qG9v8tsUWZNFNr7Xr6yFEhbDy3UUR3kBrqWY6zueS7kFNdum6RUikpfah_yWQGqrS_zNYv87_LGklNZ464l_1dZBeumPtoNCWFSppea6DWgdkcrIwGjzYoYy5xWY1k5ZlCEiw-v3Jv2vE';

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

export default function GetStartedScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  const completeAndEnterApp = useCallback(async () => {
    await setGetStartedSeen();
    const existing = await getProfile();
    const next: StoredProfile = { ...(existing ?? defaultProfile()), flowOnboardingDone: true };
    await setProfile(next);
    await upsertMealMindProfile(next);
    await setOnboardingComplete();
    router.replace('/(tabs)');
  }, [router]);

  const onBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      void completeAndEnterApp();
    }
  }, [navigation, completeAndEnterApp]);

  return (
    <MealMindScreen scroll={false} contentBottomInset={0}>
      <View style={styles.shell}>
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={12} onPress={onBack} style={styles.iconBtn}>
              <MaterialIcons name="arrow-back" size={24} color={MealMindColors.primary} />
            </Pressable>
            <Text style={styles.topBarTitle} numberOfLines={1}>
              Smart Family Recipe Assistant
            </Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="More options" hitSlop={12} style={styles.iconBtn}>
            <MaterialIcons name="more-vert" size={24} color={MealMindColors.primary} />
          </Pressable>
        </View>

        <View style={styles.main}>
          <View style={styles.blobTL} pointerEvents="none" />
          <View style={styles.blobBR} pointerEvents="none" />

          <View style={styles.canvas}>
            <View style={styles.illustrationWrap}>
              <View style={styles.circleFrame}>
                <Image source={{ uri: HERO_IMG }} style={styles.circleImg} contentFit="cover" />
                <View style={styles.floatingCard}>
                  <View style={styles.floatingIconWell}>
                    <MaterialIcons name="restaurant" size={22} color={MealMindColors.onSecondaryContainer} />
                  </View>
                  <View>
                    <View style={[styles.skelLine, { width: 64, marginBottom: 4 }]} />
                    <View style={[styles.skelLine, { width: 40 }]} />
                  </View>
                </View>
              </View>
            </View>

            <Text style={styles.headline}>Ready to cook?</Text>
            <Text style={styles.sub}>{"Add ingredients to get started and we'll handle the rest."}</Text>

            <GlowButton
              label="Add Ingredients"
              trailing={<MaterialIcons name="add-circle" size={22} color={MealMindColors.onPrimary} />}
              style={styles.primaryCta}
              onPress={() => void completeAndEnterApp()}
            />

            <Pressable onPress={() => void completeAndEnterApp()} style={styles.textLink}>
              <Text style={styles.textLinkLabel}>Browse popular recipes</Text>
            </Pressable>
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
    overflow: 'hidden',
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
    marginRight: MealMindSpace.sm,
  },
  topBarTitle: {
    flex: 1,
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 18,
    letterSpacing: headlineTracking,
    color: MealMindColors.primary,
  },
  iconBtn: {
    padding: 4,
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: MealMindSpace.lg,
    position: 'relative',
  },
  blobTL: {
    position: 'absolute',
    top: 40,
    left: -80,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: MealMindColors.secondaryContainer,
    opacity: 0.2,
  },
  blobBR: {
    position: 'absolute',
    bottom: 80,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: MealMindColors.primaryFixed,
    opacity: 0.2,
  },
  canvas: {
    maxWidth: 448,
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
  },
  illustrationWrap: {
    marginBottom: MealMindSpace.xl + 8,
  },
  circleFrame: {
    width: 288,
    height: 288,
    borderRadius: 144,
    backgroundColor: MealMindColors.surfaceContainerLow,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleImg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
  floatingCard: {
    position: 'absolute',
    bottom: -16,
    right: -16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: MealMindSpace.md,
    padding: MealMindSpace.lg,
    borderRadius: MealMindRadii.md,
    backgroundColor: MealMindColors.surfaceContainerLowest,
    ...MealMindShadow.ambient,
  },
  floatingIconWell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MealMindColors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skelLine: {
    height: 8,
    borderRadius: 4,
    backgroundColor: MealMindColors.surfaceContainerHighest,
  },
  headline: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.68,
    textAlign: 'center',
    color: MealMindColors.onSurface,
    marginBottom: MealMindSpace.md,
  },
  sub: {
    fontFamily: MealMindFonts.body,
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
    color: MealMindColors.onSurfaceVariant,
    maxWidth: 280,
    marginBottom: MealMindSpace.xl + 8,
  },
  primaryCta: {
    alignSelf: 'stretch',
  },
  textLink: {
    marginTop: MealMindSpace.lg + 8,
    paddingVertical: MealMindSpace.sm,
  },
  textLinkLabel: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 15,
    color: MealMindColors.primary,
  },
});
