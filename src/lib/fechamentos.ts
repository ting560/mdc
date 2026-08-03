import { generateCombinations } from "./lotofacil";

export const TICKET_PRICE = 3.5;

export type FechamentoResult = {
  chosen: number[];
  guarantee: number; // 13 | 14 | 15
  tickets: number[][];
  ticketCount: number;
  totalCost: number;
  complete: boolean;
  note?: string;
};

export type GuaranteeInfo = {
  label: string;
  estimate: number;
};

/** Estimativa do nº de jogos por garantia (valores aproximados de sistemas reduzidos). */
const ESTIMATES: Record<number, Record<number, number>> = {
  13: { 16: 1, 17: 1, 18: 2, 19: 5, 20: 15 },
  14: { 16: 1, 17: 3, 18: 10, 19: 25, 20: 60 },
};

/** Gera as máscaras (bit i = número chosen[i]) de todas as combinações de `size` elementos. */
function allSubsetMasks(m: number, size: number): number[] {
  const out: number[] = [];
  const comb = (start: number, count: number, mask: number) => {
    if (count === 0) {
      out.push(mask);
      return;
    }
    for (let i = start; i <= m - count; i++) {
      comb(i + 1, count - 1, mask | (1 << i));
    }
  };
  comb(0, size, 0);
  return out;
}

function maskToNums(mask: number, chosen: number[]): number[] {
  const nums: number[] = [];
  for (let i = 0; i < chosen.length; i++) {
    if (mask & (1 << i)) nums.push(chosen[i]);
  }
  return nums;
}

function randomSubset(m: number, size: number): number {
  const set = new Set<number>();
  while (set.size < size) set.add(Math.floor(Math.random() * m));
  let mask = 0;
  for (const i of set) mask |= 1 << i;
  return mask;
}

function popcountTable(m: number): Uint8Array {
  const size = 1 << m;
  const table = new Uint8Array(size);
  for (let i = 1; i < size; i++) table[i] = table[i >> 1] + (i & 1);
  return table;
}

/**
 * Fechamento reduzido com garantia de `guarantee` pontos.
 *
 * Modelo: se as 15 dezenas sorteadas estiverem entre as `chosen.length` escolhidas,
 * pelo menos um jogo acerta `guarantee` pontos.
 *
 * Cada jogo é um subconjunto de 15 dezenas; o "removido" C (size s = m - 15) fica fora do
 * volante. Para um sorteio D (15 dezenas) com complemento E = escolhidas \ D (size s),
 * o jogo acerta |D \ C| = 15 - |C ∩ D| = 15 - (s - |C ∩ E|) = 30 - m + |C ∩ E| pontos.
 * Logo cobrimos D quando |C ∩ E| >= g + m - 30 (que é <= s, sempre satisfazível).
 */
export function generateWheel(chosen: number[], guarantee: 13 | 14 | 15): FechamentoResult {
  const sorted = [...chosen].sort((a, b) => a - b);
  const m = sorted.length;
  const MAX_TICKETS = 3000;

  if (m < 16 || m > 20) {
    throw new Error("Escolha entre 16 e 20 dezenas para o fechamento.");
  }

  if (guarantee === 15) {
    const tickets = generateCombinations(sorted, 15);
    return {
      chosen: sorted,
      guarantee,
      tickets,
      ticketCount: tickets.length,
      totalCost: tickets.length * TICKET_PRICE,
      complete: true,
      note:
        tickets.length > 100
          ? "Fechamento completo: todos os jogos possíveis. Custo elevado."
          : undefined,
    };
  }

  const s = m - 15; // tamanho do conjunto removido/complemento
  const K = guarantee + m - 30; // |C ∩ E| necessário (para m=20: g-10; para m=16: g-14)

  // Garantia trivial: um único jogo já cobre todas as combinações.
  if (K <= 0) {
    const ticket = sorted.slice(0, 15);
    return {
      chosen: sorted,
      guarantee,
      tickets: [ticket],
      ticketCount: 1,
      totalCost: TICKET_PRICE,
      complete: true,
    };
  }

  const universe = allSubsetMasks(m, s); // complementos E dos possíveis jogos sorteados
  const table = popcountTable(m);
  const covered = new Uint8Array(universe.length);
  const tickets: number[][] = [];
  let complete = false;

  const R = Math.min(600, universe.length);
  const uncoveredIdx: number[] = [];

  while (tickets.length < MAX_TICKETS) {
    uncoveredIdx.length = 0;
    for (let i = 0; i < universe.length; i++) if (!covered[i]) uncoveredIdx.push(i);
    if (uncoveredIdx.length === 0) {
      complete = true;
      break;
    }

    // candidatos: s-subconjuntos aleatórios + alguns complementos ainda descobertos
    const candSet = new Set<number>();
    const candidates: number[] = [];
    for (let c = 0; c < R && candidates.length < R; c++) {
      const cand = randomSubset(m, s);
      if (!candSet.has(cand)) {
        candSet.add(cand);
        candidates.push(cand);
      }
    }
    const sampleSize = Math.min(uncoveredIdx.length, R);
    for (let c = 0; c < sampleSize; c++) {
      const idx = uncoveredIdx[Math.floor(Math.random() * uncoveredIdx.length)];
      const cand = universe[idx];
      if (!candSet.has(cand)) {
        candSet.add(cand);
        candidates.push(cand);
      }
    }

    let best = -1;
    let bestCount = -1;
    for (const cand of candidates) {
      let cnt = 0;
      for (const ui of uncoveredIdx) {
        if (table[cand & universe[ui]] >= K) cnt++;
      }
      if (cnt > bestCount) {
        bestCount = cnt;
        best = cand;
      }
    }

    if (bestCount <= 0) {
      // cobre os restantes diretamente (garante corretude)
      for (const ui of uncoveredIdx) {
        const comp = universe[ui];
        const used = new Set(maskToNums(comp, sorted));
        tickets.push(sorted.filter((n) => !used.has(n)));
        covered[ui] = 1;
      }
      complete = true;
      break;
    }

    for (const ui of uncoveredIdx) {
      if (table[best & universe[ui]] >= K) covered[ui] = 1;
    }
    const used = new Set(maskToNums(best, sorted));
    tickets.push(sorted.filter((n) => !used.has(n)));
  }

  const notes: string[] = [];
  if (!complete) {
    notes.push(
      `Atingiu o limite de ${MAX_TICKETS} jogos sem cobrir todas as combinações. Considere reduzir a garantia ou o nº de dezenas.`
    );
  }
  if (guarantee === 14 && m >= 18) {
    notes.push("Garantia de 14 pontos exige muitos jogos. Considere a garantia de 13 pontos.");
  }

  return {
    chosen: sorted,
    guarantee,
    tickets,
    ticketCount: tickets.length,
    totalCost: tickets.length * TICKET_PRICE,
    complete,
    note: notes.length ? notes.join(" ") : undefined,
  };
}

/** Garantias disponíveis para um tamanho de jogo (com estimativa de jogos). */
export function availableGuarantees(m: number): Record<number, GuaranteeInfo> {
  const out: Record<number, GuaranteeInfo> = {};
  if (m >= 16) {
    out[13] = { label: "13 pontos", estimate: ESTIMATES[13][m] ?? 30 };
    out[14] = { label: "14 pontos", estimate: ESTIMATES[14][m] ?? 100 };
  }
  if (m <= 17) {
    out[15] = { label: "15 pontos (completo)", estimate: generateCombinationsCount(m) };
  }
  return out;
}

function generateCombinationsCount(m: number): number {
  let n = 1;
  for (let i = 0; i < 15; i++) n = (n * (m - i)) / (i + 1);
  return Math.round(n);
}
