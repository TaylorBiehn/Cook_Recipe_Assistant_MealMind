import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'mealmind.authToken';

export async function getAuthToken(): Promise<string | null> {
  const v = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  return v && v.length > 0 ? v : null;
}

export async function setAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
}

export async function clearAuthToken(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
}

