// src/app/api/test-middleware/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'API route works' })
}