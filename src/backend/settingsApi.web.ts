/**
 * User Settings API (Web version)
 */

import { getFirstFromStore, getAllFromStore, updateInStore, addToStore, deleteFromStore } from './database.web';
import { UserSettings, CalculationMethod, Madhab } from './types';

const SETTINGS_UPDATED_EVENT = 'settings-updated';

function notifySettingsUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(SETTINGS_UPDATED_EVENT));
  }
}

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

export async function getUserSettings(): Promise<UserSettings> {
  const row = await getFirstFromStore<any>('user_settings');
  
  if (!row) {
    return {
      calculationMethod: CalculationMethod.MWL,
      madhab: Madhab.SHAFI,
      adhanSound: 'default.mp3',
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

export async function updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  const currentSettings = await getUserSettings();
  const updatedSettings = { ...currentSettings, ...settings };
  
  const data = {
    id: currentSettings.id,
    calculation_method: updatedSettings.calculationMethod,
    madhab: updatedSettings.madhab,
    adhan_sound: updatedSettings.adhanSound,
    notifications_enabled: updatedSettings.notificationsEnabled ? 1 : 0,
    notification_24_hour: updatedSettings.notification24Hour ? 1 : 0,
    notification_fajr: updatedSettings.notificationFajr ? 1 : 0,
    notification_dhuhr: updatedSettings.notificationDhuhr ? 1 : 0,
    notification_asr: updatedSettings.notificationAsr ? 1 : 0,
    notification_maghrib: updatedSettings.notificationMaghrib ? 1 : 0,
    notification_isha: updatedSettings.notificationIsha ? 1 : 0,
    use_12_hour_format: updatedSettings.use12HourFormat ? 1 : 0,
    language: updatedSettings.language,
    theme: updatedSettings.theme,
    created_at: currentSettings.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  if (currentSettings.id) {
    await updateInStore('user_settings', data);
  } else {
    await addToStore('user_settings', data);
  }
  
  notifySettingsUpdated();
  return await getUserSettings();
}

export async function updateCalculationMethod(method: CalculationMethod): Promise<UserSettings> {
  return updateUserSettings({ calculationMethod: method });
}

export async function updateMadhab(madhab: Madhab): Promise<UserSettings> {
  return updateUserSettings({ madhab });
}

export async function updateAdhanSound(adhanSound: string): Promise<UserSettings> {
  return updateUserSettings({ adhanSound });
}

export async function toggleNotifications(enabled: boolean): Promise<UserSettings> {
  return updateUserSettings({ notificationsEnabled: enabled });
}

export async function updatePrayerNotification(
  prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
  enabled: boolean
): Promise<UserSettings> {
  const key = `notification${prayer.charAt(0).toUpperCase() + prayer.slice(1)}` as keyof UserSettings;
  return updateUserSettings({ [key]: enabled } as Partial<UserSettings>);
}

export async function resetSettings(): Promise<UserSettings> {
  const settings = await getUserSettings();
  if (settings.id) {
    await deleteFromStore('user_settings', settings.id);
  }
  
  await addToStore('user_settings', {
    calculation_method: CalculationMethod.MWL,
    madhab: Madhab.SHAFI,
    adhan_sound: 'default.mp3',
    notifications_enabled: 1,
    notification_24_hour: 1,
    notification_fajr: 1,
    notification_dhuhr: 1,
    notification_asr: 1,
    notification_maghrib: 1,
    notification_isha: 1,
    language: 'en',
    theme: 'light',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  
  notifySettingsUpdated();
  return await getUserSettings();
}
