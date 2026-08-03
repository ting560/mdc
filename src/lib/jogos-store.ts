export type SavedGame = {
  id: string;
  numbers: number[];
  createdAt: number;
  source?: string;
};

const KEY = "lotofacil:jogos";

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `g-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function read(): SavedGame[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const listeners = new Set<() => void>();
let cache: SavedGame[] | null = null;

function getSnapshot(): SavedGame[] {
  if (cache === null) cache = read();
  return cache;
}

function emit(): void {
  cache = read();
  for (const listener of listeners) listener();
}

/** Subscrição para `useSyncExternalStore`. */
export function subscribeGamesChanged(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getGamesSnapshot(): SavedGame[] {
  return getSnapshot();
}

/** Snapshot para renderização no servidor (evita mismatch de hidratação). */
export function getServerGamesSnapshot(): SavedGame[] {
  return [];
}

function persist(games: SavedGame[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(games));
  } catch {
    // armazenamento indisponível
  }
}

export function addSavedGame(numbers: number[], source?: string): SavedGame {
  const game: SavedGame = {
    id: uid(),
    numbers: [...numbers].sort((a, b) => a - b),
    createdAt: Date.now(),
    source,
  };
  persist([game, ...getSnapshot()]);
  emit();
  return game;
}

export function removeSavedGame(id: string): void {
  persist(getSnapshot().filter((g) => g.id !== id));
  emit();
}

export function clearSavedGames(): void {
  persist([]);
  emit();
}
