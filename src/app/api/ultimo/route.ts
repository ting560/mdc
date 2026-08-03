import { NextResponse } from "next/server";
import { getLastContest, maybeRefresh } from "@/lib/lotofacil-data";

export const dynamic = "force-dynamic";

export async function GET() {
  await maybeRefresh();
  const last = getLastContest();
  if (!last) {
    return NextResponse.json({ error: "Dados indisponíveis." }, { status: 503 });
  }
  return NextResponse.json(last);
}
