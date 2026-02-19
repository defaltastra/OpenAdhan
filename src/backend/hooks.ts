/**
 * React Hooks for Prayer Times Backend
 * 
 * Custom hooks to easily integrate prayer times functionality
 * into React Native components.
 * 
 * Usage:
 * import { usePrayerTimes, useNextPrayer, useSettings } from './backend/hooks';
 */

import { useState, useEffect, useCallback } from 'react';
import PrayerAPI from './api';
import {
  DailyPrayerTimes,
  NextPrayer,
  UserSettings,
  Location,
  AdhanFile,
  PrayerTime,
  CalculationMethod,
  Madhab,
} from './types';
import { getTranslation, Language, translatePrayerName } from './translations';

/**
 * Hook to get today's prayer times
 * Auto-refreshes at midnight
 */
export function usePrayerTimes() {
  const [prayerTimes, setPrayerTimes] = useState<DailyPrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPrayerTimes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const times = await PrayerAPI.getTodaysPrayerTimes();
      setPrayerTimes(times);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading prayer times:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrayerTimes();

    // Refresh at midnight
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    const timeout = setTimeout(() => {
      loadPrayerTimes();
      
      // Set up daily refresh
      const interval = setInterval(loadPrayerTimes, 24 * 60 * 60 * 1000);
      return () => clearInterval(interval);
    }, timeUntilMidnight);

    return () => clearTimeout(timeout);
  }, [loadPrayerTimes]);

  return {
    prayerTimes,
    prayers: prayerTimes?.prayers || [],
    location: prayerTimes?.location || null,
    qiblaDirection: prayerTimes?.qiblaDirection || 0,
    loading,
    error,
    refresh: loadPrayerTimes,
  };
}

/**
 * Hook to get next prayer with live countdown
 * Updates every second
 */
export function useNextPrayer() {
  const [nextPrayer, setNextPrayer] = useState<NextPrayer | null>(null);
  const [loading, setLoading] = useState(true);

  const updateNextPrayer = useCallback(async () => {
    try {
      const next = await PrayerAPI.getNextPrayerWithCountdown();
      setNextPrayer(next);
      setLoading(false);
    } catch (error) {
      console.error('Error getting next prayer:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    updateNextPrayer();
    
    // Update countdown every second
    const interval = setInterval(updateNextPrayer, 1000);
    
    return () => clearInterval(interval);
  }, [updateNextPrayer]);

  return {
    nextPrayer,
    countdown: nextPrayer?.countdown || null,
    loading,
    refresh: updateNextPrayer,
  };
}

/**
 * Hook to manage user settings
 */
export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userSettings = await PrayerAPI.settings.get();
      setSettings(userSettings);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    try {
      const updated = await PrayerAPI.settings.update(updates);
      setSettings(updated);
      return updated;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }, []);

  const updateCalculationMethod = useCallback(async (method: CalculationMethod) => {
    try {
      const updated = await PrayerAPI.settings.updateCalculationMethod(method);
      setSettings(updated);
      return updated;
    } catch (error) {
      console.error('Error updating calculation method:', error);
      throw error;
    }
  }, []);

  const updateMadhab = useCallback(async (madhab: Madhab) => {
    try {
      const updated = await PrayerAPI.settings.updateMadhab(madhab);
      setSettings(updated);
      return updated;
    } catch (error) {
      console.error('Error updating madhab:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleSettingsUpdated = () => {
      loadSettings();
    };

    window.addEventListener('settings-updated', handleSettingsUpdated);
    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdated);
    };
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    updateCalculationMethod,
    updateMadhab,
    refresh: loadSettings,
  };
}

/**
 * Hook to manage locations
 */
export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [activeLocation, setActiveLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadLocations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [allLocations, active] = await Promise.all([
        PrayerAPI.locations.getAll(),
        PrayerAPI.locations.getActive(),
      ]);
      setLocations(allLocations);
      setActiveLocation(active);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading locations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveLocation = useCallback(async (location: Omit<Location, 'id' | 'createdAt'>) => {
    try {
      const saved = await PrayerAPI.locations.save(location);
      await loadLocations();
      return saved;
    } catch (error) {
      console.error('Error saving location:', error);
      throw error;
    }
  }, [loadLocations]);

  const setActive = useCallback(async (id: number) => {
    try {
      const location = await PrayerAPI.locations.setActive(id);
      setActiveLocation(location);
      await loadLocations();
      return location;
    } catch (error) {
      console.error('Error setting active location:', error);
      throw error;
    }
  }, [loadLocations]);

  const deleteLocation = useCallback(async (id: number) => {
    try {
      await PrayerAPI.locations.delete(id);
      await loadLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  }, [loadLocations]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  return {
    locations,
    activeLocation,
    loading,
    error,
    saveLocation,
    setActive,
    deleteLocation,
    refresh: loadLocations,
  };
}

/**
 * Hook to manage adhan files
 */
export function useAdhanFiles() {
  const [adhanFiles, setAdhanFiles] = useState<AdhanFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadAdhanFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const files = await PrayerAPI.adhan.getFiles();
      setAdhanFiles(files);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading adhan files:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdhanFiles();
  }, [loadAdhanFiles]);

  return {
    adhanFiles,
    loading,
    error,
    refresh: loadAdhanFiles,
  };
}

/**
 * Hook to manage adhan playback
 */
export function useAdhanPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAdhan, setCurrentAdhan] = useState<string | null>(null);

  const play = useCallback(async (adhanFilename?: string) => {
    try {
      if (adhanFilename) {
        await PrayerAPI.adhan.playByFilename(adhanFilename);
        setCurrentAdhan(adhanFilename);
      } else {
        await PrayerAPI.playSelectedAdhan();
        const settings = await PrayerAPI.settings.get();
        setCurrentAdhan(settings.adhanSound);
      }
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing adhan:', error);
      throw error;
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      await PrayerAPI.adhan.stop();
      setIsPlaying(false);
      setCurrentAdhan(null);
    } catch (error) {
      console.error('Error stopping adhan:', error);
      throw error;
    }
  }, []);

  const pause = useCallback(async () => {
    try {
      await PrayerAPI.adhan.pause();
      setIsPlaying(false);
    } catch (error) {
      console.error('Error pausing adhan:', error);
      throw error;
    }
  }, []);

  const resume = useCallback(async () => {
    try {
      await PrayerAPI.adhan.resume();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error resuming adhan:', error);
      throw error;
    }
  }, []);

  const setVolume = useCallback(async (volume: number) => {
    try {
      await PrayerAPI.adhan.setVolume(volume);
    } catch (error) {
      console.error('Error setting volume:', error);
      throw error;
    }
  }, []);

  // Check playing status periodically
  useEffect(() => {
    const checkStatus = async () => {
      const playing = await PrayerAPI.adhan.isPlaying();
      setIsPlaying(playing);
      if (!playing) {
        setCurrentAdhan(null);
      }
    };

    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    isPlaying,
    currentAdhan,
    play,
    stop,
    pause,
    resume,
    setVolume,
  };
}

/**
 * Hook to get Qibla direction
 */
export function useQibla() {
  const [direction, setDirection] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadQiblaDirection = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const qibla = await PrayerAPI.getQiblaDirection();
      setDirection(qibla);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading Qibla direction:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQiblaDirection();
  }, [loadQiblaDirection]);

  return {
    direction,
    loading,
    error,
    refresh: loadQiblaDirection,
  };
}

/**
 * Hook to initialize the backend
 * Use this in your root App component
 */
export function usePrayerAPI() {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initialize() {
      try {
        if (!PrayerAPI.isInitialized()) {
          await PrayerAPI.initialize();
          setInitialized(true);
        }
      } catch (err) {
        setError(err as Error);
        console.error('Failed to initialize Prayer API:', err);
      }
    }

    initialize();

    // Cleanup on unmount
    return () => {
      PrayerAPI.cleanup();
    };
  }, []);

  return {
    initialized,
    error,
  };
}

/**
 * Hook for getting prayer times for a specific date
 */
export function usePrayerTimesForDate(date: Date) {
  const [prayerTimes, setPrayerTimes] = useState<DailyPrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadPrayerTimes() {
      try {
        setLoading(true);
        setError(null);
        const times = await PrayerAPI.getPrayerTimesForDate(date);
        setPrayerTimes(times);
      } catch (err) {
        setError(err as Error);
        console.error('Error loading prayer times for date:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPrayerTimes();
  }, [date]);

  return {
    prayerTimes,
    loading,
    error,
  };
}

/**
 * Hook to get translations based on current language setting
 */
export function useTranslation() {
  const { settings } = useSettings();
  const lang = (settings?.language || 'en') as Language;
  const t = getTranslation(lang);
  
  const translatePrayer = (prayerName: string) => translatePrayerName(prayerName, lang);
  
  return {
    t,
    lang,
    isRTL: lang === 'ar',
    translatePrayer,
  };
}
