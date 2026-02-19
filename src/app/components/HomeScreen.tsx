import { useState, useEffect } from "react";
import { Bell, BellOff, Volume2, VolumeX, Moon, Sun, Compass } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Switch } from "./ui/switch";
import { useNavigate } from "react-router";
import { usePrayerTimes, useNextPrayer, useSettings, useTranslation } from "../../backend/hooks";
import PrayerAPI from "../../backend";

interface PrayerTime {
  name: string;
  time: string;
  isPassed: boolean;
}

export function HomeScreen() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSystemDark, setIsSystemDark] = useState(false);
  
  // Use backend hooks
  const { prayers: backendPrayers, loading: prayersLoading } = usePrayerTimes();
  const { nextPrayer: backendNextPrayer, countdown } = useNextPrayer();
  const { settings, updateSettings } = useSettings();
  const { t, lang, isRTL, translatePrayer } = useTranslation();

  // Convert backend prayers to display format
  const prayerTimes: PrayerTime[] = backendPrayers.map(prayer => ({
    name: translatePrayer(prayer.name),
    time: prayer.formattedTime,
    isPassed: prayer.timestamp < Date.now(),
  }));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (settings?.theme !== 'auto') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setIsSystemDark(media.matches);
    handleChange();

    if (media.addEventListener) {
      media.addEventListener('change', handleChange);
      return () => media.removeEventListener('change', handleChange);
    }

    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, [settings?.theme]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatCountdown = () => {
    if (!countdown) return "Loading...";
    const { hours, minutes, seconds } = countdown;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  };

  const handleSoundToggle = async (enabled: boolean) => {
    if (settings) {
      await updateSettings({ notificationsEnabled: enabled });
    }
  };

  const isDarkMode =
    settings?.theme === 'dark' || (settings?.theme === 'auto' && isSystemDark);

  if (prayersLoading || !settings) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-full px-5 py-6 pb-20" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-muted-foreground">Wednesday</p>
          <p className="text-lg">18 February 2026</p>
        </div>
        <button
          onClick={() => updateSettings({ theme: isDarkMode ? 'light' : 'dark' })}
          className="p-2 rounded-full bg-card hover:bg-secondary transition-colors"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-foreground" />
          ) : (
            <Moon className="w-5 h-5 text-foreground" />
          )}
        </button>
      </div>

      {/* Current Prayer Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary via-accent to-primary/90 rounded-3xl p-6 mb-6 shadow-lg"
      >
        <div className="text-center">
          <p className="text-primary-foreground/80 text-sm mb-2">{t.nextPrayer}</p>
          <h1 className="text-primary-foreground text-5xl font-semibold mb-3">
            {backendNextPrayer?.prayer.name ? translatePrayer(backendNextPrayer.prayer.name) : "..."}
          </h1>
          <div className="text-primary-foreground text-3xl font-light mb-2">
            {formatCountdown()}
          </div>
          <p className="text-primary-foreground/80 text-sm">
            {t.currentTime}: {formatTime(currentTime)}
          </p>
        </div>
      </motion.div>

      {/* Quick Controls */}
      <div className="bg-card rounded-2xl p-4 mb-6 shadow-sm">
        <h3 className="text-sm text-muted-foreground mb-3">{t.notifications}</h3>
        <div className="space-y-3">
          <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              {settings.notificationsEnabled ? (
                <Volume2 className="w-5 h-5 text-primary" />
              ) : (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              )}
              <span className="text-sm">{t.soundLabel}</span>
            </div>
            <Switch 
              checked={settings.notificationsEnabled} 
              onCheckedChange={handleSoundToggle} 
            />
          </div>
        </div>
      </div>

      {/* Qibla Compass Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/app/qibla')}
        className="w-full bg-gradient-to-r from-primary to-accent p-6 rounded-2xl mb-6 shadow-md hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Compass className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h3 className="text-primary-foreground font-semibold mb-0.5">{t.qiblaDirection}</h3>
              <p className="text-primary-foreground/80 text-sm">{t.findDirection}</p>
            </div>
          </div>
          <svg
            className="w-5 h-5 text-primary-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </motion.button>

      {/* Prayer Times List */}
      <div className="space-y-3">
        <h3 className="text-sm text-muted-foreground mb-3">{t.prayerTimes}</h3>
        <AnimatePresence>
          {prayerTimes.map((prayer, index) => (
            <motion.div
              key={prayer.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                bg-card rounded-2xl p-4 shadow-sm
                flex items-center justify-between
                transition-all duration-300
                ${prayer.isPassed ? "opacity-50" : ""}
              `}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${
                    !prayer.isPassed
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary text-muted-foreground"
                  }
                `}
                >
                  <span className="text-sm font-medium">{prayer.name[0]}</span>
                </div>
                <div>
                  <p className="font-medium">{prayer.name}</p>
                  {prayer.isPassed && (
                    <p className="text-xs text-muted-foreground">Completed</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium">{prayer.time}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Privacy Message */}
      <div className="mt-8 p-4 bg-card rounded-2xl border border-border">
        <p className="text-xs text-center text-muted-foreground">
          🔒 Your data stays on your device. No tracking, no ads.
        </p>
      </div>
    </div>
  );
}