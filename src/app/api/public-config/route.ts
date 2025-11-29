import { NextResponse } from 'next/server'

export async function GET() {
  const env = process.env as Record<string, string | undefined>
  return NextResponse.json({
    supabaseUrl: env['NEXT_PUBLIC_SUPABASE_URL'] || '',
    supabaseAnonKey: env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || '',
    apiUrl: env['NEXT_PUBLIC_API_URL'] || '',
    codeBattleApiUrl: env['NEXT_PUBLIC_CODE_BATTLE_API_URL'] || '',
    googleClientId: env['NEXT_PUBLIC_GOOGLE_CLIENT_ID'] || '',
    liveblocksPublicKey: env['NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY'] || '',
  })
}
