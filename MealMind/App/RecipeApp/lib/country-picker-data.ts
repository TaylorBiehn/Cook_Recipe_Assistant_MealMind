import type { LocaleData } from 'i18n-iso-countries';
/**
 * Metro resolves the package `main` field (`entry-node.js`), which loops over
 * `require("./langs/" + locale + ".json")` — those dynamic paths are unknown
 * to the bundler. The `browser` entry is `index.js`; import it explicitly.
 */
import * as countries from 'i18n-iso-countries/index.js';
import english from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(english as LocaleData);

export type CountryPickerItem = { value: string; label: string };

let cachedItems: CountryPickerItem[] | null = null;

/** Worldwide first, then all ISO countries (English names), A–Z. */
export function getCountryPickerItems(): CountryPickerItem[] {
  if (cachedItems != null) return cachedItems;
  const names = countries.getNames('en', { select: 'official' });
  const sorted = Object.entries(names)
    .map(([code, label]) => ({ value: code, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'en'));
  cachedItems = [{ value: 'WORLDWIDE', label: 'Worldwide' }, ...sorted];
  return cachedItems;
}

export function getCountryLabel(code: string): string {
  if (code === 'WORLDWIDE') return 'Worldwide';
  return countries.getName(code, 'en') ?? code;
}
