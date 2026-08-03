import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import rawDataset from "../../data/lotofacil-results.json";
import type { DrawnResult } from "./lotofacil";

export type ContestResult = DrawnResult & {
  // prêmios: array [ganhadores, valor] por faixa (15, 14, 13, 12, 11 acertos)
  pr?: [number, number][];
};

type Dataset = {
  meta: {
    proximoConcurso: number;
    dataProximoConcurso: string;
    valorEstimadoProximoConcurso: number;
    updatedAt: string;
  };
  results: ContestResult[];
};

// O dataset é embutido no bundle via import estático (funciona em servidores
// com filesystem read-only, como o Vercel). Os dados vêm do repositório em data/.
const STALE_MS = 6 * 60 * 60 * 1000; // 6 horas

const BASE = "https://api-loterias.moleniuk.com/api/lotofacil";
const CAIXA_LATEST = "https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil";

let dataset: Dataset = rawDataset as Dataset;

function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

async function refreshFromApi(): Promise<Dataset> {
  const res = await fetch(BASE, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Falha ao atualizar dados: ${res.status}`);
  const text = Buffer.from(await res.arrayBuffer()).toString("latin1");
  const raw = JSON.parse(text);

  const results: ContestResult[] = (Array.isArray(raw) ? raw : [])
    .filter((r) => Array.isArray(r.dezenas) && r.dezenas.length === 15)
    .map((r) => {
      const contest: ContestResult = {
        c: Number(r.concurso),
        d: String(r.data || ""),
        z: r.dezenas.map((n: unknown) => Number(n)),
      };
      const prizes: [number, number][] = [];
      for (let faixa = 1; faixa <= 5; faixa++) {
        const p = (r.premiacoes || []).find(
          (x: { faixa: unknown }) => Number(x.faixa) === faixa
        );
        if (p) prizes.push([Number(p.numeroDeGanhadores) || 0, Number(p.valor) || 0]);
      }
      if (prizes.length) contest.pr = prizes;
      return contest;
    })
    .sort((a, b) => a.c - b.c);

  const last = results[results.length - 1];
  const meta: Dataset["meta"] = {
    proximoConcurso: (last?.c || 0) + 1,
    dataProximoConcurso: "",
    valorEstimadoProximoConcurso: 0,
    updatedAt: new Date().toISOString(),
  };

  try {
    const caixa = await fetch(CAIXA_LATEST, {
      headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
    });
    if (caixa.ok) {
      const c = await caixa.json();
      meta.proximoConcurso = Number(c.numeroConcursoProximo) || meta.proximoConcurso;
      meta.dataProximoConcurso = c.dataProximoConcurso || "";
      meta.valorEstimadoProximoConcurso = c.valorEstimadoProximoConcurso || 0;
    }
  } catch {
    // metadata opcional
  }

  const fresh: Dataset = { meta, results };
  // atualiza em memória primeiro (funciona mesmo onde não dá para gravar em disco)
  dataset = fresh;
  try {
    mkdirSync(join(process.cwd(), "data"), { recursive: true });
    writeFileSync(join(process.cwd(), "data", "lotofacil-results.json"), JSON.stringify(fresh), "utf8");
  } catch {
    // filesystem read-only (ex.: Vercel) — segue apenas com dados em memória
  }
  return fresh;
}

let refreshing: Promise<void> | null = null;

/** Atualiza os dados em segundo plano se estiverem antigos. */
export function maybeRefresh(): void {
  if (isBuildPhase()) return;
  const updated = Date.parse(dataset.meta.updatedAt);
  if (Number.isNaN(updated) || Date.now() - updated > STALE_MS) {
    if (!refreshing) {
      refreshing = refreshFromApi()
        .then(() => console.log("[lotofacil-data] dados atualizados."))
        .catch((err) => console.error("[lotofacil-data] falha na atualização:", err?.message))
        .finally(() => {
          refreshing = null;
        });
    }
  }
}

maybeRefresh();

export function getDataset(): Dataset {
  return dataset;
}

export function getMeta(): Dataset["meta"] {
  return dataset.meta;
}

export function getContestCount(): number {
  return dataset.results.length;
}

export function getFirstContest(): ContestResult {
  return dataset.results[0];
}

export function getLastContest(): ContestResult {
  return dataset.results[dataset.results.length - 1];
}

export function getContest(c: number): ContestResult | undefined {
  return dataset.results.find((r) => r.c === c);
}

export function getLastResults(n: number): ContestResult[] {
  return dataset.results.slice(-n).reverse();
}

export function checkTicket(ticket: number[]): {
  total: number;
  byHits: Record<number, ContestResult[]>;
} {
  const byHits: Record<number, ContestResult[]> = {};
  let total = 0;
  for (const r of dataset.results) {
    const hits = r.z.reduce((acc, n) => acc + (ticket.includes(n) ? 1 : 0), 0);
    if (hits >= 11) {
      total++;
      (byHits[hits] ||= []).push(r);
    }
  }
  return { total, byHits };
}

export function getMostFrequent(n: number): { number: number; count: number }[] {
  const counts = new Array<number>(26).fill(0);
  for (const r of dataset.results) for (const z of r.z) counts[z]++;
  return counts
    .map((count, number) => ({ number, count }))
    .slice(1)
    .sort((a, b) => b.count - a.count || a.number - b.number)
    .slice(0, n);
}

export function getFrequencies(): { number: number; count: number }[] {
  const counts = new Array<number>(26).fill(0);
  for (const r of dataset.results) for (const z of r.z) counts[z]++;
  return counts.map((count, number) => ({ number, count })).slice(1);
}

export function getFrequenciesByPeriod(
  n: number
): { number: number; count: number }[] {
  const counts = new Array<number>(26).fill(0);
  const slice = dataset.results.slice(-n);
  for (const r of slice) for (const z of r.z) counts[z]++;
  return counts.map((count, number) => ({ number, count })).slice(1);
}

export function getMostDelayed(n: number): { number: number; delay: number }[] {
  const last = dataset.results[dataset.results.length - 1].c;
  const lastSeen = new Array<number>(26).fill(0);
  for (const r of dataset.results) for (const z of r.z) lastSeen[z] = r.c;
  return lastSeen
    .map((c, number) => ({ number, delay: last - c }))
    .slice(1)
    .sort((a, b) => b.delay - a.delay || a.number - b.number)
    .slice(0, n);
}

export function getRepeatedPerContest(): {
  c: number;
  d: string;
  repeated: number;
}[] {
  const out: { c: number; d: string; repeated: number }[] = [];
  for (let i = 1; i < dataset.results.length; i++) {
    const prev = dataset.results[i - 1];
    out.push({
      c: dataset.results[i].c,
      d: dataset.results[i].d,
      repeated: dataset.results[i].z.filter((n) => prev.z.includes(n)).length,
    });
  }
  return out;
}

export function getParesImparesPerContest(): {
  c: number;
  d: string;
  pares: number;
  impares: number;
}[] {
  return dataset.results.map((r) => {
    const pares = r.z.filter((n) => n % 2 === 0).length;
    return { c: r.c, d: r.d, pares, impares: r.z.length - pares };
  });
}

export function getRepeatedStats(n: number): { repeated: number; percent: number }[] {
  const total = Math.min(n, dataset.results.length - 1);
  const freq = new Map<number, number>();
  for (let i = dataset.results.length - total; i < dataset.results.length; i++) {
    const prev = dataset.results[i - 1];
    const rep = dataset.results[i].z.filter((x) => prev.z.includes(x)).length;
    freq.set(rep, (freq.get(rep) || 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || b[0] - a[0])
    .map(([repeated, count]) => ({ repeated, percent: (count / total) * 100 }));
}

export function getParesImparesStats(
  n: number
): { pares: number; impares: number; percent: number }[] {
  const total = Math.min(n, dataset.results.length);
  const freq = new Map<string, number>();
  for (const r of dataset.results.slice(-total)) {
    const pares = r.z.filter((x) => x % 2 === 0).length;
    const impares = r.z.length - pares;
    const key = `${pares}|${impares}`;
    freq.set(key, (freq.get(key) || 0) + 1);
  }
  return [...freq.entries()]
    .map(([key, count]) => {
      const [pares, impares] = key.split("|").map(Number);
      return { pares, impares, percent: (count / total) * 100 };
    })
    .sort((a, b) => b.percent - a.percent || a.pares - b.pares);
}

export function getGeneratorContext(n: number): DrawnResult[] {
  return dataset.results.slice(-n);
}
