import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { ProgressDots } from "./ProgressDots";
import { WelcomeScreen } from "./WelcomeScreen";
import { LocationSetupScreen } from "./LocationSetupScreen";
import { AdhanSetupScreen } from "./AdhanSetupScreen";
import { NotificationScreen } from "./NotificationScreen";
import { CompletionScreen } from "./CompletionScreen";
import { useTranslation } from "../../../backend/hooks";

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { isRTL } = useTranslation();

  const totalSteps = 5;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const screens = [
    <WelcomeScreen key="welcome" onNext={handleNext} />,
    <LocationSetupScreen key="location" onNext={handleNext} onBack={handleBack} />,
    <AdhanSetupScreen key="adhan" onNext={handleNext} onBack={handleBack} />,
    <NotificationScreen key="notification" onNext={handleNext} onBack={handleBack} />,
    <CompletionScreen key="completion" onComplete={onComplete} />,
  ];

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background" dir={isRTL ? "rtl" : "ltr"}>
      {/* Progress Indicator - Hide on first and last screen */}
      {currentStep > 0 && currentStep < totalSteps - 1 && (
        <ProgressDots total={totalSteps - 2} current={currentStep - 1} />
      )}

      {/* Screen Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {screens[currentStep]}
        </AnimatePresence>
      </div>
    </div>
  );
}
