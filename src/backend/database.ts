/**
 * SQLite Database Setup and Management
 * Using expo-sqlite for React Native
 * 
 * For React Native projects, install:
 * expo install expo-sqlite
 * 
 * For bare React Native, use:
 * npm install react-native-sqlite-storage
 */

import * as SQLite from 'expo-sqlite';
import { CalculationMethod, Madhab } from './types';

const DB_NAME = 'prayer_times.db';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize and open the database
 */
export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  try {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await createTables();
    await seedDefaultData();
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Get the database instance
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    return await initDatabase();
  }
  return db;
}

/**
 * Create all necessary tables
 */
async function createTables(): Promise<void> {
  const database = await getDatabase();

  // User settings table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      calculation_method TEXT NOT NULL DEFAULT 'MWL',
      madhab TEXT NOT NULL DEFAULT 'Shafi',
      adhan_sound TEXT NOT NULL DEFAULT 'default',
      notifications_enabled INTEGER NOT NULL DEFAULT 1,
      notification_24_hour INTEGER NOT NULL DEFAULT 1,
      notification_fajr INTEGER NOT NULL DEFAULT 1,
      notification_dhuhr INTEGER NOT NULL DEFAULT 1,
      notification_asr INTEGER NOT NULL DEFAULT 1,
      notification_maghrib INTEGER NOT NULL DEFAULT 1,
      notification_isha INTEGER NOT NULL DEFAULT 1,
      use_12_hour_format INTEGER NOT NULL DEFAULT 1,
      language TEXT NOT NULL DEFAULT 'en',
      theme TEXT NOT NULL DEFAULT 'light',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    await database.execAsync(
      "ALTER TABLE user_settings ADD COLUMN use_12_hour_format INTEGER NOT NULL DEFAULT 1;"
    );
  } catch (error) {
    // Column already exists or migration not needed.
  }

  // Locations table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      timezone TEXT,
      is_active INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Adhan files table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS adhan_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      filename TEXT NOT NULL UNIQUE,
      path TEXT NOT NULL,
      duration INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create indexes for better performance
  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_locations_active ON locations(is_active);
    CREATE INDEX IF NOT EXISTS idx_adhan_files_filename ON adhan_files(filename);
  `);
}

/**
 * Seed default data
 */
async function seedDefaultData(): Promise<void> {
  const database = await getDatabase();

  // Check if user_settings already has data
  const settingsResult = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM user_settings'
  );

  if (settingsResult && settingsResult.count === 0) {
    // Insert default settings
    await database.runAsync(`
      INSERT INTO user_settings (
        calculation_method,
        madhab,
        adhan_sound,
        notifications_enabled,
        notification_24_hour,
        use_12_hour_format,
        theme
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [CalculationMethod.MWL, Madhab.SHAFI, 'default', 1, 1, 1, 'light']);
  }

  // Check if adhan_files already has data
  const adhanResult = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM adhan_files'
  );

  if (adhanResult && adhanResult.count === 0) {
    // Insert default adhan files
    const defaultAdhans = [
      { name: 'Default Adhan', filename: 'default.mp3', path: 'assets/adhan/default.mp3', duration: 180 },
      { name: 'Makkah', filename: 'makkah.mp3', path: 'assets/adhan/makkah.mp3', duration: 240 },
      { name: 'Madinah', filename: 'madinah.mp3', path: 'assets/adhan/madinah.mp3', duration: 210 },
      { name: 'Egypt', filename: 'egypt.mp3', path: 'assets/adhan/egypt.mp3', duration: 195 },
      { name: 'Turkey', filename: 'turkey.mp3', path: 'assets/adhan/turkey.mp3', duration: 205 },
    ];

    for (const adhan of defaultAdhans) {
      await database.runAsync(
        'INSERT INTO adhan_files (name, filename, path, duration) VALUES (?, ?, ?, ?)',
        [adhan.name, adhan.filename, adhan.path, adhan.duration]
      );
    }
  }
}

/**
 * Reset database (for development/testing)
 */
export async function resetDatabase(): Promise<void> {
  const database = await getDatabase();
  
  await database.execAsync(`
    DROP TABLE IF EXISTS user_settings;
    DROP TABLE IF EXISTS locations;
    DROP TABLE IF EXISTS adhan_files;
  `);
  
  await createTables();
  await seedDefaultData();
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
