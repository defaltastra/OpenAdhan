import { useEffect, useRef, useState } from "react";
import { RouterProvider } from "react-router";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Network } from "@capacitor/network";
import { router } from "./routes";
import PrayerAPI from "../backend";
import { usePrayerTimes, useNextPrayer, useSettings } from "../backend/hooks";
import { translatePrayerName } from "../backend/translations";
import { updateWidgetData } from "../backend/widgetBridge";

function AppContent() {
  const { settings } = useSettings();
  const { prayers } = usePrayerTimes();
  const { nextPrayer, countdown } = useNextPrayer();
  const lastWidgetMinute = useRef<string | null>(null);

  // Apply language and direction globally
  useEffect(() => {
    if (settings) {
      const lang = settings.language || 'en';
      const isRTL = lang === 'ar';
      
      document.documentElement.setAttribute('lang', lang);
      document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
      
      // Force re-render of all components
      console.log(`Language changed to: ${lang}, RTL: ${isRTL}`);
    }
  }, [settings?.language]);

  useEffect(() => {
    if (!settings) return;

    const applyTheme = (theme: 'light' | 'dark' | 'auto') => {
      const prefersDark =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      const resolved = theme === 'auto' ? (prefersDark ? 'dark' : 'light') : theme;
      document.documentElement.classList.toggle('dark', resolved === 'dark');
    };

    applyTheme(settings.theme || 'auto');

    if (settings.theme !== 'auto') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('auto');

    if (media.addEventListener) {
      media.addEventListener('change', handler);
      return () => media.removeEventListener('change', handler);
    }

    media.addListener(handler);
    return () => media.removeListener(handler);
  }, [settings?.theme]);

  // Listen for network reconnection to refresh widget data
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let unsubscribe: (() => void) | null = null;

    const setupNetworkListener = async () => {
      try {
        unsubscribe = (await Network.addListener('networkStatusChange', (status) => {
          if (status.connected && nextPrayer && countdown && prayers.length > 0) {
            console.log('Network reconnected - updating widgets');
            const now = new Date();
            const lang = (settings?.language || "en") as "en" | "ar" | "fr";
            const prayerList = prayers.slice(0, 5).map((prayer) => ({
              name: translatePrayerName(prayer.name, lang),
              time: prayer.formattedTime,
              completed: prayer.timestamp < now.getTime(),
            }));

            updateWidgetData({
              nextPrayerName: translatePrayerName(nextPrayer.prayer.name, lang),
              nextPrayerTime: nextPrayer.prayer.formattedTime,
              nextPrayerTimestamp: nextPrayer.prayer.timestamp,
              currentTime: now.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              }),
              timeLeft: `${nextPrayer.countdown.hours}h ${nextPrayer.countdown.minutes}m`,
              prayerList: JSON.stringify(prayerList),
            });
          }
        })).remove;
      } catch (error) {
        console.error('Error setting up network listener:', error);
      }
    };

    setupNetworkListener();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [nextPrayer, countdown, prayers, settings?.language]);

  useEffect(() => {
    if (!nextPrayer || !countdown || prayers.length === 0) return;

    const now = new Date();
    const minuteKey = `${now.getHours()}:${now.getMinutes()}`;
    if (lastWidgetMinute.current === minuteKey) return;
    lastWidgetMinute.current = minuteKey;

    const hours = countdown.hours;
    const minutes = countdown.minutes;
    const timeLeft = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    const currentTime = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    const lang = (settings?.language || "en") as "en" | "ar" | "fr";
    const prayerList = prayers.slice(0, 5).map((prayer) => ({
      name: translatePrayerName(prayer.name, lang),
      time: prayer.formattedTime,
      completed: prayer.timestamp < now.getTime(),
    }));

    updateWidgetData({
      nextPrayerName: translatePrayerName(nextPrayer.prayer.name, lang),
      nextPrayerTime: nextPrayer.prayer.formattedTime,
      nextPrayerTimestamp: nextPrayer.prayer.timestamp,
      currentTime,
      timeLeft,
      prayerList: JSON.stringify(prayerList),
    });
  }, [nextPrayer, countdown, prayers, settings?.language]);

  useEffect(() => {
    if (!settings) return;
    if (!settings.notificationsEnabled) return;
    if (prayers.length === 0) return;

    const scheduleNotifications = async () => {
      if (!Capacitor.isNativePlatform()) return;

      const permission = await LocalNotifications.checkPermissions();
      if (permission.display !== "granted") return;

      // Create native notification channels for each adhan variant.
      // Sounds are baked into res/raw so they play even when the app is killed.
      const channels = [
        { id: "prayer", name: "Prayer Times (silent)", sound: undefined },
        { id: "prayer-default-full", name: "Prayer Times – Default (Full)", sound: "adhan_default" },
        { id: "prayer-default-sample", name: "Prayer Times – Default (5s)", sound: "adhan_default_sample" },
        { id: "prayer-madinah-full", name: "Prayer Times – Madinah (Full)", sound: "adhan_madinah" },
        { id: "prayer-madinah-sample", name: "Prayer Times – Madinah (5s)", sound: "adhan_madinah_sample" },
      ];
      for (const ch of channels) {
        await LocalNotifications.createChannel({
          id: ch.id,
          name: ch.name,
          importance: 5,
          sound: ch.sound,
          vibration: true,
        });
      }

      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }

      // Pick the right channel based on user settings
      let channelId = "prayer";
      if (settings.playAdhanOnNotification) {
        const isDefault = !settings.adhanSound || settings.adhanSound === "default.mp3";
        const sound = isDefault ? "default" : "madinah";
        const mode = settings.adhanPlayMode === "sample" ? "sample" : "full";
        channelId = `prayer-${sound}-${mode}`;
      }

      const now = Date.now();
      const notifications = prayers
        .filter((prayer) => prayer.timestamp > now)
        .filter((prayer) => {
          if (prayer.name === "Fajr") return settings.notificationFajr;
          if (prayer.name === "Dhuhr") return settings.notificationDhuhr;
          if (prayer.name === "Asr") return settings.notificationAsr;
          if (prayer.name === "Maghrib") return settings.notificationMaghrib;
          if (prayer.name === "Isha") return settings.notificationIsha;
          return false;
        })
        .map((prayer, index) => ({
          id: 1000 + index,
          title: translatePrayerName(prayer.name, (settings.language || "en") as "en" | "ar" | "fr"),
          body: "Prayer time",
          schedule: { at: new Date(prayer.timestamp) },
          channelId,
        }));

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
      }
    };

    scheduleNotifications();
  }, [settings, prayers]);

  return <RouterProvider router={router} key={settings?.language} />;
}

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize backend on app start
    async function init() {
      try {
        await PrayerAPI.initialize();
        setIsReady(true);
      } catch (error) {
        console.error("Failed to initialize app:", error);
        setIsReady(true); // Continue anyway
      }
    }
    init();
  }, []);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <AppContent />;
}
