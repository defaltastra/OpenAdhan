import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { HomeScreen } from "./components/HomeScreen";
import { LocationScreen } from "./components/LocationScreen";
import { SettingsScreen } from "./components/SettingsScreen";
import { QiblaScreen } from "./components/QiblaScreen";
import { OnboardingWrapper } from "./components/OnboardingWrapper";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: OnboardingWrapper,
  },
  {
    path: "/app",
    Component: Root,
    children: [
      { index: true, Component: HomeScreen },
      { path: "location", Component: LocationScreen },
      { path: "settings", Component: SettingsScreen },
      { path: "qibla", Component: QiblaScreen },
    ],
  },
]);