import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MealMindColors } from '@/constants/mealmind-colors';
import { MealMindRadii, MealMindShadow, MealMindSpace } from '@/constants/mealmind-layout';
import { MealMindFonts } from '@/constants/mealmind-typography';
import { showErrorToast } from '@/lib/mealmind-toast';
import { signOutMealMind } from '@/lib/supabase-auth';

export type ProfileMenuButtonProps = {
  /** Visual offset from the screen right edge (defaults to screen padding). */
  anchorRightInset?: number;
};

/**
 * Circular avatar button in the top bar. Tapping it opens a small popover
 * with "My Profile" and "Sign Out" actions.
 */
export function ProfileMenuButton({ anchorRightInset }: ProfileMenuButtonProps = {}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  const onProfile = useCallback(() => {
    setOpen(false);
    router.push('/(tabs)/profile');
  }, [router]);

  const onSignOut = useCallback(() => {
    if (busy) return;
    setBusy(true);
    void (async () => {
      try {
        await signOutMealMind();
        setOpen(false);
        router.replace('/signin');
      } catch (e) {
        showErrorToast('Sign out', e instanceof Error ? e.message : 'Could not sign out.');
      } finally {
        setBusy(false);
      }
    })();
  }, [busy, router]);

  const rightInset = anchorRightInset ?? MealMindSpace.lg;
  const topInset = insets.top + MealMindSpace.md + 44;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open profile menu"
        accessibilityState={{ expanded: open }}
        hitSlop={12}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.avatarWell, pressed && styles.pressed]}>
        <MaterialIcons name="account-circle" size={26} color={MealMindColors.primary} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
        statusBarTranslucent>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss profile menu"
          onPress={close}
          style={styles.backdrop}>
          <Pressable
            onPress={() => {}}
            style={[styles.card, { top: topInset, right: rightInset }]}>
            <Pressable
              accessibilityRole="menuitem"
              accessibilityLabel="My Profile"
              onPress={onProfile}
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}>
              <MaterialIcons name="person" size={20} color={MealMindColors.onSurface} />
              <Text style={styles.itemText}>My Profile</Text>
            </Pressable>

            <View style={styles.divider} />

            <Pressable
              accessibilityRole="menuitem"
              accessibilityLabel="Sign out"
              onPress={onSignOut}
              disabled={busy}
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed, busy && styles.itemBusy]}>
              <MaterialIcons name="logout" size={20} color={MealMindColors.error} />
              <Text style={[styles.itemText, styles.itemTextDanger]}>Sign Out</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
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
  pressed: {
    opacity: 0.75,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  card: {
    position: 'absolute',
    minWidth: 200,
    borderRadius: MealMindRadii.md,
    backgroundColor: MealMindColors.surfaceContainerLowest,
    paddingVertical: MealMindSpace.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${MealMindColors.outlineVariant}33`,
    ...MealMindShadow.ambient,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MealMindSpace.sm + 2,
    paddingVertical: MealMindSpace.sm + 2,
    paddingHorizontal: MealMindSpace.md,
  },
  itemPressed: {
    backgroundColor: MealMindColors.surfaceContainerHigh,
  },
  itemBusy: {
    opacity: 0.6,
  },
  itemText: {
    fontFamily: MealMindFonts.bodyMedium,
    fontSize: 15,
    color: MealMindColors.onSurface,
  },
  itemTextDanger: {
    color: MealMindColors.error,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: `${MealMindColors.outlineVariant}33`,
    marginVertical: 2,
  },
});
