/**
 * Locations API (Web version)
 */

import { getAllFromStore, getByIdFromStore, addToStore, updateInStore, deleteFromStore } from './database.web';
import { Location } from './types';

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

export async function getAllLocations(): Promise<Location[]> {
  const rows = await getAllFromStore<any>('locations');
  return rows
    .map(mapRowToLocation)
    .sort((a, b) => (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0));
}

export async function getActiveLocation(): Promise<Location | null> {
  const locations = await getAllLocations();
  return locations.find(loc => loc.isActive) || null;
}

export async function getLocationById(id: number): Promise<Location | null> {
  const row = await getByIdFromStore<any>('locations', id);
  return row ? mapRowToLocation(row) : null;
}

export async function saveLocation(location: Omit<Location, 'id' | 'createdAt'>): Promise<Location> {
  if (location.isActive) {
    // Deactivate all others
    const allLocations = await getAllLocations();
    for (const loc of allLocations) {
      if (loc.isActive && loc.id) {
        await updateInStore('locations', {
          ...loc,
          is_active: 0,
        });
      }
    }
  }
  
  const id = await addToStore('locations', {
    city: location.city,
    country: location.country,
    latitude: location.latitude || null,
    longitude: location.longitude || null,
    timezone: location.timezone || null,
    is_active: location.isActive ? 1 : 0,
    created_at: new Date().toISOString(),
  });
  
  const newLocation = await getLocationById(id);
  if (!newLocation) throw new Error('Failed to retrieve saved location');
  return newLocation;
}

export async function updateLocation(id: number, updates: Partial<Location>): Promise<Location> {
  const currentLocation = await getLocationById(id);
  if (!currentLocation) throw new Error(`Location with id ${id} not found`);
  
  if (updates.isActive) {
    const allLocations = await getAllLocations();
    for (const loc of allLocations) {
      if (loc.isActive && loc.id && loc.id !== id) {
        await updateInStore('locations', {
          id: loc.id,
          city: loc.city,
          country: loc.country,
          latitude: loc.latitude,
          longitude: loc.longitude,
          timezone: loc.timezone,
          is_active: 0,
          created_at: loc.createdAt,
        });
      }
    }
  }
  
  const updatedData = { ...currentLocation, ...updates };
  
  await updateInStore('locations', {
    id,
    city: updatedData.city,
    country: updatedData.country,
    latitude: updatedData.latitude || null,
    longitude: updatedData.longitude || null,
    timezone: updatedData.timezone || null,
    is_active: updatedData.isActive ? 1 : 0,
    created_at: currentLocation.createdAt || new Date().toISOString(),
  });
  
  const updated = await getLocationById(id);
  if (!updated) throw new Error('Failed to retrieve updated location');
  return updated;
}

export async function setActiveLocation(id: number): Promise<Location> {
  const allLocations = await getAllLocations();
  
  for (const loc of allLocations) {
    if (loc.id) {
      await updateInStore('locations', {
        id: loc.id,
        city: loc.city,
        country: loc.country,
        latitude: loc.latitude,
        longitude: loc.longitude,
        timezone: loc.timezone,
        is_active: loc.id === id ? 1 : 0,
        created_at: loc.createdAt || new Date().toISOString(),
      });
    }
  }
  
  const location = await getLocationById(id);
  if (!location) throw new Error(`Location with id ${id} not found`);
  return location;
}

export async function deleteLocation(id: number): Promise<void> {
  const location = await getLocationById(id);
  if (!location) throw new Error(`Location with id ${id} not found`);
  
  await deleteFromStore('locations', id);
  
  if (location.isActive) {
    const remaining = await getAllLocations();
    if (remaining.length > 0 && remaining[0].id) {
      await setActiveLocation(remaining[0].id);
    }
  }
}

export async function searchLocations(query: string): Promise<Location[]> {
  const allLocations = await getAllLocations();
  const lowerQuery = query.toLowerCase();
  return allLocations.filter(
    loc => 
      loc.city.toLowerCase().includes(lowerQuery) ||
      loc.country.toLowerCase().includes(lowerQuery)
  );
}

export async function clearAllLocations(): Promise<void> {
  const allLocations = await getAllLocations();
  for (const loc of allLocations) {
    if (loc.id) {
      await deleteFromStore('locations', loc.id);
    }
  }
}

/**
 * Fetch available cities from Aladhan API
 * @param country - optional country code to filter by (e.g., 'MA' for Morocco)
 */
export async function fetchCitiesFromAPI(country?: string): Promise<Array<{ city: string; country: string; latitude: number; longitude: number; timezone: string }>> {
  try {
    // Aladhan provides a list of supported cities per country
    // We'll fetch the prayer times for major cities in the region
    const url = new URL('https://api.aladhan.com/v1/timingsByCity');
    
    if (country) {
      url.searchParams.append('country', country);
    }
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch cities: ${response.statusText}`);
    }
    
    // Aladhan doesn't have a dedicated cities endpoint, so we use a fallback
    // For now, return popular cities that work with Aladhan
    const popularCities = [
      // Morocco
      { city: 'Casablanca', country: 'Morocco', latitude: 33.5731, longitude: -7.5898, timezone: 'Africa/Casablanca' },
      { city: 'Fez', country: 'Morocco', latitude: 34.0373, longitude: -5.0088, timezone: 'Africa/Casablanca' },
      { city: 'Marrakech', country: 'Morocco', latitude: 31.6295, longitude: -8.0088, timezone: 'Africa/Casablanca' },
      { city: 'Tangier', country: 'Morocco', latitude: 35.7580, longitude: -5.8330, timezone: 'Africa/Casablanca' },
      { city: 'Rabat', country: 'Morocco', latitude: 34.0209, longitude: -6.8416, timezone: 'Africa/Casablanca' },
      { city: 'Agadir', country: 'Morocco', latitude: 30.4202, longitude: -9.5981, timezone: 'Africa/Casablanca' },
      // World major cities
      { city: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
      { city: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
      { city: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
      { city: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
      { city: 'Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357, timezone: 'Africa/Cairo' },
      { city: 'Istanbul', country: 'Turkey', latitude: 41.0082, longitude: 28.9784, timezone: 'Europe/Istanbul' },
      { city: 'Jakarta', country: 'Indonesia', latitude: -6.2088, longitude: 106.8456, timezone: 'Asia/Jakarta' },
    ];
    
    if (country) {
      const countryName = country === 'MA' ? 'Morocco' : country;
      return popularCities.filter(c => c.country.toLowerCase() === countryName.toLowerCase());
    }
    
    return popularCities;
  } catch (error) {
    console.error('[Locations] Error fetching cities from API:', error);
    // Return empty array on error - user can still manually add location
    return [];
  }
}
