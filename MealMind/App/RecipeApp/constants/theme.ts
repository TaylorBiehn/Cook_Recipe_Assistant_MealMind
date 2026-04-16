/**
 * App-wide theme hooks for navigation / legacy components.
 * MealMind palette: `constants/mealmind-colors.ts` (+ layout + typography).
 */

import { Platform } from 'react-native';

import { MealMindColors } from './mealmind-colors';

const tintColorLight = MealMindColors.primaryContainer;
const tintColorDark = '#ff9f43';

export const Colors = {
  light: {
    text: MealMindColors.onSurface,
    background: MealMindColors.surface,
    tint: tintColorLight,
    icon: MealMindColors.onSurfaceVariant,
    tabIconDefault: MealMindColors.onSurfaceVariant,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
