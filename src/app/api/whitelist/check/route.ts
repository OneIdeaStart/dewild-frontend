// src/app/api/whitelist/check/route.ts
import { NextResponse } from 'next/server'
import { checkWhitelistEntries } from '@/lib/whitelist'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const discord = searchParams.get('discord')
    const twitter = searchParams.get('twitter')

    if (!address && !discord && !twitter) {
      return NextResponse.json(
        { error: 'No parameters provided' },
        { status: 400 }
      )
    }

    const checks = checkWhitelistEntries({
      address: address ?? undefined,
      discord: discord ?? undefined,
      twitter: twitter ?? undefined
    })

    return NextResponse.json(checks)
  } catch (error) {
    console.error('Check error:', error)
    return NextResponse.json(
      { error: 'Check failed' },
      { status: 500 }
    )
  }
}