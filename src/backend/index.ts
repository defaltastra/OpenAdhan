/**
 * Prayer Times Backend - Main Export
 * 
 * This is the main entry point for the offline prayer times backend.
 * Import this in your React Native app to access all prayer-related functionality.
 * 
 * @example
 * ```typescript
 * import PrayerAPI from './backend';
 * 
 * // Initialize on app start
 * await PrayerAPI.initialize();
 * 
 * // Get prayer times
 * const prayers = await PrayerAPI.getTodaysPrayerTimes();
 * ```
 */

// Main API export
export { default } from './api';
export { PrayerTimesAPI } from './api';

// Type exports
export type {
  UserSettings,
  Location,
  AdhanFile,
  PrayerTime,
  DailyPrayerTimes,
  NextPrayer,
  PrayerTimesParams,
} from './types';

export {
  CalculationMethod,
  Madhab,
  PrayerName,
} from './types';

// Direct module exports for advanced usage
// Use web-compatible versions for browser
export * as SettingsAPI from './settingsApi.web';
export * as LocationsAPI from './locationsApi.web';
export * as AdhanPlayer from './adhanPlayer.web';
export * as PrayerCalculator from './prayerCalculator';
export * as Database from './database.web';
