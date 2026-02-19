import { Capacitor, registerPlugin } from "@capacitor/core";

interface WidgetBridgePlugin {
  setWidgetData(options: {
    nextPrayerName: string;
    nextPrayerTime: string;
    nextPrayerTimestamp: number;
    currentTime: string;
    timeLeft: string;
    prayerList: string;
  }): Promise<void>;
  refreshWidgets(): Promise<void>;
}

const WidgetBridge = registerPlugin<WidgetBridgePlugin>("WidgetBridge");

export async function updateWidgetData(payload: {
  nextPrayerName: string;
  nextPrayerTime: string;
  nextPrayerTimestamp: number;
  currentTime: string;
  timeLeft: string;
  prayerList: string;
}): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await WidgetBridge.setWidgetData(payload);
  } catch {
    // Ignore widget update errors on unsupported platforms.
  }
}

export async function refreshWidgets(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await WidgetBridge.refreshWidgets();
  } catch {
    // Ignore widget refresh errors on unsupported platforms.
  }
}
