import { useState, useEffect, useRef } from "react";
import { ChevronRight, Volume2, Book, Calculator, Bell, Shield, RotateCcw, Upload, Play, Square, LayoutGrid } from "lucide-react";
import { motion } from "motion/react";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";
import { useSettings, useAdhanPlayer, useTranslation, useLocations } from "../../backend/hooks";
import PrayerAPI, { CalculationMethod, Madhab } from "../../backend";
import { getSuggestedCalculationMethod } from "../../backend/locationUtils";

interface SettingSection {
  title: string;
  icon: any;
  items: SettingItem[];
}

interface SettingItem {
  label: string;
  value?: string;
  type: "toggle" | "select" | "nav";
  enabled?: boolean;
}

export function SettingsScreen() {
  const navigate = useNavigate();
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  
  // Backend hooks
  const { settings, updateCalculationMethod, updateMadhab, updateSettings } = useSettings();
  const { isPlaying, play, stop } = useAdhanPlayer();
  const { t, lang, isRTL, translatePrayer } = useTranslation();
  const { activeLocation } = useLocations();

  const adhanOptions = [
    { filename: "default.mp3", name: t.defaultAdhan, icon: Volume2, description: t.traditionalAdhan },
    { filename: "madinah.mp3", name: t.madinahAdhan, icon: Volume2, description: t.madinahStyle },
    { filename: "custom", name: t.uploadCustom, icon: Upload, description: t.uploadYourOwn },
  ];

  const suggestedMethod = activeLocation
    ? getSuggestedCalculationMethod(activeLocation)
    : CalculationMethod.MWL;

  // Auto-update calculation method when location changes
  useEffect(() => {
    if (activeLocation && settings) {
      const suggested = getSuggestedCalculationMethod(activeLocation);
      // Auto-update to suggested method when location changes
      if (suggested !== settings.calculationMethod) {
        console.log(`Location changed to ${activeLocation.city}, ${activeLocation.country}. Updating method from ${settings.calculationMethod} to ${suggested}`);
        updateCalculationMethod(suggested);
      }
    }
  }, [activeLocation?.id, activeLocation?.city, activeLocation?.country]);

  const calculationMethods = [
    { key: CalculationMethod.MWL, label: t.mwl },
    { key: CalculationMethod.ISNA, label: t.isna },
    { key: CalculationMethod.EGYPT, label: t.egypt },
    { key: CalculationMethod.MAKKAH, label: t.makkah },
    { key: CalculationMethod.KARACHI, label: t.karachi },
    { key: CalculationMethod.TEHRAN, label: t.tehran },
    { key: CalculationMethod.JAFARI, label: t.jafari },
    { key: CalculationMethod.GULF, label: t.gulf },
    { key: CalculationMethod.KUWAIT, label: t.kuwait },
    { key: CalculationMethod.QATAR, label: t.qatar },
    { key: CalculationMethod.SINGAPORE, label: t.singapore },
    { key: CalculationMethod.FRANCE, label: t.france },
    { key: CalculationMethod.TURKEY, label: t.turkey },
    { key: CalculationMethod.RUSSIA, label: t.russia },
    { key: CalculationMethod.MOONSIGHTING, label: t.moonsighting },
    { key: CalculationMethod.DUBAI, label: t.dubai },
    { key: CalculationMethod.JAKIM, label: t.jakim },
    { key: CalculationMethod.TUNISIA, label: t.tunisia },
    { key: CalculationMethod.ALGERIA, label: t.algeria },
    { key: CalculationMethod.KEMENAG, label: t.kemenag },
    { key: CalculationMethod.MOROCCO, label: t.morocco },
    { key: CalculationMethod.PORTUGAL, label: t.portugal },
  ];

  const madhabs = [
    { key: Madhab.HANAFI, label: t.hanafi },
    { key: Madhab.SHAFI, label: t.shafi },
    { key: Madhab.MALIKI, label: t.maliki },
    { key: Madhab.HANBALI, label: t.hanbali },
  ];

  const handleUploadCustom = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const url = URL.createObjectURL(file);
          await PrayerAPI.adhan.add({
            name: file.name.replace(/\.[^/.]+$/, ""),
            filename: file.name,
            path: url,
            duration: 0,
          });
          await updateSettings({ adhanSound: file.name });
          alert('Custom adhan uploaded successfully!');
        } catch (error) {
          console.error('Failed to upload custom adhan:', error);
          alert('Failed to upload custom adhan.');
        }
      }
    };
    input.click();
  };

  const handleAdhanSelect = async (filename: string) => {
    try {
      await updateSettings({ adhanSound: filename });
    } catch (error) {
      console.error("Failed to select adhan:", error);
    }
  };

  const handleAdhanPreview = async (filename: string) => {
    try {
      if (playingPreview === filename || isPlaying) {
        await stop();
        setPlayingPreview(null);
      } else if (filename !== 'custom') {
        await play(filename);
        setPlayingPreview(filename);
        setTimeout(async () => {
          await stop();
          setPlayingPreview(null);
        }, 10000);
      }
    } catch (error) {
      console.error("Failed to play adhan:", error);
      setPlayingPreview(null);
    }
  };

  const handleNotificationToggle = async (prayer: string, enabled: boolean) => {
    try {
      await PrayerAPI.settings.updatePrayerNotification(
        prayer as 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
        enabled
      );
    } catch (error) {
      console.error("Failed to update notification:", error);
    }
  };

  const handleResetDefaults = async () => {
    try {
      await PrayerAPI.settings.reset();
      alert("Settings reset to defaults!");
    } catch (error) {
      console.error("Failed to reset settings:", error);
    }
  };

  if (!settings) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-full px-5 py-6 pb-20" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2">{t.settings}</h1>
        <p className="text-muted-foreground text-sm">
          {t.customizePrayer}
        </p>
      </div>

      {/* Calculation Method */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <Calculator className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm text-muted-foreground">{t.calculationMethod}</h3>
        </div>
        <div className="bg-card rounded-2xl p-4 shadow-sm">
          <select
            value={settings.calculationMethod}
            onChange={(e) => updateCalculationMethod(e.target.value as CalculationMethod)}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {calculationMethods.map((method) => (
              <option key={method.key} value={method.key}>
                {method.label}
                {method.key === suggestedMethod ? ` (${t.recommended})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Madhab Selection */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <Book className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm text-muted-foreground">{t.madhab}</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {madhabs.map((madhab) => (
            <button
              key={madhab.key}
              onClick={() => updateMadhab(madhab.key)}
              className={`
                p-4 rounded-2xl border-2 transition-all
                ${
                  settings.madhab === madhab.key
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card"
                }
              `}
            >
              <span
                className={`text-sm font-medium ${
                  settings.madhab === madhab.key ? "text-primary" : "text-foreground"
                }`}
              >
                {madhab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Adhan Sound */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <Volume2 className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm text-muted-foreground">{t.adhanSound}</h3>
        </div>
        <div className="space-y-2">
          {adhanOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = settings.adhanSound === option.filename;
            
            return (
              <div
                key={option.filename}
                onClick={() => {
                  if (option.filename === 'custom') {
                    handleUploadCustom();
                  } else {
                    handleAdhanSelect(option.filename);
                  }
                }}
                className={`
                  w-full p-4 rounded-2xl border-2 transition-all cursor-pointer
                  ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-card hover:border-primary/30"
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    ${isSelected ? "bg-primary/10" : "bg-secondary"}
                  `}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isSelected ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </div>

                  <div className="flex-1 text-left">
                    <h3
                      className={`font-medium mb-0.5 ${
                        isSelected ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {option.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>

                  {option.filename !== 'custom' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdhanPreview(option.filename);
                      }}
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${
                          isSelected
                            ? "bg-primary hover:bg-primary/90"
                            : "bg-secondary hover:bg-muted"
                        }
                      `}
                    >
                      {playingPreview === option.filename ? (
                        <Square
                          className={`w-4 h-4 ${
                            isSelected ? "text-primary-foreground" : "text-foreground"
                          }`}
                          fill="currentColor"
                        />
                      ) : (
                        <Play
                          className={`w-4 h-4 ${
                            isSelected ? "text-primary-foreground" : "text-foreground"
                          }`}
                          fill="currentColor"
                        />
                      )}
                    </button>
                  )}

                  <div
                    className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${isSelected ? "border-primary" : "border-muted"}
                  `}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 rounded-full bg-primary"
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Display Settings */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <RotateCcw className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm text-muted-foreground">
            Display
          </h3>
        </div>
        <div className="bg-card rounded-2xl p-4 shadow-sm">
          <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
            <span className="text-sm">12-Hour Format</span>
            <Switch
              checked={settings.use12HourFormat}
              onCheckedChange={(checked) => updateSettings({ use12HourFormat: checked })}
            />
          </div>
          <div className={`flex items-center justify-between pt-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <span className="text-sm">{t.darkMode}</span>
            <Switch
              checked={settings.theme === "dark"}
              onCheckedChange={(checked) =>
                updateSettings({ theme: checked ? "dark" : "light" })
              }
            />
          </div>
        </div>
      </div>

      {/* Language Settings */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <Book className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm text-muted-foreground">{t.language}</h3>
        </div>
        <div className="bg-card rounded-2xl overflow-hidden shadow-sm">
          {[
            { key: 'en', label: 'English', native: 'English' },
            { key: 'ar', label: 'Arabic', native: 'العربية' },
            { key: 'fr', label: 'French', native: 'Français' },
          ].map((lang, index) => {
            const isSelected = settings.language === lang.key;
            return (
              <div key={lang.key}>
                <button
                  onClick={() => updateSettings({ language: lang.key as 'en' | 'ar' | 'fr' })}
                  className={`
                    w-full px-4 py-3 flex items-center justify-between
                    ${isSelected ? "bg-primary/5" : "hover:bg-muted"}
                    transition-colors
                  `}
                >
                  <div className="flex flex-col items-start">
                    <span className={`font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
                      {lang.native}
                    </span>
                    <span className="text-xs text-muted-foreground">{lang.label}</span>
                  </div>
                  <div
                    className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${isSelected ? "border-primary" : "border-muted"}
                    `}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2.5 h-2.5 rounded-full bg-primary"
                      />
                    )}
                  </div>
                </button>
                {index < 2 && <div className="border-b border-border" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Prayer Notifications */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <Bell className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm text-muted-foreground">{t.notifications}</h3>
        </div>
        <div className="bg-card rounded-2xl p-4 space-y-3 shadow-sm">
          <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
            <span className="text-sm">{translatePrayer('Fajr')}</span>
            <Switch
              checked={settings.notificationFajr}
              onCheckedChange={(checked) => handleNotificationToggle('fajr', checked)}
            />
          </div>
          <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
            <span className="text-sm">{translatePrayer('Dhuhr')}</span>
            <Switch
              checked={settings.notificationDhuhr}
              onCheckedChange={(checked) => handleNotificationToggle('dhuhr', checked)}
            />
          </div>
          <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
            <span className="text-sm">{translatePrayer('Asr')}</span>
            <Switch
              checked={settings.notificationAsr}
              onCheckedChange={(checked) => handleNotificationToggle('asr', checked)}
            />
          </div>
          <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
            <span className="text-sm">{translatePrayer('Maghrib')}</span>
            <Switch
              checked={settings.notificationMaghrib}
              onCheckedChange={(checked) => handleNotificationToggle('maghrib', checked)}
            />
          </div>
          <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
            <span className="text-sm">{translatePrayer('Isha')}</span>
            <Switch
              checked={settings.notificationIsha}
              onCheckedChange={(checked) => handleNotificationToggle('isha', checked)}
            />
          </div>
        </div>
      </div>

      {/* Privacy Section */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm text-muted-foreground">{t.privacyData}</h3>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <p className="text-sm">{t.allDataLocal}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <p className="text-sm">{t.noTracking}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <p className="text-sm">{t.worksOffline}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <p className="text-sm">{t.noAds}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Widgets Info */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <LayoutGrid className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm text-muted-foreground">{t.widgetsHowToTitle}</h3>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">{t.widgetsHowToBody}</p>
        </div>
      </div>

      {/* App Info */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">Prayer Times App v1.0.0</p>
        <p className="text-xs text-muted-foreground mt-1">
          {t.madeWithCare}
        </p>
      </div>

      {/* Reset Button */}
      <div className="mt-8 text-center space-y-3">
        <Button
          variant="outline"
          onClick={handleResetDefaults}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          {t.resetDefaults}
        </Button>
        
        <Button
          variant="ghost"
          onClick={() => {
            localStorage.removeItem("onboarding_completed");
            navigate("/");
          }}
          className="text-muted-foreground"
        >
          View Onboarding Again
        </Button>
      </div>
    </div>
  );
}