import { supabase } from '@/lib/supabase';

const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const headers: Record<string, string> = {};
  if (data.session?.access_token) {
    headers.Authorization = `Bearer ${data.session.access_token}`;
  }
  return headers;
}

export class ApiClientError extends Error {
  code: string;
  status: number;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'ApiClientError';
  }
}

/** Authenticated GET to MealMind API (e.g. `/v1/users/me`). */
export async function apiGet(path: string): Promise<Response> {
  return await fetch(`${API_BASE}${path}`, {
    headers: { ...(await getAuthHeaders()) },
  });
}
