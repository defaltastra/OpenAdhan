/**
 * Type definitions for the Prayer Times Backend
 */

export enum CalculationMethod {
  MWL = 'MWL', // Muslim World League
  ISNA = 'ISNA', // Islamic Society of North America
  EGYPT = 'Egypt', // Egyptian General Authority of Survey
  MAKKAH = 'Makkah', // Umm Al-Qura University, Makkah
  KARACHI = 'Karachi', // University of Islamic Sciences, Karachi
  TEHRAN = 'Tehran', // Institute of Geophysics, University of Tehran
  JAFARI = 'Jafari', // Shia Ithna-Ashari, Leva Institute, Qum
  GULF = 'Gulf', // Gulf Region
  KUWAIT = 'Kuwait', // Kuwait
  QATAR = 'Qatar', // Qatar
  SINGAPORE = 'Singapore', // Majlis Ugama Islam Singapura, Singapore
  FRANCE = 'France', // Union Organization Islamic de France
  TURKEY = 'Turkey', // Diyanet İşleri Başkanlığı, Turkey
  RUSSIA = 'Russia', // Spiritual Administration of Muslims of Russia
  MOONSIGHTING = 'Moonsighting', // Moonsighting Committee Worldwide
  DUBAI = 'Dubai', // Dubai (unofficial - 18.2 degrees)
  JAKIM = 'JAKIM', // Jabatan Kemajuan Islam Malaysia
  TUNISIA = 'Tunisia', // Tunisia
  ALGERIA = 'Algeria', // Algeria
  KEMENAG = 'KEMENAG', // Kementerian Agama Republik Indonesia
  MOROCCO = 'Morocco', // Morocco
  PORTUGAL = 'Portugal', // Comunidate Islamica de Lisboa
}

export enum Madhab {
  SHAFI = 'Shafi',
  HANAFI = 'Hanafi',
  MALIKI = 'Maliki',
  HANBALI = 'Hanbali',
}

export enum PrayerName {
  FAJR = 'Fajr',
  SUNRISE = 'Sunrise',
  DHUHR = 'Dhuhr',
  ASR = 'Asr',
  MAGHRIB = 'Maghrib',
  ISHA = 'Isha',
}

export interface UserSettings {
  id?: number;
  calculationMethod: CalculationMethod;
  madhab: Madhab;
  adhanSound: string; // filename reference to adhan_files
  notificationsEnabled: boolean;
  notification24Hour: boolean;
  notificationFajr: boolean;
  notificationDhuhr: boolean;
  notificationAsr: boolean;
  notificationMaghrib: boolean;
  notificationIsha: boolean;
  use12HourFormat: boolean; // Display prayer times in 12-hour format
  language: 'en' | 'ar' | 'fr';
  theme: 'light' | 'dark' | 'auto';
  createdAt?: string;
  updatedAt?: string;
}

export interface Location {
  id?: number;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface AdhanFile {
  id?: number;
  name: string;
  filename: string;
  path: string;
  duration?: number; // in seconds
  createdAt?: string;
}

export interface PrayerTime {
  name: PrayerName;
  time: Date;
  timestamp: number;
  formattedTime: string; // HH:mm format
}

export interface DailyPrayerTimes {
  date: Date;
  location: Location;
  prayers: PrayerTime[];
  qiblaDirection: number; // degrees from north
}

export interface NextPrayer {
  prayer: PrayerTime;
  countdown: {
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  };
}

export interface PrayerTimesParams {
  latitude: number;
  longitude: number;
  date?: Date;
  calculationMethod: CalculationMethod;
  madhab: Madhab;
  timezone?: string;
  use12HourFormat?: boolean;
}
