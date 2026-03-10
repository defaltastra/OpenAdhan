/**
 * Low-level IndexedDB cache for prayer times.
 * Intentionally has NO imports from aladhanApi or prayerTimesSync to avoid
 * circular dependencies. Both of those modules import from here.
 */

import { getDatabase } from './database.web';

const PRAYER_TIMES_STORE = 'prayer_times_cache';

/**
 * Save prayer times to the local IndexedDB cache.
 * @param locationId  numeric location id (use 0 when id is unknown)
 * @param date        YYYY-MM-DD
 * @param data        the DailyPrayerTimes object to persist
 */
export async function cachePrayerTimes(
  locationId: number,
  date: string,
  data: any
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
        data,
        cachedAt: new Date().toISOString(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    console.log(`[cache] Saved prayer times for location ${locationId} on ${date}`);
  } catch (error) {
    console.error('[cache] Error saving prayer times:', error);
  }
}

/**
 * Read cached prayer times from IndexedDB.
 * Returns null when no cached entry exists.
 * @param locationId  numeric location id (use 0 when id is unknown)
 * @param date        YYYY-MM-DD
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
          console.log(`[cache] Hit for ${date}`);
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  } catch (error) {
    console.error('[cache] Error reading prayer times:', error);
    return null;
  }
}
