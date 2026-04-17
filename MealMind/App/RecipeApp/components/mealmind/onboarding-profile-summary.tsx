import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  CALORIE_FOCUS_LABELS,
  COOKING_EXPERIENCE_LABELS,
  COOKING_SCHEDULE_LABELS,
  DIETARY_LABELS,
  SPICY_LEVEL_LABELS,
  WELLNESS_GOAL_LABELS,
} from '@/constants/onboarding-display-labels';
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindShadow, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts } from '@/constants/mealmind-typography';
import type { StoredProfile } from '@/lib/profile-storage';

function Chip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

function ChipRow({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <Text style={styles.emptyLine}>None selected</Text>;
  }
  return (
    <View style={styles.chipWrap}>
      {items.map((x) => (
        <Chip key={x} label={x} />
      ))}
    </View>
  );
}

function Section({
  step,
  title,
  subtitle,
  icon,
  children,
}: {
  step: string;
  title: string;
  subtitle?: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  children: ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <View style={styles.iconWell}>
          <MaterialIcons name={icon} size={20} color={MealMindColors.onPrimaryFixedVariant} />
        </View>
        <View style={styles.cardHeadText}>
          <Text style={styles.kicker}>{step}</Text>
          <Text style={styles.cardTitle}>{title}</Text>
          {subtitle ? <Text style={styles.cardSub}>{subtitle}</Text> : null}
        </View>
      </View>
      {children}
    </View>
  );
}

function AnswerLine({ text }: { text: string }) {
  return (
    <View style={styles.answerRow}>
      <MaterialIcons name="fiber-manual-record" size={10} color={MealMindColors.primary} style={styles.bullet} />
      <Text style={styles.answerText}>{text}</Text>
    </View>
  );
}

export function OnboardingProfileSummary({ profile }: { profile: StoredProfile }) {
  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <Text style={styles.heroKicker}>PERSONALIZATION</Text>
        <Text style={styles.heroTitle}>Your onboarding answers</Text>
        <Text style={styles.heroSub}>What you shared in the 12-step wizard — synced to your account.</Text>
      </View>

      <Section step="Step 1 of 12" title="Main goal" icon="flag">
        <AnswerLine text={WELLNESS_GOAL_LABELS[profile.wellnessGoal]} />
      </Section>

      <Section step="Step 2 of 12" title="Diet" icon="restaurant-menu">
        <AnswerLine text={DIETARY_LABELS[profile.dietaryPreference]} />
      </Section>

      <Section step="Step 3 of 12" title="Cuisines you enjoy" icon="public">
        <ChipRow items={profile.cuisines} />
      </Section>

      <Section step="Step 4 of 12" title="Allergies" icon="warning" subtitle="Safety exclusions">
        <ChipRow items={profile.allergies} />
      </Section>

      <Section step="Step 5 of 12" title="Foods to avoid" icon="block">
        <ChipRow items={profile.avoidFoods} />
      </Section>

      <Section step="Step 6 of 12" title="Dislikes" icon="sentiment-dissatisfied">
        <ChipRow items={profile.dislikes} />
      </Section>

      <Section step="Step 7 of 12" title="Cooking experience" icon="outdoor-grill">
        <AnswerLine text={COOKING_EXPERIENCE_LABELS[profile.cookingExperience]} />
      </Section>

      <Section step="Step 8 of 12" title="Kitchen equipment" icon="countertops">
        <ChipRow items={profile.kitchenEquipment} />
      </Section>

      <Section step="Step 9 of 12" title="Cooking schedule" icon="calendar-today">
        <AnswerLine text={COOKING_SCHEDULE_LABELS[profile.cookingSchedule] ?? profile.cookingSchedule} />
      </Section>

      <Section step="Step 10 of 12" title="Flavor profile" icon="local-dining">
        <ChipRow items={profile.flavorProfile.map((f) => f.charAt(0).toUpperCase() + f.slice(1))} />
      </Section>

      <Section step="Step 11 of 12" title="Spice level" icon="whatshot">
        <AnswerLine text={SPICY_LEVEL_LABELS[profile.spicyLevel]} />
      </Section>

      <Section step="Step 12 of 12" title="Calories" icon="balance">
        <AnswerLine text={CALORIE_FOCUS_LABELS[profile.calorieFocus]} />
      </Section>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: MealMindSpace.md },
  hero: {
    gap: MealMindSpace.sm,
    marginBottom: MealMindSpace.sm,
  },
  heroKicker: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 11,
    letterSpacing: 2,
    color: MealMindColors.primary,
  },
  heroTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 22,
    letterSpacing: -0.4,
    color: MealMindColors.onSurface,
  },
  heroSub: {
    fontFamily: MealMindFonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: MealMindColors.onSurfaceVariant,
  },
  card: {
    backgroundColor: MealMindColors.surfaceContainerLowest,
    borderRadius: MealMindRadii.md,
    padding: MealMindSpace.lg,
    gap: MealMindSpace.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${MealMindColors.outlineVariant}33`,
    ...MealMindShadow.ambient,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: MealMindSpace.md,
  },
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MealMindColors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeadText: { flex: 1, gap: 4 },
  kicker: {
    fontFamily: MealMindFonts.labelSemibold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: MealMindColors.outline,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontFamily: MealMindFonts.headlineBold,
    fontSize: 17,
    color: MealMindColors.onSurface,
  },
  cardSub: {
    fontFamily: MealMindFonts.body,
    fontSize: 13,
    color: MealMindColors.onSurfaceVariant,
    lineHeight: 18,
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  bullet: { marginTop: 2 },
  answerText: {
    flex: 1,
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 15,
    color: MealMindColors.onSurface,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: MealMindSpace.sm,
  },
  chip: {
    paddingHorizontal: MealMindSpace.md,
    paddingVertical: 8,
    borderRadius: MealMindRadii.full,
    backgroundColor: MealMindColors.secondaryContainer,
  },
  chipText: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 13,
    color: MealMindColors.onSecondaryContainer,
  },
  emptyLine: {
    fontFamily: MealMindFonts.body,
    fontSize: 14,
    color: MealMindColors.onSurfaceVariant,
    fontStyle: 'italic',
  },
});
