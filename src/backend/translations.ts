/**
 * Translation strings for multi-language support
 */

export type Language = 'en' | 'ar' | 'fr';

interface Translations {
  // Prayer names
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  
  // Common phrases
  nextPrayer: string;
  currentTime: string;
  prayerTimes: string;
  settings: string;
  location: string;
  qiblaDirection: string;
  
  // Settings
  calculationMethod: string;
  madhab: string;
  notifications: string;
  adhanSound: string;
  language: string;
  theme: string;
  darkMode: string;
  timeFormat: string;
  
  // Madhabs
  shafi: string;
  hanafi: string;
  maliki: string;
  hanbali: string;
  
  // Themes
  light: string;
  dark: string;
  auto: string;
  
  // Time formats
  hour12: string;
  hour24: string;
  
  // Actions
  save: string;
  cancel: string;
  test: string;
  enable: string;
  disable: string;
  
  // Adhan
  defaultAdhan: string;
  madinahAdhan: string;
  uploadCustom: string;
  traditionalAdhan: string;
  madinahStyle: string;
  uploadYourOwn: string;
  
  // UI Messages
  customizePrayer: string;
  allDataLocal: string;
  noTracking: string;
  worksOffline: string;
  noAds: string;
  madeWithCare: string;
  resetDefaults: string;
  privacyData: string;
  recommended: string;
  soundLabel: string;
  findDirection: string;

  // Navigation
  navHome: string;
  navLocation: string;
  navSettings: string;
  widgetsHowToTitle: string;
  widgetsHowToBody: string;

  // Onboarding Screens
  onboardingTitle: string;
  onboardingTaglineLine1: string;
  onboardingTaglineLine2: string;
  onboardingFooter: string;
  continueLabel: string;
  backLabel: string;
  skipLabel: string;
  prayerTimeMethodTitle: string;
  prayerTimeMethodSubtitle: string;
  asrCalculationTitle: string;
  asrCalculationSubtitle: string;
  asrInfo: string;
  hanafiLabel: string;
  hanafiDesc: string;
  shafiGroupLabel: string;
  shafiGroupDesc: string;
  selectAdhanTitle: string;
  selectAdhanSubtitle: string;
  volumeLabel: string;
  enableNotificationsTitle: string;
  enableNotificationsSubtitle: string;
  enableNotificationsDetail: string;
  notificationsPrivacy: string;
  enableNotificationsButton: string;
  youAreReadyTitle: string;
  youAreReadySubtitle: string;
  todaysPrayersLabel: string;
  enterAppButton: string;
  chooseLocationTitle: string;
  chooseLocationSubtitle: string;
  useGpsOptional: string;
  orLabel: string;
  countryLabel: string;
  cityLabel: string;
  selectCountryPlaceholder: string;
  selectCityPlaceholder: string;
  searchCountriesPlaceholder: string;
  searchCitiesPlaceholder: string;
  noCountriesFound: string;
  noCitiesFound: string;
  locationPrivacy: string;
  
  // Onboarding
  welcome: string;
  getStarted: string;
  selectLocation: string;
  selectMethod: string;
  selectMadhab: string;
  complete: string;
  
  // Days
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  
  // Calculation Methods
  mwl: string;
  isna: string;
  egypt: string;
  makkah: string;
  karachi: string;
  tehran: string;
  jafari: string;
  gulf: string;
  kuwait: string;
  qatar: string;
  singapore: string;
  france: string;
  turkey: string;
  russia: string;
  moonsighting: string;
  dubai: string;
  jakim: string;
  tunisia: string;
  algeria: string;
  kemenag: string;
  morocco: string;
  portugal: string;
}

const en: Translations = {
  // Prayer names
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
  
  // Common phrases
  nextPrayer: 'Next Prayer',
  currentTime: 'Current Time',
  prayerTimes: 'Prayer Times',
  settings: 'Settings',
  location: 'Location',
  qiblaDirection: 'Qibla Direction',
  
  // Settings
  calculationMethod: 'Calculation Method',
  madhab: 'Madhab',
  notifications: 'Notifications',
  adhanSound: 'Adhan Sound',
  language: 'Language',
  theme: 'Theme',
    darkMode: 'Dark mode',
  timeFormat: 'Time Format',
  
  // Madhabs
  shafi: 'Shafi',
  hanafi: 'Hanafi',
  maliki: 'Maliki',
  hanbali: 'Hanbali',
  
  // Themes
  light: 'Light',
  dark: 'Dark',
  auto: 'Auto',
  
  // Time formats
  hour12: '12-hour',
  hour24: '24-hour',
  
  // Actions
  save: 'Save',
  cancel: 'Cancel',
  test: 'Test',
  enable: 'Enable',
  disable: 'Disable',
  
  // Adhan
  defaultAdhan: 'Default Adhan',
  madinahAdhan: 'Madinah',
  uploadCustom: 'Upload Custom',
  traditionalAdhan: 'Traditional adhan',
  madinahStyle: 'Madinah style adhan',
  uploadYourOwn: 'Upload your own adhan',
  
  // UI Messages
  customizePrayer: 'Customize your prayer experience',
  allDataLocal: 'All data stored locally on your device',
  noTracking: 'No user tracking or analytics',
  worksOffline: 'Works completely offline',
  noAds: 'No ads, ever',
  madeWithCare: 'Made with care for the Muslim community',
  resetDefaults: 'Reset to Defaults',
  privacyData: 'Privacy & Data',
  recommended: 'Recommended',
  soundLabel: 'Sound',
  findDirection: 'Find the direction to Mecca',

  // Navigation
  navHome: 'Home',
  navLocation: 'Location',
  navSettings: 'Settings',
  widgetsHowToTitle: 'Home screen widgets',
  widgetsHowToBody: 'Long-press your home screen, tap Widgets, then pick OpenAdhan.',

  // Onboarding Screens
  onboardingTitle: 'Prayer Times',
  onboardingTaglineLine1: 'Accurate Prayer Times.',
  onboardingTaglineLine2: 'Private. Offline.',
  onboardingFooter: 'No tracking. No ads. 100% local.',
  continueLabel: 'Continue',
  backLabel: 'Back',
  skipLabel: 'Skip',
  prayerTimeMethodTitle: 'Prayer Time Method',
  prayerTimeMethodSubtitle: 'Choose your preferred calculation method',
  asrCalculationTitle: 'Asr Calculation',
  asrCalculationSubtitle: 'Choose your school of jurisprudence for Asr timing',
  asrInfo: 'This affects when Asr prayer time begins. The difference is usually around 30-60 minutes.',
  hanafiLabel: 'Hanafi',
  hanafiDesc: 'Later Asr time calculation',
  shafiGroupLabel: "Shafi'i / Maliki / Hanbali",
  shafiGroupDesc: 'Standard Asr time calculation',
  selectAdhanTitle: 'Select Your Adhan',
  selectAdhanSubtitle: 'Choose how you want to be notified for prayer times',
  volumeLabel: 'Volume',
  enableNotificationsTitle: 'Enable Notifications',
  enableNotificationsSubtitle: 'We only notify you for prayer times.',
  enableNotificationsDetail: "No marketing. No spam. Just peaceful reminders when it's time to pray.",
  notificationsPrivacy: 'All notifications are generated locally on your device. No data is sent to external servers.',
  enableNotificationsButton: 'Enable Notifications',
  youAreReadyTitle: "You're Ready",
  youAreReadySubtitle: 'Everything is set up and ready to use',
  todaysPrayersLabel: "Today's Prayers",
  enterAppButton: 'Enter App',
  chooseLocationTitle: 'Choose Your Location',
  chooseLocationSubtitle: 'Select your location for accurate prayer times',
  useGpsOptional: 'Use GPS (Optional)',
  orLabel: 'or',
  countryLabel: 'Country',
  cityLabel: 'City',
  selectCountryPlaceholder: 'Select a country',
  selectCityPlaceholder: 'Select a city',
  searchCountriesPlaceholder: 'Search countries...',
  searchCitiesPlaceholder: 'Search cities...',
  noCountriesFound: 'No countries found',
  noCitiesFound: 'No cities found',
  locationPrivacy: 'Your location stays on your device.',
  
  // Onboarding
  welcome: 'Welcome',
  getStarted: 'Get Started',
  selectLocation: 'Select Location',
  selectMethod: 'Select Calculation Method',
  selectMadhab: 'Select Madhab',
  complete: 'Complete',
  
  // Days
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
  
  // Calculation Methods
  mwl: 'Muslim World League',
  isna: 'Islamic Society of North America',
  egypt: 'Egyptian General Authority',
  makkah: 'Umm Al-Qura, Makkah',
  karachi: 'University of Karachi',
  tehran: 'Institute of Geophysics, Tehran',
  jafari: 'Shia Ithna-Ashari',
  gulf: 'Gulf Region',
  kuwait: 'Kuwait',
  qatar: 'Qatar',
  singapore: 'Singapore',
  france: 'Union Organization Islamic de France',
  turkey: 'Turkey',
  russia: 'Russia',
  moonsighting: 'Moonsighting Committee',
  dubai: 'Dubai',
  jakim: 'JAKIM Malaysia',
  tunisia: 'Tunisia',
  algeria: 'Algeria',
  kemenag: 'KEMENAG Indonesia',
  morocco: 'Morocco',
  portugal: 'Portugal',
};

const ar: Translations = {
  // Prayer names
  fajr: 'الفجر',
  sunrise: 'الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
  
  // Common phrases
  nextPrayer: 'الصلاة القادمة',
  currentTime: 'الوقت الحالي',
  prayerTimes: 'أوقات الصلاة',
  settings: 'الإعدادات',
  location: 'الموقع',
  qiblaDirection: 'اتجاه القبلة',
  
  // Settings
  calculationMethod: 'طريقة الحساب',
  madhab: 'المذهب',
  notifications: 'الإشعارات',
  adhanSound: 'صوت الأذان',
  language: 'اللغة',
  theme: 'المظهر',
    darkMode: 'الوضع الداكن',
  timeFormat: 'صيغة الوقت',
  
  // Madhabs
  shafi: 'الشافعي',
  hanafi: 'الحنفي',
  maliki: 'المالكي',
  hanbali: 'الحنبلي',
  
  // Themes
  light: 'فاتح',
  dark: 'داكن',
  auto: 'تلقائي',
  
  // Time formats
  hour12: '12 ساعة',
  hour24: '24 ساعة',
  
  // Actions
  save: 'حفظ',
  cancel: 'إلغاء',
  test: 'اختبار',
  enable: 'تفعيل',
  disable: 'تعطيل',
  
  // Adhan
  defaultAdhan: 'الأذان الافتراضي',
  madinahAdhan: 'أذان المدينة',
  uploadCustom: 'تحميل مخصص',
  traditionalAdhan: 'أذان تقليدي',
  madinahStyle: 'أذان المدينة المنورة',
  uploadYourOwn: 'حمل الأذان الخاص بك',
  
  // UI Messages
  customizePrayer: 'خصص تجربة الصلاة الخاصة بك',
  allDataLocal: 'جميع البيانات مخزنة محليًا على جهازك',
  noTracking: 'لا يوجد تتبع للمستخدم أو تحليلات',
  worksOffline: 'يعمل بشكل كامل دون اتصال',
  noAds: 'لا إعلانات، أبدًا',
  madeWithCare: 'صُنع بعناية للمجتمع الإسلامي',
  resetDefaults: 'إعادة تعيين الافتراضات',
  privacyData: 'الخصوصية والبيانات',
  recommended: 'موصى به',
  soundLabel: 'الصوت',
  findDirection: 'اعرف اتجاه مكة',

  // Navigation
  navHome: 'الرئيسية',
  navLocation: 'الموقع',
  navSettings: 'الإعدادات',
  widgetsHowToTitle: 'أدوات الشاشة الرئيسية',
  widgetsHowToBody: 'اضغط مطولًا على الشاشة الرئيسية، ثم اختر الأدوات وحدد OpenAdhan.',

  // Onboarding Screens
  onboardingTitle: 'مواقيت الصلاة',
  onboardingTaglineLine1: 'مواقيت دقيقة للصلاة.',
  onboardingTaglineLine2: 'خصوصية. بدون اتصال.',
  onboardingFooter: 'بدون تتبع. بدون إعلانات. محلي بالكامل.',
  continueLabel: 'متابعة',
  backLabel: 'رجوع',
  skipLabel: 'تخطي',
  prayerTimeMethodTitle: 'طريقة حساب الصلاة',
  prayerTimeMethodSubtitle: 'اختر طريقة الحساب المفضلة لديك',
  asrCalculationTitle: 'حساب وقت العصر',
  asrCalculationSubtitle: 'اختر المذهب الفقهي لحساب العصر',
  asrInfo: 'يؤثر هذا على وقت بداية صلاة العصر. الفرق عادة بين 30 و 60 دقيقة.',
  hanafiLabel: 'الحنفي',
  hanafiDesc: 'حساب متأخر لوقت العصر',
  shafiGroupLabel: 'الشافعي / المالكي / الحنبلي',
  shafiGroupDesc: 'الحساب القياسي لوقت العصر',
  selectAdhanTitle: 'اختر الأذان',
  selectAdhanSubtitle: 'اختر كيفية التنبيه بمواقيت الصلاة',
  volumeLabel: 'مستوى الصوت',
  enableNotificationsTitle: 'تفعيل الإشعارات',
  enableNotificationsSubtitle: 'نقوم بإرسال تنبيه لمواقيت الصلاة فقط.',
  enableNotificationsDetail: 'لا تسويق ولا رسائل مزعجة. فقط تذكيرات هادئة عند وقت الصلاة.',
  notificationsPrivacy: 'كل الإشعارات تُولد محليًا على جهازك. لا تُرسل أي بيانات للخوادم.',
  enableNotificationsButton: 'تفعيل الإشعارات',
  youAreReadyTitle: 'أنت جاهز',
  youAreReadySubtitle: 'تم الإعداد بالكامل وجاهز للاستخدام',
  todaysPrayersLabel: 'صلوات اليوم',
  enterAppButton: 'دخول التطبيق',
  chooseLocationTitle: 'اختر موقعك',
  chooseLocationSubtitle: 'حدد موقعك للحصول على مواقيت دقيقة',
  useGpsOptional: 'استخدم GPS (اختياري)',
  orLabel: 'أو',
  countryLabel: 'الدولة',
  cityLabel: 'المدينة',
  selectCountryPlaceholder: 'اختر دولة',
  selectCityPlaceholder: 'اختر مدينة',
  searchCountriesPlaceholder: 'ابحث عن دولة...',
  searchCitiesPlaceholder: 'ابحث عن مدينة...',
  noCountriesFound: 'لم يتم العثور على دول',
  noCitiesFound: 'لم يتم العثور على مدن',
  locationPrivacy: 'موقعك يبقى على جهازك.',
  
  // Onboarding
  welcome: 'مرحباً',
  getStarted: 'ابدأ',
  selectLocation: 'اختر الموقع',
  selectMethod: 'اختر طريقة الحساب',
  selectMadhab: 'اختر المذهب',
  complete: 'إتمام',
  
  // Days
  monday: 'الاثنين',
  tuesday: 'الثلاثاء',
  wednesday: 'الأربعاء',
  thursday: 'الخميس',
  friday: 'الجمعة',
  saturday: 'السبت',
  sunday: 'الأحد',
  
  // Calculation Methods
  mwl: 'رابطة العالم الإسلامي',
  isna: 'الجمعية الإسلامية لأمريكا الشمالية',
  egypt: 'الهيئة المصرية العامة للمساحة',
  makkah: 'جامعة أم القرى، مكة',
  karachi: 'جامعة كراتشي',
  tehran: 'معهد الجيوفيزياء، طهران',
  jafari: 'الشيعة الإثنا عشرية',
  gulf: 'منطقة الخليج',
  kuwait: 'الكويت',
  qatar: 'قطر',
  singapore: 'سنغافورة',
  france: 'المنظمة الإسلامية في فرنسا',
  turkey: 'تركيا',
  russia: 'روسيا',
  moonsighting: 'لجنة رؤية الهلال',
  dubai: 'دبي',
  jakim: 'ماليزيا',
  tunisia: 'تونس',
  algeria: 'الجزائر',
  kemenag: 'إندونيسيا',
  morocco: 'المغرب',
  portugal: 'البرتغال',
};

const fr: Translations = {
  // Prayer names
  fajr: 'Fajr',
  sunrise: 'Lever du soleil',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
  
  // Common phrases
  nextPrayer: 'Prochaine prière',
  currentTime: 'Heure actuelle',
  prayerTimes: 'Horaires de prière',
  settings: 'Paramètres',
  location: 'Localisation',
  qiblaDirection: 'Direction de la Qibla',
  
  // Settings
  calculationMethod: 'Méthode de calcul',
  madhab: 'École juridique',
  notifications: 'Notifications',
  adhanSound: 'Son de l\'Adhan',
  language: 'Langue',
  theme: 'Thème',
    darkMode: 'Mode sombre',
  timeFormat: 'Format horaire',
  
  // Madhabs
  shafi: 'Chaféite',
  hanafi: 'Hanafite',
  maliki: 'Malékite',
  hanbali: 'Hanbalite',
  
  // Themes
  light: 'Clair',
  dark: 'Sombre',
  auto: 'Automatique',
  
  // Time formats
  hour12: '12 heures',
  hour24: '24 heures',
  
  // Actions
  save: 'Enregistrer',
  cancel: 'Annuler',
  test: 'Tester',
  enable: 'Activer',
  disable: 'Désactiver',
  
  // Adhan
  defaultAdhan: 'Adhan par défaut',
  madinahAdhan: 'Médine',
  uploadCustom: 'Personnalisé',
  traditionalAdhan: 'Adhan traditionnel',
  madinahStyle: 'Style de Médine',
  uploadYourOwn: 'Téléchargez le vôtre',
  
  // UI Messages
  customizePrayer: 'Personnalisez votre expérience de prière',
  allDataLocal: 'Toutes les données stockées localement',
  noTracking: 'Aucun pistage ou analyse',
  worksOffline: 'Fonctionne hors ligne',
  noAds: 'Aucune publicité, jamais',
  madeWithCare: 'Fait avec soin pour la communauté musulmane',
  resetDefaults: 'Réinitialiser',
  privacyData: 'Confidentialité et données',
  recommended: 'Recommandé',
  soundLabel: 'Son',
  findDirection: 'Trouver la direction de La Mecque',

  // Navigation
  navHome: 'Accueil',
  navLocation: 'Localisation',
  navSettings: 'Paramètres',
  widgetsHowToTitle: 'Widgets écran d’accueil',
  widgetsHowToBody: 'Appuyez longuement sur l’écran d’accueil, puis choisissez OpenAdhan.',

  // Onboarding Screens
  onboardingTitle: 'Horaires de prière',
  onboardingTaglineLine1: 'Horaires précis.',
  onboardingTaglineLine2: 'Privé. Hors ligne.',
  onboardingFooter: 'Aucun pistage. Aucune pub. 100% local.',
  continueLabel: 'Continuer',
  backLabel: 'Retour',
  skipLabel: 'Passer',
  prayerTimeMethodTitle: 'Méthode de calcul',
  prayerTimeMethodSubtitle: 'Choisissez votre méthode préférée',
  asrCalculationTitle: 'Calcul du Asr',
  asrCalculationSubtitle: 'Choisissez votre école juridique pour le Asr',
  asrInfo: "Cela affecte le début du Asr. La différence est généralement de 30 à 60 minutes.",
  hanafiLabel: 'Hanafite',
  hanafiDesc: 'Calcul du Asr plus tardif',
  shafiGroupLabel: 'Chaféite / Malékite / Hanbalite',
  shafiGroupDesc: 'Calcul standard du Asr',
  selectAdhanTitle: 'Choisissez votre Adhan',
  selectAdhanSubtitle: "Choisissez comment être notifié pour les prières",
  volumeLabel: 'Volume',
  enableNotificationsTitle: 'Activer les notifications',
  enableNotificationsSubtitle: 'Nous notifions uniquement pour les prières.',
  enableNotificationsDetail: "Pas de marketing. Pas de spam. Juste des rappels paisibles.",
  notificationsPrivacy: 'Toutes les notifications sont générées localement. Aucune donnée envoyée.',
  enableNotificationsButton: 'Activer les notifications',
  youAreReadyTitle: 'Vous êtes prêt',
  youAreReadySubtitle: 'Tout est prêt à être utilisé',
  todaysPrayersLabel: 'Prières du jour',
  enterAppButton: 'Entrer dans l\'app',
  chooseLocationTitle: 'Choisissez votre localisation',
  chooseLocationSubtitle: 'Sélectionnez votre position pour des horaires précis',
  useGpsOptional: 'Utiliser le GPS (optionnel)',
  orLabel: 'ou',
  countryLabel: 'Pays',
  cityLabel: 'Ville',
  selectCountryPlaceholder: 'Sélectionnez un pays',
  selectCityPlaceholder: 'Sélectionnez une ville',
  searchCountriesPlaceholder: 'Rechercher un pays...',
  searchCitiesPlaceholder: 'Rechercher une ville...',
  noCountriesFound: 'Aucun pays trouvé',
  noCitiesFound: 'Aucune ville trouvée',
  locationPrivacy: 'Votre localisation reste sur votre appareil.',
  
  // Onboarding
  welcome: 'Bienvenue',
  getStarted: 'Commencer',
  selectLocation: 'Sélectionner la localisation',
  selectMethod: 'Sélectionner la méthode de calcul',
  selectMadhab: 'Sélectionner l\'école juridique',
  complete: 'Terminer',
  
  // Days
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
  
  // Calculation Methods
  mwl: 'Ligue Islamique Mondiale',
  isna: 'Société Islamique d\'Amérique du Nord',
  egypt: 'Autorité Générale Égyptienne',
  makkah: 'Université Umm Al-Qura, La Mecque',
  karachi: 'Université de Karachi',
  tehran: 'Institut de Géophysique, Téhéran',
  jafari: 'Chiite Duodécimain',
  gulf: 'Région du Golfe',
  kuwait: 'Koweït',
  qatar: 'Qatar',
  singapore: 'Singapour',
  france: 'Union des Organisations Islamiques de France',
  turkey: 'Turquie',
  russia: 'Russie',
  moonsighting: 'Comité d\'Observation',
  dubai: 'Dubaï',
  jakim: 'JAKIM Malaisie',
  tunisia: 'Tunisie',
  algeria: 'Algérie',
  kemenag: 'KEMENAG Indonésie',
  morocco: 'Maroc',
  portugal: 'Portugal',
};

const translations: Record<Language, Translations> = {
  en,
  ar,
  fr,
};

export function getTranslation(lang: Language): Translations {
  return translations[lang] || translations.en;
}

export function translate(key: keyof Translations, lang: Language): string {
  return translations[lang]?.[key] || translations.en[key];
}

export function translatePrayerName(prayerName: string, lang: Language): string {
  const prayerMap: Record<string, keyof Translations> = {
    'Fajr': 'fajr',
    'Sunrise': 'sunrise',
    'Dhuhr': 'dhuhr',
    'Asr': 'asr',
    'Maghrib': 'maghrib',
    'Isha': 'isha',
  };
  
  const key = prayerMap[prayerName];
  return key ? translate(key, lang) : prayerName;
}

export default translations;
