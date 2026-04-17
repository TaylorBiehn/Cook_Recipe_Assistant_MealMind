import * as Location from 'expo-location';
import * as countries from 'i18n-iso-countries/index.js';

/**
 * Asks for foreground location permission, reverse-geocodes the current position,
 * and returns an ISO 3166-1 alpha-2 code, or null if unavailable.
 */
export async function detectCountryCodeFromDevice(): Promise<string | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const results = await Location.reverseGeocodeAsync({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
    });

    const raw = results[0]?.isoCountryCode?.trim().toUpperCase();
    if (!raw || raw.length !== 2 || !countries.isValid(raw)) return null;
    return raw;
  } catch {
    return null;
  }
}
