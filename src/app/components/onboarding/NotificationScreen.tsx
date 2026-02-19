import { motion } from "motion/react";
import { Bell } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Button } from "../ui/button";
import { useSettings, useTranslation } from "../../../backend/hooks";

interface NotificationScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function NotificationScreen({ onNext, onBack }: NotificationScreenProps) {
  const { t } = useTranslation();
  const { updateSettings } = useSettings();

  const handleEnableNotifications = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const permission = await LocalNotifications.requestPermissions();
        if (permission.display !== "granted") {
          alert("Notification permission was denied.");
          onNext();
          return;
        }
      } else if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          alert("Notification permission was denied.");
          onNext();
          return;
        }
      }

      await updateSettings({
        notificationsEnabled: true,
        notificationFajr: true,
        notificationDhuhr: true,
        notificationAsr: true,
        notificationMaghrib: true,
        notificationIsha: true,
      });
    } catch (error) {
      console.error("Failed to enable notifications:", error);
    } finally {
      onNext();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex flex-col items-center justify-between h-full px-6 py-12"
    >
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-12"
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl">
              <Bell className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-4 mb-12"
        >
          <h1 className="text-3xl font-semibold">{t.enableNotificationsTitle}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-sm">
            {t.enableNotificationsSubtitle}
          </p>
          <p className="text-sm text-muted-foreground max-w-sm">
            {t.enableNotificationsDetail}
          </p>
        </motion.div>

        {/* Privacy Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="p-4 bg-secondary/50 rounded-2xl max-w-sm"
        >
          <p className="text-sm text-center text-muted-foreground leading-relaxed">
            🔒 {t.notificationsPrivacy}
          </p>
        </motion.div>
      </div>

      {/* Bottom Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="w-full space-y-3"
      >
        <Button
          onClick={handleEnableNotifications}
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-lg"
        >
          {t.enableNotificationsButton}
        </Button>
        <Button
          onClick={onNext}
          variant="ghost"
          className="w-full text-muted-foreground"
        >
          {t.skipLabel}
        </Button>
        <Button
          onClick={onBack}
          variant="ghost"
          className="w-full text-muted-foreground text-sm"
        >
          {t.backLabel}
        </Button>
      </motion.div>
    </motion.div>
  );
}
