import { motion } from "motion/react";

interface ProgressDotsProps {
  total: number;
  current: number;
}

export function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {Array.from({ length: total }).map((_, index) => (
        <motion.div
          key={index}
          className={`h-2 rounded-full transition-all ${
            index === current
              ? "w-8 bg-primary"
              : index < current
              ? "w-2 bg-primary/60"
              : "w-2 bg-muted"
          }`}
          animate={{
            scale: index === current ? 1.1 : 1,
          }}
          transition={{ duration: 0.3 }}
        />
      ))}
    </div>
  );
}
