import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "mcp-registry-search",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
}
