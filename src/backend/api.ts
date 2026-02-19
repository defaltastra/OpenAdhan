/**
 * Main Prayer Times API
 * 
 * This is the main entry point for the prayer times backend.
 * Provides a unified interface for all prayer-related operations.
 * 
 * Usage:
 * import PrayerAPI from './backend/api';
 * 
 * // Initialize the database
 * await PrayerAPI.initialize();
 * 
 * // Get today's prayer times
 * const todaysPrayers = await PrayerAPI.getTodaysPrayerTimes();
 * 
 * // Get next prayer with countdown
 * const nextPrayer = await PrayerAPI.getNextPrayerWithCountdown();
 */

import { initDatabase, getDatabase, resetDatabase, closeDatabase } from './database.web';
import {
  getUserSettings,
  updateUserSettings,
  updateCalculationMethod,
  updateMadhab,
  updateAdhanSound,
  toggleNotifications,
  updatePrayerNotification,
  resetSettings,
} from './settingsApi.web';
import {
  getAllLocations,
  getActiveLocation,
  getLocationById,
  saveLocation,
  updateLocation,
  setActiveLocation,
  deleteLocation,
  searchLocations,
  clearAllLocations,
} from './locationsApi.web';
import {
  calculatePrayerTimes,
  getDailyPrayerTimes,
  calculateQiblaDirection,
  isWithinPrayerTime,
  getNextPrayer,
} from './prayerCalculator';
import { fetchPrayerTimes } from './aladhanApi';
import {
  initializeAudio,
  getAdhanFiles,
  getAdhanFileByFilename,
  getAdhanFileById,
  addAdhanFile,
  playAdhanByFilename,
  playAdhan,
  playAdhanFromAsset,
  stopAdhan,
  pauseAdhan,
  resumeAdhan,
  setAdhanVolume,
  getPlaybackStatus,
  isAdhanPlaying,
  cleanupAudio,
  deleteAdhanFile,
} from './adhanPlayer.web';

import {
  UserSettings,
  Location,
  AdhanFile,
  PrayerTime,
  DailyPrayerTimes,
  NextPrayer,
  CalculationMethod,
  Madhab,
  PrayerName,
} from './types';

/**
 * Main Prayer Times API
 */
class PrayerTimesAPI {
  private initialized: boolean = false;

  /**
   * Initialize the backend
   * Call this once when your app starts
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await initDatabase();
      await initializeAudio();
      this.initialized = true;
      console.log('Prayer Times API initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Prayer Times API:', error);
      throw error;
    }
  }

  /**
   * Check if API is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get today's prayer times based on active location and settings
   */
  async getTodaysPrayerTimes(): Promise<DailyPrayerTimes> {
    const location = await getActiveLocation();
    
    if (!location) {
      throw new Error('No active location set. Please set a location first.');
    }

    const settings = await getUserSettings();
    
    return fetchPrayerTimes(
      location,
      settings.calculationMethod,
      settings.madhab,
      new Date(),
      settings.use12HourFormat
    );
  }

  /**
   * Get prayer times for a specific date
   */
  async getPrayerTimesForDate(date: Date): Promise<DailyPrayerTimes> {
    const location = await getActiveLocation();
    if (!location) {
      throw new Error('No active location set. Please set a location first.');
    }

    const settings = await getUserSettings();
    
    return fetchPrayerTimes(
      location,
      settings.calculationMethod,
      settings.madhab,
      date,
      settings.use12HourFormat
    );
  }

  /**
   * Get next prayer with countdown
   * Returns null if no location is set or calculation fails
   */
  async getNextPrayerWithCountdown(): Promise<NextPrayer | null> {
    try {
      const todaysPrayers = await this.getTodaysPrayerTimes();
      const nextPrayer = getNextPrayer(todaysPrayers.prayers);

      // If next prayer is null (meaning all prayers for today have passed),
      // get tomorrow's Fajr
      if (!nextPrayer) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowPrayers = await this.getPrayerTimesForDate(tomorrow);
        
        const fajrPrayer = tomorrowPrayers.prayers.find(p => p.name === PrayerName.FAJR);
        if (fajrPrayer) {
          const now = new Date();
          const totalSeconds = Math.floor((fajrPrayer.timestamp - now.getTime()) / 1000);
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;

          return {
            prayer: fajrPrayer,
            countdown: {
              hours,
              minutes,
              seconds,
              totalSeconds,
            },
          };
        }
      }

      return nextPrayer;
    } catch (error) {
      console.error('Error getting next prayer:', error);
      return null;
    }
  }

  /**
   * Get all prayer times (just the times array)
   */
  async getAllPrayersForToday(): Promise<PrayerTime[]> {
    const todaysPrayers = await this.getTodaysPrayerTimes();
    return todaysPrayers.prayers;
  }

  /**
   * Get Qibla direction for active location
   */
  async getQiblaDirection(): Promise<number> {
    const location = await getActiveLocation();
    if (!location || !location.latitude || !location.longitude) {
      throw new Error('No active location with coordinates set');
    }

    return calculateQiblaDirection(location.latitude, location.longitude);
  }

  /**
   * Check if we are currently within a specific prayer time window
   */
  async isCurrentlyPrayerTime(prayerName: PrayerName): Promise<boolean> {
    const prayers = await this.getAllPrayersForToday();
    return isWithinPrayerTime(prayerName, prayers);
  }

  /**
   * Play the user's selected adhan
   */
  async playSelectedAdhan(): Promise<void> {
    const settings = await getUserSettings();
    await playAdhanByFilename(settings.adhanSound);
  }

  /**
   * Play adhan for a specific prayer time
   * Automatically plays it if notifications are enabled for that prayer
   */
  async playAdhanForPrayer(prayerName: PrayerName): Promise<void> {
    const settings = await getUserSettings();
    
    // Check if notifications are enabled for this prayer
    if (!settings.notificationsEnabled) {
      console.log('Notifications are disabled');
      return;
    }

    const notificationKey = `notification${prayerName.charAt(0).toUpperCase() + prayerName.slice(1).toLowerCase()}` as keyof UserSettings;
    
    if (!settings[notificationKey]) {
      console.log(`Notifications disabled for ${prayerName}`);
      return;
    }

    await this.playSelectedAdhan();
  }

  /**
   * Cleanup and close all connections
   */
  async cleanup(): Promise<void> {
    await cleanupAudio();
    await closeDatabase();
    this.initialized = false;
  }

  // Export all sub-APIs for direct access if needed
  settings = {
    get: getUserSettings,
    update: updateUserSettings,
    updateCalculationMethod,
    updateMadhab,
    updateAdhanSound,
    toggleNotifications,
    updatePrayerNotification,
    reset: resetSettings,
  };

  locations = {
    getAll: getAllLocations,
    getActive: getActiveLocation,
    getById: getLocationById,
    save: saveLocation,
    update: updateLocation,
    setActive: setActiveLocation,
    delete: deleteLocation,
    search: searchLocations,
    clearAll: clearAllLocations,
  };

  adhan = {
    getFiles: getAdhanFiles,
    getByFilename: getAdhanFileByFilename,
    getById: getAdhanFileById,
    add: addAdhanFile,
    playByFilename: playAdhanByFilename,
    play: playAdhan,
    playFromAsset: playAdhanFromAsset,
    stop: stopAdhan,
    pause: pauseAdhan,
    resume: resumeAdhan,
    setVolume: setAdhanVolume,
    getStatus: getPlaybackStatus,
    isPlaying: isAdhanPlaying,
    delete: deleteAdhanFile,
  };

  calculator = {
    calculatePrayerTimes,
    getDailyPrayerTimes,
    getNextPrayer,
    calculateQiblaDirection,
    isWithinPrayerTime,
  };

  database = {
    get: getDatabase,
    reset: resetDatabase,
    close: closeDatabase,
  };
}

// Export singleton instance
const PrayerAPI = new PrayerTimesAPI();
export default PrayerAPI;

// Also export the class for custom instances if needed
export { PrayerTimesAPI };

// Re-export types for convenience
export type {
  UserSettings,
  Location,
  AdhanFile,
  PrayerTime,
  DailyPrayerTimes,
  NextPrayer,
};

export {
  CalculationMethod,
  Madhab,
  PrayerName,
};
