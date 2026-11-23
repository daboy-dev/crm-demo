import { connection } from "next/server";
import { getDb } from "@/db/client";
import { appVersion, checkHealth, createDbPing } from "@/lib/health";

export async function GET() {
  // Always evaluate at request time: the point is to hit the database now.
  await connection();
  const report = await checkHealth({
    pingDb: createDbPing(getDb),
    version: appVersion(),
  });
  return Response.json(report, {
    status: report.ok ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
