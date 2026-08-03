import { NextResponse } from "next/server";
import {
  getFrequencies,
  getFrequenciesByPeriod,
  getContestCount,
  maybeRefresh,
} from "@/lib/lotofacil-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await maybeRefresh();
  const url = new URL(request.url);
  const periodRaw = Number(url.searchParams.get("period") || 0);
  const period = Number.isFinite(periodRaw) && periodRaw > 0 ? Math.floor(periodRaw) : 0;
  const numbers = period > 0 ? getFrequenciesByPeriod(period) : getFrequencies();
  return NextResponse.json({
    period,
    totalContests: getContestCount(),
    numbers,
  });
}
