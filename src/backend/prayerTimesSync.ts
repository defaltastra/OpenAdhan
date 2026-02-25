/**
 * Prayer Times Sync Manager
 * Syncs prayer times from API when internet is available and caches them locally
 */

import { fetchPrayerTimes } from './aladhanApi';
import { getAllLocations, getActiveLocation } from './locationsApi.web';
import { getUserSettings } from './settingsApi.web';
import { getDatabase } from './database.web';

const PRAYER_TIMES_STORE = 'prayer_times_cache';
const SYNC_TIMESTAMP_KEY = 'last_sync_timestamp';

/**
 * Initialize prayer times cache store if it doesn't exist
 */
export async function initializePrayerTimesCache(): Promise<void> {
  const db = await getDatabase();
  
  // Create object store if it doesn't exist (for IndexedDB)
  if (!db.objectStoreNames.contains(PRAYER_TIMES_STORE)) {
    console.log('Prayer times cache store already exists');
  }
}

/**
 * Save prayer times to local cache
 */
export async function cachePrayerTimes(
  locationId: number,
  date: string, // YYYY-MM-DD format
  prayerTimesData: any
): Promise<void> {
  try {
    const db = await getDatabase();
    const cacheKey = `${locationId}-${date}`;
    
    const transaction = db.transaction([PRAYER_TIMES_STORE], 'readwrite');
    const store = transaction.objectStore(PRAYER_TIMES_STORE);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put({
        key: cacheKey,
        locationId,
        date,
        data: prayerTimesData,
        cachedAt: new Date().toISOString(),
      });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    console.log(`Cached prayer times for location ${locationId} on ${date}`);
  } catch (error) {
    console.error('Error caching prayer times:', error);
  }
}

/**
 * Get cached prayer times
 */
export async function getCachedPrayerTimes(locationId: number, date: string): Promise<any | null> {
  try {
    const db = await getDatabase();
    const cacheKey = `${locationId}-${date}`;
    
    const transaction = db.transaction([PRAYER_TIMES_STORE], 'readonly');
    const store = transaction.objectStore(PRAYER_TIMES_STORE);
    
    return new Promise<any>((resolve) => {
      const request = store.get(cacheKey);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          console.log(`Retrieved cached prayer times for ${date}`);
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  } catch (error) {
    console.error('Error retrieving cached prayer times:', error);
    return null;
  }
}

/**
 * Sync prayer times for today and next few days when internet is available
 */
export async function syncPrayerTimesWhenOnline(): Promise<void> {
  try {
    console.log('Starting prayer times sync...');
    
    const settings = await getUserSettings();
    const activeLocation = await getActiveLocation();
    
    if (!activeLocation) {
      console.log('No active location set, skipping sync');
      return;
    }
    
    if (!settings.notificationsEnabled) {
      console.log('Notifications disabled, skipping sync');
      return;
    }
    
    const today = new Date();
    const dates: Date[] = [];
    
    // Sync for today and next 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    
    console.log(`Syncing prayer times for ${dates.length} days...`);
    
    for (const date of dates) {
      try {
        const dateStr = formatDateForCache(date);
        
        // Check if already cached
        const cached = await getCachedPrayerTimes(activeLocation.id!, dateStr);
        if (cached) {
          console.log(`Prayer times for ${dateStr} already cached, skipping`);
          continue;
        }
        
        // Fetch from API
        const prayerTimes = await fetchPrayerTimes(
          activeLocation,
          settings.calculationMethod,
          settings.madhab,
          date,
          settings.use12HourFormat
        );
        
        // Cache locally
        await cachePrayerTimes(activeLocation.id!, dateStr, prayerTimes);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Failed to sync prayer times for ${date.toISOString()}:`, error);
        // Continue with next date
      }
    }
    
    // Update last sync timestamp
    const db = await getDatabase();
    const transaction = db.transaction([PRAYER_TIMES_STORE], 'readwrite');
    const store = transaction.objectStore(PRAYER_TIMES_STORE);
    
    store.put({
      key: SYNC_TIMESTAMP_KEY,
      timestamp: new Date().toISOString(),
    });
    
    console.log('Prayer times sync completed');
  } catch (error) {
    console.error('Error syncing prayer times:', error);
  }
}

/**
 * Format date for cache key (YYYY-MM-DD)
 */
function formatDateForCache(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get last sync timestamp
 */
export async function getLastSyncTimestamp(): Promise<string | null> {
  try {
    const db = await getDatabase();
    const transaction = db.transaction([PRAYER_TIMES_STORE], 'readonly');
    const store = transaction.objectStore(PRAYER_TIMES_STORE);
    
    return new Promise<string | null>((resolve) => {
      const request = store.get(SYNC_TIMESTAMP_KEY);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result?.timestamp || null);
      };
      request.onerror = () => resolve(null);
    });
  } catch (error) {
    console.error('Error getting last sync timestamp:', error);
    return null;
  }
}
