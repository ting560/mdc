export type Theme = "light" | "dark";

const THEME_KEY = "lotofacil:theme";

function read(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const listeners = new Set<() => void>();
let cache: Theme | null = null;

function getSnapshot(): Theme {
  if (cache === null) cache = read();
  return cache;
}

function emit(): void {
  cache = read();
  for (const listener of listeners) listener();
}

export function subscribeTheme(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getThemeSnapshot(): Theme {
  return getSnapshot();
}

/** Snapshot para renderização no servidor (evita mismatch de hidratação). */
export function getServerThemeSnapshot(): Theme {
  return "light";
}

export function setTheme(theme: Theme): void {
  cache = theme;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      // armazenamento indisponível
    }
  }
  emit();
}
