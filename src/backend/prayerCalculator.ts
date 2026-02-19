/**
 * Prayer Times Calculator
 * Calculates prayer times based on location, date, and calculation method
 * 
 * This module uses astronomical calculations for accurate prayer times.
 * For production, you may want to use the 'adhan' npm package:
 * npm install adhan
 * 
 * This implementation provides the core calculation logic.
 */

import {
  CalculationMethod,
  Madhab,
  PrayerName,
  PrayerTime,
  DailyPrayerTimes,
  NextPrayer,
  PrayerTimesParams,
  Location,
} from './types';

/**
 * Calculation parameters for different methods
 */
const CALCULATION_PARAMS: Record<CalculationMethod, { fajrAngle: number; ishaAngle: number; ishaInterval?: number }> = {
  [CalculationMethod.MWL]: { fajrAngle: 18, ishaAngle: 17 },
  [CalculationMethod.ISNA]: { fajrAngle: 15, ishaAngle: 15 },
  [CalculationMethod.EGYPT]: { fajrAngle: 19.5, ishaAngle: 17.5 },
  [CalculationMethod.MAKKAH]: { fajrAngle: 18.5, ishaAngle: 0, ishaInterval: 90 }, // 90 min after Maghrib
  [CalculationMethod.KARACHI]: { fajrAngle: 18, ishaAngle: 18 },
  [CalculationMethod.TEHRAN]: { fajrAngle: 17.7, ishaAngle: 14 },
  [CalculationMethod.JAFARI]: { fajrAngle: 16, ishaAngle: 14 },
  [CalculationMethod.GULF]: { fajrAngle: 19.5, ishaAngle: 0, ishaInterval: 90 },
  [CalculationMethod.KUWAIT]: { fajrAngle: 18, ishaAngle: 17.5 },
  [CalculationMethod.QATAR]: { fajrAngle: 18, ishaAngle: 0, ishaInterval: 90 },
  [CalculationMethod.SINGAPORE]: { fajrAngle: 20, ishaAngle: 18 },
  [CalculationMethod.TURKEY]: { fajrAngle: 18, ishaAngle: 17 },
  [CalculationMethod.FRANCE]: { fajrAngle: 12, ishaAngle: 12 },
  [CalculationMethod.RUSSIA]: { fajrAngle: 16, ishaAngle: 15 },
  [CalculationMethod.MOONSIGHTING]: { fajrAngle: 18, ishaAngle: 18 },
  [CalculationMethod.DUBAI]: { fajrAngle: 18.2, ishaAngle: 18.2 },
  [CalculationMethod.JAKIM]: { fajrAngle: 20, ishaAngle: 18 },
  [CalculationMethod.TUNISIA]: { fajrAngle: 18, ishaAngle: 18 },
  [CalculationMethod.ALGERIA]: { fajrAngle: 18, ishaAngle: 17 },
  [CalculationMethod.KEMENAG]: { fajrAngle: 20, ishaAngle: 18 },
  [CalculationMethod.MOROCCO]: { fajrAngle: 19, ishaAngle: 17 },
  [CalculationMethod.PORTUGAL]: { fajrAngle: 18, ishaAngle: 17 },
};

/**
 * Asr calculation adjustment based on madhab
 * Shafi/Maliki/Hanbali: shadow length = object length + shadow at zenith
 * Hanafi: shadow length = 2 * object length + shadow at zenith
 */
const ASR_SHADOW_FACTOR: Record<Madhab, number> = {
  [Madhab.SHAFI]: 1,
  [Madhab.HANAFI]: 2,
  [Madhab.MALIKI]: 1,
  [Madhab.HANBALI]: 1,
};

/**
 * Calculate Julian Day from Date
 */
function getJulianDay(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;

  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

/**
 * Calculate equation of time
 */
function getEquationOfTime(jd: number): number {
  const d = jd - 2451545.0;
  const g = (357.529 + 0.98560028 * d) % 360;
  const q = (280.459 + 0.98564736 * d) % 360;
  const L = (q + 1.915 * Math.sin(g * Math.PI / 180) + 0.020 * Math.sin(2 * g * Math.PI / 180)) % 360;
  
  const R = 1.00014 - 0.01671 * Math.cos(g * Math.PI / 180) - 0.00014 * Math.cos(2 * g * Math.PI / 180);
  const e = 23.439 - 0.00000036 * d;
  
  const RA = Math.atan2(Math.cos(e * Math.PI / 180) * Math.sin(L * Math.PI / 180), Math.cos(L * Math.PI / 180)) * 180 / Math.PI;
  const EqT = q - RA;
  
  return EqT / 15; // Convert to hours
}

/**
 * Calculate solar declination
 */
function getSolarDeclination(jd: number): number {
  const d = jd - 2451545.0;
  const g = (357.529 + 0.98560028 * d) % 360;
  const q = (280.459 + 0.98564736 * d) % 360;
  const L = (q + 1.915 * Math.sin(g * Math.PI / 180) + 0.020 * Math.sin(2 * g * Math.PI / 180)) % 360;
  const e = 23.439 - 0.00000036 * d;
  
  return Math.asin(Math.sin(e * Math.PI / 180) * Math.sin(L * Math.PI / 180)) * 180 / Math.PI;
}

/**
 * Calculate time for a given sun angle
 */
function getTimeForAngle(
  jd: number,
  latitude: number,
  longitude: number,
  zenithAngle: number,
  direction: 'ccw' | 'cw', // counter-clockwise (before noon) or clockwise (after noon)
  baseDate: Date
): Date {
  const decl = getSolarDeclination(jd);
  const eqt = getEquationOfTime(jd);
  
  // Convert zenith angle to altitude (angle is measured from zenith, altitude from horizon)
  // For zenith angle: 90° = horizon, >90° = below horizon, <90° = above horizon
  const altitude = 90 - zenithAngle;
  
  const numerator = Math.sin(altitude * Math.PI / 180) - Math.sin(decl * Math.PI / 180) * Math.sin(latitude * Math.PI / 180);
  const denominator = Math.cos(decl * Math.PI / 180) * Math.cos(latitude * Math.PI / 180);
  
  // Check for invalid calculation (happens at extreme latitudes or invalid angles)
  const cosValue = numerator / denominator;
  if (cosValue < -1 || cosValue > 1) {
    console.error('Invalid angle calculation:', { numerator, denominator, cosValue, latitude, zenithAngle, altitude });
    // Return a fallback time
    const date = new Date(baseDate);
    date.setHours(12, 0, 0, 0);
    return date;
  }
  
  const t = Math.acos(cosValue) * 180 / Math.PI / 15;
  
  const noon = 12 - longitude / 15 - eqt;
  const time = direction === 'ccw' ? noon - t : noon + t;
  
  const hours = Math.floor(time);
  const minutes = Math.floor((time - hours) * 60);
  const seconds = Math.floor(((time - hours) * 60 - minutes) * 60);
  
  const date = new Date(baseDate);
  date.setHours(hours, minutes, seconds, 0);
  
  return date;
}

/**
 * Calculate Asr time
 */
function getAsrTime(
  jd: number,
  latitude: number,
  longitude: number,
  madhab: Madhab,
  baseDate: Date
): Date {
  const decl = getSolarDeclination(jd);
  const eqt = getEquationOfTime(jd);
  const factor = ASR_SHADOW_FACTOR[madhab];
  
  // Calculate the sun altitude at which Asr begins
  const a = Math.atan(1 / (factor + Math.tan(Math.abs(latitude - decl) * Math.PI / 180)));
  const altitude = a * 180 / Math.PI;
  
  const numerator = Math.sin(altitude * Math.PI / 180) - Math.sin(decl * Math.PI / 180) * Math.sin(latitude * Math.PI / 180);
  const denominator = Math.cos(decl * Math.PI / 180) * Math.cos(latitude * Math.PI / 180);
  
  // Check for invalid calculation
  const cosValue = numerator / denominator;
  if (cosValue < -1 || cosValue > 1) {
    console.error('Invalid Asr calculation:', { numerator, denominator, cosValue, latitude, altitude });
    // Return fallback time (3 PM)
    const date = new Date(baseDate);
    date.setHours(15, 0, 0, 0);
    return date;
  }
  
  const t = Math.acos(cosValue) * 180 / Math.PI / 15;
  
  const noon = 12 - longitude / 15 - eqt;
  const time = noon + t;
  
  const hours = Math.floor(time);
  const minutes = Math.floor((time - hours) * 60);
  const seconds = Math.floor(((time - hours) * 60 - minutes) * 60);
  
  const date = new Date(baseDate);
  date.setHours(hours, minutes, seconds, 0);
  
  return date;
}

/**
 * Calculate all prayer times for a given date and location
 */
export function calculatePrayerTimes(params: PrayerTimesParams): PrayerTime[] {
  const { latitude, longitude, date = new Date(), calculationMethod, madhab, use12HourFormat = true } = params;
  
  const jd = getJulianDay(date);
  const calcParams = CALCULATION_PARAMS[calculationMethod];
  const eqt = getEquationOfTime(jd);
  
  // Calculate solar noon
  const noon = 12 - longitude / 15 - eqt;
  const noonHours = Math.floor(noon);
  const noonMinutes = Math.floor((noon - noonHours) * 60);
  const dhuhrDate = new Date(date);
  dhuhrDate.setHours(noonHours, noonMinutes, 0, 0);
  
  // Calculate Fajr
  const fajrDate = getTimeForAngle(jd, latitude, longitude, 90 + calcParams.fajrAngle, 'ccw', date);
  
  // Calculate Sunrise
  const sunriseDate = getTimeForAngle(jd, latitude, longitude, 90 + 0.833, 'ccw', date);
  
  // Calculate Asr
  const asrDate = getAsrTime(jd, latitude, longitude, madhab, date);
  
  // Calculate Maghrib
  const maghribDate = getTimeForAngle(jd, latitude, longitude, 90 + 0.833, 'cw', date);
  
  // Calculate Isha
  let ishaDate: Date;
  if (calcParams.ishaInterval) {
    // Fixed interval after Maghrib
    ishaDate = new Date(maghribDate.getTime() + calcParams.ishaInterval * 60000);
  } else {
    // Angle-based calculation
    ishaDate = getTimeForAngle(jd, latitude, longitude, 90 + calcParams.ishaAngle, 'cw', date);
  }
  
  const formatTime = (date: Date): string => {
    const hours24 = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    if (use12HourFormat) {
      const hours12 = hours24 % 12 || 12;
      const ampm = hours24 < 12 ? 'AM' : 'PM';
      return `${hours12}:${minutes} ${ampm}`;
    } else {
      const hours = hours24.toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
  };
  
  return [
    {
      name: PrayerName.FAJR,
      time: fajrDate,
      timestamp: fajrDate.getTime(),
      formattedTime: formatTime(fajrDate),
    },
    {
      name: PrayerName.SUNRISE,
      time: sunriseDate,
      timestamp: sunriseDate.getTime(),
      formattedTime: formatTime(sunriseDate),
    },
    {
      name: PrayerName.DHUHR,
      time: dhuhrDate,
      timestamp: dhuhrDate.getTime(),
      formattedTime: formatTime(dhuhrDate),
    },
    {
      name: PrayerName.ASR,
      time: asrDate,
      timestamp: asrDate.getTime(),
      formattedTime: formatTime(asrDate),
    },
    {
      name: PrayerName.MAGHRIB,
      time: maghribDate,
      timestamp: maghribDate.getTime(),
      formattedTime: formatTime(maghribDate),
    },
    {
      name: PrayerName.ISHA,
      time: ishaDate,
      timestamp: ishaDate.getTime(),
      formattedTime: formatTime(ishaDate),
    },
  ];
}

/**
 * Get complete daily prayer times with location info
 */
export function getDailyPrayerTimes(
  location: Location,
  calculationMethod: CalculationMethod,
  madhab: Madhab,
  date: Date = new Date(),
  use12HourFormat: boolean = true
): DailyPrayerTimes {
  if (!location.latitude || !location.longitude) {
    throw new Error('Location must have latitude and longitude coordinates');
  }

  const prayers = calculatePrayerTimes({
    latitude: location.latitude,
    longitude: location.longitude,
    date,
    calculationMethod,
    madhab,
    timezone: location.timezone,
    use12HourFormat,
  });

  // Calculate Qibla direction (to Kaaba in Mecca)
  const qiblaDirection = calculateQiblaDirection(location.latitude, location.longitude);

  return {
    date,
    location,
    prayers,
    qiblaDirection,
  };
}

/**
 * Get next prayer and countdown
 */
export function getNextPrayer(prayerTimes: PrayerTime[]): NextPrayer | null {
  const now = new Date();
  const currentTime = now.getTime();

  // Filter out Sunrise as it's not a prayer time
  const actualPrayers = prayerTimes.filter(p => p.name !== PrayerName.SUNRISE);

  // Find the next prayer
  for (const prayer of actualPrayers) {
    if (prayer.timestamp > currentTime) {
      const totalSeconds = Math.floor((prayer.timestamp - currentTime) / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      return {
        prayer,
        countdown: {
          hours,
          minutes,
          seconds,
          totalSeconds,
        },
      };
    }
  }

  // If no prayer found today, return tomorrow's Fajr
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  tomorrowDate.setHours(0, 0, 0, 0);

  // Return null if we can't calculate (would need location context)
  return null;
}

/**
 * Calculate Qibla direction (bearing to Kaaba from location)
 */
export function calculateQiblaDirection(latitude: number, longitude: number): number {
  // Kaaba coordinates
  const kaabaLat = 21.4225;
  const kaabaLon = 39.8262;

  const lat1 = latitude * Math.PI / 180;
  const lat2 = kaabaLat * Math.PI / 180;
  const dLon = (kaabaLon - longitude) * Math.PI / 180;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  bearing = (bearing + 360) % 360; // Normalize to 0-360

  return Math.round(bearing * 10) / 10; // Round to 1 decimal place
}

/**
 * Check if current time is within a prayer time window
 */
export function isWithinPrayerTime(
  prayerName: PrayerName,
  prayerTimes: PrayerTime[],
  currentTime: Date = new Date()
): boolean {
  const currentTimestamp = currentTime.getTime();
  const prayerIndex = prayerTimes.findIndex(p => p.name === prayerName);
  
  if (prayerIndex === -1 || prayerName === PrayerName.SUNRISE) {
    return false;
  }

  const prayer = prayerTimes[prayerIndex];
  const nextPrayer = prayerTimes[prayerIndex + 1];

  if (!nextPrayer) {
    // Last prayer of the day (Isha) - valid until midnight
    const midnight = new Date(currentTime);
    midnight.setHours(23, 59, 59, 999);
    return currentTimestamp >= prayer.timestamp && currentTimestamp <= midnight.getTime();
  }

  return currentTimestamp >= prayer.timestamp && currentTimestamp < nextPrayer.timestamp;
}
