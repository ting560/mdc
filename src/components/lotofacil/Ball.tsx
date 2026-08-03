"use client";

import { cn } from "@/lib/utils";
import { pad2 } from "@/lib/lotofacil";

type BallProps = {
  number: number;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
};

export function Ball({ number, selected, disabled, onClick, size = "md" }: BallProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      aria-label={`Dezena ${pad2(number)}`}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-bold transition-all select-none",
        size === "md"
          ? "size-11 text-base sm:size-12 sm:text-lg"
          : "size-9 text-sm sm:size-10",
        onClick ? "cursor-pointer border-2" : "cursor-default border-2",
        selected
          ? "bg-gradient-to-br from-[#a0008f] to-[#6d0070] text-white border-[#a0008f] shadow-md shadow-fuchsia-950/40"
          : "bg-white text-zinc-800 border-zinc-300 hover:border-[#c94bbf] hover:shadow-sm dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-700 dark:hover:border-[#c94bbf]",
        disabled && "opacity-40 cursor-not-allowed hover:border-zinc-300 hover:shadow-none"
      )}
    >
      {pad2(number)}
    </button>
  );
}
