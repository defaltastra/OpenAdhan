/**
 * User Settings API
 * Handles all user preferences and settings operations
 */

import { getDatabase } from './database';
import { UserSettings, CalculationMethod, Madhab } from './types';

/**
 * Map database row to UserSettings object
 */
function mapRowToSettings(row: any): UserSettings {
  return {
    id: row.id,
    calculationMethod: row.calculation_method as CalculationMethod,
    madhab: row.madhab as Madhab,
    adhanSound: row.adhan_sound,
    notificationsEnabled: Boolean(row.notifications_enabled),
    notification24Hour: Boolean(row.notification_24_hour),
    notificationFajr: Boolean(row.notification_fajr),
    notificationDhuhr: Boolean(row.notification_dhuhr),
    notificationAsr: Boolean(row.notification_asr),
    notificationMaghrib: Boolean(row.notification_maghrib),
    notificationIsha: Boolean(row.notification_isha),
    use12HourFormat: row.use_12_hour_format !== undefined ? Boolean(row.use_12_hour_format) : true,
    language: row.language,
    theme: row.theme,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Get current user settings
 */
export async function getUserSettings(): Promise<UserSettings> {
  const db = await getDatabase();
  
  const row = await db.getFirstAsync(
    'SELECT * FROM user_settings ORDER BY id DESC LIMIT 1'
  );

  if (!row) {
    // Return default settings if none exist
    return {
      calculationMethod: CalculationMethod.MWL,
      madhab: Madhab.SHAFI,
      adhanSound: 'default',
      notificationsEnabled: true,
      notification24Hour: true,
      notificationFajr: true,
      notificationDhuhr: true,
      notificationAsr: true,
      notificationMaghrib: true,
      notificationIsha: true,
      use12HourFormat: true,
      language: 'en',
      theme: 'light',
    };
  }

  return mapRowToSettings(row);
}

/**
 * Update user settings
 */
export async function updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  const db = await getDatabase();
  
  // Get current settings
  const currentSettings = await getUserSettings();
  
  // Merge with new settings
  const updatedSettings = { ...currentSettings, ...settings };

  // Check if settings record exists
  if (currentSettings.id) {
    // Update existing record
    await db.runAsync(
      `UPDATE user_settings SET
        calculation_method = ?,
        madhab = ?,
        adhan_sound = ?,
        notifications_enabled = ?,
        notification_24_hour = ?,
        notification_fajr = ?,
        notification_dhuhr = ?,
        notification_asr = ?,
        notification_maghrib = ?,
        notification_isha = ?,
        use_12_hour_format = ?,
        language = ?,
        theme = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        updatedSettings.calculationMethod,
        updatedSettings.madhab,
        updatedSettings.adhanSound,
        updatedSettings.notificationsEnabled ? 1 : 0,
        updatedSettings.notification24Hour ? 1 : 0,
        updatedSettings.notificationFajr ? 1 : 0,
        updatedSettings.notificationDhuhr ? 1 : 0,
        updatedSettings.notificationAsr ? 1 : 0,
        updatedSettings.notificationMaghrib ? 1 : 0,
        updatedSettings.notificationIsha ? 1 : 0,
        updatedSettings.use12HourFormat ? 1 : 0,
        updatedSettings.language,
        updatedSettings.theme,
        currentSettings.id,
      ]
    );
  } else {
    // Insert new record
    await db.runAsync(
      `INSERT INTO user_settings (
        calculation_method,
        madhab,
        adhan_sound,
        notifications_enabled,
        notification_24_hour,
        notification_fajr,
        notification_dhuhr,
        notification_asr,
        notification_maghrib,
        notification_isha,
        use_12_hour_format,
        language,
        theme
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        updatedSettings.calculationMethod,
        updatedSettings.madhab,
        updatedSettings.adhanSound,
        updatedSettings.notificationsEnabled ? 1 : 0,
        updatedSettings.notification24Hour ? 1 : 0,
        updatedSettings.notificationFajr ? 1 : 0,
        updatedSettings.notificationDhuhr ? 1 : 0,
        updatedSettings.notificationAsr ? 1 : 0,
        updatedSettings.notificationMaghrib ? 1 : 0,
        updatedSettings.notificationIsha ? 1 : 0,
        updatedSettings.use12HourFormat ? 1 : 0,
        updatedSettings.language,
        updatedSettings.theme,
      ]
    );
  }

  // Return updated settings
  return await getUserSettings();
}

/**
 * Update calculation method
 */
export async function updateCalculationMethod(method: CalculationMethod): Promise<UserSettings> {
  return updateUserSettings({ calculationMethod: method });
}

/**
 * Update madhab
 */
export async function updateMadhab(madhab: Madhab): Promise<UserSettings> {
  return updateUserSettings({ madhab });
}

/**
 * Update adhan sound
 */
export async function updateAdhanSound(adhanSound: string): Promise<UserSettings> {
  return updateUserSettings({ adhanSound });
}

/**
 * Toggle notifications
 */
export async function toggleNotifications(enabled: boolean): Promise<UserSettings> {
  return updateUserSettings({ notificationsEnabled: enabled });
}

/**
 * Update prayer-specific notification
 */
export async function updatePrayerNotification(
  prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
  enabled: boolean
): Promise<UserSettings> {
  const key = `notification${prayer.charAt(0).toUpperCase() + prayer.slice(1)}` as keyof UserSettings;
  return updateUserSettings({ [key]: enabled } as Partial<UserSettings>);
}

/**
 * Reset settings to default
 */
export async function resetSettings(): Promise<UserSettings> {
  const db = await getDatabase();
  
  await db.runAsync('DELETE FROM user_settings');
  
  await db.runAsync(
    `INSERT INTO user_settings (
      calculation_method,
      madhab,
      adhan_sound,
      notifications_enabled,
      notification_24_hour,
      use_12_hour_format,
      theme
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [CalculationMethod.MWL, Madhab.SHAFI, 'default', 1, 1, 1, 'light']
  );

  return await getUserSettings();
}
