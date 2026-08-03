"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import {
  subscribeTheme,
  getThemeSnapshot,
  getServerThemeSnapshot,
  setTheme,
  type Theme,
} from "@/lib/theme-store";

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark" as Theme);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Alternar modo claro/escuro"
      title="Alternar modo claro/escuro"
      className="rounded-full border border-zinc-300 p-2 text-zinc-600 transition hover:border-[#930089] hover:text-[#930089] dark:border-zinc-700 dark:text-zinc-300"
    >
      {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}
