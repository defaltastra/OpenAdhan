import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "../ui/button";
import { useTranslation } from "../../../backend/hooks";

interface MadhabScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function MadhabScreen({ onNext, onBack }: MadhabScreenProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState("Shafi'i / Maliki / Hanbali");

  const options = [
    {
      value: "Hanafi",
      label: t.hanafiLabel,
      description: t.hanafiDesc,
    },
    {
      value: "Shafi'i / Maliki / Hanbali",
      label: t.shafiGroupLabel,
      description: t.shafiGroupDesc,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex flex-col h-full px-6 py-8"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-3">{t.asrCalculationTitle}</h1>
        <p className="text-muted-foreground">
          {t.asrCalculationSubtitle}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4">
        {options.map((option, index) => (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            onClick={() => setSelected(option.value)}
            className={`
              w-full p-6 rounded-2xl border-2 transition-all
              ${
                selected === option.value
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border bg-card hover:border-primary/30"
              }
            `}
          >
            <div className="flex items-start gap-4">
              {/* Radio Button */}
              <div className="flex items-center justify-center pt-1">
                <div
                  className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center
                  ${
                    selected === option.value
                      ? "border-primary"
                      : "border-muted"
                  }
                `}
                >
                  {selected === option.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3 h-3 rounded-full bg-primary"
                    />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-left">
                <h3
                  className={`font-medium mb-1 ${
                    selected === option.value ? "text-primary" : "text-foreground"
                  }`}
                >
                  {option.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </div>
          </motion.button>
        ))}

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-4 bg-secondary/50 rounded-2xl"
        >
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t.asrInfo}
          </p>
        </motion.div>
      </div>

      {/* Bottom Buttons */}
      <div className="space-y-3 mt-6">
        <Button
          onClick={onNext}
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl"
        >
          {t.continueLabel}
        </Button>
        <Button
          onClick={onBack}
          variant="ghost"
          className="w-full text-muted-foreground"
        >
          {t.backLabel}
        </Button>
      </div>
    </motion.div>
  );
}
