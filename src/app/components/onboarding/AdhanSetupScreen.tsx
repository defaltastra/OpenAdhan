import { useState } from "react";
import { motion } from "motion/react";
import { Play, Volume2, Upload, Square } from "lucide-react";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { useSettings, useAdhanPlayer, useTranslation } from "../../../backend/hooks";

interface AdhanSetupScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function AdhanSetupScreen({ onNext, onBack }: AdhanSetupScreenProps) {
  const [selected, setSelected] = useState("default.mp3");
  const [volume, setVolume] = useState([70]);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const { updateSettings } = useSettings();
  const { play, stop, isPlaying, setVolume: setPlayerVolume } = useAdhanPlayer();
  const { t } = useTranslation();

  const adhanOptions = [
    { filename: "default.mp3", name: t.defaultAdhan, icon: Volume2, description: t.traditionalAdhan },
    { filename: "madinah.mp3", name: t.madinahAdhan, icon: Volume2, description: t.madinahStyle },
    { filename: "custom", name: t.uploadCustom, icon: Upload, description: t.uploadYourOwn },
  ];

  const handlePlayPreview = async (filename: string) => {
    try {
      if (playingPreview === filename || isPlaying) {
        await stop();
        setPlayingPreview(null);
      } else if (filename !== 'custom') {
        await play(filename);
        setPlayingPreview(filename);
        // Auto-stop after preview
        setTimeout(async () => {
          await stop();
          setPlayingPreview(null);
        }, 10000); // 10 second preview
      }
    } catch (error) {
      console.error('Failed to play adhan:', error);
      setPlayingPreview(null);
    }
  };

  const handleUploadCustom = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // For now, just select it - full upload would need backend integration
        setSelected('custom');
        alert('Custom adhan upload feature - will be saved in Settings');
      }
    };
    input.click();
  };

  const handleContinue = async () => {
    try {
      await stop();
      if (selected !== 'custom') {
        await updateSettings({ adhanSound: selected });
      }
      onNext();
    } catch (error) {
      console.error('Failed to save adhan setting:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex flex-col h-full px-6 py-8"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-3">{t.selectAdhanTitle}</h1>
        <p className="text-muted-foreground">
          {t.selectAdhanSubtitle}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {adhanOptions.map((option, index) => {
          const Icon = option.icon;
          const isSelected = selected === option.filename;

          return (
            <motion.div
              key={option.filename}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <div
                onClick={() => {
                  if (option.filename === 'custom') {
                    handleUploadCustom();
                  } else {
                    setSelected(option.filename);
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
                  {/* Icon */}
                  <div
                    className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    ${
                      isSelected
                        ? "bg-primary/10"
                        : "bg-secondary"
                    }
                  `}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isSelected ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </div>

                  {/* Text */}
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

                  {/* Play Button */}
                  {option.filename !== 'custom' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayPreview(option.filename);
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

                  {/* Radio indicator */}
                  <div
                    className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${
                      isSelected
                        ? "border-primary"
                        : "border-muted"
                    }
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
            </motion.div>
          );
        })}

        {/* Volume Slider */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="p-5 bg-secondary/50 rounded-2xl space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t.volumeLabel}</span>
            <span className="text-sm font-medium text-foreground">{volume[0]}%</span>
          </div>
          <Slider
            value={volume}
            onValueChange={(value) => {
              setVolume(value);
              setPlayerVolume(value[0] / 100);
            }}
            max={100}
            step={1}
            className="w-full"
          />
        </motion.div>
      </div>

      {/* Bottom Buttons */}
      <div className="space-y-3 mt-6">
        <Button
          onClick={handleContinue}
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
