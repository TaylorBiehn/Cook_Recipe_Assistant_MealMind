import type {
  CookingExperience,
  DietaryPreference,
  StoredProfile,
  WellnessGoal,
} from '@/lib/profile-storage';

export const WELLNESS_GOAL_LABELS: Record<WellnessGoal, string> = {
  eat_healthier: 'Eat healthier',
  save_time: 'Save time',
  lose_weight: 'Lose weight',
  gain_muscle: 'Gain muscle',
  maintain_weight: 'Maintain weight',
  reduce_waste: 'Reduce food waste',
  budget: 'Eat on a budget',
  unsure: 'Not sure yet',
};

export const DIETARY_LABELS: Record<DietaryPreference, string> = {
  none: 'No preference',
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  keto: 'Keto',
  low_carb: 'Low carb',
  high_protein: 'High protein',
  gluten_free: 'Gluten free',
  dairy_free: 'Dairy free',
  other: 'Other',
};

export const COOKING_EXPERIENCE_LABELS: Record<CookingExperience, string> = {
  new: 'Beginner cook',
  home_cook: 'Home cook',
  confident: 'Confident',
  pro: 'Pro / enthusiast',
};

export const COOKING_SCHEDULE_LABELS: Record<string, string> = {
  weeknights: 'Weeknights',
  weekends: 'Weekends',
  most_days: 'Most days',
  flexible: 'Flexible',
};

export const SPICY_LEVEL_LABELS: Record<StoredProfile['spicyLevel'], string> = {
  mild: 'Mild',
  medium: 'Medium',
  hot: 'Hot',
};

export const CALORIE_FOCUS_LABELS: Record<StoredProfile['calorieFocus'], string> = {
  no_preference: 'No preference',
  lower: 'Lower calories',
  balanced: 'Balanced',
  higher: 'Higher calories',
};
