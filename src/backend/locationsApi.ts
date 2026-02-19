/**
 * Locations API
 * Handles location storage and retrieval
 */

import { getDatabase } from './database';
import { Location } from './types';

/**
 * Map database row to Location object
 */
function mapRowToLocation(row: any): Location {
  return {
    id: row.id,
    city: row.city,
    country: row.country,
    latitude: row.latitude,
    longitude: row.longitude,
    timezone: row.timezone,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
  };
}

/**
 * Get all saved locations
 */
export async function getAllLocations(): Promise<Location[]> {
  const db = await getDatabase();
  
  const rows = await db.getAllAsync('SELECT * FROM locations ORDER BY is_active DESC, id DESC');
  
  return rows.map(mapRowToLocation);
}

/**
 * Get active location
 */
export async function getActiveLocation(): Promise<Location | null> {
  const db = await getDatabase();
  
  const row = await db.getFirstAsync(
    'SELECT * FROM locations WHERE is_active = 1 LIMIT 1'
  );

  if (!row) return null;
  
  return mapRowToLocation(row);
}

/**
 * Get location by ID
 */
export async function getLocationById(id: number): Promise<Location | null> {
  const db = await getDatabase();
  
  const row = await db.getFirstAsync(
    'SELECT * FROM locations WHERE id = ?',
    [id]
  );

  if (!row) return null;
  
  return mapRowToLocation(row);
}

/**
 * Save a new location
 */
export async function saveLocation(location: Omit<Location, 'id' | 'createdAt'>): Promise<Location> {
  const db = await getDatabase();

  // If this location should be active, deactivate all others
  if (location.isActive) {
    await db.runAsync('UPDATE locations SET is_active = 0');
  }

  const result = await db.runAsync(
    `INSERT INTO locations (city, country, latitude, longitude, timezone, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      location.city,
      location.country,
      location.latitude || null,
      location.longitude || null,
      location.timezone || null,
      location.isActive ? 1 : 0,
    ]
  );

  // Fetch and return the newly created location
  const newLocation = await getLocationById(result.lastInsertRowId);
  
  if (!newLocation) {
    throw new Error('Failed to retrieve saved location');
  }

  return newLocation;
}

/**
 * Update an existing location
 */
export async function updateLocation(id: number, updates: Partial<Location>): Promise<Location> {
  const db = await getDatabase();

  // Get current location
  const currentLocation = await getLocationById(id);
  
  if (!currentLocation) {
    throw new Error(`Location with id ${id} not found`);
  }

  // If setting this location as active, deactivate all others
  if (updates.isActive) {
    await db.runAsync('UPDATE locations SET is_active = 0');
  }

  // Merge updates with current data
  const updatedData = { ...currentLocation, ...updates };

  await db.runAsync(
    `UPDATE locations SET
      city = ?,
      country = ?,
      latitude = ?,
      longitude = ?,
      timezone = ?,
      is_active = ?
    WHERE id = ?`,
    [
      updatedData.city,
      updatedData.country,
      updatedData.latitude || null,
      updatedData.longitude || null,
      updatedData.timezone || null,
      updatedData.isActive ? 1 : 0,
      id,
    ]
  );

  const updated = await getLocationById(id);
  
  if (!updated) {
    throw new Error('Failed to retrieve updated location');
  }

  return updated;
}

/**
 * Set active location by ID
 */
export async function setActiveLocation(id: number): Promise<Location> {
  const db = await getDatabase();

  // Deactivate all locations
  await db.runAsync('UPDATE locations SET is_active = 0');

  // Activate the specified location
  await db.runAsync('UPDATE locations SET is_active = 1 WHERE id = ?', [id]);

  const location = await getLocationById(id);
  
  if (!location) {
    throw new Error(`Location with id ${id} not found`);
  }

  return location;
}

/**
 * Delete a location
 */
export async function deleteLocation(id: number): Promise<void> {
  const db = await getDatabase();

  const location = await getLocationById(id);
  
  if (!location) {
    throw new Error(`Location with id ${id} not found`);
  }

  await db.runAsync('DELETE FROM locations WHERE id = ?', [id]);

  // If we deleted the active location, try to activate another one
  if (location.isActive) {
    const remaining = await getAllLocations();
    if (remaining.length > 0) {
      await setActiveLocation(remaining[0].id!);
    }
  }
}

/**
 * Search locations by city or country
 */
export async function searchLocations(query: string): Promise<Location[]> {
  const db = await getDatabase();
  
  const searchPattern = `%${query}%`;
  
  const rows = await db.getAllAsync(
    `SELECT * FROM locations 
     WHERE city LIKE ? OR country LIKE ?
     ORDER BY is_active DESC, id DESC`,
    [searchPattern, searchPattern]
  );

  return rows.map(mapRowToLocation);
}

/**
 * Clear all locations
 */
export async function clearAllLocations(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM locations');
}
