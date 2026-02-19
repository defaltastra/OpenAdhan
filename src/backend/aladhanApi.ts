/**
 * Aladhan API Integration
 * Fetches prayer times from https://api.aladhan.com/v1
 */

import { CalculationMethod, Madhab, PrayerName, PrayerTime, DailyPrayerTimes, Location } from './types';

const API_BASE = 'https://api.aladhan.com/v1';

/**
 * Map our calculation methods to Aladhan API method codes
 */
const METHOD_MAP: Record<CalculationMethod, number> = {
  [CalculationMethod.MWL]: 3,        // Muslim World League
  [CalculationMethod.ISNA]: 2,       // Islamic Society of North America
  [CalculationMethod.EGYPT]: 5,      // Egyptian General Authority of Survey
  [CalculationMethod.MAKKAH]: 4,     // Umm Al-Qura University, Makkah
  [CalculationMethod.KARACHI]: 1,    // University of Islamic Sciences, Karachi
  [CalculationMethod.TEHRAN]: 7,     // Institute of Geophysics, University of Tehran
  [CalculationMethod.JAFARI]: 0,     // Shia Ithna-Ashari (Jafari)
  [CalculationMethod.GULF]: 8,       // Gulf Region
  [CalculationMethod.KUWAIT]: 9,     // Kuwait
  [CalculationMethod.QATAR]: 10,     // Qatar
  [CalculationMethod.SINGAPORE]: 11, // Majlis Ugama Islam Singapura, Singapore
  [CalculationMethod.FRANCE]: 12,    // Union Organization Islamic de France
  [CalculationMethod.TURKEY]: 13,    // Diyanet İşleri Başkanlığı, Turkey
  [CalculationMethod.RUSSIA]: 14,    // Spiritual Administration of Muslims of Russia
  [CalculationMethod.MOONSIGHTING]: 15, // Moonsighting Committee Worldwide
  [CalculationMethod.DUBAI]: 16,     // Dubai (unofficial - 18.2 degrees)
  [CalculationMethod.JAKIM]: 17,     // Jabatan Kemajuan Islam Malaysia
  [CalculationMethod.TUNISIA]: 18,   // Tunisia
  [CalculationMethod.ALGERIA]: 19,   // Algeria
  [CalculationMethod.KEMENAG]: 20,   // Kementerian Agama Republik Indonesia
  [CalculationMethod.MOROCCO]: 21,   // Morocco
  [CalculationMethod.PORTUGAL]: 22,  // Comunidate Islamica de Lisboa
};

/**
 * Map our madhabs to Aladhan API school codes
 * Aladhan uses "school" parameter: 0 = Shafi/Maliki/Hanbali, 1 = Hanafi
 */
const MADHAB_MAP: Record<Madhab, number> = {
  [Madhab.SHAFI]: 0,
  [Madhab.MALIKI]: 0,
  [Madhab.HANBALI]: 0,
  [Madhab.HANAFI]: 1,
};

interface AladhanTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Sunset: string;
  Midnight: string;
  Firstthird: string;
  Lastthird: string;
}

interface AladhanResponse {
  code: number;
  status: string;
  data: {
    timings: AladhanTimings;
    date: {
      readable: string;
      timestamp: string;
      gregorian: {
        date: string;
        day: string;
        month: {
          number: number;
          en: string;
        };
        year: string;
      };
    };
    meta: {
      latitude: number;
      longitude: number;
      timezone: string;
      method: {
        id: number;
        name: string;
      };
      school: string;
    };
  };
}

/**
 * Fetch prayer times from Aladhan API
 */
export async function fetchPrayerTimes(
  location: Location,
  calculationMethod: CalculationMethod,
  madhab: Madhab,
  date: Date,
  use12HourFormat: boolean = false
): Promise<DailyPrayerTimes> {
  try {
    const method = METHOD_MAP[calculationMethod] || 3; // Default to MWL
    const school = MADHAB_MAP[madhab] || 0; // Default to Shafi
    
    // Format date as DD-MM-YYYY
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const dateStr = `${day}-${month}-${year}`;
    
    // Build API URL
    let url: string;
    
    if (location.latitude && location.longitude) {
      // Use coordinates
      url = `${API_BASE}/timings/${dateStr}?latitude=${location.latitude}&longitude=${location.longitude}&method=${method}&school=${school}`;
    } else {
      // Use city/country
      url = `${API_BASE}/timingsByCity/${dateStr}?city=${encodeURIComponent(location.city)}&country=${encodeURIComponent(location.country)}&method=${method}&school=${school}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Aladhan API error: ${response.status} ${response.statusText}`);
    }
    
    const data: AladhanResponse = await response.json();
    
    if (data.code !== 200 || data.status !== 'OK') {
      throw new Error(`Aladhan API returned error status: ${data.status}`);
    }
    
    // Parse prayer times
    const timings = data.data.timings;
    const prayers: PrayerTime[] = [];
    
    const prayerNames: Array<{ name: PrayerName; key: keyof AladhanTimings }> = [
      { name: PrayerName.FAJR, key: 'Fajr' },
      { name: PrayerName.SUNRISE, key: 'Sunrise' },
      { name: PrayerName.DHUHR, key: 'Dhuhr' },
      { name: PrayerName.ASR, key: 'Asr' },
      { name: PrayerName.MAGHRIB, key: 'Maghrib' },
      { name: PrayerName.ISHA, key: 'Isha' },
    ];
    
    for (const { name, key } of prayerNames) {
      const timeStr = timings[key];
      const prayerTime = parseAladhanTime(timeStr, date);
      
      prayers.push({
        name,
        time: prayerTime,
        timestamp: prayerTime.getTime(),
        formattedTime: formatPrayerTime(prayerTime, use12HourFormat),
      });
    }
    
    // Calculate Qibla direction
    const qiblaDirection = calculateQiblaDirection(
      location.latitude || data.data.meta.latitude,
      location.longitude || data.data.meta.longitude
    );
    
    return {
      date,
      location: {
        ...location,
        latitude: location.latitude || data.data.meta.latitude,
        longitude: location.longitude || data.data.meta.longitude,
        timezone: location.timezone || data.data.meta.timezone,
      },
      prayers,
      qiblaDirection,
    };
  } catch (error) {
    console.error('Error fetching prayer times from Aladhan:', error);
    throw error;
  }
}

/**
 * Parse Aladhan time string (HH:MM format) to Date object
 */
function parseAladhanTime(timeStr: string, baseDate: Date): Date {
  // Remove timezone info if present (e.g., "05:30 (EET)")
  const cleanTime = timeStr.split(' ')[0];
  const [hours, minutes] = cleanTime.split(':').map(Number);
  
  const prayerDate = new Date(baseDate);
  prayerDate.setHours(hours, minutes, 0, 0);
  
  return prayerDate;
}

/**
 * Format prayer time for display
 */
function formatPrayerTime(date: Date, use12Hour: boolean): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  if (use12Hour) {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  } else {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
}

/**
 * Calculate Qibla direction from a given location
 * Uses the same formula as before
 */
function calculateQiblaDirection(latitude: number, longitude: number): number {
  const KAABA_LAT = 21.4225;
  const KAABA_LNG = 39.8262;
  
  const lat1 = (latitude * Math.PI) / 180;
  const lat2 = (KAABA_LAT * Math.PI) / 180;
  const dLng = ((KAABA_LNG - longitude) * Math.PI) / 180;
  
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  
  let qibla = (Math.atan2(y, x) * 180) / Math.PI;
  qibla = (qibla + 360) % 360;
  
  return qibla;
}
