import type { KitchenComfort, SkillLevel } from '@/lib/profile-storage';

export const FLAVOR_OPTIONS = ['spicy', 'sweet', 'healthy', 'savory', 'tangy', 'mild'] as const;

export const SKILL_LABELS: Record<SkillLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

/** Shown on Profile for stored `kitchenComfort` (onboarding no longer collects this). */
export const KITCHEN_COMFORT_LABELS: Record<KitchenComfort, string> = {
  quick_simple: 'Mostly quick & simple',
  balanced: 'Balanced mix',
  ambitious: 'Happy with ambitious recipes',
};
