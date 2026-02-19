import { motion } from "motion/react";
import { Check, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { useTranslation } from "../../../backend/hooks";

interface CompletionScreenProps {
  onComplete: () => void;
}

export function CompletionScreen({ onComplete }: CompletionScreenProps) {
  const { t, lang, translatePrayer } = useTranslation();

  const todayPrayers = [
    { name: "Fajr", time: "5:42 AM", completed: true },
    { name: "Dhuhr", time: "12:32 PM", completed: true },
    { name: "Asr", time: "3:15 PM", completed: false },
    { name: "Maghrib", time: "5:48 PM", completed: false },
    { name: "Isha", time: "7:12 PM", completed: false },
  ];

  const previewDate = new Date().toLocaleDateString(lang, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-between h-full px-6 py-12"
    >
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl">
            <Check className="w-12 h-12 text-primary-foreground" strokeWidth={3} />
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-semibold mb-3">{t.youAreReadyTitle}</h1>
          <p className="text-lg text-muted-foreground">
            {t.youAreReadySubtitle}
          </p>
        </motion.div>

        {/* Today's Prayer Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-sm"
        >
          <div className="bg-card rounded-3xl p-5 shadow-xl border border-border">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="font-medium">{t.todaysPrayersLabel}</h3>
              </div>
              <span className="text-sm text-muted-foreground">
                {previewDate}
              </span>
            </div>

            {/* Prayer Times */}
            <div className="space-y-2">
              {todayPrayers.map((prayer, index) => (
                <motion.div
                  key={prayer.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  className={`
                    flex items-center justify-between py-2 px-3 rounded-xl
                    ${
                      !prayer.completed
                        ? "bg-primary/5"
                        : "bg-transparent opacity-50"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                      w-2 h-2 rounded-full
                      ${!prayer.completed ? "bg-primary" : "bg-muted-foreground"}
                    `}
                    />
                    <span className="text-sm font-medium">{translatePrayer(prayer.name)}</span>
                  </div>
                  <span className="text-sm">{prayer.time}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="w-full"
      >
        <Button
          onClick={onComplete}
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-lg"
        >
          {t.enterAppButton}
        </Button>
      </motion.div>
    </motion.div>
  );
}
