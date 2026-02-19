import { motion } from "motion/react";
import { Button } from "../ui/button";
import { useTranslation } from "../../../backend/hooks";

interface WelcomeScreenProps {
  onNext: () => void;
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex flex-col items-center justify-between h-full px-6 py-12"
    >
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Logo/Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-12"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-12 h-12 text-primary-foreground"
              strokeWidth="1.5"
            >
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
        </motion.div>

        {/* Mosque Silhouette Illustration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <svg
            viewBox="0 0 200 120"
            className="w-64 h-40 opacity-20"
            fill="currentColor"
          >
            {/* Simple mosque silhouette */}
            <path d="M100 10 L110 30 L120 30 L120 80 L80 80 L80 30 L90 30 Z" className="text-primary" />
            <circle cx="100" cy="15" r="8" className="text-primary" />
            <path d="M60 50 L70 50 L70 80 L50 80 L50 50 L60 50 Z" className="text-accent" />
            <path d="M130 50 L140 50 L140 80 L150 80 L150 50 L140 50 Z" className="text-accent" />
            <rect x="40" y="80" width="120" height="8" className="text-primary" />
          </svg>
        </motion.div>

        {/* Title and Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-semibold mb-4 text-foreground">
            {t.onboardingTitle}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t.onboardingTaglineLine1}<br />
            {t.onboardingTaglineLine2}
          </p>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="w-full space-y-6"
      >
        <Button
          onClick={onNext}
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-lg"
        >
          {t.getStarted}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          {t.onboardingFooter}
        </p>
      </motion.div>
    </motion.div>
  );
}
