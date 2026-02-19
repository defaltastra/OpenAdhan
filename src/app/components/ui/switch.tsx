"use client";

import * as React from "react";

import { cn } from "./utils";

type SwitchProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

function Switch({
  className,
  checked = false,
  onCheckedChange,
  disabled,
  ...props
}: SwitchProps) {
  const isRTL =
    typeof document !== "undefined" && document.documentElement.dir === "rtl";
  const alignStart = isRTL ? checked : !checked;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    onCheckedChange?.(!checked);
    props.onClick?.(event);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      className={cn(
        "peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        checked ? "bg-primary" : "bg-switch-background dark:bg-input/80",
        alignStart ? "justify-start" : "justify-end",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block size-4 rounded-full ring-0 transition-transform",
          checked ? "bg-primary-foreground" : "bg-card-foreground",
        )}
      />
    </button>
  );
}

export { Switch };
