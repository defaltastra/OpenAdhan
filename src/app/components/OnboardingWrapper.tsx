import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { OnboardingFlow } from "./onboarding/OnboardingFlow";

export function OnboardingWrapper() {
  const navigate = useNavigate();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem("onboarding_completed");
    if (completed === "true") {
      navigate("/app");
    }
  }, [navigate]);

  const handleComplete = () => {
    localStorage.setItem("onboarding_completed", "true");
    setHasCompletedOnboarding(true);
    navigate("/app");
  };

  return <OnboardingFlow onComplete={handleComplete} />;
}
