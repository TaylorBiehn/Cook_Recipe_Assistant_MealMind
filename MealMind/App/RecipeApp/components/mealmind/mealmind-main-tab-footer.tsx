import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts } from '@/constants/mealmind-typography';
import { Colors } from '@/constants/theme';

const TABS = [
  { key: 'index' as const, href: '/(tabs)' as const, label: 'Home', icon: 'house.fill' as const },
  { key: 'favorites' as const, href: '/(tabs)/favorites' as const, label: 'Favorites', icon: 'heart.fill' as const },
  { key: 'profile' as const, href: '/(tabs)/profile' as const, label: 'Profile', icon: 'person.fill' as const },
];

export type MealMindMainTabFooterProps = {
  /** Override which tab looks selected (defaults from current path when possible). */
  activeTab?: 'index' | 'favorites' | 'profile';
};

function resolveActive(pathname: string, override?: MealMindMainTabFooterProps['activeTab']) {
  if (override) return override;
  if (pathname.includes('favorites')) return 'favorites';
  if (pathname.includes('profile')) return 'profile';
  return 'index';
}

export function MealMindMainTabFooter({ activeTab: activeTabProp }: MealMindMainTabFooterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const active = resolveActive(pathname, activeTabProp);
  const activeColor = Colors.light.tint;
  const inactiveColor = MealMindColors.onSurfaceVariant;

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, MealMindSpace.sm) }]}>
      {TABS.map((tab) => {
        const focused = active === tab.key;
        const color = focused ? activeColor : inactiveColor;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={tab.label}
            onPress={() => {
              if (process.env.EXPO_OS === 'ios') {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.replace(tab.href);
            }}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}>
            <IconSymbol name={tab.icon} size={28} color={color} />
            <Text style={[styles.label, { color }]} numberOfLines={1}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: MealMindSpace.sm,
    backgroundColor: MealMindColors.surfaceContainerLow,
    borderTopWidth: 0,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
    minHeight: 48,
  },
  itemPressed: {
    opacity: 0.88,
  },
  label: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 0.15,
  },
});
