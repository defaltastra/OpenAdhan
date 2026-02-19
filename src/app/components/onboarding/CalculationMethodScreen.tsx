import { useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { Button } from "../ui/button";
import { useTranslation } from "../../../backend/hooks";

interface CalculationMethodScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function CalculationMethodScreen({ onNext, onBack }: CalculationMethodScreenProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState("Muslim World League");

  const methods = [
    { name: t.mwl, description: "Standard calculation used worldwide", key: "MWL" },
    { name: t.makkah, description: "Used in Saudi Arabia", key: "MAKKAH" },
    { name: t.egypt, description: "Egypt", key: "EGYPT" },
    { name: t.isna, description: "Islamic Society of North America", key: "ISNA" },
    { name: t.karachi, description: "Pakistan", key: "KARACHI" },
    { name: t.tehran, description: "Iran", key: "TEHRAN" },
    { name: t.jafari, description: "Jafari method", key: "JAFARI" },
    { name: t.gulf, description: "General Gulf method", key: "GULF" },
    { name: t.kuwait, description: "Kuwait", key: "KUWAIT" },
    { name: t.qatar, description: "Qatar", key: "QATAR" },
    { name: t.singapore, description: "MUIS Singapore", key: "SINGAPORE" },
    { name: t.france, description: "UOIF France", key: "FRANCE" },
    { name: t.turkey, description: "Diyanet Turkey", key: "TURKEY" },
    { name: t.russia, description: "Russia", key: "RUSSIA" },
    { name: t.moonsighting, description: "Worldwide", key: "MOONSIGHTING" },
    { name: t.dubai, description: "Dubai, UAE", key: "DUBAI" },
    { name: t.jakim, description: "Malaysia", key: "JAKIM" },
    { name: t.tunisia, description: "Tunisia", key: "TUNISIA" },
    { name: t.algeria, description: "Algeria", key: "ALGERIA" },
    { name: t.kemenag, description: "Indonesia", key: "KEMENAG" },
    { name: t.morocco, description: "Morocco", key: "MOROCCO" },
    { name: t.portugal, description: "Lisbon", key: "PORTUGAL" },
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
        <h1 className="text-3xl font-semibold mb-3">{t.prayerTimeMethodTitle}</h1>
        <p className="text-muted-foreground">
          {t.prayerTimeMethodSubtitle}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {methods.map((method, index) => (
          <motion.button
            key={method.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelected(method.name)}
            className={`
              w-full p-5 rounded-2xl border-2 transition-all
              ${
                selected === method.name
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border bg-card hover:border-primary/30"
              }
            `}
          >
            <div className="flex items-start gap-4">
              <div
                className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                ${
                  selected === method.name
                    ? "border-primary bg-primary"
                    : "border-muted"
                }
              `}
              >
                {selected === method.name && (
                  <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
                )}
              </div>
              <div className="flex-1 text-left">
                <h3 className={`font-medium mb-1 ${selected === method.name ? "text-primary" : "text-foreground"}`}>
                  {method.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {method.description}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
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
