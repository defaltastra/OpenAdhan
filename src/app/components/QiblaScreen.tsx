import { useState, useEffect } from "react";
import { Compass, ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";
import { useQibla } from "../../backend/hooks";
import { Geolocation } from "@capacitor/geolocation";
import { calculateQiblaDirection } from "../../backend/prayerCalculator";
import { startCompass, stopCompass, setCompassLocation } from "../../backend/compassBridge";

export function QiblaScreen() {
  const navigate = useNavigate();
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [smoothedHeading, setSmoothedHeading] = useState<number>(0);
  const [deviceQiblaDirection, setDeviceQiblaDirection] = useState<number | null>(null);
  const [hasCompassData, setHasCompassData] = useState<boolean>(false);
  const { direction: qiblaDirection } = useQibla();

  const effectiveQiblaDirection = deviceQiblaDirection ?? qiblaDirection;

  // Device compass support
  useEffect(() => {
    let listenerHandle: { remove: () => void } | null = null;
    let isMounted = true;

    startCompass((heading) => {
      if (!isMounted) return;
      setHasCompassData(true);
      setDeviceHeading(heading);
      setSmoothedHeading((prev) => {
        const delta = ((heading - prev + 540) % 360) - 180;
        return (prev + delta * 0.15 + 360) % 360;
      });
    }).then((handle) => {
      listenerHandle = handle || null;
    });

    return () => {
      isMounted = false;
      listenerHandle?.remove();
      stopCompass();
    };
  }, []);

  useEffect(() => {
    const fetchDeviceLocation = async () => {
      try {
        const permissions = await Geolocation.requestPermissions();
        if (permissions.location !== "granted") {
          return;
        }

        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });

        await setCompassLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude || 0,
        });

        if (effectiveQiblaDirection === undefined || effectiveQiblaDirection === null) {
          const direction = calculateQiblaDirection(
            position.coords.latitude,
            position.coords.longitude
          );
          setDeviceQiblaDirection(direction);
        }
      } catch (error) {
        console.error("Failed to access device location:", error);
      }
    };

    fetchDeviceLocation();
  }, [effectiveQiblaDirection]);

  if (!effectiveQiblaDirection && effectiveQiblaDirection !== 0) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center px-6">
        <Compass className="w-16 h-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-center mb-6">
          Unable to calculate Qibla direction. Please set your location in Settings.
        </p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col px-5 py-6 pb-20">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-semibold ml-2">Qibla Direction</h1>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col items-center justify-center"
      >
          <div className="relative w-80 h-80 mb-8">
            {/* Compass circle */}
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 shadow-xl" />
            
            {/* Direction markers */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: -smoothedHeading }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              <div className="absolute top-4 text-lg font-bold text-primary">N</div>
              <div className="absolute right-4 text-sm font-semibold text-muted-foreground">E</div>
              <div className="absolute bottom-4 text-sm font-semibold text-muted-foreground">S</div>
              <div className="absolute left-4 text-sm font-semibold text-muted-foreground">W</div>
            </motion.div>
            
            {/* Qibla arrow */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: (effectiveQiblaDirection ?? 0) - smoothedHeading }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              <div className="relative">
                <div className="w-2 h-32 bg-gradient-to-b from-primary to-primary/50 rounded-full shadow-lg" />
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[16px] border-b-primary" />
              </div>
            </motion.div>

            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-primary shadow-lg ring-4 ring-primary/20" />
            </div>
          </div>
          
          <div className="text-center px-6">
            <p className="text-3xl font-bold text-primary mb-2">
              {Math.round(effectiveQiblaDirection ?? 0)}°
            </p>
            <p className="text-muted-foreground mb-1">
              Rotate your phone until the arrow points forward
            </p>
            <p className="text-sm text-muted-foreground">
              The arrow shows the direction to Mecca
            </p>
            {!hasCompassData && (
              <p className="text-xs text-muted-foreground mt-2">
                Compass data not detected yet. Move your phone to calibrate.
              </p>
            )}
          </div>
      </motion.div>
    </div>
  );
}
