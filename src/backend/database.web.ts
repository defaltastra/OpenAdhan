/**
 * Browser-compatible Database using IndexedDB
 * This replaces expo-sqlite for web apps
 */

import { CalculationMethod, Madhab } from './types';

const DB_NAME = 'prayer_times_db';
const DB_VERSION = 2; // Incremented for path migration

let db: IDBDatabase | null = null;

/**
 * Initialize IndexedDB for browser
 */
export async function initDatabase(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      db = request.result;
      seedDefaultData();
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      const transaction = (event.target as IDBOpenDBRequest).transaction!;
      const oldVersion = event.oldVersion;

      // User settings store
      if (!database.objectStoreNames.contains('user_settings')) {
        database.createObjectStore('user_settings', { keyPath: 'id', autoIncrement: true });
      }

      // Locations store
      if (!database.objectStoreNames.contains('locations')) {
        const locationStore = database.createObjectStore('locations', { keyPath: 'id', autoIncrement: true });
        locationStore.createIndex('is_active', 'is_active', { unique: false });
      }

      // Adhan files store
      if (!database.objectStoreNames.contains('adhan_files')) {
        const adhanStore = database.createObjectStore('adhan_files', { keyPath: 'id', autoIncrement: true });
        adhanStore.createIndex('filename', 'filename', { unique: true });
      }

      // Prayer times cache store
      if (!database.objectStoreNames.contains('prayer_times_cache')) {
        database.createObjectStore('prayer_times_cache', { keyPath: 'key' });
      }

      // Migration from version 1 to 2: fix adhan file paths
      if (oldVersion < 2) {
        const adhanStore = transaction.objectStore('adhan_files');
        const getAllRequest = adhanStore.getAll();
        
        getAllRequest.onsuccess = () => {
          const files = getAllRequest.result;
          files.forEach((file: any) => {
            // Update paths to include leading slash if missing
            if (file.path && !file.path.startsWith('/')) {
              file.path = '/' + file.path;
              adhanStore.put(file);
            }
          });
        };
      }
    };
  });
}

/**
 * Get database instance
 */
export async function getDatabase(): Promise<IDBDatabase> {
  if (!db) {
    return await initDatabase();
  }
  return db;
}

/**
 * Seed default data
 */
async function seedDefaultData(): Promise<void> {
  const database = await getDatabase();

  // Check if settings exist
  const settingsCount = await new Promise<number>((resolve) => {
    const transaction = database.transaction(['user_settings'], 'readonly');
    const store = transaction.objectStore('user_settings');
    const request = store.count();
    request.onsuccess = () => resolve(request.result);
  });

  if (settingsCount === 0) {
    // Add default settings
    const transaction = database.transaction(['user_settings'], 'readwrite');
    const store = transaction.objectStore('user_settings');
    store.add({
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
      use_12_hour_format: 1,
      language: 'en',
      theme: 'light',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  // Check if adhan files exist
  const adhanCount = await new Promise<number>((resolve) => {
    const transaction = database.transaction(['adhan_files'], 'readonly');
    const store = transaction.objectStore('adhan_files');
    const request = store.count();
    request.onsuccess = () => resolve(request.result);
  });

  if (adhanCount === 0) {
    const transaction = database.transaction(['adhan_files'], 'readwrite');
    const store = transaction.objectStore('adhan_files');
    
    const defaultAdhans = [
      { name: 'Default Adhan', filename: 'default.mp3', path: '/assets/adhan/default.mp3', duration: 180 },
      { name: 'Madinah', filename: 'madinah.mp3', path: '/assets/adhan/madinah.mp3', duration: 210 },
    ];

    defaultAdhans.forEach(adhan => {
      store.add({
        ...adhan,
        created_at: new Date().toISOString(),
      });
    });
  }
}

/**
 * Reset database
 */
export async function resetDatabase(): Promise<void> {
  if (db) {
    db.close();
  }
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => {
      db = null;
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Close database
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    db.close();
    db = null;
  }
}

// Helper to get first result from object store
export async function getFirstFromStore<T>(storeName: string): Promise<T | null> {
  const database = await getDatabase();
  return new Promise((resolve) => {
    const transaction = database.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.openCursor();
    
    request.onsuccess = () => {
      const cursor = request.result;
      resolve(cursor ? cursor.value : null);
    };
  });
}

// Helper to get all from object store
export async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const database = await getDatabase();
  return new Promise((resolve) => {
    const transaction = database.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
  });
}

// Helper to add to object store
export async function addToStore<T>(storeName: string, data: T): Promise<number> {
  const database = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(data);
    
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
}

// Helper to update in object store
export async function updateInStore<T extends { id?: number }>(storeName: string, data: T): Promise<void> {
  const database = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Helper to delete from object store
export async function deleteFromStore(storeName: string, id: number): Promise<void> {
  const database = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Helper to get by id
export async function getByIdFromStore<T>(storeName: string, id: number): Promise<T | null> {
  const database = await getDatabase();
  return new Promise((resolve) => {
    const transaction = database.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);
    
    request.onsuccess = () => resolve(request.result || null);
  });
}
