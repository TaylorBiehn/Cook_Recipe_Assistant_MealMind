import { UnavailabilityError } from 'expo-modules-core';
import * as ImagePicker from 'expo-image-picker';

export type PickScanImageResult = {
  uri: string | null;
  /** Set when picking failed or permission was denied — safe to show in UI. */
  message?: string;
};

const CAMERA_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  quality: 0.85,
};

function permissionMessage(camera: boolean): string {
  return camera
    ? 'Camera access is off. You can enable it in Settings for this app.'
    : 'Photo library access is off. You can enable it in Settings for this app.';
}

function mapPickerError(e: unknown, camera: boolean): PickScanImageResult {
  if (e instanceof UnavailabilityError) {
    return {
      uri: null,
      message: camera
        ? 'The camera is not available in this environment (for example Expo web, or some simulators). Use Photo Library instead, or run on a physical device with Expo Go or a development build.'
        : 'Choosing photos is not available in this environment. Try another platform or use a development build.',
    };
  }
  const msg = e instanceof Error ? e.message : 'Something went wrong. Please try again.';
  return { uri: null, message: msg };
}

async function pickFromLibrary(): Promise<PickScanImageResult> {
  try {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      return { uri: null, message: permissionMessage(false) };
    }
    const result = await ImagePicker.launchImageLibraryAsync(CAMERA_OPTIONS);
    if (result.canceled) {
      return { uri: null };
    }
    const uri = result.assets[0]?.uri ?? null;
    return uri ? { uri } : { uri: null, message: 'No image was selected.' };
  } catch (e) {
    return mapPickerError(e, false);
  }
}

async function pickFromCamera(): Promise<PickScanImageResult> {
  try {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      return { uri: null, message: permissionMessage(true) };
    }
    const result = await ImagePicker.launchCameraAsync(CAMERA_OPTIONS);
    if (result.canceled) {
      return { uri: null };
    }
    const uri = result.assets[0]?.uri ?? null;
    return uri ? { uri } : { uri: null, message: 'No photo was captured.' };
  } catch (e) {
    return mapPickerError(e, true);
  }
}

export type ScanImageSource = 'camera' | 'library';

export async function pickScanImage(source: ScanImageSource): Promise<PickScanImageResult> {
  return source === 'camera' ? pickFromCamera() : pickFromLibrary();
}
