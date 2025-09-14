// roguelearn-web/src/app/api/health/route.ts
import { NextResponse } from 'next/server';

// Defines a simple GET endpoint to confirm the service is running.
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}