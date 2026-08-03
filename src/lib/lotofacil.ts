export type DrawnResult = {
  c: number; // concurso
  d: string; // data "dd/mm/aaaa"
  z: number[]; // dezenas sorteadas (1-25, ordenadas)
};

export type GeneratorContext = DrawnResult[];

export const TOTAL_NUMBERS = 25;
export const DRAWN_NUMBERS = 15;
export const MIN_TICKET = 15;
export const MAX_TICKET = 20;

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatNumberBR(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function formatTicket(numbers: number[]): string {
  return numbers.map(pad2).join(" ");
}

export function formatTicketText(numbers: number[]): string {
  return numbers.map(pad2).join(" ");
}

export function countHits(ticket: number[], drawn: number[]): number {
  return ticket.filter((n) => drawn.includes(n)).length;
}

export function countEvens(z: number[]): number {
  return z.filter((n) => n % 2 === 0).length;
}

export function getRepeatedCount(r: DrawnResult, prev: DrawnResult): number {
  return r.z.filter((n) => prev.z.includes(n)).length;
}

/** Gera um jogo aleatório com 15 dezenas. */
export function generateRandomTicket(): number[] {
  const pool = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, DRAWN_NUMBERS).sort((a, b) => a - b);
}

/** Gera um jogo "inteligente" seguindo o padrão dos últimos concursos. */
export function generateIntelligentTicket(context: GeneratorContext): number[] {
  const n = Math.max(5, Math.min(context.length, 30));
  const recent = context.slice(-n);

  const evenFreq = new Map<number, number>();
  for (const r of recent) {
    const e = countEvens(r.z);
    evenFreq.set(e, (evenFreq.get(e) || 0) + 1);
  }
  const targetEvens = [...evenFreq.entries()].sort((a, b) => b[1] - a[1])[0][0];

  const repeatedFreq = new Map<number, number>();
  for (let i = 1; i < recent.length; i++) {
    const rep = getRepeatedCount(recent[i], recent[i - 1]);
    repeatedFreq.set(rep, (repeatedFreq.get(rep) || 0) + 1);
  }
  const last = recent[recent.length - 1];
  const targetRepeated =
    [...repeatedFreq.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 8;
  const repeatCount = Math.max(0, Math.min(targetRepeated, DRAWN_NUMBERS));

  const repeated = [...last.z].sort(() => Math.random() - 0.5).slice(0, repeatCount);
  const used = new Set(repeated);
  const nonRepeatedPool = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).filter(
    (n) => !used.has(n)
  );
  const remaining = DRAWN_NUMBERS - repeatCount;

  const evensNeeded = Math.max(
    0,
    targetEvens - repeated.filter((n) => n % 2 === 0).length
  );
  const oddsNeeded = remaining - evensNeeded;

  const pick = (arr: number[], count: number): number[] => {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const evenPool = nonRepeatedPool.filter((n) => n % 2 === 0);
  const oddPool = nonRepeatedPool.filter((n) => n % 2 !== 0);
  const chosenEvens = pick(evenPool, Math.min(evensNeeded, evenPool.length));
  const chosenOdds = pick(oddPool, Math.min(oddsNeeded, oddPool.length));
  const rest = pick(
    nonRepeatedPool.filter((n) => !chosenEvens.includes(n) && !chosenOdds.includes(n)),
    Math.max(0, remaining - chosenEvens.length - chosenOdds.length)
  );

  return [...repeated, ...chosenEvens, ...chosenOdds, ...rest].sort((a, b) => a - b);
}

function combination(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  if (k > n - k) k = n - k;
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1);
  }
  return result;
}

/** Probabilidades (1 em X) para jogos com 15 a 20 números. */
export type OddsRow = {
  hits: number;
  oneIn: number;
  label: string;
};

export function getOdds(marked: number): OddsRow[] {
  const total = combination(TOTAL_NUMBERS, DRAWN_NUMBERS);
  const rows: OddsRow[] = [];
  for (let hits = 15; hits >= 11; hits--) {
    const ways =
      combination(marked, hits) *
      combination(TOTAL_NUMBERS - marked, DRAWN_NUMBERS - hits);
    const oneIn = total / ways;
    rows.push({ hits, oneIn, label: `${hits} acertos` });
  }
  return rows;
}

export const PRICE_PER_MARK: Record<number, number> = {
  15: 3.5,
  16: 56,
  17: 476,
  18: 2856,
  19: 13566,
  20: 54264,
};

export const TICKET_PRICE = 3.5;

/** Quantidade de combinações de um jogo de 15 dezenas (C(k, 15)). */
export function combinationsOfFifteen(k: number): number {
  return combination(k, DRAWN_NUMBERS);
}

/** Gera combinações de `size` números a partir de um conjunto (para fechamentos). */
export function generateCombinations(arr: number[], size: number): number[][] {
  const result: number[][] = [];
  const current: number[] = [];
  const walk = (start: number) => {
    if (current.length === size) {
      result.push([...current]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      current.push(arr[i]);
      walk(i + 1);
      current.pop();
    }
  };
  walk(0);
  return result;
}
