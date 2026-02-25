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
  const lastPlayedRef = useRef<string | null>(null);

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

      await LocalNotifications.createChannel({
        id: "prayer",
        name: "Prayer Times",
        importance: 5,
        sound: undefined,
        vibration: true,
      });

      await LocalNotifications.createChannel({
        id: "prayer-adhan",
        name: "Prayer Times (Adhan)",
        importance: 5,
        sound: "adhan",
        vibration: true,
      });

      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
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
          channelId: settings.playAdhanOnNotification ? "prayer-adhan" : "prayer",
        }));

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
      }
    };

    scheduleNotifications();
  }, [settings, prayers]);

  useEffect(() => {
    if (!settings) return;
    if (!settings.notificationsEnabled) return;
    if (!settings.playAdhanOnNotification) return;
    if (prayers.length === 0) return;

    // Find next prayer and set up precise timeout
    const setupPreciseNotifications = () => {
      const now = Date.now();
      let nextPrayerTime = null;

      // Find next prayer that should trigger notification
      for (const prayer of prayers) {
        if (prayer.name === "Sunrise") continue;
        if (prayer.timestamp <= now) continue; // Prayer already passed

        // Check if notifications for this prayer are enabled
        if (
          (prayer.name === "Fajr" && !settings.notificationFajr) ||
          (prayer.name === "Dhuhr" && !settings.notificationDhuhr) ||
          (prayer.name === "Asr" && !settings.notificationAsr) ||
          (prayer.name === "Maghrib" && !settings.notificationMaghrib) ||
          (prayer.name === "Isha" && !settings.notificationIsha)
        ) {
          continue;
        }

        nextPrayerTime = prayer.timestamp;
        break;
      }

      if (!nextPrayerTime) return; // No more prayers today

      // Calculate timeout to next prayer (trigger 500ms before for safety)
      const timeUntilPrayer = nextPrayerTime - now - 500;
      
      console.log(`[Adhan] Next prayer in ${timeUntilPrayer}ms`);

      const timeout = setTimeout(() => {
        const checkAndPlayAtPreciseTime = async () => {
          const currentTime = Date.now();
          const windowMs = 10 * 1000; // 10 second window

          for (const prayer of prayers) {
            if (prayer.name === "Sunrise") continue;

            const prayerKey = `${prayer.name}-${new Date(prayer.timestamp).toDateString()}`;
            if (lastPlayedRef.current === prayerKey) continue;

            // Check if we're within 10 seconds of prayer time
            const shouldPlay =
              currentTime >= prayer.timestamp && currentTime < prayer.timestamp + windowMs;

            if (!shouldPlay) continue;

            if (
              (prayer.name === "Fajr" && !settings.notificationFajr) ||
              (prayer.name === "Dhuhr" && !settings.notificationDhuhr) ||
              (prayer.name === "Asr" && !settings.notificationAsr) ||
              (prayer.name === "Maghrib" && !settings.notificationMaghrib) ||
              (prayer.name === "Isha" && !settings.notificationIsha)
            ) {
              continue;
            }

            lastPlayedRef.current = prayerKey;
            try {
              console.log(`[Adhan] Playing adhan for ${prayer.name} at ${new Date(prayer.timestamp).toLocaleTimeString()}`);
              await PrayerAPI.playSelectedAdhan();
            } catch (error) {
              console.error("[Adhan] Failed to play adhan:", error);
            }
            break;
          }
        };

        checkAndPlayAtPreciseTime();
        
        // Re-setup for next prayer after this one completes
        setupPreciseNotifications();
      }, Math.max(0, timeUntilPrayer));

      return () => clearTimeout(timeout);
    };

    const cleanup = setupPreciseNotifications();
    return () => {
      if (cleanup) cleanup();
    };
  }, [settings, prayers]);

  // Listen for notification events to play adhan when notification is shown
  useEffect(() => {
    console.log('[Adhan] Notification listener effect triggered. Platform:', Capacitor.getPlatform(), 
      'Notifications enabled:', settings?.notificationsEnabled, 
      'Play adhan on notification:', settings?.playAdhanOnNotification);
    
    if (!Capacitor.isNativePlatform()) return;
    if (!settings?.notificationsEnabled) return;
    if (!settings?.playAdhanOnNotification) return;

    let removeReceivedListener: (() => void) | undefined;
    let removeActionListener: (() => void) | undefined;

    const setupListeners = async () => {
      try {
        console.log('[Adhan] Setting up notification listeners...');
        
        // Listener for when notification is received (foreground)
        const receivedListener = await LocalNotifications.addListener(
          'localNotificationReceived',
          async (notification) => {
            console.log('[Adhan] localNotificationReceived event fired:', notification);
            // Play adhan when notification is received
            if (notification.notification.channelId === 'prayer') {
              try {
                console.log('[Adhan] Playing adhan from localNotificationReceived...');
                await PrayerAPI.playSelectedAdhan();
              } catch (error) {
                console.error('[Adhan] Failed to play adhan from localNotificationReceived:', error);
              }
            }
          }
        );
        removeReceivedListener = () => receivedListener.remove();

        // Listener for when notification action is performed (tapped/interacted)
        const actionListener = await LocalNotifications.addListener(
          'localNotificationActionPerformed',
          async (notification) => {
            console.log('[Adhan] localNotificationActionPerformed event fired:', notification);
            // Play adhan when notification is tapped
            if (notification.notification.channelId === 'prayer') {
              try {
                console.log('[Adhan] Playing adhan from localNotificationActionPerformed...');
                await PrayerAPI.playSelectedAdhan();
              } catch (error) {
                console.error('[Adhan] Failed to play adhan from localNotificationActionPerformed:', error);
              }
            }
          }
        );
        removeActionListener = () => actionListener.remove();
        
        console.log('[Adhan] Notification listeners set up successfully');
      } catch (error) {
        console.error('[Adhan] Failed to setup notification listeners:', error);
      }
    };

    setupListeners();
    return () => {
      console.log('[Adhan] Cleaning up notification listeners');
      if (removeReceivedListener) removeReceivedListener();
      if (removeActionListener) removeActionListener();
    };
  }, [settings?.notificationsEnabled, settings?.playAdhanOnNotification]);

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
