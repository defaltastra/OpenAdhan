import { Capacitor, registerPlugin } from "@capacitor/core";

interface CompassBridgePlugin {
  start(): Promise<void>;
  stop(): Promise<void>;
  setLocation(options: { latitude: number; longitude: number; altitude?: number }): Promise<void>;
  addListener(
    eventName: "heading",
    listenerFunc: (data: { heading: number }) => void
  ): Promise<{ remove: () => void }>;
}

const CompassBridge = registerPlugin<CompassBridgePlugin>("CompassBridge");

export async function startCompass(listener: (heading: number) => void) {
  if (!Capacitor.isNativePlatform()) return null;
  await CompassBridge.start();
  const handle = await CompassBridge.addListener("heading", (data) => {
    if (typeof data.heading === "number") {
      listener(data.heading);
    }
  });
  return handle;
}

export async function stopCompass() {
  if (!Capacitor.isNativePlatform()) return;
  await CompassBridge.stop();
}

export async function setCompassLocation(location: {
  latitude: number;
  longitude: number;
  altitude?: number;
}) {
  if (!Capacitor.isNativePlatform()) return;
  await CompassBridge.setLocation(location);
}
